# Implementation Plan: UI Polish - Default View, Layout Centering, Filter Pills

**Branch**: `005-ui-polish` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-ui-polish/spec.md`

## Summary

Three UI fixes: (1) Set Reading mode as default view for Bible section, (2) Center Bible text when panels are collapsed on desktop, (3) Limit preacher filter pills in AI chat to single horizontal line.

## Technical Context

**Language/Version**: JavaScript (ES2020), CSS3
**Primary Dependencies**: React 18.2, CSS custom properties
**Storage**: localStorage (for view mode preference)
**Testing**: Manual testing in browser
**Target Platform**: Web (desktop ≥1200px, mobile)
**Project Type**: Single-page React app
**Performance Goals**: No impact on existing performance
**Constraints**: CSS-only changes preferred, minimal JS changes
**Scale/Scope**: 3 small UI fixes

## Constitution Check

*No constitution gates defined - project uses template constitution*

## Project Structure

### Documentation (this feature)

```text
specs/005-ui-polish/
├── plan.md              # This file
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Validation checklist
```

### Source Code (repository root)

```text
video-study-bible-mvp/src/
├── App.js                      # FR-001: Default viewMode to 'reading'
├── App.css                     # FR-003: Center bible column
├── components/
│   └── AIInsights.js          # FR-004: Limit speaker chips to 1 line
│   └── AIInsights.css         # FR-004: Speaker chip overflow styles
```

**Structure Decision**: Existing React app structure. Changes are localized to 4 files.

## Complexity Tracking

No constitution violations - simple CSS/JS changes only.

## Implementation Tasks

### Task 1: Set Reading Mode as Default (FR-001, FR-002)

**File**: `video-study-bible-mvp/src/App.js`

**Change**: Update initial state for `viewMode`:
```javascript
// Before
const [viewMode, setViewMode] = useState(() => {
  const saved = localStorage.getItem('vsb-view-mode');
  return (saved === 'reading' || saved === 'study') ? saved : 'study';
});

// After
const [viewMode, setViewMode] = useState(() => {
  const saved = localStorage.getItem('vsb-view-mode');
  return (saved === 'reading' || saved === 'study') ? saved : 'reading';
});
```

**Acceptance**: Fresh load opens Bible in Reading mode; preference persists.

---

### Task 2: Center Bible Text on Desktop (FR-003)

**File**: `video-study-bible-mvp/src/App.css`

**Change**: Add centering rule for bible column when panels are closed:

```css
@media (min-width: 1200px) {
  /* Center bible column when no panels are open */
  .main-container:not(:has(.verse-detail-panel.is-open)):not(:has(.notes-chat-panel.is-open)) .bible-column {
    margin: 0 auto;
  }
}
```

**Fallback (if :has() not supported)**:
```css
@media (min-width: 1200px) {
  .main-container .bible-column {
    margin: 0 auto;
    max-width: 680px;
  }
}
```

**Acceptance**: Bible text is centered when both detail panel and notes panel are closed.

---

### Task 3: Single-Line Speaker Filter Pills (FR-004, FR-005)

**File**: `video-study-bible-mvp/src/components/AIInsights.css`

**Change**: Limit speaker chips container to single line:

```css
.speaker-chips {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 0.5rem;
  padding-bottom: 0.25rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.speaker-chips::-webkit-scrollbar {
  display: none;
}
```

**Acceptance**: Speaker filter pills stay on one line; horizontal scroll to see all.

---

## Testing Checklist

- [ ] Fresh page load shows Reading mode active
- [ ] Switching to Study mode persists after refresh
- [ ] Bible text centered when panels closed on desktop
- [ ] Speaker pills single line, horizontally scrollable
- [ ] All speakers accessible via scroll on mobile
