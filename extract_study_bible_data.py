#!/usr/bin/env python3
"""
Extract comprehensive study Bible data from video transcripts for Genesis 1.

This script processes all transcripts and creates a structured database for the MVP:
- Verse references with timestamps
- Commentary excerpts per verse
- Cross-references
- Topics and themes
- Hebrew word occurrences
- Q&A sections

EXTRACTION MODES:
1. BASIC (--mode=basic): Fast regex-based extraction (default, no AI needed)
2. ENHANCED (--mode=enhanced): AI-powered extraction for implicit references and better context
"""

import json
import re
import os
from pathlib import Path
from collections import defaultdict
from typing import List, Dict, Tuple, Optional
import argparse

# Bible reference patterns (German)
VERSE_PATTERNS = [
    # Genesis patterns
    (r'(?:1\.?\s*Mose|Genesis)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Genesis'),
    # Other OT books
    (r'Psalm\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Psalm'),
    (r'(?:2\.?\s*Mose|Exodus)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Exodus'),
    # NT books
    (r'(?:Matthäus|Matthew)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Matthew'),
    (r'(?:Johannes|John)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'John'),
    (r'(?:Römer|Romans)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Romans'),
    (r'(?:1\.?\s*Korinther|1 Corinthians)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', '1 Corinthians'),
    (r'(?:2\.?\s*Korinther|2 Corinthians)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', '2 Corinthians'),
    (r'(?:Galater|Galatians)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Galatians'),
    (r'(?:Epheser|Ephesians)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Ephesians'),
    (r'(?:Philipper|Philippians)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Philippians'),
    (r'(?:Kolosser|Colossians)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Colossians'),
    (r'(?:Hebräer|Hebrews)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Hebrews'),
    (r'(?:Jakobus|James)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'James'),
    (r'(?:1\.?\s*Petrus|1 Peter)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', '1 Peter'),
    (r'(?:Offenbarung|Revelation)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Revelation'),
    (r'(?:Lukas|Luke)\s+(\d+)(?:,\s*(?:Vers\s+)?(\d+))?', 'Luke'),
]

# Hebrew/Greek words to track
THEOLOGICAL_TERMS = [
    (r'[Tt]ohu\s+[Ww]abohu', 'tohu_wabohu'),
    (r'[Rr]akia', 'rakia'),
    (r'[Bb]ara', 'bara'),
    (r'[Ee]lohim', 'elohim'),
    (r'[Ee]benbild', 'image_of_god'),
    (r'[Dd]reieinig', 'trinity'),
]

# Topics to extract
TOPICS = [
    (r'[Ss]chöpfung|[Cc]reation', 'creation'),
    (r'[Ll]icht', 'light'),
    (r'[Ww]asser', 'water'),
    (r'[Aa]tmosphäre', 'atmosphere'),
    (r'[Zz]eit', 'time'),
    (r'[Rr]aum', 'space'),
    (r'[Pp]flanze', 'plants'),
    (r'[Tt]ier', 'animals'),
    (r'[Mm]ensch', 'humanity'),
    (r'[Ee]he|[Mm]arriage', 'marriage'),
    (r'[Ss]abbat', 'sabbath'),
    (r'[Ss]ünde', 'sin'),
    (r'[Ee]rlösung|[Rr]edemption', 'redemption'),
]


def parse_timestamp(ts_str: str) -> int:
    """Convert timestamp string to milliseconds."""
    parts = ts_str.split(':')
    hours, minutes, seconds = map(int, parts)
    return (hours * 3600 + minutes * 60 + seconds) * 1000


def extract_verses_from_line(line: str) -> List[Tuple[str, int, int]]:
    """Extract verse references from a line."""
    verses = []
    for pattern, book in VERSE_PATTERNS:
        matches = re.finditer(pattern, line, re.IGNORECASE)
        for match in matches:
            chapter = int(match.group(1))
            verse = int(match.group(2)) if match.group(2) else None
            verses.append((book, chapter, verse))
    return verses


def process_transcript(txt_path: Path, json_path: Path) -> Dict:
    """Process a single transcript and extract all study Bible data."""

    # Read transcript
    with open(txt_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Read video metadata if available
    metadata = {}
    if json_path.exists():
        with open(json_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)

    video_id = txt_path.stem

    result = {
        'video_id': video_id,
        'video_file': f"{video_id}.mp4",
        'title': metadata.get('video', video_id),
        'language': metadata.get('language', 'de'),
        'segments': [],
        'verse_mentions': defaultdict(list),  # verse_ref -> [timestamps]
        'commentary': defaultdict(list),      # verse_ref -> [text excerpts]
        'topics': defaultdict(list),          # topic -> [timestamps]
        'terms': defaultdict(list),           # term -> [timestamps]
        'questions': [],
    }

    # Process each line
    for i, line in enumerate(lines):
        # Extract timestamp
        ts_match = re.match(r'\[(\d{2}:\d{2}:\d{2})\]\s*(.*)', line)
        if not ts_match:
            continue

        timestamp = ts_match.group(1)
        text = ts_match.group(2).strip()
        timestamp_ms = parse_timestamp(timestamp)

        # Create segment
        segment = {
            'start': timestamp,
            'start_ms': timestamp_ms,
            'text': text,
            'verses': [],
            'topics': [],
            'terms': [],
        }

        # Extract verse references
        verses = extract_verses_from_line(text)
        for book, chapter, verse in verses:
            verse_ref = f"{book} {chapter}" + (f":{verse}" if verse else "")
            segment['verses'].append(verse_ref)
            result['verse_mentions'][verse_ref].append({
                'timestamp': timestamp,
                'timestamp_ms': timestamp_ms,
                'context': text[:200]
            })

            # Extract commentary context (this line + next few lines)
            commentary_text = text
            for j in range(i+1, min(i+5, len(lines))):
                next_line = lines[j]
                next_ts_match = re.match(r'\[(\d{2}:\d{2}:\d{2})\]\s*(.*)', next_line)
                if next_ts_match:
                    commentary_text += " " + next_ts_match.group(2).strip()

            result['commentary'][verse_ref].append({
                'timestamp': timestamp,
                'timestamp_ms': timestamp_ms,
                'text': commentary_text[:500]  # Limit length
            })

        # Extract topics
        for pattern, topic in TOPICS:
            if re.search(pattern, text, re.IGNORECASE):
                segment['topics'].append(topic)
                result['topics'][topic].append({
                    'timestamp': timestamp,
                    'timestamp_ms': timestamp_ms,
                    'text': text[:200]
                })

        # Extract theological terms
        for pattern, term in THEOLOGICAL_TERMS:
            if re.search(pattern, text, re.IGNORECASE):
                segment['terms'].append(term)
                result['terms'][term].append({
                    'timestamp': timestamp,
                    'timestamp_ms': timestamp_ms,
                    'text': text[:200]
                })

        # Detect questions
        if '?' in text and len(text.split()) > 5:
            # Extract the question
            question_match = re.search(r'([^.!]*\?)', text)
            if question_match:
                result['questions'].append({
                    'timestamp': timestamp,
                    'timestamp_ms': timestamp_ms,
                    'question': question_match.group(1).strip(),
                    'context': text
                })

        result['segments'].append(segment)

    # Convert defaultdicts to regular dicts for JSON serialization
    result['verse_mentions'] = dict(result['verse_mentions'])
    result['commentary'] = dict(result['commentary'])
    result['topics'] = dict(result['topics'])
    result['terms'] = dict(result['terms'])

    return result


def build_verse_index(all_videos: List[Dict]) -> Dict:
    """Build an index of verses -> videos for quick lookup."""
    verse_index = defaultdict(list)

    for video in all_videos:
        for verse_ref, mentions in video['verse_mentions'].items():
            verse_index[verse_ref].append({
                'video_id': video['video_id'],
                'video_file': video['video_file'],
                'title': video['title'],
                'mentions': mentions
            })

    return dict(verse_index)


def build_topic_index(all_videos: List[Dict]) -> Dict:
    """Build an index of topics -> videos."""
    topic_index = defaultdict(list)

    for video in all_videos:
        for topic, occurrences in video['topics'].items():
            topic_index[topic].append({
                'video_id': video['video_id'],
                'video_file': video['video_file'],
                'title': video['title'],
                'occurrences': len(occurrences),
                'timestamps': [occ['timestamp'] for occ in occurrences[:5]]  # First 5
            })

    return dict(topic_index)


def enhance_with_ai(video_data: Dict, mode: str = 'basic') -> Dict:
    """
    Enhance extraction with AI for implicit references and better context.

    For MVP: This is optional. Set mode='enhanced' to enable.
    Requires: anthropic or openai library + API key
    """
    if mode == 'basic':
        return video_data

    # TODO: Add AI enhancement here
    # Could use Claude/GPT to:
    # 1. Find implicit verse references (quotes without citations)
    # 2. Generate better summaries
    # 3. Extract theological insights
    # 4. Identify verse being discussed even without explicit mention

    print("  🤖 AI enhancement not yet implemented (coming in Phase 2)")
    return video_data


def main():
    # Parse arguments
    parser = argparse.ArgumentParser(description='Extract study Bible data from transcripts')
    parser.add_argument('--mode', choices=['basic', 'enhanced'], default='basic',
                       help='Extraction mode: basic (regex only) or enhanced (with AI)')
    args = parser.parse_args()

    # Setup paths
    transcript_dir = Path('bibelthek_videos/transcripts')
    output_dir = Path('study_bible_data')
    output_dir.mkdir(exist_ok=True)

    print(f"🔍 Processing transcripts in {args.mode} mode...")
    if args.mode == 'enhanced':
        print("  🤖 AI enhancement enabled (requires API key)")

    # Process all transcripts
    all_videos = []
    for txt_file in sorted(transcript_dir.glob('*.txt')):
        json_file = txt_file.with_suffix('.json')

        print(f"  📹 Processing {txt_file.name}...")
        video_data = process_transcript(txt_file, json_file)

        # Optional AI enhancement
        video_data = enhance_with_ai(video_data, args.mode)

        # Save individual video data
        output_file = output_dir / f"{video_data['video_id']}_study_data.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(video_data, f, indent=2, ensure_ascii=False)

        all_videos.append(video_data)

    print(f"\n✅ Processed {len(all_videos)} videos")

    # Build indices
    print("\n🏗️  Building indices...")

    verse_index = build_verse_index(all_videos)
    topic_index = build_topic_index(all_videos)

    # Filter Genesis 1 specific data
    genesis1_verses = {k: v for k, v in verse_index.items() if k.startswith('Genesis 1')}

    print(f"  📖 Found {len(genesis1_verses)} Genesis 1 verse references")
    print(f"  🏷️  Found {len(topic_index)} unique topics")

    # Create cross-reference graph
    cross_refs = defaultdict(set)
    for video in all_videos:
        verses = list(video['verse_mentions'].keys())
        # If video mentions Genesis 1, track what other verses it references
        genesis1_verses_in_video = [v for v in verses if v.startswith('Genesis 1')]
        other_verses = [v for v in verses if not v.startswith('Genesis 1')]

        for gen_verse in genesis1_verses_in_video:
            cross_refs[gen_verse].update(other_verses)

    # Convert sets to lists for JSON
    cross_refs = {k: list(v) for k, v in cross_refs.items()}

    # Compile final database
    database = {
        'metadata': {
            'total_videos': len(all_videos),
            'genesis1_videos': len([v for v in all_videos if any(
                ref.startswith('Genesis 1') for ref in v['verse_mentions'].keys()
            )]),
            'generated_at': 'DATE_PLACEHOLDER',
            'focus_chapter': 'Genesis 1'
        },
        'verses': {
            'genesis1': genesis1_verses,
            'all': verse_index
        },
        'cross_references': cross_refs,
        'topics': topic_index,
        'videos': [
            {
                'video_id': v['video_id'],
                'video_file': v['video_file'],
                'title': v['title'],
                'language': v['language'],
                'total_segments': len(v['segments']),
                'verse_count': len(v['verse_mentions']),
                'genesis1_coverage': [k for k in v['verse_mentions'].keys() if k.startswith('Genesis 1')]
            }
            for v in all_videos
        ]
    }

    # Save master database
    with open(output_dir / 'study_bible_database.json', 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Saved master database to study_bible_data/study_bible_database.json")

    # Print summary
    print("\n📊 Summary:")
    print(f"  Total videos: {len(all_videos)}")
    print(f"  Videos mentioning Genesis 1: {len([v for v in all_videos if any(ref.startswith('Genesis 1') for ref in v['verse_mentions'].keys())])}")
    print(f"  Total verse references: {len(verse_index)}")
    print(f"  Genesis 1 verse references: {len(genesis1_verses)}")
    print(f"  Topics identified: {len(topic_index)}")

    # Show some examples
    print("\n📖 Sample Genesis 1 verses with videos:")
    for verse_ref in sorted(genesis1_verses.keys())[:5]:
        videos = genesis1_verses[verse_ref]
        print(f"  {verse_ref}: {len(videos)} video(s)")
        for v in videos[:2]:
            print(f"    - {v['title']} ({len(v['mentions'])} mentions)")

    print("\n🎯 Top topics:")
    topic_counts = [(topic, sum(len(v['timestamps']) for v in videos))
                    for topic, videos in topic_index.items()]
    for topic, count in sorted(topic_counts, key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {topic}: {count} occurrences")

    print("\n✅ Data extraction complete! Ready for React MVP.")


if __name__ == '__main__':
    main()
