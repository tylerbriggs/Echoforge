# ✅ keyword_detector.py — matches hot keywords to timestamps

def find_keyword_timestamps(transcript, segments, keywords, clip_length=15):
    print(f"[DETECTOR] Searching for keywords: {keywords}")
    matches = []

    for entry in transcript:
        word = entry["word"].lower()
        start = float(entry["start"])
        if any(keyword in word for keyword in keywords):
            match = {
                "start": max(0, start - clip_length // 2),
                "end": start + clip_length // 2,
                "reason": f"Keyword: {word}",
                "score": 1.0
            }
            matches.append(match)

    print(f"[DETECTOR] Found {len(matches)} matches")
    return matches
