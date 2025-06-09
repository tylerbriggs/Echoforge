# ✅ clip_exporter.py — Exports clips using ffmpeg

import os
import subprocess

def export_clips(video_path, timestamps, orientation="vertical", quality="medium"):
    output_dir = os.path.abspath(os.path.join("..", "public", "output"))
    os.makedirs(output_dir, exist_ok=True)

    exported_paths = []

    for i, clip in enumerate(timestamps):
        start = clip["start"]
        end = clip["end"]
        duration = round(end - start, 2)

        output_file = f"clip_{i+1}_{clip['reason'].replace(' ', '_').lower()}.mp4"
        output_path = os.path.join(output_dir, output_file)

        scale_filter = {
            "vertical": "scale=1080:1920",
            "landscape": "scale=1920:1080"
        }.get(orientation, "scale=1080:1920")

        bitrate = {
            "low": "1M",
            "medium": "2.5M",
            "high": "5M"
        }.get(quality.lower(), "2.5M")

        cmd = [
            "ffmpeg",
            "-y",
            "-ss", str(start),
            "-i", video_path,
            "-t", str(duration),
            "-vf", scale_filter,
            "-b:v", bitrate,
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-c:a", "aac",
            "-loglevel", "error",
            output_path
        ]

        print(f"[EXPORT] Running ffmpeg: {' '.join(cmd)}")
        subprocess.run(cmd, check=True)
        exported_paths.append(output_path)

    return exported_paths
