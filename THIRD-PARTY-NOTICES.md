# Third-Party Notices

Zephyr V5 bundles `circular-natal-horoscope-js` 1.1.0 for browser-side natal
chart calculations. The project is released under The Unlicense:

https://github.com/0xStarcat/CircularNatalHoroscopeJS

Its bundled dependencies include Moment, Moment Timezone, and tz-lookup, each
distributed under permissive open-source licenses. Their source projects and
license notices are available at:

- https://momentjs.com/
- https://momentjs.com/timezone/
- https://github.com/darkskyapp/tz-lookup-oss

The calculation engine runs locally in the visitor's browser. Zephyr does not
send birth details to an astrology API. City lookup, when requested by the
visitor, uses the Open-Meteo geocoding service to resolve coordinates.
