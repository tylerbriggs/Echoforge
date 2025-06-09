# ✅ transcriber.py — Full Whisper Integration w/ Word-level JSON Output
# Place inside /utils/

import whisper
import json
import os

def transcribe_audio(audio_path):
    print("[TRANSCRIBE] Loading Whisper base model...")
    model = whisper.load_model("base")

    print(f"[TRANSCRIBE] Transcribing file: {audio_path}")
    result = model.transcribe(audio_path, word_timestamps=True)

    full_text = result["text"]
    segments = [
        {
            "start": round(seg["start"], 2),
            "end": round(seg["end"], 2),
            "text": seg["text"]
        }
        for seg in result["segments"]
    ]

    words = []
    for seg in result["segments"]:
        for word in seg["words"]:
            words.append({
                "word": word["word"].strip(),
                "start": round(word["start"], 2),
                "end": round(word["end"], 2)
            })

    with open("../public/transcript.json", "w") as f:
        json.dump(words, f, indent=2)

    return full_text, segments


