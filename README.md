# Zephyr V5 — Harmony and Natal Observatory

This package is ready for a static Vercel deployment.

## What changed
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

## Deploy through GitHub
Replace the matching files in the repository root, commit, and Vercel will deploy automatically.

Recommended commit message:
`feat: ship Zephyr V5 natal observatory`
