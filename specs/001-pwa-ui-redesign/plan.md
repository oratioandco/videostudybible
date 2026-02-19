# Implementation Plan: PWA Bible Reader UI Redesign

**Branch**: `001-pwa-ui-redesign` | **Date**: 2026-02-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-pwa-ui-redesign/spec.md`

## Summary

Redesign the Video Study Bible React app (Create React App) to visually match the ProtoBible PWA Bible reader. Introduce the Diagramm font, a dark color theme based on ProtoBible's design tokens, a responsive layout (bottom-sheet overlay on mobile / sidebar on desktop at 1024px), correct API authentication to load real video thumbnails, and a translation label switcher. All changes are in-place edits to existing files — no new dependencies, no Tailwind, no backend changes.

## Technical Context

**Language/Version**: JavaScript (ES2022), React 18.2, Create React App 5 (react-scripts 5.0.1)
**Primary Dependencies**: react 18.2, lucide-react 0.312, react-player 2.14.1 (no new deps added)
**Storage**: N/A (no persistence layer)
**Testing**: react-scripts test (Jest + React Testing Library, pre-configured)
**Target Platform**: Web browser (desktop + mobile responsive)
**Project Type**: Single web application (frontend only)
**Performance Goals**: Overlay opens within 300ms of verse click; no layout jank at breakpoint
**Constraints**: No npm installs, no CRA eject, no Tailwind; plain CSS only; Genesis 1 scope preserved
**Scale/Scope**: Single-page demo app, ~8 files modified, ~2 new micro-components

## Constitution Check

*Constitution is a blank template — no project-specific gates defined. No violations.*

All changes are additive or replacements within existing files. No new libraries, no architectural changes, no data persistence changes. Risk is low.

## Project Structure

### Documentation (this feature)

```text
specs/001-pwa-ui-redesign/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api-contracts.md # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
video-study-bible-mvp/
├── public/
│   └── fonts/                        # NEW: Diagramm font files
│       ├── Diagramm-Regular.woff
│       ├── Diagramm-Regular.woff2
│       ├── Diagramm-Bold.woff
│       └── Diagramm-Bold.woff2
├── src/
│   ├── index.css                     # MODIFIED: @font-face + CSS custom properties
│   ├── App.css                       # MODIFIED: dark theme, responsive layout
│   ├── App.js                        # MODIFIED: translation state, API key fix, detail panel
│   └── components/
│       ├── BibleViewer.css           # MODIFIED: dark verse styles
│       ├── BibleViewer.js            # MODIFIED: translation prop + display
│       ├── VideoList.css             # MODIFIED: dark card styles
│       ├── VideoList.js              # MODIFIED: thumbnail rendering
│       ├── VerseDetailPanel.js       # NEW (or inline in App.js): overlay/sidebar wrapper
│       └── TranslationSwitcher.js   # NEW (or inline in BibleViewer.js): translation picker
└── .env                              # MODIFIED: add REACT_APP_BIBELTHEK_API_KEY
```

**Structure Decision**: Single web application (Option 1). No frontend/backend split. All changes in `video-study-bible-mvp/src/` and `public/fonts/`.

## Implementation Phases

### Phase A: Foundation — Fonts & Design Tokens

**Goal**: Establish the visual foundation so all subsequent changes build on the correct system.

1. Copy Diagramm font files (Regular + Bold, woff + woff2) from ProtoBible to `public/fonts/`
2. Add `@font-face` declarations in `src/index.css`
3. Add CSS custom properties block in `:root` in `src/index.css`
4. Update `body` base styles in `src/index.css`: `background: var(--bg-primary)`, `color: var(--text-primary)`, font-family to system-ui (non-Bible areas)

**Verification**: `npm start` → app body is dark, no font errors in console.

---

### Phase B: Bible Viewer Dark Theme

**Goal**: BibleViewer renders like the ProtoBible PWA reading view.

1. Rewrite `BibleViewer.css` with dark theme:
   - `.bible-viewer`: `background: var(--bg-elevated)`, rounded corners, subtle border
   - `.bible-header`: dark background, white text, translation label styled
   - `.verse`: dark hover state (`rgba(255,255,255,0.05)` background, rounded-2xl)
   - `.verse-number`: `var(--text-muted)`, small, light weight
   - `.verse-text`: `var(--font-bible)`, `font-size: 18px`, `line-height: 1.8`, `var(--text-primary)`, `font-weight: 300`
   - `.verse.selected`: highlighted with subtle border/background
   - `.verse.has-videos`: dot indicator using `var(--accent-action)`

2. Update `BibleViewer.js`:
   - Accept `selectedTranslation` prop
   - Display `selectedTranslation.abbreviation` in header instead of hardcoded "Luther 2017"
   - Pass through to `TranslationSwitcher`

**Verification**: Genesis 1 renders with Diagramm font, dark background, muted verse numbers.

---

### Phase C: Translation Switcher

**Goal**: Header shows translation abbreviation; user can switch between options.

1. Create `TranslationSwitcher` component (inline in `BibleViewer.js` or separate file)
   - Renders current `abbreviation` as a clickable button
   - Opens a dropdown/popover with the 6 translation options
   - `onChange` callback updates `selectedTranslation` state in App.js

2. Wire `selectedTranslation` state in `App.js`:
   ```javascript
   const [selectedTranslation, setSelectedTranslation] = useState(TRANSLATIONS[0]);
   ```
   Pass to `BibleViewer` and down to `TranslationSwitcher`.

**Verification**: Clicking translation label opens picker; selecting GNB updates header label to "GNB".

---

### Phase D: Responsive Layout — Overlay + Sidebar

**Goal**: Mobile gets bottom-sheet overlay; desktop gets sidebar.

1. Rewrite `App.css` layout:
   - Remove `grid-template-columns: 1fr 1fr`
   - Use `display: flex; flex-direction: column` at base
   - At `@media (min-width: 1024px)`: `flex-direction: row`, Bible text `flex: 1`, detail panel `width: 350px; flex-shrink: 0`
   - Bottom-sheet overlay styles: `position: fixed; bottom: 0; left: 0; right: 0; transform: translateY(100%); transition: transform 0.3s ease`; `.is-open { transform: translateY(0) }`
   - Backdrop: `position: fixed; inset: 0; background: var(--overlay-medium); opacity: 0; transition: opacity 0.3s`

2. Create `VerseDetailPanel` component (wraps existing VideoList + verse info):
   - Props: `isOpen`, `verseRef`, `videos`, `onClose`, `onPlayClip`
   - Renders as overlay below 1024px; sidebar above 1024px (controlled by CSS class + `isOpen` state)
   - Includes close button (X) for mobile

3. Update `App.js`:
   - Add `isDetailOpen` state
   - On `onVerseSelect`: set `isDetailOpen = true`
   - Pass `isOpen` and `onClose` to `VerseDetailPanel`

**Verification**: At 375px: clicking verse → bottom sheet slides up. At 1280px: clicking verse → sidebar appears, Bible text still visible.

---

### Phase E: Video Thumbnails

**Goal**: Real thumbnail images load in video cards.

1. Fix API authentication in `App.js`:
   - Replace `X-API-KEY` + `Authorization: Bearer` headers with single `Key: process.env.REACT_APP_BIBELTHEK_API_KEY` header
   - Store and re-send `session_uuid` from API response

2. Add `REACT_APP_BIBELTHEK_API_KEY` to `.env`

3. Update `VideoList.js` — `ClipCard` component:
   - Add thumbnail image at the top of each card:
     ```jsx
     {video.thumb && (
       <img
         src={video.thumb}
         alt={displayTitle}
         onError={e => { e.target.style.display = 'none'; }}
         style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '6px 6px 0 0' }}
       />
     )}
     ```
   - Fallback: if `thumb` is empty, show colored category-tinted placeholder div

4. Update `VideoList.css`: dark card styles (dark background, white text, subtle border)

**Verification**: DevTools Network tab shows image requests with `Key` header returning 200; video cards show thumbnail images.

---

### Phase F: App-wide Dark Theme Polish

**Goal**: Header, tabs, and all remaining UI components match the dark theme.

1. Update `App.css`:
   - Header: `background: var(--bg-elevated)` instead of purple gradient
   - Tab bar: dark background, white text, `var(--accent-action)` active indicator
   - Tab content area: `background: var(--bg-elevated)`, white text
   - Loading spinner: adapt to dark theme
   - Remove all `#667eea`, `#764ba2`, `#f5f7fa`, `#ffffff` hardcoded values — replace with CSS variables

2. Update other component CSS files as needed:
   - `Commentary.css`, `CrossReferences.css`, `AIInsights.css` — replace light-background card styles with dark equivalents

**Verification**: Full app renders consistently dark with no light-mode artifacts visible.

## Complexity Tracking

No constitution violations. No complexity justification needed.
