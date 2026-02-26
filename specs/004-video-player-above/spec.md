# Feature Specification: Video Player Above Left Panel on Desktop

**Feature Branch**: `004-video-player-above`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "video player above left panel on desktop"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Video Player Integration with Detail Panel (Priority: P1)

As a user studying the Bible on desktop, I want the video player positioned above the commentary/detail panel so that I can watch videos and read commentary without splitting my attention across the full width of the screen.

**Why this priority**: This is the core layout change that improves the visual hierarchy and makes the video-content relationship clearer. The current layout spreads content too thin horizontally.

**Independent Test**: Can be fully tested by viewing the app on desktop (≥1200px width), selecting a verse, and verifying the video player appears directly above the commentary panel in a stacked layout.

**Acceptance Scenarios**:

1. **Given** I am on desktop (≥1200px), **When** I view the main layout, **Then** the video player is stacked vertically above the detail panel on the left side
2. **Given** I am on desktop and a video is playing, **When** I scroll the detail panel, **Then** the video player remains visible at the top of the left column
3. **Given** I am on mobile (<768px), **When** I view the app, **Then** the video player retains its current mobile position (bottom sheet or inline)

---

### User Story 2 - Responsive Layout Transitions (Priority: P2)

As a user, I want smooth transitions when resizing the browser window so that the layout adapts gracefully between desktop and mobile views.

**Why this priority**: Ensures a polished user experience across device sizes without jarring layout jumps.

**Independent Test**: Can be tested by resizing the browser window from mobile to desktop widths and verifying smooth transitions.

**Acceptance Scenarios**:

1. **Given** I am viewing on desktop, **When** I resize to tablet width (768-1199px), **Then** the layout transitions to tablet mode with appropriate spacing
2. **Given** I am viewing on tablet, **When** I resize to mobile width (<768px), **Then** the video player moves to its mobile position

---

### Edge Cases

- What happens when no video is selected? → Show placeholder or collapse video player area
- What happens with very long video titles? → Truncate with ellipsis
- How does the layout handle ultra-wide screens? → Add max-width constraints

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display video player stacked above the detail panel (Commentary, Videos, Cross-refs, Topics tabs) on desktop screens (≥1200px)
- **FR-002**: System MUST maintain the existing Notes/Chat panel on the right side of the screen
- **FR-003**: System MUST preserve current mobile/tablet layout behavior (no stacking changes below 1200px)
- **FR-004**: System MUST keep the video player visible when scrolling the detail panel content
- **FR-005**: Video player MUST maintain its current functionality (play/pause, seek, fullscreen, etc.)

### Layout Structure

**Current Desktop Layout (≥1200px):**
```
[Video Player] [Bible Column] [Detail Panel] [Notes/Chat Panel]
   (~400px)       (~350px)       (~440px)        (~360px)
```

**New Desktop Layout (≥1200px):**
```
[Video Player + Detail Panel]  [Bible Column]  [Notes/Chat Panel]
     (~440px, stacked)           (~400px)          (~360px)

Stacked order:
┌─────────────────────────┐
│     Video Player        │
│      (~280px height)    │
├─────────────────────────┤
│   Detail Panel          │
│   (Commentary, Videos,  │
│    Cross-refs, Topics)  │
└─────────────────────────┘
```

### Key Entities

- **VideoPlayerContainer**: Wraps video player and provides sticky positioning
- **LeftColumn**: Contains VideoPlayer + DetailPanel in vertical stack
- **BibleColumn**: Bible text display (middle column)
- **RightColumn**: Notes/Chat panel (already implemented)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On desktop, video player is positioned within 200px of the left edge and stacked above the detail panel
- **SC-002**: Video player remains visible when user scrolls commentary content
- **SC-003**: Layout transition between breakpoints is smooth (<300ms visual change)
- **SC-004**: All existing video player functionality (play, pause, seek, fullscreen) works unchanged

## Technical Notes

### Files to Modify

- `src/App.js`: Restructure component layout order
- `src/App.css`: Update desktop grid/flexbox layout for stacking

### CSS Approach

Use CSS Grid with row spanning for the left column:
```css
@media (min-width: 1200px) {
  .app-layout {
    display: grid;
    grid-template-columns: 440px 1fr 360px;
    grid-template-rows: auto 1fr;
  }

  .left-column {
    grid-row: 1 / -1;
    display: flex;
    flex-direction: column;
  }

  .video-player-wrapper {
    flex-shrink: 0;
    position: sticky;
    top: 0;
  }

  .detail-panel {
    flex: 1;
    overflow-y: auto;
  }
}
```
