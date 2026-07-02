import json
import os


def generate_videos_json():
    # Define the target directory and output file path
    target_dir = os.path.join("public", "data")
    output_file = os.path.join(target_dir, "videos.json")

    # Ensure the directory actually exists before proceeding
    if not os.path.exists(target_dir):
        print(f"Error: The directory '{target_dir}' does not exist.")
        return

    video_list = []

    # 1. Read the files in the public/data/ folder
    for filename in os.listdir(target_dir):
        # Filter for .mp4 files (this naturally excludes videos.json)
        if filename.lower().endswith(".mp4"):
            # Extract the filename without the .mp4 extension
            file_name_without_ext = os.path.splitext(filename)[0]

            # 2. Map the data according to your specifications
            video_entry = {
                "title": file_name_without_ext,
                "category": "English",
                "video_url": f"data/{filename}",
                "script_url": f"data/{file_name_without_ext}.json",
            }

            video_list = video_list + [video_entry]

    # Write the resulting list to public/data/videos.json
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            # indent=4 makes the JSON file human-readable and pretty
            json.dump(video_list, f, indent=4, ensure_ascii=False)
        print(
            f"Successfully generated {output_file} with {len(video_list)} videos!"
        )
    except IOError as e:
        print(f"Error writing to file: {e}")


if __name__ == "__main__":
    generate_videos_json()