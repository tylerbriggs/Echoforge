# ✅ clipper.py — EchoForge Main Clip Engine
# Full version with integrated export, transcription, keyword match, and upload hooks

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))
sys.path.append(os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')
print("[DEBUG] Python path:", sys.executable)
import json
import subprocess
from clip_exporter.export import export_clips
from utils.transcriber import transcribe_audio
from utils.keyword_detector import find_keyword_timestamps

# 🟠 Placeholder upload integrations
def upload_to_youtube(video_path, title, description, oauth_token=None):
    print(f"[UPLOAD] Uploading to YouTube: {video_path}")
    # TODO: YouTube API Integration
    pass

def upload_to_tiktok(video_path, caption, oauth_token=None):
    print(f"[UPLOAD] Uploading to TikTok: {video_path}")
    # TODO: TikTok API Integration
    pass

# 🧠 Parse command-line args
def parse_args(args):
    expected_arg_count = 9
    is_link = args[0] == '--link'
    if is_link:
        args = args[1:]

    if len(args) < expected_arg_count:
        raise ValueError(f"Expected {expected_arg_count} arguments but got {len(args)}: {args}")

    return {
        "source_path": args[0],
        "keywords": args[1],
        "length": int(args[2]),
        "orientation": args[3],
        "quality": args[4],
        "face_track": args[5].lower() == "true",
        "add_captions": args[6].lower() == "true",
        "upload_to_tiktok": args[7].lower() == "true",
        "upload_to_youtube": args[8].lower() == "true",
        "is_link": is_link
    }


# 🔥 Main EchoForge Pipeline
def main():
    try:
        args = parse_args(sys.argv[1:])
        print(f"[ARGS] {json.dumps(args, indent=2)}")

        if not os.path.exists(args["source_path"]):
            raise FileNotFoundError(f"Source file not found: {args['source_path']}")

        # Step 1: Transcription
        transcript, segments = transcribe_audio(args["source_path"])
        print(f"[INFO] Transcription complete — {len(segments)} segments")

        # Step 2: Keyword Matching
        keywords = [k.strip().lower() for k in args["keywords"].split(",") if k.strip()]
        match_clips = find_keyword_timestamps(transcript, segments, keywords, clip_length=args["length"])

        if not match_clips:
            raise Exception("No matching clips found with the given keywords.")

        # Save timestamps for frontend marker display
        output_json = os.path.join(os.path.dirname(__file__), "..", "public", "clip_moments.json")
        with open(output_json, "w") as f:
            json.dump(match_clips, f, indent=2)


        # Step 3: Clip Export
        exported_paths = export_clips(
            video_path=args["source_path"],
            timestamps=[(clip["start"], clip["end"]) for clip in match_clips],
            orientation=args["orientation"]
        )



        print(f"[EXPORT] {len(exported_paths)} clips exported to public/output/")

        # Step 4: Optional Uploads
        if args["upload_to_youtube"]:
            upload_to_youtube(exported_paths[0], "EchoForge Clip", "Auto uploaded via EchoForge")

        if args["upload_to_tiktok"]:
            upload_to_tiktok(exported_paths[0], "EchoForge Clip")

        print("DONE - EchoForge pipeline fully executed")

    except Exception as e:
        print(f"[ERROR] {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()





