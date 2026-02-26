# Feature Specification: UI Polish - Default View, Layout Centering, Filter Pills

**Feature Branch**: `005-ui-polish`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Lesen View should be default in bible. the bible text is off center when the panels are collapsed on desktop, the preacher filter pills in the ai chat should be limited to 1 line of text"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reading Mode as Default (Priority: P1)

As a user opening the Bible section, I want the app to default to "Lesen" (Reading) view so that I can immediately read the Bible text without study distractions.

**Why this priority**: First impression matters - users opening the Bible expect to read text, not see study tools. This matches the primary use case.

**Independent Test**: Can be fully tested by navigating to the Bible section and verifying the default view mode is "Lesen" (Reading), not "Studie" (Study).

**Acceptance Scenarios**:

1. **Given** a fresh app load, **When** I navigate to the Bible section, **Then** the view mode is set to "Lesen" (Reading) by default
2. **Given** I'm in Reading mode, **When** I switch to Study mode and refresh the page, **Then** the app remembers my preference (Study mode persists)

---

### User Story 2 - Centered Bible Text on Desktop (Priority: P1)

As a desktop user with side panels collapsed, I want the Bible text to remain centered on screen so that reading feels balanced and comfortable.

**Why this priority**: Visual layout issues are immediately noticeable and affect the core reading experience.

**Independent Test**: Can be fully tested by viewing the Bible on desktop (≥1200px) with all panels closed and verifying the text is horizontally centered.

**Acceptance Scenarios**:

1. **Given** I'm on desktop with all panels closed, **When** I view the Bible text, **Then** the text column is horizontally centered on the screen
2. **Given** I'm on desktop, **When** I open the detail panel, **Then** the Bible text adjusts to remain in the visible area (not hidden behind panel)

---

### User Story 3 - Single-Line Preacher Filter Pills (Priority: P2)

As a user filtering AI chat by preacher, I want the filter pills to stay on one line so that the chat interface doesn't get pushed down by a long list of options.

**Why this priority**: Prevents excessive vertical space usage while keeping all speakers accessible via horizontal scroll.

**Independent Test**: Can be fully tested by opening the AI chat and verifying preacher filter pills are limited to a single horizontal row.

**Acceptance Scenarios**:

1. **Given** I'm viewing the AI chat, **When** I look at the speaker filter pills, **Then** all pills are displayed in a single horizontal row
2. **Given** there are more speakers than fit on one line, **When** I scroll horizontally in the pills area, **Then** I can see all available speakers
3. **Given** I'm on a narrow screen, **When** I view the filter pills, **Then** they remain on one line with horizontal scroll capability

---

### Edge Cases

- What happens when user has no localStorage available? → Default to Reading mode
- What happens with very long speaker names? → Truncate with ellipsis or limit width

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: App MUST default to "Lesen" (Reading) view mode when opening the Bible section for the first time
- **FR-002**: App MUST persist user's view mode preference across sessions
- **FR-003**: Bible text column MUST be horizontally centered when no panels are open on desktop
- **FR-004**: Speaker filter pills in AI chat MUST be constrained to a single line with horizontal overflow scroll
- **FR-005**: Speaker filter pills MUST remain fully functional (scrollable, clickable) on mobile devices

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Bible section opens in Reading mode by default (100% of fresh sessions)
- **SC-002**: Bible text is visually centered (within 5% of viewport center) when panels are closed on desktop
- **SC-003**: Speaker filter pills occupy no more than 48px of vertical height in AI chat
- **SC-004**: All speakers remain accessible via horizontal scroll in the filter area

## Assumptions

- "Lesen" view is the simpler reading-focused mode without study tools
- Desktop breakpoint is ≥1200px
- Speaker filter pills use the existing chip/button design pattern
- Horizontal scrolling is acceptable UX for overflow content on mobile
