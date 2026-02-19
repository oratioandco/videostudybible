# Tasks: PWA Bible Reader UI Redesign

**Input**: Design documents from `specs/001-pwa-ui-redesign/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Organization**: Tasks grouped by user story (P1–P4) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Get fonts and environment config in place — required by all user stories

- [x] T001 Copy Diagramm-Regular.woff and Diagramm-Regular.woff2 into `video-study-bible-mvp/public/fonts/` from `/Users/ttreppmann/StudioProjects/ProtoBible/packages/pwa/public/fonts/`
- [x] T002 [P] Copy Diagramm-Bold.woff and Diagramm-Bold.woff2 into `video-study-bible-mvp/public/fonts/` from `/Users/ttreppmann/StudioProjects/ProtoBible/packages/pwa/public/fonts/`
- [x] T003 Add `REACT_APP_BIBELTHEK_API_KEY=<value>` to `video-study-bible-mvp/.env` (copy key from ProtoBible `.env` as `VITE_BIBELTHEK_API_KEY`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: CSS design token system and font declarations — every visual user story builds on this

**⚠️ CRITICAL**: US1, US2, US3, US4 all depend on these tokens being in place

- [x] T004 Add `@font-face` rules for Diagramm-Regular (woff2 + woff) and Diagramm-Bold (woff2 + woff) in `video-study-bible-mvp/src/index.css`
- [x] T005 Add CSS custom properties block to `:root` in `video-study-bible-mvp/src/index.css`: `--bg-primary: #0E0E0E`, `--bg-elevated: #1a1a1a`, `--bg-border: rgba(255,255,255,0.08)`, `--text-primary: rgba(255,255,255,1.0)`, `--text-secondary: rgba(255,255,255,0.8)`, `--text-muted: rgba(255,255,255,0.5)`, `--text-disabled: rgba(255,255,255,0.4)`, `--accent-action: #3b82f6`, `--overlay-medium: rgba(0,0,0,0.5)`, `--font-bible: 'Diagramm', Georgia, serif`, `--detail-panel-width: 350px`
- [x] T006 Update `body` base styles in `video-study-bible-mvp/src/index.css`: set `background: var(--bg-primary)`, `color: var(--text-primary)`, remove old font-family stack and replace with `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Checkpoint**: Foundation ready — all CSS variables available; Diagramm font declared. `npm start` should show dark body with no console errors.

---

## Phase 3: User Story 1 — Visually Refined Bible Reading Experience (Priority: P1) 🎯 MVP

**Goal**: Replace the current purple/light theme with ProtoBible PWA's dark aesthetic: dark background, Diagramm font for verse text, muted verse numbers, subtle hover states.

**Independent Test**: Load app at any viewport width → background is near-black, verse text uses Diagramm font at ≥18px with line-height 1.8, verse numbers are small and low-opacity, hovering a verse shows a subtle rounded dark highlight. No layout breakage.

### Implementation for User Story 1

- [x] T007 [US1] Rewrite `video-study-bible-mvp/src/components/BibleViewer.css`: set `.bible-viewer` to `background: var(--bg-elevated); border-radius: 12px; border: 1px solid var(--bg-border)`, remove white background and old box-shadow
- [x] T008 [US1] Update `.bible-header` in `video-study-bible-mvp/src/components/BibleViewer.css`: dark background (`var(--bg-elevated)`), `color: var(--text-primary)`, remove purple gradient
- [x] T009 [US1] Update `.verse` in `video-study-bible-mvp/src/components/BibleViewer.css`: hover state to `background: rgba(255,255,255,0.04); border-radius: 12px`, transition `all 0.2s`
- [x] T010 [US1] Update `.verse-number` in `video-study-bible-mvp/src/components/BibleViewer.css`: `color: var(--text-muted); font-size: 0.75rem; font-weight: 300; min-width: 1.5rem; user-select: none`
- [x] T011 [US1] Update `.verse-text` in `video-study-bible-mvp/src/components/BibleViewer.css`: `font-family: var(--font-bible); font-size: 1.125rem; line-height: 1.8; color: var(--text-primary); font-weight: 300`
- [x] T012 [US1] Update `.verse.selected` in `video-study-bible-mvp/src/components/BibleViewer.css`: `background: rgba(255,255,255,0.06); border-radius: 12px` (remove purple `#ede9fe` highlight)
- [x] T013 [US1] Update `.verse.has-videos::before` dot indicator in `video-study-bible-mvp/src/components/BibleViewer.css`: `background: var(--accent-action)` (replace `#667eea`)
- [x] T014 [US1] Update `.video-indicator` in `video-study-bible-mvp/src/components/BibleViewer.css`: `color: var(--accent-action)` with subtle opacity
- [x] T015 [P] [US1] Rewrite header and tab styles in `video-study-bible-mvp/src/App.css`: replace `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` header with `background: var(--bg-elevated)`, white text for `.app-title` and logo text
- [x] T016 [P] [US1] Update tab bar styles in `video-study-bible-mvp/src/App.css`: `.tabs` border-bottom to `var(--bg-border)`, `.tab` color to `var(--text-muted)`, `.tab.active` color to `var(--text-primary)` with `border-bottom-color: var(--accent-action)` (replace `#667eea`)
- [x] T017 [P] [US1] Update `.tab-content` in `video-study-bible-mvp/src/App.css`: `background: var(--bg-elevated); color: var(--text-primary)` (remove white background and old box-shadow)
- [x] T018 [P] [US1] Update `.main-container` background in `video-study-bible-mvp/src/App.css`: remove `background: #f5f7fa`, replace with `background: var(--bg-primary)`

