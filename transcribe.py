import os
import json
import re
import torch
from faster_whisper import WhisperModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

def get_target_folder():
    """Locates and validates the target 'new_videos' directory."""
    current_directory = os.path.dirname(os.path.abspath(__file__))
    target_folder = os.path.join(current_directory, 'new_videos')
    
    if not os.path.exists(target_folder):
        print(f"Error: The directory '{target_folder}' does not exist.")
        return None
    return target_folder

def initialize_hf_llm():
    """Initializes a small, fast local Hugging Face instruction model."""
    print("--- Initializing Local Hugging Face LLM (Qwen 1.5B) ---")
    model_id = "Qwen/Qwen2.5-1.5B-Instruct"
    
    # Auto-detect the best hardware accelerator available
    if torch.cuda.is_available():
        device_map = "cuda"
        torch_dtype = torch.float16
    elif torch.backends.mps.is_available():
        device_map = "mps"
        torch_dtype = torch.float16
    else:
        device_map = "cpu"
        torch_dtype = torch.float32

    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id, 
        torch_dtype=torch_dtype, 
        device_map=device_map
    )
    
    # Create a text-generation pipeline
    return pipeline("text-generation", model=model, tokenizer=tokenizer)

def infer_metadata_with_hf(hf_pipe, transcript_text):
    """Uses the local Hugging Face model to infer title and category from transcript."""
    print(" -> Analyzing transcript text via local Hugging Face LLM...")
    
    # Clean string assignments for system and user contents
    system_prompt = (
        "You are a helpful assistant that outputs ONLY raw JSON text matching the exact schema requested. "
        "Do not include markdown code block formatting tags like ```json or any trailing explanation. "
        "Return only raw, naked JSON code."
    )
    
    user_prompt = (
        f"Analyze this video transcript text and extract a descriptive title and category.\n\n"
        f"Expected JSON Schema Output Format:\n"
        f"{{\n"
        f"  \"title\": \"A short, descriptive, accurate title for the video content\",\n"
        f"  \"category\": \"One or two words representing the category (e.g., Education, Music, Tech, Travel)\"\n"
        f"}}\n\n"
        f"Transcript:\n"
        f"\"{transcript_text}\""
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    # Generate the response
    outputs = hf_pipe(messages, max_new_tokens=150, temperature=0.1, do_sample=False)
    raw_response = outputs[0]['generated_text'][-1]['content'].strip()
    
    # Clean up markdown backticks safely using standard string methods
    raw_response = raw_response.replace("```json", "")
    raw_response = raw_response.replace("```", "")
    raw_response = raw_response.strip()
        
    try:
        return json.loads(raw_response)
    except Exception as parse_error:
        print(f"    Warning parsing text generation object: {parse_error}. Using fallback defaults.")
        # Minimal regex fallback check if the JSON format is slightly off
        try:
            title_match = re.search(r'"title"\s*:\s*"([^"]+)"', raw_response)
            category_match = re.search(r'"category"\s*:\s*"([^"]+)"', raw_response)
            return {
                "title": title_match.group(1) if title_match else "Untitled Video",
                "category": category_match.group(1) if category_match else "General"
            }
        except Exception:
            return {"title": "Untitled Video", "category": "General"}

def run_local_pipeline(target_folder, whisper_model, hf_pipe):
    """Core loop mapping faster-whisper outputs to Hugging Face LLM analysis."""
    video_files = [f.name for f in os.scandir(target_folder) if f.is_file() and f.name.endswith('.mp4')]
    
    if not video_files:
        print(f"No .mp4 video files found inside: {target_folder}")
        return
        
    print(f"Found {len(video_files)} file(s) to process.\n")
    final_manifest = []

    for file_name in video_files:
        file_path = os.path.join(target_folder, file_name)
        print("=" * 60)
        print(f"Processing File: {file_name}")
        print("=" * 60)
        
        try:
            # --- 1. FASTER-WHISPER AUDIO TRANSCRIPTION ---
            segments, info = whisper_model.transcribe(file_path, word_timestamps=True, beam_size=5)
            segments_list = list(segments)  # Evaluate generator to list upfront
            
            transcript_dict = {
                "file_name": file_name,
                "detected_language": info.language,
                "language_probability": round(info.language_probability, 4),
                "words": []
            }
            
            full_transcript_text = ""
            print(f"Detected language: {info.language}. Running structural token timestamp mapping...")
            
            for segment in segments_list:
                full_transcript_text += segment.text + " "
                if segment.words:
                    for w in segment.words:
                        transcript_dict["words"].append({
                            "word": w.word.strip(),
                            "start": round(w.start, 2),
                            "end": round(w.end, 2),
                            "probability": round(w.probability, 4)
                        })
            
            # Save individual JSON timeline script
            json_name = os.path.splitext(file_name)[0] + ".json"
            json_out_path = os.path.join(target_folder, json_name)
            with open(json_out_path, 'w', encoding='utf-8') as f:
                json.dump(transcript_dict, f, indent=4, ensure_ascii=False)
            print(f"Saved word timestamps map data successfully to: {json_name}")

            # --- 2. HUGGING FACE TEXT EXTRACTION ---
            local_metadata = infer_metadata_with_hf(hf_pipe, full_transcript_text.strip())
            
            # --- 3. CONSTRUCT TARGET STRUCTURE INDEX MANIFEST ENTRY ---
            entry = {
                "title": local_metadata.get("title", os.path.splitext(file_name)[0]),
                "state": "New",
                "category": local_metadata.get("category", "General"),
                "video_url": f"data/{file_name}",
                "script_url": f"data/{json_name}"
            }
            final_manifest.append(entry)
            print(f"Generated Catalog Entry -> Title: '{entry['title']}' | Category: '{entry['category']}'\n")
            
        except Exception as file_error:
            print(f"Skipping error anomaly encountered on file {file_name}: {file_error}\n")

    # Save absolute registry catalogue index arrays into new_videos.json
    if final_manifest:
        manifest_output = os.path.join(target_folder, "new_videos.json")
        with open(manifest_output, 'w', encoding='utf-8') as out_f:
            json.dump(final_manifest, out_f, indent=4, ensure_ascii=False)
        print("=" * 60)
        print(f"COMPLETE: Unified local index registry created at:\n -> {manifest_output}")
        print("=" * 60)

if __name__ == "__main__":
    folder_path = get_target_folder()
    if folder_path:
        # Load local audio tracking system
        print("--- Initializing Faster-Whisper Model Instance ---")
        whisper_instance = WhisperModel("base", device="cpu", compute_type="int8")
        
        # Load local text metadata model pipeline 
        hf_pipeline_instance = initialize_hf_llm()
        
        # Execute unified tracking processing routine
        run_local_pipeline(folder_path, whisper_instance, hf_pipeline_instance)