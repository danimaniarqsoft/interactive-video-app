import os
import json
from faster_whisper import WhisperModel

def transcribe_stored_videos_to_json():
    # 1. Target the 'data' directory relative to this script
    current_directory = os.path.dirname(os.path.abspath(__file__))
    target_folder = os.path.join(current_directory, 'data')
    
    # Check if the data directory exists
    if not os.path.exists(target_folder):
        print(f"Error: The directory '{target_folder}' does not exist.")
        print("Please run your download script to populate files first.")
        return

    # 2. Initialize the Faster-Whisper Model
    print("--- Initializing Faster-Whisper Model ---")
    model = WhisperModel("base", device="cpu", compute_type="int8")

    # 3. Find all MP4 files inside the 'data' directory
    video_files = [f for f in os.listdir(target_folder) if f.endswith('.mp4')]
    
    if not video_files:
        print(f"No .mp4 video files found inside: {target_folder}")
        return

    print(f"Found {len(video_files)} video file(s) to process.\n")

    # 4. Loop through each file and extract data
    for file_name in video_files:
        file_path = os.path.join(target_folder, file_name)
        print("=" * 60)
        print(f"Processing File: {file_name}")
        print("=" * 60)
        
        try:
            # Transcribe with word_timestamps active
            segments, info = model.transcribe(file_path, word_timestamps=True, beam_size=5)
            
            # Dictionary to collect all meta and transcription details
            transcription_data = {
                "file_name": file_name,
                "detected_language": info.language,
                "language_probability": info.language_probability,
                "words": []
            }
            
            print(f"Detected Language: '{info.language}'... Transcribing words...")
            
            # Extract word objects from each segment
            for segment in segments:
                if segment.words:
                    for word_info in segment.words:
                        word_data = {
                            "word": word_info.word.strip(),
                            "start": round(word_info.start, 2),
                            "end": round(word_info.end, 2),
                            "probability": round(word_info.probability, 4)
                        }
                        transcription_data["words"].append(word_data)
            
            # 5. Define output JSON path (replaces .mp4 with .json)
            json_file_name = os.path.splitext(file_name)[0] + ".json"
            json_file_path = os.path.join(target_folder, json_file_name)
            
            # Save data to JSON
            with open(json_file_path, 'w', encoding='utf-8') as json_file:
                json.dump(transcription_data, json_file, indent=4, ensure_ascii=False)
                
            print(f"Saved word-by-word data successfully to:\n -> {json_file_name}\n")
            
        except Exception as e:
            print(f"An error occurred while transcribing {file_name}: {e}")

if __name__ == "__main__":
    transcribe_stored_videos_to_json()