**Checkpoint**: US1 complete. App renders with full dark theme. Diagramm font visible on verse text. Verse numbers muted. Hover effect visible on dark background.

---

## Phase 4: User Story 2 — Responsive Layout: Overlay on Mobile, Sidebar on Desktop (Priority: P2)

**Goal**: On mobile (< 1024px) a tapped verse opens a slide-up bottom-sheet overlay; on desktop (≥ 1024px) the detail panel appears as a right-hand sidebar alongside the Bible text.

**Independent Test**: At 375px width: click verse → bottom sheet slides up from below with a close button. At 1280px width: click verse → right sidebar appears and Bible text remains visible side-by-side. Resize from mobile to desktop → layout switches correctly.

### Implementation for User Story 2

- [x] T019 [US2] Create `video-study-bible-mvp/src/components/VerseDetailPanel.js`: accepts props `{ isOpen, verseRef, videos, onClose, onPlayClip }`, renders `<div className="verse-detail-panel">` containing the existing VideoList and verse header, with a close button (`×`) in the panel header
- [x] T020 [US2] Add CSS for `VerseDetailPanel` in new file `video-study-bible-mvp/src/components/VerseDetailPanel.css`: `.verse-detail-panel` base styles `position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg-elevated); border-top: 1px solid var(--bg-border); transform: translateY(100%); transition: transform 0.3s ease; z-index: 100; max-height: 85vh; overflow-y: auto; border-radius: 16px 16px 0 0`
- [x] T021 [US2] Add open state CSS in `video-study-bible-mvp/src/components/VerseDetailPanel.css`: `.verse-detail-panel.is-open { transform: translateY(0) }` and backdrop `.verse-detail-backdrop { position: fixed; inset: 0; background: var(--overlay-medium); opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 99 }` / `.verse-detail-backdrop.is-open { opacity: 1; pointer-events: auto }`
- [x] T022 [US2] Add desktop sidebar override in `video-study-bible-mvp/src/components/VerseDetailPanel.css`: `@media (min-width: 1024px) { .verse-detail-panel { position: sticky; transform: none; width: 0 when closed, var(--detail-panel-width) when open; flex-shrink: 0; overflow-y: auto } .verse-detail-backdrop { display: none } }`
- [x] T023 [US2] Rewrite `.main-container` layout in `video-study-bible-mvp/src/App.css`: remove `grid-template-columns: 1fr 1fr`, add `display: flex; flex-direction: column` at base and `@media (min-width: 1024px) { .main-container { flex-direction: row } .left-panel { flex: 1; min-width: 0 } }`
- [x] T024 [US2] Add `isDetailOpen` state to `video-study-bible-mvp/src/App.js`: `const [isDetailOpen, setIsDetailOpen] = useState(false)`, update `handleVerseSelect` to also call `setIsDetailOpen(true)`, add `handleCloseDetail` that calls `setIsDetailOpen(false)`
- [x] T025 [US2] Import and render `VerseDetailPanel` in `video-study-bible-mvp/src/App.js`: VerseDetailPanel placed inside .main-container flex row for proper desktop sidebar column behavior
- [x] T026 [US2] Add close button styles in `video-study-bible-mvp/src/components/VerseDetailPanel.css`: `.panel-close-btn { ... }` and hide on desktop with `@media (min-width: 1024px) { .panel-close-btn { display: none } }`

**Checkpoint**: US2 complete. Mobile overlay and desktop sidebar both function. Bible text visible alongside detail panel on wide screens.

---

## Phase 5: User Story 3 — Real Video Thumbnails from BibelTV API (Priority: P3)

**Goal**: Video cards display real thumbnail images from the `thumb` field. API authentication uses the correct `Key` header. Broken thumbnails fall back gracefully.

