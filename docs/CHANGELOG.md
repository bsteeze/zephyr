# Changelog

## 0.3.2 - Human Voice and Desktop Interpretation Fix — 2026-07-25

### Changed

- Expanded the Zephyr interpretation voice with concrete life scenarios, specific praise, kind humor, and practical growth experiments
- Versioned generated-report caching for the revised voice

### Fixed

- Unsupported minor aspects are ignored instead of invalidating the desktop chart request
- Unknown house assignments no longer invalidate an otherwise complete chart

## 0.3.1 - Branded Natal Portrait PDF — 2026-07-25

### Added

- Zephyr-branded PDF masthead, running headers, and footer
- Strongest-aspects summary with orb values
- Aspect-color legend on the celestial-map page

### Fixed

- PDF chart snapshots now draw aspect geometry explicitly instead of depending on page CSS

## 0.3.0 - Expert Story Engine Alpha — 2026-07-25

### Added

- Server-side OpenAI Responses API interpretation endpoint
- Strict expert-report schema and chart-evidence verification
- Expert whole-chart UI with confidence and evidence labels
- Scroll-linked highlighting for generated interpretations
- Local report caching by calculated-chart fingerprint
- Downloadable portrait PDF with the full natal chart on the final page
- Same-origin checks, payload limits, and lightweight rate limiting

### Security

- API credential is read only from `OPENAI_API_KEY`
- Added `.gitignore` protection for local environment files
- The browser never receives the OpenAI API key

## 0.2.2.5 - Independent Synchronized Mini-map — 2026-07-25

### Fixed

- Removed the disappearing live-chart portal and its empty placeholder
- Kept the original chart in normal flow
- Added a viewport-level synchronized visual copy for mobile scrollytelling
- Removed unintended desktop chart-name truncation

## 0.2.2.4 - Viewport-native Mobile Dock — 2026-07-25

### Fixed

- Ported the docked chart outside nested layout containers on iPhone
- Restored the chart to its source position when undocking
- Simplified compact medallion content to prevent clipping

## 0.2.2.3 - Center Medallion Correction — 2026-07-25

### Fixed

- Locked the natal center medallion to equal width and height
- Prevented wrapped metadata from stretching the center into an oval

## 0.2.2.2 - Measured iPhone Chart Dock — 2026-07-25

### Fixed

- Replaced unreliable iOS sticky positioning with a measured fixed chart dock
- Preserved page position with an automatic chart placeholder
- Kept map expansion compatible with the docked mobile state

## 0.2.2.1 - Sticky Chart Correction — 2026-07-25

### Fixed

- Replaced JavaScript sentinel docking with native CSS sticky positioning
- Prevented the upper half of the wheel from scrolling offscreen on iPhone
- Preserved chart expansion independently from sticky reading mode

## 0.2.2 - Scrollytelling Observatory — 2026-07-25

### Added

- Dock-on-arrival chart behavior
- Continuous Story, Aspects, Houses, and Study journey
- Scroll-aware section navigation
- Expand Map overlay
- Release-at-end sticky boundary

### Changed

- Natal tabs now jump within a continuous document
- Active evidence follows a reading line below the docked map
- Mobile hero, summary, and Big Three consume less vertical space

## 0.2.1 - Mobile Observatory — 2026-07-25

### Added

- Fixed mobile application navigation
- Persistent mobile celestial map
- Story, Aspects, Houses, and Study exploration tabs
- Complete major-aspect explorer
- Twelve-house explorer

### Changed

- Natal exploration now uses a Safari-safe containing frame
- Mobile Chart at a Glance is more compact
- Scorpio rulership displays traditional and modern rulers

## 0.2.0 - Observatory v2 — 2026-07-25

### Added

- Explore Mode
- Study Mode
- Planet Focus
- Chart at a Glance
- Scroll-linked chart highlighting
- Follow Reading, Focus Locked, and Full Chart states
- Chart evidence on story cards
- All-planet interpretation cards
- Mobile sticky celestial map
- Product, design, writing, interaction, and developer documentation

### Improved

- Natal wheel
- Mobile UX
- Planet and aspect focus transitions
- Sample profile editing and city visibility
- Interpretation-to-chart continuity

### Fixed

- Aspect rendering
- Aspect focus bindings now illuminate the correct lines
- Major-aspect cards now highlight both planets
- Zodiac glyphs and planets remain anchored to the wheel
