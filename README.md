# Zephyr Observatory v2.2.3

This package is ready for a static Vercel deployment.

## What Zephyr is

Zephyr is an interactive observatory for self-discovery through astrology,
music, and story. The natal experience connects every interpretation to visible
chart evidence: reading changes the wheel, and the wheel changes the reading.

## v2.2.3 production correction

- Restored the natal chart's circular center medallion
- Prevented center labels from changing the medallion geometry

## v2.2.2 production correction

- Replaced unreliable iPhone sticky positioning with a measured fixed chart dock
- Preserved the chart's document space with an automatic placeholder
- The complete compact chart stays visible while Story, Aspects, Houses, and Study scroll

## Added in Observatory v2.2

- Continuous Story → Aspects → Houses → Study scrollytelling journey
- Full chart scrolls normally until it reaches the top, then compresses and docks
- Interpretation evidence updates the docked chart at the mobile reading line
- The chart releases after the final natal section
- Section tabs act as jump links and follow the current scroll position
- Expand Map overlay for inspecting the complete wheel without losing reading position
- Compact mobile hero, Chart at a Glance, and Big Three navigation

## Added in Observatory v2.1

- Fixed mobile navigation that remains available throughout Harmony and Natal
- Safari-safe persistent celestial map while natal content scrolls
- Story, Aspects, Houses, and Study exploration tabs
- Full scrollable major-aspect library with exact two-planet highlighting
- Twelve-house explorer with illuminated boundaries and resident planets
- Mobile reading layout that keeps the chart and interpretation connected
- Traditional and modern rulership shown for Scorpio rising

## Added in Observatory v2

- Chart at a Glance synthesis with archetypes, dominant element, dominant mode,
  chart ruler, and a concise central theme
- Scroll-linked story cards that automatically illuminate the relevant planet,
  zodiac sector, house, and aspect lines
- Tap-to-lock planet focus plus Follow Reading and Full Chart controls
- Major-aspect cards that illuminate both planets and their exact relationship
- Compact sticky mobile wheel designed to remain visible while reading
- Expanded original observations for all ten displayed planets
- Corrected aspect-focus data bindings
- Canonical sample chart: May 15, 1976, 7:03 PM, Price, Utah

## Existing foundation

- Dedicated Natal Observatory with a modern SVG birth chart
- Local calculations for Sun, Moon, Mercury through Pluto, Ascendant, Midheaven, houses, retrogrades, and major aspects
- Placidus, Whole Sign, Equal House, Koch, Campanus, Regiomontanus, and Topocentric house systems
- Tropical and sidereal zodiac options
- Birth profile with exact date, local time, city, coordinates, and historical time-zone resolution
- Optional city search with manual coordinate fallback
- Big Three cards, original Zephyr interpretations, and a complete planet/house table
- Natal profiles stay in the visitor's browser; no birth data is sent to an astrology API
- Separate Harmony and Natal navigation on desktop and mobile
- Removed the self-triggering zodiac glyph observer that pulled symbols toward the center
- Birth dates remain editable while shared-date privacy is enabled
- New Solar map / Harmony map view switch
- Twelve pitch sectors now rotate with the selected root instead of being anchored to January 1
- Root-relative chord-wheel colors for strong resonance, warm harmony, creative motion, charged contrast, and transformative tension
- Tap a person, numbered badge, wheel marker, or compatibility chip to make that person the root
- Root-relative compatibility summary beneath the wheel
- Mobile-safe controls and compatibility cards
- Anonymous Perfect Pair onboarding: Orion (boy) + Aurora (girl)
- Dates hidden by default in Privacy Mode
- Demo pair is approximately a mathematically exact Perfect Fifth
- New hero/observatory landing experience
- “Create your own harmony” transition into editable mode
- Existing interval math, interpretation engine, bell synthesis, storage, and GA4 retained
- GA4 Measurement ID: G-0JSD84W2V2

## Documentation

- [North Star](docs/NORTH_STAR.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Developer Reference](docs/DEV_REFERENCE.md)
- [Writing Guide](docs/WRITING_GUIDE.md)
- [Interaction Principles](docs/INTERACTION_PRINCIPLES.md)
- [Meeting Notes](docs/MEETING_NOTES.md)
- [Ideas](docs/IDEAS.md)
- [Changelog](docs/CHANGELOG.md)

## Deploy through GitHub
Replace the matching files in the repository root, commit, and Vercel will deploy automatically.

Recommended commit message:
`fix: keep Zephyr natal chart sticky on iPhone`
