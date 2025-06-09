# ✅ transcriber.py — dummy transcription placeholder

def transcribe_audio(video_path):
    print(f"[TRANSCRIBE] Simulated transcription for: {video_path}")

    # Dummy transcript and segment list
    transcript = [
        {"start": 1.0, "end": 2.5, "word": "bro"},
        {"start": 3.0, "end": 4.2, "word": "dude"},
        {"start": 6.0, "end": 7.5, "word": "crazy"}
    ]

    segments = [
        {"start": 0.0, "end": 5.0},
        {"start": 5.0, "end": 10.0}
    ]

    return transcript, segments

