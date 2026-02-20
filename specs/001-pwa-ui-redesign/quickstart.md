# Quickstart: PWA Bible Reader UI Redesign

**Feature**: 001-pwa-ui-redesign
**Branch**: `001-pwa-ui-redesign`
**Date**: 2026-02-19

## Prerequisites

- Node.js 18+
- Access to `/StudioProjects/ProtoBible/packages/pwa/public/fonts/` for Diagramm font files
- Bibelthek API key (from `.env` or ProtoBible's `.env` file)

## Setup

### 1. Copy font files

```bash
mkdir -p video-study-bible-mvp/public/fonts
cp /Users/ttreppmann/StudioProjects/ProtoBible/packages/pwa/public/fonts/Diagramm-*.woff* \
   video-study-bible-mvp/public/fonts/
```

### 2. Set API key

Add to `video-study-bible-mvp/.env`:

```
REACT_APP_BIBELTHEK_API_KEY=<key from ProtoBible .env as VITE_BIBELTHEK_API_KEY>
```

### 3. Install & run

```bash
cd video-study-bible-mvp
npm install
npm start
```

App runs at `http://localhost:3000`

## What changes in this feature

### Files modified

| File | Change |
|------|--------|
| `public/fonts/` | Add Diagramm-Regular + Diagramm-Bold (woff + woff2) |
| `src/index.css` | Add `@font-face` for Diagramm; CSS custom properties for dark theme |
| `src/App.css` | Replace purple/light theme with dark theme; responsive overlay/sidebar layout |
| `src/App.js` | Add `selectedTranslation` state; fix API `Key` header; add `isDetailOpen` toggle |
| `src/components/BibleViewer.css` | Dark verse styles (dark background, white text, dark hover states) |
| `src/components/BibleViewer.js` | Display translation abbreviation; pass `selectedTranslation` prop |
| `src/components/VideoList.css` | Dark card styles |
| `src/components/VideoList.js` | Render `video.thumb` as thumbnail image in ClipCard |
| `.env` | Add `REACT_APP_BIBELTHEK_API_KEY` |

### New components (created in-place or as small additions)

| Component | Location | Purpose |
|-----------|----------|---------|
| `TranslationSwitcher` | `src/components/BibleViewer.js` (inline) or new file | Translation dropdown in Bible header |
| `VerseDetailPanel` | Extracted from `App.js` render logic | Overlay (mobile) / sidebar (desktop) for verse detail |

## Verification checklist

1. App loads with dark background (`#0E0E0E`)
2. Genesis 1 verse text renders in Diagramm font
3. Clicking a verse on 375px viewport → bottom-sheet overlay slides up
4. Clicking a verse on 1280px viewport → right sidebar appears, Bible text remains visible
5. Video cards show actual thumbnail images (not grey placeholders)
6. Translation picker updates the abbreviation label in the header
7. No JS errors in console

## Key design tokens (CSS variables)

```css
:root {
  --bg-primary: #0E0E0E;
  --bg-elevated: #1a1a1a;
  --bg-border: rgba(255, 255, 255, 0.08);
  --text-primary: rgba(255, 255, 255, 1.0);
  --text-secondary: rgba(255, 255, 255, 0.8);
  --text-muted: rgba(255, 255, 255, 0.5);
  --text-disabled: rgba(255, 255, 255, 0.4);
  --accent-action: #3b82f6;
  --overlay-medium: rgba(0, 0, 0, 0.5);
  --font-bible: 'Diagramm', Georgia, serif;
  --detail-panel-width: 350px;
  --breakpoint-desktop: 1024px;
}
```
