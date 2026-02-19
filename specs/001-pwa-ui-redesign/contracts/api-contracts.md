# API Contracts: PWA Bible Reader UI Redesign

**Feature**: 001-pwa-ui-redesign
**Date**: 2026-02-19

This feature has no new backend endpoints. It consumes two existing external APIs. Contracts below document the correct usage patterns.

---

## Contract 1: Bibelthek Search API

**Endpoint**: `GET https://bibelthek-backend.bibeltv.de/search.json`

**Purpose**: Fetch Bible chapter content with associated video metadata (including thumbnail URLs)

### Request

```
GET /search.json?query=Genesis%201&bible_abbr=LUT
Host: bibelthek-backend.bibeltv.de
Key: <REACT_APP_BIBELTHEK_API_KEY>
Accept: application/json
Content-Type: application/json
```

**Required headers**:

| Header | Value | Notes |
|--------|-------|-------|
| `Key` | API key string | NOT `X-API-KEY`, NOT `Authorization: Bearer` |

**Query parameters**:

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `query` | string | Yes | Bible reference, e.g. `Genesis 1` |
| `bible_abbr` | string | Yes | Translation abbreviation: `LUT`, `GNB`, `ELB`, `EU`, `NGÜ`, `SLT` |
| `session_uuid` | string | No | Session continuity token, echoed from previous response |

### Response

```json
{
  "status": 200,
  "error": null,
  "message": "OK",
  "session_uuid": "uuid-string",
  "content": {
    "type": "chapter",
    "slug": "genesis-1",
    "name": "1. Mose 1",
    "chapter_number": 1,
    "contents_by_bible_abbr": {
      "LUT": {
        "contents": [
          {
            "id": "gen-1-1",
            "type": "verse",
            "content": "Am Anfang schuf Gott Himmel und Erde.",
            "verse_number": "1",
            "videos": [
              {
                "id": 12345,
                "active": true,
                "slug": "schoepfung-genesis",
                "title": "Schöpfung - Genesis 1",
                "thumb": "https://cdn.example.com/thumb/12345.jpg",
                "description": "Eine Erklärung des Schöpfungsberichts"
              }
            ]
          }
        ]
      }
    }
  }
}
```

**Key contract points**:
- `content.contents_by_bible_abbr[abbr].contents[].videos[].thumb` is the thumbnail URL — a plain HTTPS CDN URL, no auth header needed to load it
- `session_uuid` should be stored and sent on subsequent requests for session continuity
- The `Key` header is the only authentication mechanism

### Error states

| HTTP Status | Meaning | App behavior |
|-------------|---------|--------------|
| 401 | Invalid or missing API key | Show error state, fall back to hardcoded text |
| 404 | Verse/chapter not found | Show empty state |
| 5xx | Server error | Fall back to local studyData JSON |

---

## Contract 2: Local Study Data JSON

**Source**: `public/study_bible_data/study_bible_database.json`

**Purpose**: Pre-curated video metadata with clip timestamps for Genesis 1 verses

### Shape

```json
{
  "metadata": {
    "total_videos": 57,
    "genesis1_videos": 16,
    "focus_chapter": "Genesis 1"
  },
  "verses": {
    "genesis1": {
      "Genesis 1:1": [
        {
          "title": "filename_style_title.mp4",
          "display_title": "Human Readable Title",
          "thumb": "https://cdn.example.com/thumb.jpg",
          "speaker": "Speaker Name",
          "speaker_avatar": "https://cdn.example.com/avatar.jpg",
          "series": "Series Name",
          "organization": "Organization Name",
          "mentions": [
            {
              "timestamp": 12000,
              "timestamp_ms": 12000,
              "clip_start_ms": 10500,
              "clip_end_ms": 45000,
              "clip_title": "Optional clip title",
              "clip_description": "Optional description",
              "context": "Context text",
              "category": "textanalyse"
            }
          ]
        }
      ]
    }
  }
}
```

**Notes**:
- `thumb` may be an empty string `""` — UI must handle with placeholder
- `speaker_avatar` may be null or absent
- `clip_start_ms` / `clip_end_ms` null means no precise clip boundary

---

## Component Contracts (UI)

### BibleViewer props

```javascript
BibleViewer({
  verse: string,          // Currently selected verse ref, e.g. "Genesis 1:1"
  bibleText: object|null, // API response (currently unused in render)
  studyData: object|null, // Local JSON data
  onVerseSelect: (verseRef: string) => void,
  onVideoSelect: (video, startMs, endMs) => void,
  selectedTranslation: { id: string, name: string, abbreviation: string }
})
```

### VerseDetailPanel props (new component or refactored section in App.js)

```javascript
VerseDetailPanel({
  isOpen: boolean,
  verseRef: string,          // e.g. "Genesis 1:1"
  videos: Video[],           // Videos for this verse from studyData
  onClose: () => void,
  onPlayClip: (video, startMs, endMs) => void
})
```

### TranslationSwitcher props (new component)

```javascript
TranslationSwitcher({
  selected: Translation,
  options: Translation[],
  onChange: (translation: Translation) => void
})
```
