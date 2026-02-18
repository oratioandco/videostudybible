#!/usr/bin/env python3
"""
AI-first transcript parser.

Instead of Python regex to find verse references, Claude reads the full
transcript and identifies:
- Which verse/passage each teaching section is about
- The quality of that teaching (high/medium/skip)
- The category of content (textanalyse, theologisch, anwendung, etc.)
- What the speaker actually says (not just a raw segment)

This replaces extract_study_bible_data.py + ai_extraction.py with a
single AI-driven pass that understands meaning, not just pattern matches.
"""

import json
import os
import sys
import time
from pathlib import Path
from typing import List, Dict
import anthropic

CATEGORY_LABELS = [
    "textanalyse",        # word meanings, Hebrew/Greek, structure
    "historisch_kulturell",  # historical/cultural background
    "theologisch",        # doctrines, themes
    "christologisch",     # connection to Jesus / NT
    "anwendung",          # practical life application
    "illustrationen",     # stories, analogies, examples
]


def parse_chunk(chunk: List[Dict], video_title: str, client: anthropic.Anthropic) -> List[Dict]:
    """
    Have Claude read a chunk of transcript segments and extract all
    meaningful teaching sections with verse attribution and category.
    """

    chunk_text = "\n".join(
        f"[{seg['start']}] {seg['text']}"
        for seg in chunk
    )

    prompt = f"""Du analysierst ein deutsches Bibel-Lehr-Video-Transkript.

VIDEO: {video_title}

DEINE AUFGABE:
Identifiziere alle Stellen im Transkript, wo der Sprecher über einen konkreten Bibelvers oder -abschnitt LEHRT (nicht nur vorliest oder ankündigt).

Ignoriere:
- Moderationsansagen ("Herzlich willkommen...")
- Verse vorlesen ohne Kommentar
- Ankündigungen ("Schlagen Sie auf...")
- Musik, Begrüßungen, Übergänge

Extrahiere NUR:
- Stellen mit echtem Lehrinhalt: Erklärungen, Einsichten, Anwendungen, Illustrationen
- Muss sich auf einen bestimmten Bibelvers oder -abschnitt beziehen
- Der Bezug kann explizit ("Genesis 1:1") oder implizit ("Am Anfang schuf Gott") sein

Für jede Lehrstelle:
- Welcher Vers/Abschnitt wird behandelt?
- Welche Kategorie trifft am besten zu?
  - "textanalyse": Wortbedeutung, Sprache, Aufbau des Textes
  - "historisch_kulturell": Historischer oder kultureller Hintergrund
  - "theologisch": Glaubenslehre, theologische Aussagen
  - "christologisch": Verbindung zu Jesus Christus, NT-Bezug
  - "anwendung": Praktische Lebensanwendung, persönlicher Bezug
  - "illustrationen": Geschichte, Analogie, Beispiel zur Veranschaulichung
- Was sagt der Sprecher konkret? (als klare, eigenständige Aussage)

TRANSKRIPT:
{chunk_text}

ANTWORTFORMAT (nur JSON):
{{
  "sections": [
    {{
      "timestamp": "HH:MM:SS",
      "verse_reference": "Genesis 1:1",
      "category": "theologisch",
      "quality": "high",
      "content": "Was der Sprecher sagt — als klare Aussage, nicht als Zitat"
    }}
  ]
}}

"quality" Werte: "high" (tiefgründig, einzigartig), "medium" (solide, nützlich), "low" (zu allgemein).
Nur "high" und "medium" aufnehmen. Bei Zweifeln weglassen.
Nur gültiges JSON. Alles auf Deutsch."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=4000,
            temperature=0,
            messages=[{"role": "user", "content": prompt}]
        )

        text = message.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]

        result = json.loads(text)
        return result.get("sections", [])

    except Exception as e:
        print(f"      ⚠️  Chunk parse error: {e}")
        return []


def parse_transcript(video_data: Dict, client: anthropic.Anthropic) -> Dict:
    """
    AI-parse a full video transcript to extract all teaching sections.

    Returns enriched video data with AI-identified teaching sections
    organized by verse reference and category.
    """

    title = video_data.get("title", "")
    segments = video_data.get("segments", [])

    print(f"    📖 Parsing {len(segments)} segments...")

    # Process in chunks of 40 segments with 5-segment overlap
    chunk_size = 40
    overlap = 5
    all_sections = []

    i = 0
    chunk_num = 0
    while i < len(segments):
        chunk = segments[i:i + chunk_size]
        chunk_num += 1
        print(f"      Chunk {chunk_num} [{chunk[0]['start']} → {chunk[-1]['start']}]...", end=" ")

        sections = parse_chunk(chunk, title, client)
        all_sections.extend(sections)
        print(f"{len(sections)} Lehrabschnitte")

        # Advance with overlap so teaching spanning chunk boundaries isn't lost
        i += chunk_size - overlap

        # Small delay to avoid rate limits
        time.sleep(0.5)

    # Organize sections by verse reference
    verse_sections: Dict[str, List[Dict]] = {}
    for section in all_sections:
        ref = section.get("verse_reference", "")
        if not ref:
            continue
        if ref not in verse_sections:
            verse_sections[ref] = []
        verse_sections[ref].append(section)

    print(f"    ✅ {len(all_sections)} Lehrabschnitte → {len(verse_sections)} Bibelstellen")

    return {
        **video_data,
        "ai_sections": all_sections,
        "verse_sections": verse_sections,
    }


def main():
    api_key = None
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
    else:
        api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        print("❌ Kein API-Schlüssel. Aufruf: python3 parse_transcript_with_ai.py YOUR_KEY")
        return

    client = anthropic.Anthropic(api_key=api_key)
    data_dir = Path("study_bible_data")

    # Only process videos that have a corresponding *_enhanced.json
    # (those are the Genesis 1 videos identified in the previous pipeline step).
    # Skip any that already have a *_parsed.json output file.
    all_study_files = sorted(data_dir.glob("*_study_data.json"))
    if not all_study_files:
        print("❌ Keine study_data Dateien. Erst extract_study_bible_data.py ausführen.")
        return

    # Find which base names have enhanced files → those are our target Genesis 1 videos
    enhanced_bases = {f.stem.replace('_enhanced', '') for f in data_dir.glob('*_enhanced.json')}
    already_parsed = {f.stem.replace('_parsed', '') for f in data_dir.glob('*_parsed.json')}

    input_files = []
    for f in all_study_files:
        base = f.stem.replace('_study_data', '')
        if base in enhanced_bases and base not in already_parsed:
            input_files.append(f)

    if not input_files:
        parsed_count = len(list(data_dir.glob('*_parsed.json')))
        print(f"✅ Alle {parsed_count} Genesis 1 Videos bereits geparst.")
        return

    print(f"🤖 AI-Transkript-Parsing für {len(input_files)} Videos...\n")

    for data_file in input_files:
        with open(data_file, encoding="utf-8") as f:
            video_data = json.load(f)

        print(f"📹 {video_data.get('title', data_file.stem)[:60]}")

        parsed = parse_transcript(video_data, client)

        # Save as *_parsed.json — use same base name as input file for consistent matching
        base_name = data_file.stem.replace('_study_data', '')
        out_file = data_dir / f"{base_name}_parsed.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(parsed, f, indent=2, ensure_ascii=False)

        print(f"    💾 Gespeichert: {out_file.name}\n")

    print("✅ AI-Parsing abgeschlossen!")
    print("➡️  Nächster Schritt: python3 rebuild_database.py YOUR_KEY")


if __name__ == "__main__":
    main()
