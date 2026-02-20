# Feature Specification: PWA Bible Reader UI Redesign

**Feature Branch**: `001-pwa-ui-redesign`
**Created**: 2026-02-19
**Status**: Draft
**Input**: User description: "Update this UI to match that of the bible reader in the pwa in /StudioProjects/ProtoBible. Beautiful responsive layout — verse details in an overlay/detail-view on mobile, side-by-side on wider screens. Matching the beautiful design of the pwa (the bible part). Focused on Genesis 1:1 demo, with optional translation switcher. Primary goal: UI/layout (colors, fonts, layout) and getting actual video thumbnails to load instead of the fallback image."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visually Refined Bible Reading Experience (Priority: P1)

A visitor opens the Video Study Bible app and immediately sees a polished, dark-themed reading interface that matches the quality of the ProtoBible PWA. The Bible text (Genesis 1) is rendered with the Diagramm typeface on a near-black background. Verse numbers are subtle and muted; verse text is generous, readable, and airy. The overall aesthetic feels intentional and premium rather than like a default React app.

**Why this priority**: First impressions drive trust. The visual quality gap between the current app and the ProtoBible PWA is the most visible problem. Fixing layout and typography delivers immediate, tangible value without any backend work.

**Independent Test**: Can be fully tested by loading the app and comparing screenshots to the ProtoBible PWA — verifiable without interaction.

**Acceptance Scenarios**:

