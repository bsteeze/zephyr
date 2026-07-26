# Zephyr Observatory v2.2.4

Release date: July 25, 2026

## v2.2.4 Viewport-native mobile dock

- Moves the docked chart directly beneath the page body to escape nested Safari layout behavior.
- Restores the chart to its original placeholder when the reader scrolls above it or leaves Natal.
- Simplifies the compact center medallion to two lines: chart name and Sun sign.
- Keeps the full three-line medallion treatment for larger layouts.

## v2.2.3 Center medallion correction

- Locked the natal center medallion to equal width and height.
- Prevented the sign and luminary label from wrapping and stretching the circle.
- Added safe truncation for unusually long chart names.

## v2.2.2 Measured iPhone chart dock

- Replaced Safari-dependent sticky behavior with a measured fixed-position dock.
- Added an automatic placeholder so the document does not jump when docking begins.
- Docking begins only when the compact chart reaches the top of the viewport.
- Expand Map releases the dock temporarily and restores it after collapse.
- The visible chart continues responding to Story, Aspect, House, and Study cards.

## v2.2.1 Sticky chart correction

- Removed the unreliable JavaScript docking sentinel.
- Mobile docking is now controlled entirely by native CSS sticky positioning.
- The chart uses its compact dimensions before reaching the viewport top, preventing half of the wheel from scrolling out of view.
- Expansion remains an explicit fixed overlay and returns to the sticky reading state.

## v2.2 Scrollytelling Observatory

- The full celestial map now arrives naturally in the document flow.
- When the chart reaches the top of the mobile viewport, it compresses and docks.
- Story, Aspects, Houses, and Study form one continuous reading journey.
- Section tabs are scroll-aware jump links rather than content switches.
- Each evidence card updates the docked map as it crosses the reading line.
- The chart releases cleanly after Study Mode.
- Expand Map opens the full wheel without losing the reader's place.
- Mobile summary and Big Three content are substantially more compact.

## v2.1 Mobile Observatory

- The bottom navigation is fixed above the iPhone safe area.
- The celestial map remains docked while the active section scrolls.
- Story, Aspects, Houses, and Study are now first-class exploration modes.
- Every major aspect can illuminate both planets and its exact line.
- Every house can illuminate its boundaries, cusp sign, and resident planets.
- Scorpio rising identifies Mars and Pluto as traditional and modern rulers.

## The release

Observatory v2 turns the natal page from a static report into a guided
exploration. As the reader moves through the story, the corresponding planet,
sign, house, and aspects illuminate in the celestial map.

## Highlights

- Chart at a Glance summarizes the chart before the technical detail.
- Story cards now cover every displayed planet.
- Reading automatically controls chart focus.
- Planet and story-card taps lock the selected evidence.
- Full Chart restores the complete wheel and resumes reading follow.
- Major-aspect observations show both planets and their connecting line.
- The wheel becomes compact and sticky on mobile.

## Reference chart

The included sample uses Brian's canonical test profile:

- May 15, 1976
- 7:03 PM local time
- Price, Utah
- Placidus houses
- Tropical zodiac

## Deployment

Upload the extracted contents with `index.html` at the repository root. A
connected Vercel project will deploy the commit as a static site.