**Independent Test**: Open DevTools Network tab, select a verse with videos → image requests show `Key` header in request headers, images return HTTP 200, video cards show actual thumbnails not grey boxes.

### Implementation for User Story 3

- [x] T027 [US3] Fix API authentication in `video-study-bible-mvp/src/App.js`: in the `fetchBibleText` async function, replace the headers object `{ 'X-API-KEY': '...', 'Authorization': 'Bearer ...' }` with `{ 'Key': process.env.REACT_APP_BIBELTHEK_API_KEY, 'Accept': 'application/json' }`
- [x] T028 [US3] Add session UUID persistence in `video-study-bible-mvp/src/App.js`: add `const sessionUUIDRef = useRef(null)`, append `session_uuid` query param if set (`&session_uuid=${sessionUUIDRef.current}`), and after successful response parse: `if (data.session_uuid) sessionUUIDRef.current = data.session_uuid`
- [x] T029 [US3] Add thumbnail image rendering to `ClipCard` in `video-study-bible-mvp/src/components/VideoList.js`: renders `<img src={thumb}>` at top of card with onError fallback to dark placeholder
- [x] T030 [US3] Update `ClipCard` container background in `video-study-bible-mvp/src/components/VideoList.js`: change inline style from `background: '#fff'` to `background: 'var(--bg-elevated)'` and `border: '1px solid var(--bg-border)'`
- [x] T031 [US3] Update `ClipCard` text colors in `video-study-bible-mvp/src/components/VideoList.js`: change title color from `#111827` to `var(--text-primary)`, description/context color from `#6b7280` to `var(--text-muted)`, speaker text color to `var(--text-secondary)`
- [x] T032 [P] [US3] Update `.cc-card:hover` in `video-study-bible-mvp/src/components/VideoList.css`: change box-shadow from `rgba(102,126,234,.18)` to `rgba(59,130,246,0.2)` to match `--accent-action` blue
- [x] T033 [P] [US3] Update chip hover styles in `video-study-bible-mvp/src/components/VideoList.css`: `.vl-chip.active { background: var(--accent-action) !important; border-color: var(--accent-action) !important }` (replace `#667eea`)
- [x] T034 [P] [US3] Update play button color in `video-study-bible-mvp/src/components/VideoList.js`: change inline `background: '#667eea'` to `background: 'var(--accent-action)'` on the play/open button

**Checkpoint**: US3 complete. Video cards show real thumbnails on verses that have API-returned video data. Fallback placeholder shown for empty thumbs.

---

## Phase 6: User Story 4 — Translation Switcher (Priority: P4)

**Goal**: A translation picker in the Bible reader header shows the active translation abbreviation and lets users switch between 6 German translations.

**Independent Test**: Click the translation label in the header → dropdown appears with 6 options. Select "GNB" → header label updates to "GNB". Select "LUT" → label updates to "LUT".

### Implementation for User Story 4

- [x] T035 [US4] Add `TRANSLATIONS` constant array in `video-study-bible-mvp/src/components/BibleViewer.js`: `[{ id: 'LUT', name: 'Lutherbibel 2017', abbreviation: 'LUT' }, { id: 'GNB', name: 'Gute Nachricht Bibel', abbreviation: 'GNB' }, { id: 'ELB', name: 'Elberfelder Bibel', abbreviation: 'ELB' }, { id: 'EU', name: 'Einheitsübersetzung 2016', abbreviation: 'EÜ' }, { id: 'NGÜ', name: 'Neue Genfer Übersetzung', abbreviation: 'NGÜ' }, { id: 'SLT', name: 'Schlachter 2000', abbreviation: 'SLT' }]`
- [x] T036 [US4] Add `selectedTranslation` prop to `BibleViewer` in `video-study-bible-mvp/src/components/BibleViewer.js`: update function signature to include `selectedTranslation` and `onTranslationChange`; replace hardcoded `<p className="translation">Luther 2017 (via Bibel TV)</p>` with a `TranslationSwitcher` inline component
- [x] T037 [US4] Create inline `TranslationSwitcher` component in `video-study-bible-mvp/src/components/BibleViewer.js`: a small `useState(false)` for open/closed, renders a button showing `selectedTranslation.abbreviation` and a dropdown `<ul>` of translation options on open; each option calls `onTranslationChange(t)` and closes the dropdown
- [x] T038 [US4] Add `TranslationSwitcher` styles in `video-study-bible-mvp/src/components/BibleViewer.css`: `.translation-switcher`, `.translation-btn`, `.translation-dropdown`, `.translation-option` styles with dark theme
- [x] T039 [US4] Add `selectedTranslation` state in `video-study-bible-mvp/src/App.js`: `const [selectedTranslation, setSelectedTranslation] = useState({ id: 'LUT', name: 'Lutherbibel 2017', abbreviation: 'LUT' })` and pass `selectedTranslation={selectedTranslation}` and `onTranslationChange={setSelectedTranslation}` as props to `BibleViewer`

