# Zephyr V5 — Harmony and Natal Observatory

This package is ready for a static Vercel deployment.

## SEO and AI discovery
- Dedicated `/natal-chart.html` landing page targeting free natal chart, houses, aspects, Big Three, and private chart searches
- Rebuilt natal landing-page illustration as a precise SVG chart with engraved sign names, planet markers, and aspect geometry—no emoji glyph dependency
- Five interconnected Zephyr Field Notes covering product differentiation, music of the spheres, birthday interval math, a sample portrait, and a beginner natal-chart guide
- Expanded titles, descriptions, Open Graph, and social metadata
- `WebSite`, `WebPage`, `WebApplication`, and visible FAQ structured data
- `llms.txt` with a concise machine-readable explanation of Zephyr
- Explicit OAI-SearchBot and GPTBot access in `robots.txt`
- Updated XML sitemap with the natal chart landing page
- Direct `/?view=natal` links open the Natal Observatory automatically
- Dedicated Zodiac Tone Circle article covering Kepler, the Circle of Fifths, traditional sign-to-key mapping, and Zephyr’s distinct solar-year method
- Canonical URLs standardized on `https://www.zephyr.guru`
- Eight public URLs in the XML sitemap

## What changed
- Dedicated Natal Observatory with a modern SVG birth chart
- Local calculations for Sun, Moon, Mercury through Pluto, Ascendant, Midheaven, houses, retrogrades, and major aspects
- Placidus, Whole Sign, Equal House, Koch, Campanus, Regiomontanus, and Topocentric house systems
- Tropical and sidereal zodiac options
- Birth profile with exact date, local time, city, coordinates, and historical time-zone resolution
- Optional city search with manual coordinate fallback
- Big Three cards, original Zephyr interpretations, and a complete planet/house table
- AI-generated Expert Story Engine with whole-chart synthesis, chart evidence, report caching, and a downloadable portrait PDF
- Server-side `/api/interpret-chart` route keeps the OpenAI API key out of the browser
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
