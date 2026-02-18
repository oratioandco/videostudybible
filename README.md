# Video-Studienbibel (MVP)

Eine KI-gestützte Bibel-Studien-App, die Predigtvideos aus der BibleTV Bibelthek mit Bibeltext verknüpft und durchsuchbar macht.

---

## Was diese App tut

Die Video-Studienbibel ist eine React-Webanwendung für deutschsprachige Bibel-Studierende. Ausgehend von einem gewählten Bibelvers (aktuell Genesis 1) zeigt sie:

- **Kommentar**: KI-synthetisierte Lehraussagen aus allen Videos zu diesem Vers, kategorisiert nach Textanalyse, Theologie, Christologie, Anwendung und Illustrationen
- **Querverweise**: Bibelstellen, die Sprecher im Zusammenhang mit dem Vers zitieren (aus den Videos extrahiert, auf Deutsch)
- **Themen**: Übergreifende biblische Themen (Schöpfung, Gott, Erlösung etc.) mit Verlinkung zu den relevanten Versen in Genesis 1
- **Videos / Clips**: Zu jedem Vers gibt es eigenständige Clips mit KI-generiertem Titel (Hook), Beschreibung, Dauer, Kategorie und Sprecher-Info — direkt abspielbar mit automatischem Start- und Endpunkt
- **KI-Einblicke**: RAG-basierter Chat über den gesamten Genesis-1-Lehrinhalt, wahlweise gefiltert auf einen bestimmten Sprecher

---

## Technologien

### Frontend (React App)
| Technologie | Zweck |
|---|---|
| React 18 / Create React App | UI-Framework |
| react-player | Videowiedergabe mit Seek & Auto-Pause |
| react-markdown | Markdown-Rendering in KI-Antworten |
| lucide-react | Icons |
| Anthropic Claude API (direkt im Browser) | KI-Einblicke Chat (RAG) |

### Datenpipeline (Python-Skripte)
| Technologie | Zweck |
|---|---|
| Claude Haiku (Anthropic API) | Transkript-Parsing, Clip-Extraktion, Metadaten |
| Claude Sonnet (Anthropic API) | Kommentar-Synthese, Datenbank-Aufbau |
| JSON | Datenbankformat (statische Datei) |
| imgix CDN (bibeltv.imgix.net) | Video-Thumbnails und Sprecher-Avatare |

### Videoquelle
- **BibleTV Bibelthek** — deutschsprachige christliche Lehrvideos
- Videos wurden separat heruntergeladen und transkribiert (siehe `../kuraturvideoanalyse/`)

---

## Pipeline: Von der Video-Datei zur App

```
Bibelthek-Videos (.mp4)
        │
        ▼ [kuraturvideoanalyse/]
┌─────────────────────────────┐
│ 1. Download                 │  download_*.py — Videos von BibleTV
│ 2. Transkription            │  Whisper-Modell → rohes Transkript
│ 3. Transkript-Verbesserung  │  improve_transcript_ai.py
└─────────────────────────────┘
        │
        │  study_bible_data/*_parsed.json
        ▼ [videostudybible/]
┌─────────────────────────────┐
│ 4. AI-Parsing               │  parse_transcript_with_ai.py
│                             │  → Verse-Referenzen detektieren
│                             │  → Lehr-Momente mit Kategorie & Kontext
│                             │  → Querverweise extrahieren
│                             │  Ergebnis: *_parsed.json pro Video
│                             │
│ 5. Datenbank aufbauen       │  rebuild_database.py
│                             │  → Alle Videos nach Vers indexieren
│                             │  → verse_commentaries synthetisieren
│                             │  → Topics aus Wort-Häufigkeiten
│                             │  → Thumbnails via imgix CDN
│                             │  Ergebnis: study_bible_database.json
│                             │
│ 6. Metadaten anreichern     │  extract_video_metadata.py
│                             │  → Sprecher-Name aus Transkript-Anfang
│                             │  → Serien-Name, Organisation
│                             │  → Sprecher-Avatar-URL (imgix CDN)
│                             │
│ 7. Clips extrahieren        │  extract_clips.py
│                             │  → Für jede Vers-Erwähnung:
│                             │     Claude Haiku analysiert ±3-Min-Fenster
│                             │     → clip_start_ms / clip_end_ms
│                             │     → clip_title (Hook, 7 Wörter)
│                             │     → clip_description (1 Satz)
└─────────────────────────────┘
        │
        │  video-study-bible-mvp/public/study_bible_data/study_bible_database.json
        ▼
┌─────────────────────────────┐
│ React App                   │  Statische JSON-Datenbank wird beim
│                             │  Start geladen → kein Backend nötig
└─────────────────────────────┘
```

