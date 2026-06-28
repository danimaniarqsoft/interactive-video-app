import os
from yt_dlp import YoutubeDL

def download_content():
    # 1. Define and create the 'data' folder in the script's current directory
    current_directory = os.path.dirname(os.path.abspath(__file__))
    target_folder = os.path.join(current_directory, 'data')
    
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)
        print(f"Folder successfully created at: {target_folder}")

    # 2. Prompt the user for the YouTube URL
    url = input("Please enter the YouTube video URL: ").strip()
    if not url:
        print("The URL cannot be empty.")
        return

    # 3. Configuration to download Video in MP4 format
    # 'bestvideo+bestaudio' fetches highest quality, combining them into an MP4 container
    # Configured to force H.264 format and move the index metadata to the front (+faststart)
    video_options = {
        'format': 'bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': os.path.join(target_folder, '%(title)s_video.%(ext)s'),
        'postprocessor_args': {
            'ffmpeg': ['-movflags', '+faststart']
        }
    }
    # 4. Configuration to download Audio and convert it to MP3
    audio_options = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(target_folder, '%(title)s_audio.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }

    try:
        # Downloading the Video file
        print("\n--- Starting VIDEO download (MP4) ---")
        with YoutubeDL(video_options) as ydl_video:
            ydl_video.download([url])
        print("Video downloaded successfully!")

        # Downloading and converting the Audio file
        print("\n--- Starting AUDIO download (MP3) ---")
        with YoutubeDL(audio_options) as ydl_audio:
            ydl_audio.download([url])
        print("Audio downloaded successfully!")

        print(f"\nProcess completed! Check your files in: {target_folder}")

    except Exception as e:
        print(f"\nAn error occurred during the download process: {e}")

if __name__ == "__main__":
    download_content()
