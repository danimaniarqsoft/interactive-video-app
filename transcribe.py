import os
import json
from faster_whisper import WhisperModel

def get_target_folder():
    """Locates and validates the target 'data' directory."""
    current_directory = os.path.dirname(os.path.abspath(__file__))
    target_folder = os.path.join(current_directory, 'public/data')
    
    if not os.path.exists(target_folder):
        print(f"Error: The directory '{target_folder}' does not exist.")
        print("Please run your download script to populate files first.")
        return None
    return target_folder

def transcribe_stored_videos_to_json(target_folder, model):
    """Loops through mp4 files in target_folder and transcribes them using model."""
    # Find all MP4 files using a generator approach
    video_files = [f.name for f in os.scandir(target_folder) if f.is_file() and f.name.endswith('.mp4')]
    
    if not video_files:
        print(f"No .mp4 video files found inside: {target_folder}")
        return

    print(f"Found {len(video_files)} video file(s) to process.\n")

    for file_name in video_files:
        file_path = os.path.join(target_folder, file_name)
        print("=" * 60)
        print(f"Processing File: {file_name}")
        print("=" * 60)
        
        try:
            # Transcribe with word_timestamps active
            segments, info = model.transcribe(file_path, word_timestamps=True, beam_size=5)
            
            # Convert generator to list to safely fetch all text segments before mapping
            segments_list = list(segments)
            
            # Dictionary to collect all meta and transcription details
            transcription_data = {
                "file_name": file_name,
                "detected_language": info.language,
                "language_probability": round(info.language_probability, 4),
                "words": []
            }
            
            print(f"Detected Language: '{info.language}' (Prob: {round(info.language_probability, 2)})... Transcribing words...")
            
            # Extract word objects from evaluated segments
            for segment in segments_list:
                if segment.words:
                    for word_info in segment.words:
                        transcription_data["words"].append({
                            "word": word_info.word.strip(),
                            "start": round(word_info.start, 2),
                            "end": round(word_info.end, 2),
                            "probability": round(word_info.probability, 4)
                        })
            
            # Define output JSON path
            json_file_name = os.path.splitext(file_name)[0] + ".json"
            json_file_path = os.path.join(target_folder, json_file_name)
            
            # Save data securely to JSON
            with open(json_file_path, 'w', encoding='utf-8') as json_file:
                json.dump(transcription_data, json_file, indent=4, ensure_ascii=False)
                
            print(f"Saved word-by-word data successfully to:\n -> {json_file_name}\n")
            
        except Exception as e:
            print(f"An error occurred while transcribing {file_name}: {e}")

if __name__ == "__main__":
    folder = get_target_folder()
    if folder:
        # Load the model globally or inside main block once
        print("--- Initializing Faster-Whisper Model ---")
        whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
        
        # Run the transcription pipeline
        transcribe_stored_videos_to_json(folder, whisper_model)