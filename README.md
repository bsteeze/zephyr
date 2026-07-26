# Zephyr Observatory v2

This package is ready for a static Vercel deployment.

## What Zephyr is

Zephyr is an interactive observatory for self-discovery through astrology,
music, and story. The natal experience connects every interpretation to visible
chart evidence: reading changes the wheel, and the wheel changes the reading.

## New in Observatory v2

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
`feat: ship Zephyr Observatory v2`
