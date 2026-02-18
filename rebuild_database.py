#!/usr/bin/env python3
"""
Rebuild the study Bible database from AI-parsed JSON files, then synthesize
per-verse commentary by aggregating teachings from ALL videos about each verse.

Primary input: *_parsed.json (from parse_transcript_with_ai.py)
Fallback input: *_enhanced.json (legacy Python-regex extraction)
"""

import json
import re
import sys
import os
from pathlib import Path
from collections import defaultdict
import anthropic


def clean_title(title: str) -> str:
    """Convert a video title/filename to a short readable label."""
    # Remove .mp4 extension
    t = title.replace('.mp4', '')
    # Remove trailing video ID (last underscore + digits)
    t = re.sub(r'_\d{5,}$', '', t)
    # Replace underscores with spaces
    t = t.replace('_', ' ')
    # Shorten long titles to first 40 chars
    if len(t) > 40:
        t = t[:40].rsplit(' ', 1)[0]
    return t.strip()


READING_PHRASES = [
    'schlagen sie auf', 'schlag auf', 'liest:', 'lesen wir:',
    'ich lese', 'wir lesen jetzt', 'steht geschrieben:', 'der text lautet',
]


def rebuild_database(data_dir: Path) -> dict:
    """
    Rebuild database from AI-parsed files (primary) or enhanced files (fallback).

    Parsed files (*_parsed.json) contain AI-identified teaching sections with
    pre-classified categories — far richer than the old Python regex approach.
    """

    db_path = data_dir / 'study_bible_database.json'
    with open(db_path) as f:
        db = json.load(f)

    new_genesis1 = defaultdict(list)
    new_all = defaultdict(list)

    # Prefer *_parsed.json (AI-first), fall back to *_enhanced.json
    parsed_files = sorted(data_dir.glob('*_parsed.json'))
    enhanced_files = sorted(data_dir.glob('*_enhanced.json'))

    # Determine which videos have parsed files so we skip their enhanced fallback
    parsed_video_ids = set()

    # Build lookup: base_name -> enhanced file path for ai_summary retrieval
    enhanced_by_base = {f.stem.replace('_enhanced', ''): f for f in enhanced_files}

    if parsed_files:
        print(f"   Found {len(parsed_files)} AI-parsed files (primary)")
        for parsed_file in parsed_files:
            with open(parsed_file) as f:
                data = json.load(f)

            video_id = data.get('video_id', '')
            title = data.get('title', '')
            video_file = data.get('video_file', '')
            parsed_video_ids.add(video_id)

            # Build thumbnail URL from CRN (imgix pattern: {crn}.jpg)
            crn_match = re.search(r'_(\d{5,})(?:\.mp4)?$', video_id or title or '')
            thumb = f"https://bibeltv.imgix.net/{crn_match.group(1)}.jpg" if crn_match else None

            # Load ai_summary from corresponding enhanced file if available
            base_name = parsed_file.stem.replace('_parsed', '')
            ai_summary = None
            if base_name in enhanced_by_base:
                try:
                    with open(enhanced_by_base[base_name]) as ef:
                        edata = json.load(ef)
                    ai_summary = edata.get('ai_summary', '')
                    # Strip markdown heading if present
                    if ai_summary and ai_summary.startswith('# '):
                        ai_summary = ai_summary.split('\n', 1)[-1].strip()
                except Exception:
                    pass

            # verse_sections: {verse_ref: [section, ...]}
            # Each section: {timestamp, verse_reference, category, quality, content}
            verse_sections = data.get('verse_sections', {})
            for verse_ref, sections in verse_sections.items():
                # Build mention-style entries compatible with VideoList component
                mentions = []
                for sec in sections:
                    ts_str = sec.get('timestamp', '00:00:00')
                    # Convert HH:MM:SS to milliseconds
                    try:
                        parts = ts_str.split(':')
                        ms = (int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])) * 1000
                    except Exception:
                        ms = 0
                    mentions.append({
                        'timestamp': ts_str,
                        'timestamp_ms': ms,
                        'context': sec.get('content', ''),
                        'category': sec.get('category', ''),
                        'quality': sec.get('quality', 'medium'),
                        'type': 'ai_parsed',
                    })

                if not mentions:
                    continue

                video_entry = {
                    'video_id': video_id,
                    'title': title,
                    'display_title': clean_title(title),
                    'video_file': video_file,
                    'ai_summary': ai_summary or '',
                    'thumb': thumb,
                    'mentions': mentions,
                }

                if 'Genesis 1' in verse_ref or '1. Mose 1' in verse_ref:
                    new_genesis1[verse_ref].append(video_entry)
                new_all[verse_ref].append(video_entry)

    # Fallback: load enhanced files for any video without a parsed file
    fallback_files = [f for f in enhanced_files
                      if not any(f.stem.startswith(vid) for vid in parsed_video_ids)]
    if fallback_files:
        print(f"   Found {len(fallback_files)} legacy enhanced files (fallback)")
        for enhanced_file in fallback_files:
            with open(enhanced_file) as f:
                data = json.load(f)

            video_id = data.get('video_id', '')
            title = data.get('title', '')
            video_file = data.get('video_file', '')
            crn_match = re.search(r'_(\d{5,})(?:\.mp4)?$', video_id or title or '')
            thumb = f"https://bibeltv.imgix.net/{crn_match.group(1)}.jpg" if crn_match else None

            for verse_ref, mentions in data.get('verse_mentions', {}).items():
                quality_mentions = []
                for mention in mentions:
                    meaningfulness = mention.get('meaningfulness')
                    mention_type = mention.get('type', '')
                    if mention_type == 'implicit_ai_detected':
                        if meaningfulness in ['high', 'medium']:
                            quality_mentions.append(mention)
                        continue
                    context = mention.get('context', '').lower()
                    if not any(p in context for p in READING_PHRASES):
                        quality_mentions.append(mention)

                if not quality_mentions:
                    continue

                video_entry = {
                    'video_id': video_id,
                    'title': title,
                    'display_title': clean_title(title),
                    'video_file': video_file,
                    'ai_summary': data.get('ai_summary', ''),
                    'thumb': thumb,
                    'mentions': quality_mentions,
                }
                if 'Genesis 1' in verse_ref or '1. Mose 1' in verse_ref:
                    new_genesis1[verse_ref].append(video_entry)
                new_all[verse_ref].append(video_entry)

    db['verses']['genesis1'] = dict(new_genesis1)
    db['verses']['all'] = dict(new_all)
    db['metadata']['genesis1_verses'] = len(new_genesis1)
    db['metadata']['total_verse_refs'] = len(new_all)

    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

    print(f"   ✅ Database rebuilt: {len(new_genesis1)} Genesis 1 verses, {len(new_all)} total verse refs")
    return db


