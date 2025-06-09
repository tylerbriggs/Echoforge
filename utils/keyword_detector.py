import re

def find_keyword_timestamps(transcript, segments, keywords, clip_length=15):
    keyword_hits = []

    for i, (start, end, text) in enumerate(segments):
        text_lower = text.lower()

        if any(re.search(rf"\b{re.escape(word)}\b", text_lower) for word in keywords):
            clip_start = max(0, start - 2)  # Pad before the hit
            clip_end = min(clip_start + clip_length, end + 5)
            keyword_hits.append((format_time(clip_start), format_time(clip_end)))

    return keyword_hits

def format_time(seconds):
    mins, secs = divmod(int(seconds), 60)
    hrs, mins = divmod(mins, 60)
    return f"{hrs:02}:{mins:02}:{secs:02}"

