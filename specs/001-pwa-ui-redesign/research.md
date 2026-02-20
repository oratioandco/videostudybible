# Research: PWA Bible Reader UI Redesign

**Feature**: 001-pwa-ui-redesign
**Date**: 2026-02-19

---

## Decision 1: CSS Strategy — Plain CSS with Design Token Variables (no Tailwind)

**Decision**: Replicate ProtoBible PWA design tokens using CSS custom properties (variables) in plain CSS files. Do NOT install Tailwind CSS.

**Rationale**: The project uses Create React App with plain `.css` files across 10 components. Tailwind would require PostCSS config, `tailwind.config.js`, and a full refactor of existing CSS files — large blast radius for a UI-only change. CSS custom properties can replicate the same design token system (colors, spacing, typography) with zero new tooling. CRA 5.x supports CSS variables natively.

**Alternatives considered**:
- Tailwind CSS — rejected: requires eject or CRACO, rewrites all existing CSS, too much scope
- Styled-components / CSS-in-JS — rejected: adds a runtime dependency, not consistent with existing codebase pattern
- CSS Modules — rejected: existing code uses global CSS class names; migration cost not warranted

---

## Decision 2: Diagramm Font — Copy from ProtoBible PWA public/fonts/

**Decision**: Copy `Diagramm-Regular.woff`, `Diagramm-Regular.woff2`, `Diagramm-Bold.woff`, `Diagramm-Bold.woff2` from `/StudioProjects/ProtoBible/packages/pwa/public/fonts/` into `video-study-bible-mvp/public/fonts/`. Declare via `@font-face` in `index.css`.

**Rationale**: The files already exist and are self-hosted. No npm package or CDN required. The font is proprietary to the ProtoBible project, so copying it locally within the same developer's workspace is appropriate for internal demos.

**Alternatives considered**:
- Google Fonts (no Diagramm equivalent available)
- System serif — acceptable fallback only, doesn't match the PWA aesthetic
- Lora / Playfair Display from Google Fonts — could substitute but would not match the reference design exactly

---

## Decision 3: Video Thumbnail Auth — thumb URLs are unauthenticated; fix is API key in search request

**Decision**: The `thumb` field URLs returned by the Bibelthek API are plain CDN URLs — no `Key` header is needed to load the images themselves. The root cause of broken thumbnails is that the `study_bible_database.json` video objects use a `thumb` field that may be missing or empty (the local JSON was generated without thumbnails), and the API search request uses wrong headers (`X-API-KEY` / `Authorization: Bearer` instead of `Key`).

**Fix approach**:
1. Correct the API authentication header: change from `X-API-KEY` + `Authorization: Bearer` to single `Key: <value>` header
2. Add `REACT_APP_BIBELTHEK_API_KEY` to `.env` with the actual key value
3. In VideoList / ClipCard, render `video.thumb` from the API-enriched data (not just from local JSON)
4. Add `onError` fallback for broken thumbnails

**Rationale**: ProtoBible's `BibelthekAPIService` uses `headers: { 'Key': this.apiKey }` — a single custom header, not a Bearer token. The current videostudybible code uses both `X-API-KEY` and `Authorization: Bearer` which are incorrect for this API.

**Note on BibelTV thumbnails**: For Kaltura-based videos (BibelTV API), thumbnails are constructed as `https://api.medianac.com/p/107/sp/10700/thumbnail/entry_id/{kalturaId}/width/640` — also unauthenticated. But the study data primarily uses the Bibelthek API's `thumb` field.

---

## Decision 4: Responsive Layout — CSS media query + conditional overlay vs. sidebar

**Decision**: Implement the responsive pattern using a CSS media query at 1024px (matching ProtoBible PWA's `lg:` breakpoint). Below 1024px: verse detail renders as a fixed bottom-sheet overlay with slide-up animation using CSS transitions. At 1024px+: the layout becomes a flex-row with Bible text on the left and a fixed-width detail panel on the right (350px, matching ProtoBible PWA).

**Rationale**: The ProtoBible PWA's `StudyLayout.tsx` uses `flex-col lg:flex-row` with a `w-full lg:w-[350px]` right panel. Replicating this with a CSS media query is straightforward. For the mobile overlay, a CSS `position: fixed; bottom: 0` bottom-sheet pattern with a CSS `transform: translateY(100%)` → `translateY(0)` transition avoids any animation library dependency.

**Alternatives considered**:
- Framer Motion (used in ProtoBible VerseDetail.tsx) — rejected: not already installed in the CRA project; adds 40kb
- React Spring — rejected: same concern
- CSS-only with `display: none` toggle — simpler but no animation; acceptable but lower quality
- `react-modal` — rejected: overkill for a bottom sheet

---

## Decision 5: Translation Switcher — UI-only dropdown, no live API re-fetch

**Decision**: Implement a translation switcher as a dropdown/select near the Bible header that updates a display label. For the Genesis 1 demo, the underlying verse text remains the same (hardcoded Luther 2017 text). The switcher updates state and the displayed abbreviation label only.

**Rationale**: The spec explicitly states "the underlying API call may remain pointed at the existing default translation." Full translation-aware API fetching is out of scope.

**Alternatives considered**:
- Full API refetch on translation change — out of scope per spec
- No switcher — P4 priority, included per spec

---

## Decision 6: Color Theme — Dark design tokens from ProtoBible PWA

**Decision**: Replace the current purple gradient / light-gray color scheme with the ProtoBible PWA dark theme:

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0E0E0E` | Main background |
| `--bg-elevated` | `#1a1a1a` | Cards, panels |
| `--bg-border` | `rgba(255,255,255,0.08)` | Dividers |
| `--text-primary` | `rgba(255,255,255,1.0)` | Verse text |
| `--text-secondary` | `rgba(255,255,255,0.8)` | Subtitles |
| `--text-muted` | `rgba(255,255,255,0.5)` | Verse numbers |
| `--text-disabled` | `rgba(255,255,255,0.4)` | Inactive labels |
| `--accent-action` | `#3b82f6` | Buttons, active states |
| `--overlay-medium` | `rgba(0,0,0,0.5)` | Overlay backdrop |

**Rationale**: Directly taken from ProtoBible's `colors.ts` design tokens.

---

## Decision 7: App structure — keep existing component boundaries, update in-place

**Decision**: Do not create new files beyond a `fonts/` public directory and minor CSS additions. Update existing files:
- `public/fonts/` — add Diagramm font files
- `src/index.css` — add `@font-face`, CSS variables, base dark theme
- `src/App.css` — replace light-gray layout with dark theme, add responsive overlay/sidebar layout
- `src/App.js` — add translation state, fix API auth header, add overlay/sidebar toggle logic
- `src/components/BibleViewer.css` — dark verse styles
- `src/components/BibleViewer.js` — add translation prop display
- `src/components/VideoList.css` — dark card styles
- `src/components/VideoList.js` — render `video.thumb` thumbnail image in ClipCard
- `.env` — add `REACT_APP_BIBELTHEK_API_KEY`

**Rationale**: The spec is a UI redesign; all core logic remains. Minimum necessary changes.