**Checkpoint**: US4 complete. Translation picker visible in header. Selecting different translation updates the abbreviation label.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Remaining CSS component updates for full dark-theme consistency across Commentary, CrossReferences, AIInsights, and SearchBar

- [x] T040 [P] Update `video-study-bible-mvp/src/components/Commentary.css`: replace any white/light backgrounds with `var(--bg-elevated)`, text colors to `var(--text-primary)`/`var(--text-secondary)`, borders to `var(--bg-border)`
- [x] T041 [P] Update `video-study-bible-mvp/src/components/CrossReferences.css`: replace white backgrounds and `#667eea` accent colors with dark theme variables
- [x] T042 [P] Update `video-study-bible-mvp/src/components/AIInsights.css`: replace white/light panel backgrounds with `var(--bg-elevated)`, update chip/button active colors to `var(--accent-action)`
- [x] T043 [P] Update `video-study-bible-mvp/src/components/SearchBar.css`: dark input background (`var(--bg-elevated)`), white text, border `var(--bg-border)`
- [x] T044 Update `video-study-bible-mvp/public/index.html`: change `<meta name="theme-color" content="#667eea">` to `<meta name="theme-color" content="#0E0E0E">`
- [x] T045 Run quickstart.md verification checklist: confirm all 7 items pass at both 375px and 1280px viewports; check browser console for zero JS errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T001 and T002 are parallel.
- **Foundational (Phase 2)**: Depends on Phase 1 (font files must exist before `@font-face`). BLOCKS all user stories.
- **User Story Phases (3–6)**: All depend on Foundational phase. Can be worked in priority order or parallel.
- **Polish (Phase 7)**: Depends on all user stories desired being complete.

### User Story Dependencies

- **US1 (P1)**: After Foundational — no story dependencies. Pure visual CSS changes to existing files.
- **US2 (P2)**: After Foundational — independent of US1 (different structural changes). However, US1's dark theme makes US2's overlay/sidebar look correct, so doing US1 first is recommended.
- **US3 (P3)**: After Foundational — independent of US1 and US2. Dark card styling in T030–T031 requires the CSS variables from Foundational.
- **US4 (P4)**: After Foundational — independent of all other stories. Pure JS + CSS addition to BibleViewer.

### Within Each Story

- CSS file changes within a story can all run in parallel
- JS changes (state, props) follow dependency order: parent state before child prop consumption

### Parallel Opportunities

- T001 + T002: Both font copy operations run in parallel
- T015, T016, T017, T018: Different CSS rules in App.css, write sequentially (same file) unless batching
- T007–T014: All BibleViewer.css rules, write sequentially (same file)
- T040, T041, T042, T043: All different CSS files, fully parallel in Phase 7

---

## Parallel Example: User Story 1

```text
# These CSS rules can be added in one pass to BibleViewer.css:
T007: .bible-viewer dark background
T008: .bible-header dark styles
T009: .verse hover state
T010: .verse-number muted styles
T011: .verse-text Diagramm font
T012: .verse.selected dark highlight
T013: .verse.has-videos::before dot color
T014: .video-indicator color

# These App.css rules can be added in one pass (different selectors):
T015: header gradient removal
T016: tab bar dark styles
T017: tab-content dark background
T018: main-container background
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (copy fonts + set API key)
2. Complete Phase 2: Foundational (CSS variables + font-face)
3. Complete Phase 3: User Story 1 (dark theme + Diagramm font)
4. **STOP and VALIDATE**: Load at localhost:3000 — dark background, Diagramm font, muted verse numbers, hover states
5. Demo-ready minimal version

### Incremental Delivery

1. Phase 1 + 2 → Dark base theme ready
2. + Phase 3 (US1) → Premium dark reading experience ✓
3. + Phase 4 (US2) → Responsive overlay/sidebar ✓
4. + Phase 5 (US3) → Real thumbnails loading ✓
5. + Phase 6 (US4) → Translation switcher ✓
6. + Phase 7 → Full polish across all components ✓

---

## Notes

- All paths relative to repo root `video-study-bible-mvp/`
- No new npm packages — this is purely CSS and JS changes to existing files
- CSS custom properties are defined in `src/index.css` and cascade to all components
- The `Key` header fix (T027) is critical — without it thumbnails will still fail even after T029
- Font files must exist in `public/fonts/` before `npm start` or `@font-face` src will 404 (handled in Phase 1)
- `REACT_APP_` prefix is required by Create React App for env vars exposed to the browser
