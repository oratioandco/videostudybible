# Data Model: PWA Bible Reader UI Redesign

**Feature**: 001-pwa-ui-redesign
**Date**: 2026-02-19

This is a UI-only feature. No new backend storage is introduced. Entities below describe the runtime data shapes flowing through the React component tree.

---

## Entity: Verse

Represents a single Bible verse rendered in the reading view.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `verseNum` | number | Hardcoded 1–31 | Genesis 1 scope |
| `text` | string | `getVerseText(n)` in BibleViewer.js | Luther 2017, hardcoded |
| `isSelected` | boolean | `selectedVerse` state in App.js | Drives detail panel open state |
| `hasVideos` | boolean | Derived from `studyData.verses.genesis1` | Whether any clips reference this verse |
| `videoCount` | number | Derived count | Displayed in verse indicator badge |

**State transitions**:
- Default → Selected (user clicks verse) → triggers VerseDetailPanel open
- Selected → Default (user closes detail panel)

---

## Entity: Video / Clip

Represents a video clip associated with one or more Bible verses.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | number | `studyData` JSON / API response | Bibelthek video ID |
| `title` | string | `video.title` | Raw filename-style title |
| `displayTitle` | string | `video.display_title \|\| cleanTitle(title)` | Human-readable |
| `thumb` | string | `video.thumb` (API response field) | CDN URL, no auth required |
| `speaker` | string \| null | `video.speaker` | Speaker name |
| `speakerAvatar` | string \| null | `video.speaker_avatar` | Avatar image URL |
| `series` | string \| null | `video.series` | Series name |
| `organization` | string \| null | `video.organization` | Publishing organization |
| `mentions` | Mention[] | `video.mentions` | Verse reference timestamps |
| `category` | string \| null | `mention.category` | One of the 5 category keys |

### Sub-entity: Mention

| Field | Type | Notes |
|-------|------|-------|
| `timestamp` | number | Milliseconds into video |
| `clip_start_ms` | number \| null | Start of relevant clip |
| `clip_end_ms` | number \| null | End of relevant clip |
| `clip_title` | string \| null | Optional clip title |
| `clip_description` | string \| null | Optional clip description |
| `context` | string \| null | Context text |
| `category` | string \| null | Category tag |

**Validation rules**:
- `thumb` may be empty string — UI must handle with fallback image
- `clip_start_ms` null means no precise clip, show full video

---

## Entity: Translation

Represents a German Bible translation option in the switcher.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Internal identifier (e.g., `'LUT'`) |
| `name` | string | Full display name (e.g., `'Lutherbibel 2017'`) |
| `abbreviation` | string | Short label shown in header (e.g., `'LUT'`) |

**Available translations** (static list, UI-only for this feature):

| id | name | abbreviation |
|----|------|--------------|
| `LUT` | Lutherbibel 2017 | LUT |
| `GNB` | Gute Nachricht Bibel | GNB |
| `ELB` | Elberfelder Bibel | ELB |
| `EU` | Einheitsübersetzung 2016 | EÜ |
| `NGÜ` | Neue Genfer Übersetzung | NGÜ |
| `SLT` | Schlachter 2000 | SLT |

---

## Entity: UI State (App-level)

React state managed in `App.js` that drives layout decisions.

| State field | Type | Initial value | Notes |
|-------------|------|---------------|-------|
| `selectedVerse` | string | `'Genesis 1:1'` | Format: `'Genesis 1:N'` |
| `isDetailOpen` | boolean | `false` | Controls overlay/sidebar visibility |
| `selectedTranslation` | Translation | `{ id: 'LUT', name: 'Lutherbibel 2017', abbreviation: 'LUT' }` | Currently displayed translation |
| `studyData` | object \| null | `null` | Loaded from local JSON |
| `loading` | boolean | `true` | Loading state |
| `currentVideo` | object \| null | `null` | Video currently playing |
| `currentTimestamp` | number | `0` | Playback start position |
| `currentClipEnd` | number \| null | `null` | Playback end boundary |
| `activeTab` | string | `'commentary'` | Active study tab |

---

## Layout Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 1024px | Bible text full-width; verse detail = fixed bottom-sheet overlay |
| Desktop | ≥ 1024px | Bible text column (flex: 1) + detail sidebar (350px) side by side |
