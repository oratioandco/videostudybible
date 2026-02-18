#!/usr/bin/env python3
"""
For each verse mention in the database, use Claude to:
 - Find the exact clip start/end in the transcript (ms)
 - Generate a hook title (German, ~6 words)
 - Generate a 1-sentence description

Updates study_bible_database.json in-place.
"""

import json
import os
import re
import sys
from pathlib import Path
import anthropic

DB_PATH = Path('video-study-bible-mvp/public/study_bible_data/study_bible_database.json')
DATA_DIR = Path('study_bible_data')
WINDOW_MS = 180_000   # ±3 minutes around mention timestamp


def load_segments(video_id: str) -> list:
    for pattern in [f'{video_id}_parsed.json', f'{video_id}_study_data.json']:
        p = DATA_DIR / pattern
        if p.exists():
            with open(p) as f:
                return json.load(f).get('segments', [])
    return []


def segments_window(segments: list, center_ms: int) -> list:
    return [s for s in segments
            if abs(s['start_ms'] - center_ms) <= WINDOW_MS]


def ms_to_ts(ms: int) -> str:
    s = ms // 1000
    return f'{s//3600:02d}:{(s%3600)//60:02d}:{s%60:02d}'


def extract_clip(client, verse_ref: str, mention: dict, segments: list) -> dict:
    center_ms = mention.get('timestamp_ms', 0)
    window = segments_window(segments, center_ms)
    if not window:
        return {}

    seg_text = '\n'.join(
        f'[{s["start"]}|{s["start_ms"]}ms] {s["text"]}' for s in window
    )

    prompt = f"""Du analysierst ein deutsches christliches Lehrvideo-Transkript.

BIBELVERS: {verse_ref}
BEKANNTE LEHRSTELLE: {mention.get('timestamp', '?')} — „{mention.get('context', '')[:200]}"
KATEGORIE: {mention.get('category', '?')}

TRANSKRIPT-AUSSCHNITT (Format: [HH:MM:SS|ms] Text):
{seg_text}

Aufgabe:
1. Finde den besten START-Zeitpunkt für einen Clip zu diesem Vers (inkl. Einleitung/Setup, typisch 20–60 Sek. vor der Hauptaussage). Wähle einen Zeitpunkt aus dem Transkript.
2. Finde den END-Zeitpunkt (wenn der Sprecher zum nächsten Thema übergeht). Wähle einen Zeitpunkt aus dem Transkript.
3. Schreibe einen prägnanten deutschen Hook-Titel (max. 7 Wörter, keine Anführungszeichen).
4. Schreibe eine deutsche Beschreibung (1 Satz, max. 20 Wörter), was der Zuschauer in diesem Clip lernt.

Antworte NUR mit gültigem JSON:
{{
  "clip_start_ms": <Ganzzahl, ms aus dem Transkript>,
  "clip_end_ms": <Ganzzahl, ms aus dem Transkript>,
  "clip_title": "<Hook-Titel>",
  "clip_description": "<Beschreibung>"
}}"""

    try:
        msg = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=300,
            temperature=0,
            messages=[{'role': 'user', 'content': prompt}]
        )
        text = msg.content[0].text.strip()
        text = re.sub(r'^```(?:json)?\s*|\s*```$', '', text, flags=re.MULTILINE).strip()
        result = json.loads(text)

        # Validate: start < end, both within reasonable range
        s, e = result.get('clip_start_ms', 0), result.get('clip_end_ms', 0)
        if s >= e or e - s > 600_000 or s < 0:
            return {}
        return result
    except Exception as ex:
        print(f'      ⚠ AI error: {ex}')
        return {}


def main():
    api_key = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        print('Usage: python3 extract_clips.py <api_key>')
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    with open(DB_PATH) as f:
        db = json.load(f)

    # Collect unique (video_id, mention_idx) combos to process
    # Process in-place: iterate over all video entries
    total_mentions = 0
    enriched = 0
    skipped = 0

    # Cache segments per video_id to avoid re-loading
    seg_cache: dict = {}

    for section_name, section in db.get('verses', {}).items():
        for verse_ref, videos in section.items():
            for video in videos:
                vid_id = video.get('video_id', '')
                if vid_id not in seg_cache:
                    seg_cache[vid_id] = load_segments(vid_id)
                segments = seg_cache[vid_id]

                mentions = video.get('mentions', [])
                if not mentions or not segments:
                    continue

                print(f'\n  [{video.get("display_title","?")}] → {verse_ref}')
                for mention in mentions:
                    total_mentions += 1
                    # Skip if already done
                    if mention.get('clip_start_ms') is not None:
                        skipped += 1
                        continue

                    result = extract_clip(client, verse_ref, mention, segments)
                    if result:
                        mention['clip_start_ms'] = result['clip_start_ms']
                        mention['clip_end_ms']   = result['clip_end_ms']
                        mention['clip_title']     = result.get('clip_title', '')
                        mention['clip_description'] = result.get('clip_description', '')
                        dur = (result['clip_end_ms'] - result['clip_start_ms']) // 1000
                        print(f'    ✅ {mention["timestamp"]} → '
                              f'{ms_to_ts(result["clip_start_ms"])}–{ms_to_ts(result["clip_end_ms"])} '
                              f'({dur}s) — {result.get("clip_title","?")}')
                        enriched += 1
                    else:
                        print(f'    ⚠  {mention["timestamp"]} — no clip extracted')

    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

    print(f'\n✅ Done: {enriched}/{total_mentions} mentions enriched '
          f'({skipped} already had clips)')
    print(f'💾 Saved to {DB_PATH}')


if __name__ == '__main__':
    main()
