#!/usr/bin/env python3
"""
Extract speaker name and series info for each video using Claude AI.
Reads transcript openings, asks Claude to identify speaker + series.
Updates study_bible_database.json with 'speaker' and 'series' fields.
"""

import json
import re
import os
import sys
import glob
from pathlib import Path
import anthropic

DB_PATH = Path('video-study-bible-mvp/public/study_bible_data/study_bible_database.json')
DATA_DIR = Path('study_bible_data')


def get_transcript_opening(video_id: str, max_chars: int = 600) -> str:
    """Get the opening of the transcript for a video."""
    for pattern in [f'{video_id}_parsed.json', f'{video_id}_enhanced.json', f'{video_id}_study_data.json']:
        path = DATA_DIR / pattern
        if path.exists():
            with open(path) as f:
                d = json.load(f)
            segs = d.get('segments', [])
            text = ' '.join(s.get('text', '') for s in segs[:20])
            return text[:max_chars]
    return ''


def extract_metadata_with_ai(client: anthropic.Anthropic, video_id: str, display_title: str, opening: str) -> dict:
    """Use Claude to extract speaker name and series info."""
    prompt = f"""Du analysierst ein deutsches christliches Lehrvideo.

Videotitel: {display_title}
Transcript-Anfang: {opening}

Bitte identifiziere:
1. Den Namen des Sprechers/Predigers (falls genannt oder erkennbar)
2. Den Namen der Sendungsreihe/Serie (falls erkennbar)
3. Die Episodennummer (falls vorhanden)
4. Den Namen der Gemeinde/Organisation (falls genannt)

Antworte NUR mit JSON, kein anderer Text:
{{
  "speaker": "Name des Sprechers oder null",
  "series": "Name der Serie oder null",
  "episode": "Episodennummer oder null",
  "organization": "Gemeinde/Organisation oder null"
}}

Falls du dir nicht sicher bist, setze null. Keine Vermutungen."""

    try:
        msg = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=200,
            temperature=0,
            messages=[{'role': 'user', 'content': prompt}]
        )
        text = msg.content[0].text.strip()
        # Strip markdown code blocks if present
        text = re.sub(r'^```(?:json)?\s*|\s*```$', '', text, flags=re.MULTILINE).strip()
        return json.loads(text)
    except Exception as e:
        print(f'    AI error: {e}')
        return {}


def main():
    api_key = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        print('Usage: python3 extract_video_metadata.py [api_key]')
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    with open(DB_PATH) as f:
        db = json.load(f)

    # Collect unique videos from the database
    all_videos = []
    seen_ids = set()
    for section in db.get('verses', {}).values():
        for verse_videos in section.values():
            for video in verse_videos:
                vid_id = video.get('video_id')
                if vid_id and vid_id not in seen_ids:
                    seen_ids.add(vid_id)
                    all_videos.append(video)

    print(f'Processing {len(all_videos)} unique videos...\n')

    # Extract metadata for each unique video
    metadata_by_id = {}
    for video in all_videos:
        vid_id = video['video_id']
        display_title = video.get('display_title', vid_id)
        print(f'  [{vid_id[:40]}]')

        opening = get_transcript_opening(vid_id)
        if not opening:
            print(f'    No transcript found, skipping')
            metadata_by_id[vid_id] = {}
            continue

        meta = extract_metadata_with_ai(client, vid_id, display_title, opening)
        metadata_by_id[vid_id] = meta
        print(f'    speaker={meta.get("speaker")!r}, series={meta.get("series")!r}, org={meta.get("organization")!r}')

    print(f'\nUpdating database...')

    # Apply metadata to all video entries in the database
    patched = 0
    for section in db.get('verses', {}).values():
        for verse_videos in section.values():
            for video in verse_videos:
                vid_id = video.get('video_id')
                meta = metadata_by_id.get(vid_id, {})
                if meta.get('speaker'):
                    video['speaker'] = meta['speaker']
                if meta.get('series'):
                    video['series'] = meta['series']
                if meta.get('episode'):
                    video['episode'] = meta['episode']
                if meta.get('organization'):
                    video['organization'] = meta['organization']
                patched += 1

    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

    print(f'✅ Done — {patched} video entries updated')
    print(f'💾 Saved to {DB_PATH}')


if __name__ == '__main__':
    main()
