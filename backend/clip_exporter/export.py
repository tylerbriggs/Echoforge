# ✅ export.py — ffmpeg-only clip exporter

import os
import subprocess

def export_clips(video_path, timestamps, output_folder="public/output", orientation="vertical"):
    os.makedirs(output_folder, exist_ok=True)

    scale_filter = {
        "vertical": "scale=1080:1920",
        "landscape": "scale=1920:1080"
    }.get(orientation, "scale=1080:1920")

    clip_paths = []

    for i, (start, end) in enumerate(timestamps):
        output_file = os.path.join(output_folder, f"clip_{i+1}.mp4")
        duration = round(end - start, 2)

        cmd = [
            "ffmpeg",
            "-y",
            "-ss", str(start),
            "-i", video_path,
            "-t", str(duration),
            "-vf", scale_filter,
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-c:a", "aac",
            "-loglevel", "error",
            output_file
        ]

        print(f"[EXPORT] Running ffmpeg: {' '.join(cmd)}")
        subprocess.run(cmd, check=True)
        clip_paths.append(output_file)

    return clip_paths
