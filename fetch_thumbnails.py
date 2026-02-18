#!/usr/bin/env python3
"""
Fetch thumbnail URLs from Bibelthek API for all videos in the database.
Updates the database in-place with 'thumb' field on each video entry.
"""

import json
import re
import urllib.request
DB_PATH = 'video-study-bible-mvp/public/study_bible_data/study_bible_database.json'
API_KEY = '9063d9c81d111797641719a3b86651eb'
BASE_URL = 'https://bibelthek-backend.bibeltv.de'


def extract_crn(video):
    """Extract numeric CRN from video_id or title field."""
    for field in ('video_id', 'title', 'video_file'):
        val = video.get(field, '') or ''
        m = re.search(r'_(\d{5,})(?:\.mp4)?$', val)
        if m:
            return m.group(1)
    return None


def fetch_json(url):
    req = urllib.request.Request(url, headers={
        'X-API-KEY': API_KEY,
        'Authorization': f'Bearer {API_KEY}',
        'Accept': 'application/json',
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception:
        return None


def get_thumb_for_crn(crn):
    """Try multiple API endpoints to get the thumb URL for a CRN."""

    # Strategy 1: search by CRN number directly
    url = f'{BASE_URL}/search.json?query={crn}'
    data = fetch_json(url)
    if data:
        items = data if isinstance(data, list) else data.get('programs', data.get('items', data.get('results', [])))
        if isinstance(items, list):
            for item in items:
                if str(item.get('crn', '')) == str(crn) or str(item.get('id', '')) == str(crn):
                    thumb = item.get('thumb') or item.get('thumbnail') or item.get('image')
                    if thumb:
                        return thumb

    # Strategy 2: programs endpoint
    for path in [f'/programs/{crn}.json', f'/programs/{crn}']:
        data = fetch_json(f'{BASE_URL}{path}')
        if data and isinstance(data, dict):
            thumb = data.get('thumb') or data.get('thumbnail') or data.get('image')
            if thumb:
                return thumb

    return None


def main():
    with open(DB_PATH) as f:
        db = json.load(f)

    # Collect unique CRN → thumb mappings
    crn_to_thumb = {}
    crns_needed = set()

    all_videos = []
    for section in db.get('verses', {}).values():
        for verse_videos in section.values():
            all_videos.extend(verse_videos)

    for video in all_videos:
        crn = extract_crn(video)
        if crn and crn not in crn_to_thumb:
            crns_needed.add(crn)

    print(f"Fetching thumbnails for {len(crns_needed)} unique videos...")

    for crn in sorted(crns_needed):
        thumb = get_thumb_for_crn(crn)
        crn_to_thumb[crn] = thumb
        status = f"✅ {thumb}" if thumb else "❌ not found"
        print(f"  CRN {crn}: {status}")

    # Patch every video entry in the database
    patched = 0
    for section in db.get('verses', {}).values():
        for verse_videos in section.values():
            for video in verse_videos:
                crn = extract_crn(video)
                if crn and crn_to_thumb.get(crn):
                    video['thumb'] = crn_to_thumb[crn]
                    patched += 1

    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

    found = sum(1 for t in crn_to_thumb.values() if t)
    print(f"\n✅ Done: {found}/{len(crns_needed)} thumbnails found, {patched} video entries patched")
    print(f"💾 Saved to {DB_PATH}")


if __name__ == '__main__':
    main()