1. **Given** the app is loaded, **When** the user views the Genesis 1 page, **Then** the background is near-black (#0E0E0E or equivalent), text is white/light with reduced opacity for verse numbers, and Bible text uses a serif/Diagramm-style typeface.
2. **Given** any screen width, **When** the user views the app, **Then** padding, spacing, and font sizes are comfortable and visually consistent with the ProtoBible PWA reading view.
3. **Given** the app is loaded, **When** the user hovers over a verse, **Then** a subtle highlight/hover state appears (similar to the rounded hover effect in ProtoBible PWA).

---

### User Story 2 - Responsive Layout: Overlay on Mobile, Side-by-Side on Desktop (Priority: P2)

On a narrow screen (phone), tapping a verse opens a full-screen or slide-up overlay/sheet showing verse details and related videos — similar to the VerseDetail overlay pattern in the ProtoBible PWA. On a wide screen (≥1024px), the verse detail panel is shown inline as a right-hand sidebar without covering the Bible text, enabling a true study layout where both panels are visible simultaneously.

**Why this priority**: The current layout is desktop-first and broken on mobile. A responsive approach where mobile gets an overlay and desktop gets a side-by-side panel is the correct UX pattern and directly mirrors the ProtoBible PWA.

**Independent Test**: Can be fully tested by resizing the browser window and tapping/clicking a verse — verifiable at any breakpoint without needing real video data.

**Acceptance Scenarios**:

1. **Given** the screen width is below 1024px (mobile/tablet), **When** the user taps a verse, **Then** a bottom sheet or full-screen overlay slides in from the bottom or right, showing verse details and videos, with a close/dismiss mechanism.
2. **Given** the screen width is 1024px or wider (desktop), **When** the user clicks a verse, **Then** the main layout shows the Bible text column on the left and a detail panel on the right, both simultaneously visible without overlay.
3. **Given** the detail panel is open on mobile, **When** the user taps outside or a close button, **Then** the overlay dismisses and the Bible text is restored.
4. **Given** a window is resized from mobile to desktop while a verse is selected, **When** the breakpoint is crossed, **Then** the layout transitions correctly between overlay and sidebar modes.

---

### User Story 3 - Real Video Thumbnails from BibelTV API (Priority: P3)

In the video list and verse detail view, each video card displays the actual thumbnail image from the BibelTV API (`thumb` field) rather than a grey fallback placeholder. The API authentication (using the `Key` header with the API key) is correctly applied so that thumbnail URLs resolve and render.

**Why this priority**: Broken thumbnails degrade the credibility of the demo. Correct authentication is a prerequisite for any real content to display.

**Independent Test**: Can be verified by inspecting network requests in browser DevTools — thumbnail images should return 200 (not 401 or fallback) when the API key is present in the request header.

**Acceptance Scenarios**:

1. **Given** a verse with associated videos is selected, **When** the detail view loads, **Then** video cards display the real thumbnail image from the API response's `thumb` field.
2. **Given** the API key is configured in the app's environment, **When** image requests are made, **Then** the `Key` header is included and images load without authentication errors.
3. **Given** a thumbnail fails to load (network error or missing), **When** the image fails, **Then** a graceful placeholder (not a broken image icon) is shown.

---

### User Story 4 - Translation Switcher (Priority: P4)

A translation picker (matching the style of the TranslationPicker in the ProtoBible PWA) is accessible from the Bible reader header. The user can switch between available German Bible translations (e.g., Luther 2017, GNB, ELB). The selected translation is reflected in the displayed verse text label. The scope of this story is UI only for the Genesis 1 demo — the underlying API call may remain pointed at the existing default translation.

**Why this priority**: Nice-to-have polish that supports demo versatility but does not affect core UX quality.

**Independent Test**: Can be tested by opening the switcher and selecting a different translation — the label in the header must update.

**Acceptance Scenarios**:

1. **Given** the Bible reader is displayed, **When** the user opens the translation picker, **Then** a list of German Bible translations is shown.
2. **Given** the user selects a translation, **When** the selection is made, **Then** the header/label updates to reflect the selected translation abbreviation (e.g., "LUT", "GNB").

---

### Edge Cases

- What happens when thumbnail images are requested without an API key configured? → Graceful fallback image shown, no unhandled JS error.
- What happens when the verse detail panel is open and the browser is rotated from portrait to landscape? → Layout transitions correctly between overlay and sidebar modes at the breakpoint.
- What if a verse has zero associated videos? → The detail panel still opens and shows the verse text and a "Keine Videos verfügbar" empty state rather than crashing.
- What if the Diagramm font fails to load? → System serif font is used as fallback with no layout breakage.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST use a dark color theme with a near-black primary background (#0E0E0E or equivalent) and white text at varying opacity levels, matching the ProtoBible PWA color design tokens.
- **FR-002**: Bible verse text MUST be rendered using the Diagramm typeface (with serif as fallback) at a comfortable reading size (≥18px on desktop), with light font weight and generous line height (≥1.8).
- **FR-003**: Verse numbers MUST be displayed in a small, muted style (low opacity) that does not compete with the verse text.
- **FR-004**: On screens narrower than 1024px, tapping a verse MUST open a bottom sheet or slide-in overlay panel showing verse details and related videos; the overlay MUST be dismissible.
- **FR-005**: On screens 1024px wide and above, clicking a verse MUST reveal a right-hand sidebar panel alongside the Bible text without obscuring the main reading area.
- **FR-006**: Video thumbnail images MUST be fetched using the correct API authentication (Key header with the configured API key), matching the authentication pattern used in the BibelthekAPIService.
- **FR-007**: Video cards MUST display the `thumb` field from the API response as the thumbnail image, with a defined fallback if the image fails to load.
- **FR-008**: Verse hover states MUST include a subtle rounded highlight matching ProtoBible PWA interaction style.
- **FR-009**: The app MUST include a translation label in the Bible reader header showing the currently active translation abbreviation.
- **FR-010**: A translation switcher UI element MUST allow the user to view and select from available German Bible translations; selecting a translation MUST update the displayed label.
- **FR-011**: The Genesis 1 demo scope MUST be preserved — the app is focused on Genesis chapter 1 and need not support full Bible navigation for this feature.

### Key Entities

- **Verse**: A single Bible verse with a number, text content, and zero or more associated video references.
- **Video**: A media item with a title, thumbnail URL (thumb field), category, duration, and speaker metadata; fetched from the BibelTV/Bibelthek API.
- **Translation**: A Bible translation with an identifier, full name, and abbreviation (e.g., LUT, GNB, ELB).
- **VerseDetailPanel**: The UI container that presents a selected verse's text, related videos, and contextual information — rendered as an overlay on mobile and as a sidebar on desktop.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The app's visual appearance is subjectively indistinguishable in quality (colors, typography, spacing) from the ProtoBible PWA Bible reader when viewed side by side.
- **SC-002**: On a 375px-wide viewport (iPhone SE), tapping any verse opens the detail overlay within 300ms with no layout overflow or broken elements visible.
- **SC-003**: On a 1280px-wide viewport, the Bible text column and detail panel are both fully visible simultaneously without horizontal scrolling.
- **SC-004**: 100% of video cards with a valid thumb URL display the actual thumbnail image (not the fallback) when the API key is correctly configured.
- **SC-005**: The translation label in the header updates correctly when the user selects a different translation from the switcher.
- **SC-006**: No unhandled JavaScript errors appear in the browser console during normal use of the redesigned UI.
- **SC-007**: The Diagramm font (or serif fallback) is applied consistently to all Bible verse text throughout the page.

## Assumptions

- The Diagramm font files are available or can be copied from the ProtoBible PWA's `public/fonts/` directory into the videostudybible project.
- The existing API key for the Bibelthek/BibelTV API is available as an environment variable (REACT_APP_BIBELTHEK_API_KEY) in the videostudybible project or can be configured there.
- The app continues to use Create React App (not Vite), so Tailwind CSS will need to be configured or inline styles/CSS Modules will be used to replicate the design tokens from ProtoBible PWA.
- The Genesis 1 scope is intentional — no full book/chapter navigation UI is required for this feature.
- The responsive breakpoint (mobile overlay vs. desktop sidebar) is 1024px, matching the ProtoBible PWA's lg: breakpoint pattern.
