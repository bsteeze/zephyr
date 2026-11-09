/* Zephyr Mayan core — calendar math, nawal profiles, Maya Cross and compatibility.
   Shared by mayan.html (browser) and api/interpret-maya.js (Node) so both compute identical facts.
   Traditional count: GMT correlation 584283 (the living K'iche' count).
   Maya Cross: practitioners' method — conception −8 days, destiny +8, sides −6 / +6 (the number travels with the day). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ZephyrMaya = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const mod = (a, n) => ((a % n) + n) % n;

  // [Yucatec, K'iche', English]
  const NAMES = [
    ['Imix', 'Imox', 'Crocodile'], ["Ik'", "Iq'", 'Wind'], ["Ak'b'al", "Aq'ab'al", 'Night'], ["K'an", "K'at", 'Seed'],
    ['Chikchan', 'Kan', 'Serpent'], ['Kimi', 'Kame', 'Death'], ["Manik'", 'Kej', 'Deer'], ['Lamat', "Q'anil", 'Star'],
    ['Muluk', 'Toj', 'Water'], ['Ok', "Tz'i'", 'Dog'], ['Chuwen', "B'atz'", 'Monkey'], ["Eb'", 'E', 'Road'],
    ["B'en", 'Aj', 'Reed'], ['Ix', "I'x", 'Jaguar'], ['Men', "Tz'ikin", 'Eagle'], ["K'ib'", 'Ajmaq', 'Owl'],
    ["Kab'an", "No'j", 'Earth'], ["Etz'nab'", 'Tijax', 'Flint'], ['Kawak', 'Kawoq', 'Storm'], ['Ajaw', 'Ajpu', 'Sun']
  ];

  // Four directions cycle through the 20 signs: East/red, North/white, West/black, South/yellow.
  const DIRECTIONS = [
    { dir: 'East', color: 'Red', hex: '#d9573f', theme: 'beginnings, fire and the rising sun' },
    { dir: 'North', color: 'White', hex: '#cfc9ba', theme: 'air, breath and the wisdom of the ancestors' },
    { dir: 'West', color: 'Black', hex: '#3b3b46', theme: 'water, the inner world and transformation' },
    { dir: 'South', color: 'Yellow', hex: '#e7b53c', theme: 'earth, the harvest and the body' }
  ];

  // Profile: essence, gifts, shadow, love, work, day (what the day is traditionally good for), affinity [love, friendship, business] 0–2
  const PROFILES = [
    { essence: 'Imox is the primordial water: the deep, unruly source that everything grows out of. People born under it are intuitive, original and a little wild at the edges. They often sense things before they can explain them.',
      gifts: 'Creativity that comes from nowhere, deep empathy, protective instincts, and a gift for starting what others only imagine.',
      shadow: 'Moodiness, feeling overwhelmed by other people’s emotions, and scattering energy when the inner tide runs high.',
      love: 'Devoted and nurturing, with a need to be understood without having to explain everything. Steady partners help them feel safe enough to open up.',
      work: 'Thrives in creative, caring or pioneering roles: art, healing, early-stage projects. Struggles with rigid routines.',
      day: 'asking for clarity of mind, rain and fertility, and for healing what feels chaotic.', aff: [2, 1, 1] },
    { essence: 'Iq’ is the wind and the breath of life. Those born on this day are quick, communicative and changeable, carrying ideas from place to place like seeds on the air.',
      gifts: 'Eloquence, imagination, adaptability, and a talent for inspiring people with words.',
      shadow: 'Restlessness, impatience, and promises that blow away before they are kept.',
      love: 'Romantic and expressive, but needs freedom and conversation. A partner who tries to cage them will feel the gust leave.',
      work: 'Writing, teaching, media, sales, anything that moves ideas. Needs variety to stay engaged.',
      day: 'cleansing negative energy, asking for good health and for the right words.', aff: [1, 2, 1] },
    { essence: 'Aq’ab’al is the dawn hidden inside the night. It belongs to the dark hour just before light, when secrets are kept and new beginnings quietly form.',
      gifts: 'Intuition, discretion, a talent for renewal, and the ability to see light in hard situations.',
      shadow: 'Secretiveness, fear of the unknown, and keeping feelings hidden until they become heavy.',
      love: 'Loyal and tender in private, slow to trust in public. Once committed, they are a safe harbor.',
      work: 'Strategy, research, counseling, night work, quiet roles behind the scenes. Good at fresh starts.',
      day: 'asking for a new beginning, for light in a dark time, and for a partner or a home.', aff: [2, 1, 0] },
    { essence: 'K’at is the net that gathers. In the Yucatec count it is the ripening seed. Either way it is about collecting, holding and storing: harvests, memories, people.',
      gifts: 'Resourcefulness, patience, generosity, and a knack for bringing people and things together.',
      shadow: 'Getting tangled: worry, holding grudges, or being caught in obligations and other people’s problems.',
      love: 'Gathers the beloved into a warm, full life. Needs to learn to let go as well as hold on.',
      work: 'Business, organizing, finance, agriculture, community building. Excellent at seeing projects through to harvest.',
      day: 'untangling problems, asking for abundance, and releasing what binds you.', aff: [1, 1, 2] },
    { essence: 'Kan is the feathered serpent: life force, instinct and knowledge rising through the body. People born under it are magnetic and perceptive, feeling truth in the gut first.',
      gifts: 'Charisma, intelligence, sensuality, physical vitality, and a natural sense of justice.',
      shadow: 'Possessiveness, a strong temper, and impulsive reactions when they feel threatened.',
      love: 'Passionate and intensely loyal. Needs depth and honesty. Jealousy is the thing to watch.',
      work: 'Leadership, medicine, law, movement and bodywork. Learns fast and teaches well.',
      day: 'asking for strength, wisdom and justice, and for restoring balance in the body.', aff: [2, 0, 1] },
    { essence: 'Kame is death as transformation, the day of the ancestors. Far from gloomy, those born under it are calm, wise and comfortable with endings, which makes them excellent at beginnings too.',
      gifts: 'Intuition, peace-making, a long view of life, and a gift for helping others through change.',
      shadow: 'Pessimism, indecision, and dwelling on the past.',
      love: 'Gentle, steady and deeply loyal. Brings calm to a partner’s storms.',
      work: 'Counseling, mediation, hospice and healing, history, transitions of every kind.',
      day: 'honoring the ancestors, asking for protection on a journey, and ending something well.', aff: [1, 2, 0] },
    { essence: 'Kej is the deer, the four pillars that hold up the sky. Those born on this day are grounded, protective and graceful, natural guardians of family and nature.',
      gifts: 'Steadiness, leadership, a strong sense of responsibility, and healing through service.',
      shadow: 'Stubbornness, being domineering, and carrying everyone else’s load until it buckles them.',
      love: 'Protective and dependable. Shows love by providing and showing up.',
      work: 'Leadership, conservation, healing professions, anything where they hold others steady.',
      day: 'asking for strength and stability, and for the protection of nature and family.', aff: [1, 2, 1] },
    { essence: 'Q’anil is the seed and the star of Venus: fertility, harmony and abundance. People born under it make things grow, from gardens to friendships to bank balances.',
      gifts: 'Optimism, charm, creativity, fertility of ideas, and a sense of beauty.',
      shadow: 'Over-indulgence, vanity, and scattering their seeds too widely to tend any of them.',
      love: 'Affectionate, sensual and generous. Love flourishes when it is tended like a garden.',
      work: 'Arts, agriculture, design, investment, anything that multiplies. Natural entrepreneurs.',
      day: 'planting, starting a family or a project, and asking for abundance and harmony.', aff: [2, 1, 2] },
    { essence: 'Toj is the offering: water, payment and balance. Those born under it understand that life is an exchange, and that what we give comes back.',
      gifts: 'Generosity, emotional depth, a strong sense of fairness, and a talent for repair.',
      shadow: 'Guilt, martyrdom, and feeling that everything must be earned through suffering.',
      love: 'Deeply feeling and devoted. Needs reciprocity, not a scorecard.',
      work: 'Service, healing, the arts, finance, and any role that restores balance.',
      day: 'making offerings and amends, and paying back debts of every kind.', aff: [2, 1, 0] },
    { essence: 'Tz’i’ is the dog: loyalty, law and authority. People born under it are faithful guides with a strong sense of right and wrong.',
      gifts: 'Loyalty, a sense of justice, affection and protectiveness.',
      shadow: 'Judgment, rigid rules, and loyalty that turns into blind defense.',
      love: 'Utterly faithful and warm. Needs a partner who matches their loyalty.',
      work: 'Law, advocacy, protection, guidance, teaching and service.',
      day: 'asking for justice and order, and settling legal and family matters.', aff: [2, 2, 0] },
    { essence: 'B’atz’ is the thread of time and the monkey artisan. Those born under it are weavers of life: creative, playful and skilled with their hands and minds.',
      gifts: 'Artistry, humor, intelligence, and a talent for weaving people and ideas together.',
      shadow: 'Vanity, trickery, and starting many threads without finishing the cloth.',
      love: 'Fun, charming and affectionate. Needs a partner who enjoys play as much as depth.',
      work: 'Art, crafts, music, performance, invention, and anything that ties loose ends together.',
      day: 'starting new work, beginning a relationship or marriage, and untangling knots.', aff: [1, 2, 1] },
    { essence: 'E is the road: the path of life, travel and destiny. Those born on this day are guides and travelers, social and generous, gathering wisdom from the journey.',
      gifts: 'Sociability, wisdom from experience, adventurousness, and a gift for helping others find their way.',
      shadow: 'Restlessness, recklessness, and wandering away from commitments.',
      love: 'Warm and companionable. Love works best as a shared journey.',
      work: 'Travel, trade, guiding, diplomacy, sales and leadership.',
      day: 'asking for a good road, starting a journey, and making good decisions.', aff: [1, 2, 1] },
    { essence: 'Aj is the reed and the cane: the home, the household and the community. Those born under it are upright pillars who build structures where others can thrive.',
      gifts: 'Dependability, principles, leadership, and a talent for building home and community.',
      shadow: 'Rigidity, self-righteousness, and difficulty bending when life demands it.',
      love: 'Home-centered and protective. Builds a life to share.',
      work: 'Leadership, architecture, education, community work and management.',
      day: 'asking for a stable home, abundance and protection for children.', aff: [1, 1, 2] },
    { essence: 'I’x is the jaguar, guardian of the mountains and the feminine strength of the earth. People born under it are powerful, intuitive and independent.',
      gifts: 'Strength, intuition, courage, stamina, and a deep bond with nature.',
      shadow: 'Arrogance, isolation, and being hard to reach behind their walls.',
      love: 'Fierce and loyal, but needs independence. Trust is earned slowly and given completely.',
      work: 'Leadership, healing, environmental work, strategy and anything requiring nerve.',
      day: 'asking for strength and vitality, and for protection of the earth and of animals.', aff: [1, 0, 2] },
    { essence: 'Tz’ikin is the bird: vision, freedom and fortune. Those born on this day see from great heights and act as messengers between heaven and earth.',
      gifts: 'Vision, ambition, independence, and luck with material matters.',
      shadow: 'Detachment, impatience with detail, and chasing the next horizon too soon.',
      love: 'Generous and idealistic, but needs space to fly. Thrives with an equally independent partner.',
      work: 'Business, finance, design, aviation, entrepreneurship and big-picture strategy.',
      day: 'asking for economic well-being, good fortune and a clear vision.', aff: [0, 1, 2] },
    { essence: 'Ajmaq is forgiveness and the wisdom of the ancestors. Those born under it are reflective, perceptive and wise, learning from mistakes, their own and everyone else’s.',
      gifts: 'Wisdom, forgiveness, tolerance, and a knack for repairing relationships.',
      shadow: 'Guilt, secretiveness, and repeating old patterns before they learn the lesson.',
      love: 'Understanding and forgiving. Values partners who can talk about the hard things.',
      work: 'Counseling, research, mediation and history. Good at reconciling people.',
      day: 'asking forgiveness, making amends and letting go of guilt.', aff: [1, 2, 1] },
    { essence: 'No’j is thought, wisdom and knowledge. Those born under it are thinkers and counselors, with ideas that move like the earth: slow, deep and powerful.',
      gifts: 'Intelligence, good judgment, creativity, and a gift for advising others.',
      shadow: 'Overthinking, arrogance about being right, and stubborn opinions.',
      love: 'Thoughtful and steady. Needs a partner who loves conversation.',
      work: 'Science, teaching, writing, consulting, planning and law.',
      day: 'asking for wisdom, good ideas and understanding.', aff: [1, 1, 2] },
    { essence: 'Tijax is the obsidian blade: sharp truth, healing and decisive action. Those born under it cut through illusion and conflict.',
      gifts: 'Honesty, courage, decisiveness and healing ability.',
      shadow: 'Harshness, quarrelsomeness and cutting words.',
      love: 'Direct and loyal. Needs honesty, and must learn tenderness.',
      work: 'Medicine and surgery, law, crisis work and leadership in tough situations.',
      day: 'cutting away illness and conflict, and asking for justice and healing.', aff: [0, 1, 2] },
    { essence: 'Kawoq is the storm and the gathering of community. Those born on this day bring rain, renewal and people together.',
      gifts: 'Community-mindedness, healing, fertility, and a gift for clearing the air.',
      shadow: 'Drama, emotional storms and difficulty letting things settle.',
      love: 'Warm and family-oriented. Love grows when shared with community.',
      work: 'Community work, healing, midwifery, events and team leadership.',
      day: 'asking for family and community harmony, and for rain and renewal.', aff: [1, 2, 1] },
    { essence: 'Ajpu is the sun and the hunter-hero of the Popol Vuh. Those born under it are radiant, brave and complete, carrying the energy of victory and wholeness.',
      gifts: 'Courage, leadership, artistry, warmth and a strong spiritual sense.',
      shadow: 'Pride, recklessness, and needing to be the hero of every story.',
      love: 'Generous and warm. Loves wholeheartedly and needs to be appreciated.',
      work: 'Leadership, the arts, performance, athletics and spiritual guidance.',
      day: 'asking for strength, protection, and success in what you undertake.', aff: [2, 1, 1] }
  ];

  const NUMBERS = [null,
    ['Unity and initiation', 'One is the seed: a beginning, pure intention, the first spark. Energy is new and tender.'],
    ['Duality and balance', 'Two is polarity: light and dark, giving and receiving. Its work is finding balance between opposites.'],
    ['Movement and rhythm', 'Three brings action and rhythm. Things start to move and take part in the world.'],
    ['Stability and form', 'Four is the four corners and directions. It gives a solid shape and lasting foundations.'],
    ['Center and empowerment', 'Five is the center and the hand. It brings capability, command and getting things done.'],
    ['Flow and response', 'Six is flow and responsiveness: adapting, organizing and keeping things in balance.'],
    ['Reflection and attunement', 'Seven sits at the center of the thirteen. It mirrors, attunes and joins the inner and outer worlds.'],
    ['Harmony and integrity', 'Eight is wholeness and integrity. It brings justice, fairness and harmony.'],
    ['Patience and completion', 'Nine is patience and the long cycle. It persists, endures and gives life.'],
    ['Manifestation', 'Ten brings manifestation. Ideas become real, often with force and visibility.'],
    ['Release and resolution', 'Eleven dissolves and resolves. It brings change, release and sometimes upheaval.'],
    ['Understanding and community', 'Twelve gathers experience into understanding, and it brings people together.'],
    ['Transcendence and ascension', 'Thirteen completes the count. It is the highest intensity, with power and responsibility in equal measure.']
  ];
  // One common daykeeper teaching: low numbers gentle, middle balanced, high strong.
  const intensity = n => n <= 5 ? 'gentle' : n <= 9 ? 'balanced' : 'strong';
  const INTENSITY_TEXT = {
    gentle: 'Gentle numbers (1–5) express the sign softly. The energy is easier to live with, but you may have to reach for it.',
    balanced: 'Balanced numbers (6–9) express the sign evenly, neither muted nor overwhelming.',
    strong: 'Strong numbers (10–13) express the sign at full force. Its gifts are big and so are its tests, so this energy asks for maturity.'
  };

  const CROSS_POSITIONS = [
    { key: 'conception', label: 'Conception', offset: -8, meaning: 'Where you come from: family, ancestry and the energy you were formed in. It is your root and your past.' },
    { key: 'right', label: 'Right side', offset: -6, meaning: 'A helper energy at your side. Some daykeepers read it as one half of your nature, others as an ally that supports you.' },
    { key: 'center', label: 'Birth sign', offset: 0, meaning: 'Your essence: the day you were born and the heart of the cross.' },
    { key: 'left', label: 'Left side', offset: 6, meaning: 'The other helper energy. Together with the right side, it shows talents to draw on and lessons to work through.' },
    { key: 'destiny', label: 'Destiny', offset: 8, meaning: 'Where your life is heading: your mission and what you grow into.' }
  ];

  // ---------- Calendar math ----------
  function jdn(y, m, d) {
    const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function parseDate(str) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || ''));
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    if (y < 1600 || y > 2200 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCMonth() !== mo - 1) return null;
    return [y, mo, d];
  }
  function dayFromCount(days) {
    return { number: mod(days + 3, 13) + 1, sign: mod(days + 19, 20) };
  }
  function traditional(y, m, d) {
    const days = jdn(y, m, d) - 584283, t = dayFromCount(days);
    const h = mod(days + 348, 365);
    const lc = []; let r = days; [144000, 7200, 360, 20, 1].forEach(u => { lc.push(Math.floor(r / u)); r = mod(r, u); });
    let pos = 0; for (let k = 1; k <= 260; k++) { if (mod(k - 1, 13) + 1 === t.number && mod(k - 1, 20) === t.sign) { pos = k; break; } }
    const trecenaStart = dayFromCount(days - (t.number - 1));
    return { days, number: t.number, sign: t.sign, haabDay: h % 20, haabMonth: Math.floor(h / 20), lc: lc.join('.'), pos, trecena: trecenaStart.sign, trecenaIndex: Math.floor(mod(pos - 1, 260) / 13) };
  }
  function cross(days) {
    const out = {};
    CROSS_POSITIONS.forEach(p => { out[p.key] = dayFromCount(days + p.offset); });
    return out;
  }

  // Dreamspell
  const SEALS = ['Dragon', 'Wind', 'Night', 'Seed', 'Serpent', 'Worldbridger', 'Hand', 'Star', 'Moon', 'Dog', 'Monkey', 'Human', 'Skywalker', 'Wizard', 'Eagle', 'Warrior', 'Earth', 'Mirror', 'Storm', 'Sun'];
  const TONES = ['', 'Magnetic', 'Lunar', 'Electric', 'Self-Existing', 'Overtone', 'Rhythmic', 'Resonant', 'Galactic', 'Solar', 'Planetary', 'Spectral', 'Crystal', 'Cosmic'];
  const DS_COLORS = ['Red', 'White', 'Blue', 'Yellow'];
  function noLeapIndex(y, m, d) { const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]; if (m === 2 && d === 29) d = 28; return y * 365 + cum[m - 1] + d; }
  const s20 = s => mod(s - 1, 20) + 1;
  function dreamspell(y, m, d) {
    const kin = mod(33 + noLeapIndex(y, m, d) - noLeapIndex(1987, 7, 26), 260) + 1;
    const seal = mod(kin - 1, 20) + 1, tone = mod(kin - 1, 13) + 1;
    const off = [0, 0, 12, 4, 16, 8, 0, 12, 4, 16, 8, 0, 12, 4][tone];
    return { kin, seal, tone, color: DS_COLORS[mod(seal - 1, 4)],
      oracle: { guide: s20(seal + off), analog: s20(19 - seal), antipode: s20(seal + 10), occult: s20(21 - seal) } };
  }

  const signName = i => `${NAMES[i][1]} (${NAMES[i][2]})`;
  const dayName = t => `${t.number} ${NAMES[t.sign][1]}`;

  function chartFor(dateStr) {
    const p = parseDate(dateStr); if (!p) return null;
    const t = traditional(p[0], p[1], p[2]), ds = dreamspell(p[0], p[1], p[2]);
    return { date: dateStr, trad: t, cross: cross(t.days), ds };
  }

  // ---------- Compatibility ----------
  const DOMAINS = ['love', 'friendship', 'business'];
  const DOMAIN_LABEL = { love: 'Love', friendship: 'Friendship', business: 'Business' };

  function compatibility(dateA, dateB, nameA, nameB) {
    const A = chartFor(dateA), B = chartFor(dateB);
    if (!A || !B) return null;
    const nA = nameA || 'You', nB = nameB || 'they';
    const signals = [];
    const add = (system, key, title, text, w) => signals.push({ system, key, title, text, w });
    const sa = A.trad.sign, sb = B.trad.sign, ga = sa % 4, gb = sb % 4;
    const ia = intensity(A.trad.number), ib = intensity(B.trad.number);

    // Traditional signals
    if (sa === sb) add('traditional', 'same-sign', 'Same day sign', `You share ${signName(sa)}. You understand each other instantly, but you also share the same blind spots.`, [1, 2, -1]);
    else if (ga === gb) add('traditional', 'same-direction', `Both ${DIRECTIONS[ga].dir} signs`, `Both signs belong to the ${DIRECTIONS[ga].dir} (${DIRECTIONS[ga].color}): ${DIRECTIONS[ga].theme}. You move to a similar rhythm.`, [1, 2, 1]);
    else if (mod(ga - gb, 4) === 2) add('traditional', 'opposite-direction', 'Opposite directions', `${DIRECTIONS[ga].dir} meets ${DIRECTIONS[gb].dir}. Opposite corners of the world complete each other but see things differently.`, [1, 0, 1]);
    const crossHit = (X, Y) => ['conception', 'destiny', 'left', 'right'].filter(k => X.cross[k].sign === Y.trad.sign);
    const ab = crossHit(A, B), ba = crossHit(B, A);
    if (ab.length || ba.length) {
      const where = [...ab.map(k => `${nB === 'they' ? 'their' : nB + '’s'} sign sits in ${nA === 'You' ? 'your' : nA + '’s'} cross (${CROSS_POSITIONS.find(p => p.key === k).label.toLowerCase()})`), ...ba.map(k => `${nA === 'You' ? 'your' : nA + '’s'} sign sits in ${nB === 'they' ? 'their' : nB + '’s'} cross (${CROSS_POSITIONS.find(p => p.key === k).label.toLowerCase()})`)];
      const w = ab.length && ba.length ? [3, 2, 2] : [2, 1, 1];
      add('traditional', 'cross', 'Woven into each other’s cross', `${where.join('; ')}. Each of you carries an energy the other already holds in their birth chart.`, w);
    }
    if (A.trad.trecenaIndex === B.trad.trecenaIndex && A.trad.pos !== B.trad.pos) add('traditional', 'trecena', 'Same trecena', `You were both born in the 13-day period ruled by ${signName(A.trad.trecena)}, a shared “season” of the sacred calendar.`, [1, 1, 1]);
    if (ia === 'gentle' && ib === 'gentle') add('traditional', 'gentle-gentle', 'Two gentle numbers', 'Both numbers are gentle. This is an easy, kind pace, though someone may need to push when decisions are due.', [1, 1, -1]);
    else if (ia === 'strong' && ib === 'strong') add('traditional', 'strong-strong', 'Two strong numbers', 'Both numbers are strong. That is a lot of power in one room: great for ambitious projects, harder when you both want the wheel.', [-1, 0, 2]);
    else if ((ia === 'gentle' && ib === 'strong') || (ia === 'strong' && ib === 'gentle')) add('traditional', 'gentle-strong', 'Gentle meets strong', 'One gentle number and one strong. One brings drive and the other brings ease, which is a natural balance.', [1, 0, 1]);
    if (A.trad.number === B.trad.number) add('traditional', 'same-number', 'Same number', `You share the number ${A.trad.number}: ${NUMBERS[A.trad.number][0].toLowerCase()}. You approach life with a similar intensity.`, [0, 1, 1]);

    // Dreamspell signals
    const da = A.ds, db = B.ds;
    if (da.seal === db.seal) add('dreamspell', 'ds-same', 'Same Dreamspell seal', `You are both ${SEALS[da.seal - 1]}, which is mirror energy.`, [0, 1, 0]);
    if (da.oracle.analog === db.seal) add('dreamspell', 'analog', 'Analog partners', `${SEALS[db.seal - 1]} is ${SEALS[da.seal - 1]}’s analog: the classic supportive partner in Dreamspell.`, [2, 2, 1]);
    if (da.oracle.occult === db.seal) add('dreamspell', 'occult', 'Hidden helpers (occult)', 'Your seals are each other’s occult power, an unexpected partner who draws out what is hidden.', [2, 1, 0]);
    if (da.oracle.antipode === db.seal) add('dreamspell', 'antipode', 'Antipodes', 'Your seals are antipodes, challenging opposites. This means real spark and real friction, and growth through tension.', [-1, 0, 1]);
    if (da.oracle.guide === db.seal || db.oracle.guide === da.seal) add('dreamspell', 'guide', 'Guide relationship', `${da.oracle.guide === db.seal ? (nB === 'they' ? 'Their' : nB + '’s') + ` seal guides ${nA === 'You' ? 'yours' : nA + '’s'}` : (nA === 'You' ? 'Your' : nA + '’s') + ` seal guides ${nB === 'they' ? 'theirs' : nB + '’s'}`}. It is a natural mentor and student flow.`, [0, 1, 2]);
    if (da.color === db.color && da.seal !== db.seal) add('dreamspell', 'color', `Both ${da.color}`, `Both seals are ${da.color} in Dreamspell, which means a shared temperament.`, [0, 1, 0]);
    if (da.tone === db.tone) add('dreamspell', 'tone', 'Same tone', `You share the ${TONES[da.tone]} tone.`, [0, 1, 1]);

    // Natural leanings of each sign
    const affA = PROFILES[sa].aff, affB = PROFILES[sb].aff;
    const base = DOMAINS.map((_, i) => (affA[i] + affB[i]) * 0.5);

    const score = DOMAINS.map((_, i) => base[i] + signals.reduce((s, x) => s + x.w[i], 0));
    const order = DOMAINS.map((d, i) => ({ d, s: score[i], i })).sort((x, y) => y.s - x.s || x.i - y.i);
    const spread = order[0].s - order[2].s;
    const rating = {};
    order.forEach((o, k) => { rating[o.d] = spread < 1 ? 'good' : k === 0 ? 'best' : k === 2 ? 'work' : 'good'; });
    if (spread >= 1 && order[1].s === order[0].s) rating[order[1].d] = 'best';
    if (spread >= 1 && order[1].s === order[2].s) rating[order[1].d] = 'work';

    const verdicts = DOMAINS.map((d, i) => {
      const want = rating[d] === 'work' ? -1 : 1;
      const reasons = signals.filter(x => Math.sign(x.w[i]) === want).sort((x, y) => Math.abs(y.w[i]) - Math.abs(x.w[i]));
      const lean = (x, label) => `${signName(x)} leans ${PROFILES[x].aff[i] === 2 ? 'strongly toward' : PROFILES[x].aff[i] === 1 ? 'comfortably toward' : 'away from'} ${label}`;
      const lo = affA[i] <= affB[i] ? sa : sb, hi = affA[i] >= affB[i] ? sa : sb;
      const fallback = rating[d] === 'work'
        ? (PROFILES[lo].aff[i] === 0 ? lean(lo, d) : `Fewer natural ties here than in other areas`)
        : (PROFILES[hi].aff[i] === 2 ? lean(hi, d) : 'A steady, easy fit');
      const reason = reasons[0] ? reasons[0].title : fallback;
      return { domain: d, label: DOMAIN_LABEL[d], rating: rating[d], score: Math.round(score[i] * 10) / 10, reason, reasons: reasons.map(r => r.title) };
    });
    return { a: A, b: B, signals, verdicts, base };
  }

  // Compact facts for the AI (no free text from the visitor besides first names)
  function factsFor(c) {
    const T = c.trad, cr = c.cross;
    return {
      traditional: { day: dayName(T), sign: NAMES[T.sign][1], yucatec: NAMES[T.sign][0], english: NAMES[T.sign][2], number: T.number, number_meaning: NUMBERS[T.number][0], intensity: intensity(T.number),
        direction: DIRECTIONS[T.sign % 4].dir, color: DIRECTIONS[T.sign % 4].color, trecena: NAMES[T.trecena][1], haab: T.haabDay + ' ' + HAAB[T.haabMonth], long_count: T.lc,
        cross: Object.fromEntries(CROSS_POSITIONS.map(p => [p.key, dayName(cr[p.key])])) },
      dreamspell: { kin: c.ds.kin, signature: `${c.ds.color} ${TONES[c.ds.tone]} ${SEALS[c.ds.seal - 1]}`, guide: SEALS[c.ds.oracle.guide - 1], analog: SEALS[c.ds.oracle.analog - 1], antipode: SEALS[c.ds.oracle.antipode - 1], occult: SEALS[c.ds.oracle.occult - 1] }
    };
  }
  const HAAB = ['Pop', "Wo'", 'Sip', "Sotz'", 'Sek', 'Xul', "Yaxk'in", 'Mol', "Ch'en", 'Yax', "Sak'", 'Keh', 'Mak', "K'ank'in", 'Muwan', 'Pax', "K'ayab", "Kumk'u", "Wayeb'"];

  return { NAMES, DIRECTIONS, PROFILES, NUMBERS, INTENSITY_TEXT, CROSS_POSITIONS, SEALS, TONES, HAAB, DOMAINS, DOMAIN_LABEL,
    mod, parseDate, traditional, dreamspell, cross, chartFor, compatibility, intensity, factsFor, signName, dayName };
});