def get_teaching_block(segments: list, timestamp: str, after: int = 60) -> list:
    """
    Get the teaching block that follows a verse mention.

    Preacher cites a verse, THEN teaches about it.
    Grab the 60 segments AFTER the citation — that's the actual teaching.
    """
    for idx, seg in enumerate(segments):
        if seg.get('start', '') >= timestamp:
            # A few before for context, then lots after for the teaching
            start = max(0, idx - 2)
            end = min(len(segments), idx + after)
            return segments[start:end]
    return []


def synthesize_verse_commentary(verse_ref: str, all_video_data: list,
                                 client: anthropic.Anthropic) -> dict:
    """
    Synthesize commentary for a verse from ALL videos that discuss it.

    When AI-parsed data is available (*_parsed.json), sections already have
    category and content extracted — synthesis only needs to deduplicate and
    combine insights across sources.

    Fallback: raw transcript segment extraction from *_enhanced.json.
    """

    all_passages = []

    for video_data in all_video_data:
        title = video_data.get('title', '')
        short_key = clean_title(title)

        # --- Primary: AI-parsed sections ---
        verse_sections = video_data.get('verse_sections', {}).get(verse_ref, [])
        if verse_sections:
            # Build formatted text grouped by category
            by_category: dict = {}
            for sec in verse_sections:
                cat = sec.get('category', 'allgemein')
                content = sec.get('content', '').strip()
                if content and len(content) > 40:
                    by_category.setdefault(cat, []).append(content)

            if by_category:
                lines = []
                for cat, contents in by_category.items():
                    lines.append(f"[{cat.upper()}]")
                    lines.extend(f"- {c}" for c in contents)
                all_passages.append({
                    'video_title': title,
                    'text': '\n'.join(lines),
                    'is_parsed': True,
                })
            continue

        # --- Fallback: raw transcript segment extraction ---
        mentions = video_data.get('verse_mentions', {}).get(verse_ref, [])
        if not mentions:
            continue

        segments = video_data.get('segments', [])
        seen_indices = set()
        video_blocks = []

        for mention in mentions:
            ts = mention.get('timestamp', '')
            pos = next((idx for idx, s in enumerate(segments) if s.get('start', '') >= ts), None)
            if pos is None:
                continue
            start = max(0, pos - 2)
            end = min(len(segments), pos + 60)
            new_indices = set(range(start, end)) - seen_indices
            if len(new_indices) > 5:
                block = [segments[idx] for idx in sorted(new_indices)]
                video_blocks.extend(block)
                seen_indices.update(new_indices)

        if video_blocks:
            block_text = ' '.join(s['text'] for s in video_blocks)
            if len(block_text) > 200:
                all_passages.append({
                    'video_title': title,
                    'text': '\n'.join(f"[{s['start']}] {s['text']}" for s in video_blocks),
                    'is_parsed': False,
                })

    if not all_passages:
        return {}

    # Format for prompt — use clean short titles as keys for attribution
    formatted = ""
    title_map = {}  # short_key -> full title
    for source in all_passages:
        short_key = clean_title(source['video_title'])
        title_map[short_key] = source['video_title']
        formatted += f"\n\n=== [{short_key}] ===\n"
        formatted += source['text']

    prompt = f"""Du bist Kurator eines Video-Studienbibel-Projekts. Deine Aufgabe ist es, die Aussagen verschiedener Bibel-Lehrer zu einer Textstelle zu strukturieren — so wie es in Studienbibeln und Kommentaren üblich ist.

BIBELSTELLE: {verse_ref}
QUELLEN: {len(all_passages)} verschiedene Lehrer/Videos

KRITISCH: Verwende NUR was tatsächlich in den Transkripten steht. Kein eigenes Wissen ergänzen.
Quellenangabe: Nutze den Kurztitel genau so wie er in den ===[Titel]=== Headers steht.

HINWEIS: Manche Quellen sind bereits nach Kategorien gegliedert (z.B. [TEXTANALYSE], [THEOLOGISCH]).
Nutze diese Gliederung als Orientierung. Kombiniere und dedupliziere gleichartige Aussagen verschiedener Sprecher.

INHALTE DER SPRECHER:
{formatted}

Ordne die Aussagen der Sprecher nach diesen Studienbibel-Kategorien.
Lass eine Kategorie weg wenn wirklich nichts Passendes im Transkript steht.
Lieber wenige, tiefgründige Punkte als viele oberflächliche.

ANTWORTFORMAT (nur JSON):
{{
  "summary": "1-2 Sätze: Was ist das Kernthema dieser Textstelle laut den Lehrern?",
  "categories": {{
    "textanalyse": [
      {{"text": "Spezifische Beobachtung zum Text — z.B. Wortbedeutung, Satzbau, Struktur", "source": "Kurztitel"}}
    ],
    "historisch_kulturell": [
      {{"text": "Historischer oder kultureller Hintergrund, den ein Sprecher erläutert", "source": "Kurztitel"}}
    ],
    "theologisch": [
      {{"text": "Theologische Einsicht oder Lehraussage eines Sprechers", "source": "Kurztitel"}}
    ],
    "christologisch": [
      {{"text": "Verbindung zu Jesus Christus oder zum Neuen Testament, die ein Sprecher aufzeigt", "source": "Kurztitel"}}
    ],
    "anwendung": [
      {{"text": "Konkrete Lebensanwendung mit Beispiel, die ein Sprecher nennt", "source": "Kurztitel"}}
    ],
    "illustrationen": [
      {{"text": "Geschichte, Analogie oder Bild, das ein Sprecher zur Veranschaulichung verwendet", "source": "Kurztitel"}}
    ]
  }},
  "cross_references": ["Johannes 1:1", "Hebräer 11:3"],
  "source_count": {len(all_passages)}
}}

Wenn gar kein verwertbarer Inhalt vorhanden ist, gib {{}} zurück.
Alles auf Deutsch. Nur gültiges JSON."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=3000,
            temperature=0,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text.strip()
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]

        # Robust JSON parsing — transcript quotes often break raw JSON
        try:
            result = json.loads(response_text)
        except json.JSONDecodeError:
            # Try to extract JSON object even if trailing content exists
            import re
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if match:
                try:
                    result = json.loads(match.group())
                except Exception:
                    return {}
            else:
                return {}

        result['source_videos'] = [clean_title(s['video_title']) for s in all_passages]
        return result

    except Exception as e:
        print(f"      ⚠️  Synthesis error for {verse_ref}: {e}")
        return {}


def synthesize_all_verses(db: dict, data_dir: Path, client: anthropic.Anthropic):
    """For each Genesis 1 verse with multiple videos, synthesize commentary."""

    print("\n🧠 Synthesizing verse commentary from all video sources...")

    # Load all video data — prefer *_parsed.json, fall back to *_enhanced.json
    all_video_data = []
    loaded_ids: set = set()

    for f in sorted(data_dir.glob('*_parsed.json')):
        with open(f) as fh:
            data = json.load(fh)
        all_video_data.append(data)
        loaded_ids.add(data.get('video_id', ''))

    for f in sorted(data_dir.glob('*_enhanced.json')):
        with open(f) as fh:
            data = json.load(fh)
        if data.get('video_id', '') not in loaded_ids:
            all_video_data.append(data)

    parsed_count = sum(1 for d in all_video_data if 'verse_sections' in d)
    print(f"   Loaded {len(all_video_data)} videos ({parsed_count} AI-parsed, "
          f"{len(all_video_data) - parsed_count} legacy)")

    # Process each verse that has 2+ videos (synthesis is most valuable here)
    verse_commentaries = {}
    genesis1_verses = db['verses']['genesis1']

    # Priority: specific single verses first (Genesis 1:1, 1:3, etc.)
    single_verses = {k: v for k, v in genesis1_verses.items()
                     if ':' in k and '-' not in k and len(v) >= 1}
    # Also include multi-verse ranges if they have multiple sources
    range_verses = {k: v for k, v in genesis1_verses.items()
                    if k not in single_verses and len(v) >= 2}

    all_to_process = {**single_verses, **range_verses}

    for verse_ref, videos in sorted(all_to_process.items()):
        n = len(videos)
        print(f"   🔎 {verse_ref} ({n} video{'s' if n > 1 else ''})...", end=' ')

        commentary = synthesize_verse_commentary(verse_ref, all_video_data, client)

        if commentary:
            verse_commentaries[verse_ref] = commentary
            cats = commentary.get('categories', {})
            total = sum(len(v) for v in cats.values()) if cats else len(commentary.get('key_points', []))
            sources = commentary.get('source_count', 0)
            print(f"✅ {total} Punkte aus {sources} Quellen")
        else:
            print("⚠️  Nicht genug Lehrinhalt")

    # Save synthesized commentaries into the database
    db['verse_commentaries'] = verse_commentaries

    db_path = data_dir / 'study_bible_database.json'
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Synthesized commentary for {len(verse_commentaries)} verses")
    print("💾 Saved to study_bible_database.json")


def main():
    api_key = None
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
    else:
        api_key = os.environ.get('ANTHROPIC_API_KEY')

    data_dir = Path('study_bible_data')

    print("🔄 Step 1: Rebuilding database from AI-parsed files...")
    db = rebuild_database(data_dir)

    if api_key:
        client = anthropic.Anthropic(api_key=api_key)
        print("\n🔄 Step 2: Synthesizing verse commentary across all videos...")
        synthesize_all_verses(db, data_dir, client)
    else:
        print("\n⚠️  No API key — skipping synthesis step. Pass key as argument to enable.")


if __name__ == '__main__':
    main()
