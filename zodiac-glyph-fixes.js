(() => {
  'use strict';

  const wheel = document.getElementById('wheel');
  if (!wheel) return;

  // Clean, custom SVG line drawings. These remain vector artwork—no emoji or font glyphs.
  const PATHS = {
    Aries: [
      'M24 40 L24 21',
      'M24 21 C20 10 12 8 8 17 C5 24 10 29 16 25',
      'M24 21 C28 10 36 8 40 17 C43 24 38 29 32 25'
    ],
    Taurus: [
      'M11 9 C13 17 18 21 24 21 C30 21 35 17 37 9',
      'M13 31 C13 23 19 19 24 19 C29 19 35 23 35 31 C35 39 29 42 24 42 C19 42 13 39 13 31 Z'
    ],
    Gemini: [
      'M12 9 C20 12 28 12 36 9',
      'M12 39 C20 36 28 36 36 39',
      'M17 11 L17 37',
      'M31 11 L31 37'
    ],
    Cancer: [
      'M10 18 C16 10 28 9 36 15',
      'M38 30 C32 38 20 39 12 33',
      'M14 18 A4 4 0 1 0 14.1 18',
      'M34 30 A4 4 0 1 0 34.1 30'
    ],
    Leo: [
      'M18 31 C9 31 8 19 15 16 C22 13 27 19 24 25 C22 29 18 30 15 27',
      'M24 25 C28 13 39 13 40 23 C41 31 35 37 28 36 C24 35 22 32 22 29'
    ],
    Virgo: [
      'M8 10 L8 39',
      'M8 18 C12 10 17 11 17 19 L17 39',
      'M17 18 C21 10 26 11 26 19 L26 39',
      'M26 18 C31 10 35 13 35 22 C35 31 30 36 24 39',
      'M29 29 L39 39'
    ],
    Libra: [
      'M9 37 L39 37',
      'M9 29 L16 29 C16 19 32 19 32 29 L39 29'
    ],
    Scorpio: [
      'M8 10 L8 38',
      'M8 18 C12 10 17 11 17 19 L17 38',
      'M17 18 C21 10 26 11 26 19 L26 38',
      'M26 18 C31 10 35 13 35 22 L35 37',
      'M35 37 L41 31',
      'M35 37 L29 32'
    ],
    Sagittarius: [
      'M11 37 L37 11',
      'M23 11 L37 11 L37 25',
      'M13 22 L26 35'
    ],
    Capricorn: [
      'M8 12 L8 37',
      'M8 20 C13 10 19 11 19 21 L19 36',
      'M19 22 C24 13 32 16 32 25 C32 33 25 35 22 29',
      'M22 29 C24 39 35 42 40 33 C43 28 40 24 36 25'
    ],
    Aquarius: [
      'M8 18 L14 13 L20 18 L26 13 L32 18 L38 13',
      'M8 31 L14 26 L20 31 L26 26 L32 31 L38 26'
    ],
    Pisces: [
      'M14 9 C23 15 23 33 14 39',
      'M34 9 C25 15 25 33 34 39',
      'M11 24 L37 24'
    ]
  };

  const ORDER = ['Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn'];
  let applying = false;

  function cleanGlyphs() {
    if (applying) return;
    const groups = [...wheel.querySelectorAll(':scope > g[transform*="scale"]')]
      .filter(g => g.querySelector('path'));
    if (groups.length < 12) return;

    applying = true;
    try {
      groups.slice(0, 12).forEach((group, index) => {
        const name = ORDER[index];
        const paths = PATHS[name];
        if (!paths) return;

        const transform = group.getAttribute('transform') || '';
        const match = transform.match(/translate\(([-\d.]+)[ ,]([-\d.]+)\)\s*scale\(([-\d.]+)\)/);
        if (match) {
          const tx = Number(match[1]);
          const ty = Number(match[2]);
          const oldScale = Number(match[3]);
          const cx = tx + 24 * oldScale;
          const cy = ty + 24 * oldScale;

          // Pull the symbol inward, away from the sign name/date, and reduce its footprint.
          const vx = cx - 380;
          const vy = cy - 380;
          const length = Math.hypot(vx, vy) || 1;
          const newCx = cx - (vx / length) * 12;
          const newCy = cy - (vy / length) * 12;
          const size = 30;
          const scale = size / 48;
          group.setAttribute('transform', `translate(${newCx-size/2} ${newCy-size/2}) scale(${scale})`);
        }

        group.innerHTML = '';
        paths.forEach(d => {
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('d', d);
          group.appendChild(p);
        });
        group.setAttribute('stroke-width', '2.35');
        group.setAttribute('data-zephyr-sign', name);
      });

      // Slightly tighten typography so sign names and date ranges remain distinct on phones.
      [...wheel.querySelectorAll('text')].forEach(text => {
        const value = (text.textContent || '').trim();
        if (ORDER.includes(value)) {
          text.setAttribute('font-size', '9.5');
          text.setAttribute('letter-spacing', '1');
        } else if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}[–-]/.test(value)) {
          text.setAttribute('font-size', '6.7');
        }
      });
    } finally {
      applying = false;
    }
  }

  const observer = new MutationObserver(() => requestAnimationFrame(cleanGlyphs));
  observer.observe(wheel, { childList: true, subtree: true });
  cleanGlyphs();
})();