---

## Datenbankstruktur (`study_bible_database.json`)

```json
{
  "metadata": { "created": "...", "video_count": 16, ... },

  "verses": {
    "genesis1": {
      "Genesis 1:1": [
        {
          "video_id": "303178",
          "display_title": "Arbeit selbst – Gott arbeitet",
          "speaker": "...", "speaker_avatar": "https://bibeltv.imgix.net/...",
          "series": "...", "organization": "...",
          "thumb": "https://bibeltv.imgix.net/303178.jpg",
          "mentions": [
            {
              "timestamp": "00:10:46", "timestamp_ms": 646000,
              "category": "textanalyse", "context": "...",
              "clip_start_ms": 477000, "clip_end_ms": 786000,
              "clip_title": "Am Anfang arbeitete Gott",
              "clip_description": "Warum Gottes Schöpfung Arbeit ist..."
            }
          ]
        }
      ]
    }
  },

  "verse_commentaries": {
    "Genesis 1:1": {
      "categories": {
        "theologisch": [{ "text": "...", "source": "Videoname" }]
      },
      "cross_references": ["Johannes 1:1", "Hebräer 11:3"]
    }
  },

  "topics": {
    "creation": [{ "video_id": "...", "relevance": 0.9 }]
  },

  "cross_references": { "Genesis 1:1": ["..."] }
}
```

---

## Dateien in diesem Ordner

| Datei | Zweck |
|---|---|
| `video-study-bible-mvp/` | React-App (Frontend) |
| `study_bible_data/` | Rohdaten pro Video (`*_parsed.json`, `*_study_data.json`) |
| `rebuild_database.py` | Baut `study_bible_database.json` aus study_bible_data |
| `extract_clips.py` | Reichert Mentions mit Clip-Grenzen und Titeln an |
| `extract_video_metadata.py` | Extrahiert Sprecher/Serie aus Transkript-Anfängen |
| `extract_study_bible_data.py` | Verarbeitet Rohtranskripte zu study_data |
| `parse_transcript_with_ai.py` | AI-Parsing der Transkripte für Verse & Kategorien |
| `fetch_thumbnails.py` | Hilfsskript für Thumbnail-URLs |
| `requirements.txt` | Python-Abhängigkeiten |
| `venv/` | Python Virtual Environment |

## React App starten

```bash
cd video-study-bible-mvp
npm install      # einmalig
npm start        # startet localhost:3000
```

## Datenbank neu aufbauen

```bash
# Benötigt: ANTHROPIC_API_KEY
source venv/bin/activate
python3 rebuild_database.py
python3 extract_video_metadata.py <api_key>
python3 extract_clips.py <api_key>
```

---

## Demo-Stand

Aktuell ist nur **Genesis 1** vollständig indexiert:
- 16 Videos aus der BibleTV Bibelthek
- 85 Vers-Referenzen (Genesis 1:1 – 1:31 + Abschnitte)
- 747 Vers-Erwähnungen, 705 mit extrahierten Clips
- 38 Vers-Kommentare (KI-synthetisiert)
- 13 Themen

In einer Vollversion würde die Pipeline auf die gesamte Bibel ausgeweitet.
