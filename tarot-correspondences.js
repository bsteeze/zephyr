/* Zephyr Tarot — traditional correspondences (Hermetic Order of the Golden Dawn system,
   the one behind the Rider-Waite-Smith deck). Shared by the browser (tarot.html) and the
   interpretation API (api/interpret-tarot.js). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ZephyrTarotCorrespondences = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SEPHIROTH = {
    1: ['Kether', 'the Crown'], 2: ['Chokmah', 'Wisdom'], 3: ['Binah', 'Understanding'], 4: ['Chesed', 'Mercy'],
    5: ['Geburah', 'Severity'], 6: ['Tiphareth', 'Beauty'], 7: ['Netzach', 'Victory'], 8: ['Hod', 'Splendor'],
    9: ['Yesod', 'Foundation'], 10: ['Malkuth', 'the Kingdom']
  };
  const NUMEROLOGY = {
    0: 'pure potential', 1: 'beginnings and will', 2: 'duality and choice', 3: 'creation and growth', 4: 'structure and stability',
    5: 'change and challenge', 6: 'harmony and exchange', 7: 'reflection and testing', 8: 'power and movement',
    9: 'culmination and wisdom', 10: 'completion and renewal'
  };
  const reduce = n => { while (n > 9) n = String(n).split('').reduce((a, d) => a + Number(d), 0); return n; };

  // [astrology, element, Hebrew letter, letter name, letter meaning, path, from, to]
  const MAJOR = [
    ['Air (element)', 'Air', 'א', 'Aleph', 'ox', 11, 1, 2],
    ['Mercury', 'Air', 'ב', 'Beth', 'house', 12, 1, 3],
    ['the Moon', 'Water', 'ג', 'Gimel', 'camel', 13, 1, 6],
    ['Venus', 'Earth', 'ד', 'Daleth', 'door', 14, 2, 3],
    ['Aries', 'Fire', 'ה', 'Heh', 'window', 15, 2, 6],
    ['Taurus', 'Earth', 'ו', 'Vav', 'nail', 16, 2, 4],
    ['Gemini', 'Air', 'ז', 'Zayin', 'sword', 17, 3, 6],
    ['Cancer', 'Water', 'ח', 'Cheth', 'fence', 18, 3, 5],
    ['Leo', 'Fire', 'ט', 'Teth', 'serpent', 19, 4, 5],
    ['Virgo', 'Earth', 'י', 'Yod', 'hand', 20, 4, 6],
    ['Jupiter', 'Fire', 'כ', 'Kaph', 'palm of the hand', 21, 4, 7],
    ['Libra', 'Air', 'ל', 'Lamed', 'ox-goad', 22, 5, 6],
    ['Water (element)', 'Water', 'מ', 'Mem', 'water', 23, 5, 8],
    ['Scorpio', 'Water', 'נ', 'Nun', 'fish', 24, 6, 7],
    ['Sagittarius', 'Fire', 'ס', 'Samekh', 'prop or support', 25, 6, 9],
    ['Capricorn', 'Earth', 'ע', 'Ayin', 'eye', 26, 6, 8],
    ['Mars', 'Fire', 'פ', 'Peh', 'mouth', 27, 7, 8],
    ['Aquarius', 'Air', 'צ', 'Tzaddi', 'fish-hook', 28, 7, 9],
    ['Pisces', 'Water', 'ק', 'Qoph', 'back of the head', 29, 7, 10],
    ['the Sun', 'Fire', 'ר', 'Resh', 'head', 30, 8, 9],
    ['Fire (element), with modern Pluto', 'Fire', 'ש', 'Shin', 'tooth', 31, 8, 10],
    ['Saturn, with the element of Earth', 'Earth', 'ת', 'Tav', 'cross or mark', 32, 9, 10]
  ];

  const SUIT = {
    wands:     {element:'Fire',  letter:'Yod (י)',       world:'Atziluth, the world of spirit and will', root:'Root of the Powers of Fire'},
    cups:      {element:'Water', letter:'Heh (ה)',       world:'Briah, the world of creation and feeling', root:'Root of the Powers of Water'},
    swords:    {element:'Air',   letter:'Vav (ו)',       world:'Yetzirah, the world of formation and thought', root:'Root of the Powers of Air'},
    pentacles: {element:'Earth', letter:'final Heh (ה)', world:'Assiah, the world of action and matter', root:'Root of the Powers of Earth'}
  };
  // Decans for 2–10: [planet, sign, degrees, Golden Dawn title]
  const DECANS = {
    wands: [null, null, ['Mars','Aries','0°–10°','Lord of Dominion'], ['the Sun','Aries','10°–20°','Lord of Established Strength'], ['Venus','Aries','20°–30°','Lord of Perfected Work'],
      ['Saturn','Leo','0°–10°','Lord of Strife'], ['Jupiter','Leo','10°–20°','Lord of Victory'], ['Mars','Leo','20°–30°','Lord of Valour'],
      ['Mercury','Sagittarius','0°–10°','Lord of Swiftness'], ['the Moon','Sagittarius','10°–20°','Lord of Great Strength'], ['Saturn','Sagittarius','20°–30°','Lord of Oppression']],
    cups: [null, null, ['Venus','Cancer','0°–10°','Lord of Love'], ['Mercury','Cancer','10°–20°','Lord of Abundance'], ['the Moon','Cancer','20°–30°','Lord of Blended Pleasure'],
      ['Mars','Scorpio','0°–10°','Lord of Loss in Pleasure'], ['the Sun','Scorpio','10°–20°','Lord of Pleasure'], ['Venus','Scorpio','20°–30°','Lord of Illusory Success'],
      ['Saturn','Pisces','0°–10°','Lord of Abandoned Success'], ['Jupiter','Pisces','10°–20°','Lord of Material Happiness'], ['Mars','Pisces','20°–30°','Lord of Perfected Success']],
    swords: [null, null, ['the Moon','Libra','0°–10°','Lord of Peace Restored'], ['Saturn','Libra','10°–20°','Lord of Sorrow'], ['Jupiter','Libra','20°–30°','Lord of Rest from Strife'],
      ['Venus','Aquarius','0°–10°','Lord of Defeat'], ['Mercury','Aquarius','10°–20°','Lord of Earned Success'], ['the Moon','Aquarius','20°–30°','Lord of Unstable Effort'],
      ['Jupiter','Gemini','0°–10°','Lord of Shortened Force'], ['Mars','Gemini','10°–20°','Lord of Despair and Cruelty'], ['the Sun','Gemini','20°–30°','Lord of Ruin']],
    pentacles: [null, null, ['Jupiter','Capricorn','0°–10°','Lord of Harmonious Change'], ['Mars','Capricorn','10°–20°','Lord of Material Works'], ['the Sun','Capricorn','20°–30°','Lord of Earthly Power'],
      ['Mercury','Taurus','0°–10°','Lord of Material Trouble'], ['the Moon','Taurus','10°–20°','Lord of Material Success'], ['Saturn','Taurus','20°–30°','Lord of Success Unfulfilled'],
      ['the Sun','Virgo','0°–10°','Lord of Prudence'], ['Venus','Virgo','10°–20°','Lord of Material Gain'], ['Mercury','Virgo','20°–30°','Lord of Wealth']]
  };
  // Court cards: popular modern elemental scheme + Golden Dawn Tree placement
  const COURT = {
    11: {role:'Page', element:'Earth', sephira:10, note:'the student and messenger'},
    12: {role:'Knight', element:'Air', sephira:6, note:'the seeker in motion'},
    13: {role:'Queen', element:'Water', sephira:3, note:'the inner mastery of the suit'},
    14: {role:'King', element:'Fire', sephira:2, note:'the outer mastery of the suit'}
  };

  function forCard(id) {
    let m = /^major-(\d{1,2})$/.exec(id);
    if (m) {
      const n = Number(m[1]), d = MAJOR[n]; if (!d) return null;
      const [from, to] = [SEPHIROTH[d[6]], SEPHIROTH[d[7]]];
      return {
        astrology: d[0], element: d[1],
        hebrew: `${d[3]} (${d[2]}), meaning "${d[4]}"`,
        kabbalah: `Path ${d[5]} on the Tree of Life, joining ${from[0]} (${from[1]}) and ${to[0]} (${to[1]})`,
        numerology: n === 0 ? 'Zero: ' + NUMEROLOGY[0] : (n > 9 ? `${n}, which reduces to ${reduce(n)}: ${NUMEROLOGY[reduce(n)]}` : `${n}: ${NUMEROLOGY[n]}`)
      };
    }
    m = /^(wands|cups|swords|pentacles)-(\d{1,2})$/.exec(id);
    if (!m) return null;
    const suit = SUIT[m[1]], r = Number(m[2]);
    if (r === 1) return {astrology:`The ${suit.element.toLowerCase()} signs as a whole`, element:suit.element, title:suit.root, kabbalah:`${SEPHIROTH[1][0]} (${SEPHIROTH[1][1]}) in ${suit.world}`, letter:suit.letter, numerology:`1: ${NUMEROLOGY[1]}`};
    if (r <= 10) {
      const dc = DECANS[m[1]][r], s = SEPHIROTH[r];
      return {astrology:`${dc[0]} in ${dc[1]} (${dc[2]} ${dc[1]})`, element:suit.element, title:dc[3], kabbalah:`${s[0]} (${s[1]}) in ${suit.world}`, letter:suit.letter, numerology:`${r}: ${NUMEROLOGY[r]}`};
    }
    const c = COURT[r], s = SEPHIROTH[c.sephira];
    return {element:`${c.element} of ${suit.element}`, title:`${c.role}: ${c.note}`, kabbalah:`${s[0]} (${s[1]}) in ${suit.world}`, letter:suit.letter};
  }

  return { forCard };
});
