# Developer Reference

## Runtime architecture

The production package is static and requires no PHP runtime.

- `index.html` owns the application shell and semantic content.
- `harmony.js` owns solar-year music, people, storage, and audio interaction.
- `natal-engine.bundle.js` calculates planets, angles, houses, and aspects.
- `natal.js` renders the wheel, synthesis, story cards, and interaction state.
- `natal.css` owns the observatory presentation and responsive reading flow.

## Natal render pipeline

1. Read and validate the birth profile.
2. Calculate the horoscope locally in the browser.
3. Render zodiac sectors, houses, aspects, planets, and angles into SVG.
4. Derive the Big Three and Chart at a Glance synthesis.
5. Render evidence-bearing story cards.
6. Connect card visibility and taps to chart focus.

## Interaction data

Each story card declares its evidence with `data-planets`. A single-placement
card names one planet. An aspect card names both planets. The focus renderer
uses SVG `data-planet`, `data-sign`, `data-house`, `data-planet-a`, and
`data-planet-b` attributes to illuminate exact chart geometry.

## Focus states

- `followReading: true`: the active card is selected by `IntersectionObserver`.
- Planet tap: locks focus on the selected planet.
- Story-card tap: locks focus on that card's evidence.
- Full Chart: clears visual filtering and resumes reading follow.

## Future systems

- Compatibility and synastry
- Transits and Today's Sky
- Observation Deck
- Curated story-rule library
- Harmony evidence inside natal narratives
