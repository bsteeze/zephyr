/* Zephyr Tarot deck — 78 cards drawn as SVG on demand (no image downloads).
   To use your own painted art for a card, add it to PAINTED, e.g.
     'major-0': '/tarot/fool.jpg'
   Any card listed here shows that image; every other card uses the vector design. */
(function (global) {
  'use strict';

  const PAINTED = {
    // 'major-0': '/tarot/fool.jpg',
  };

  // ---------- Card data ----------
  const ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
  const MAJORS = [
    ['The Fool','beginnings, leap of faith, freedom, innocence','recklessness, hesitation, naivety','A fresh start asks for trust more than a plan. Step lightly and stay curious.'],
    ['The Magician','skill, willpower, manifestation, resourcefulness','manipulation, scattered energy, untapped talent','Everything you need is already on the table. Focus your intent and act.'],
    ['The High Priestess','intuition, mystery, inner knowing, stillness','secrets, disconnection from instinct, noise','The answer is quiet and already inside you. Listen before you speak.'],
    ['The Empress','abundance, nurture, creativity, pleasure','smothering, creative block, neglecting self-care','Growth comes from tending, not forcing. Feed what you want to flourish.'],
    ['The Emperor','structure, authority, stability, leadership','rigidity, control, domineering','Build the frame that lets the rest of your life stand up straight.'],
    ['The Hierophant','tradition, teaching, belief systems, mentorship','rebellion, dogma, breaking convention','There is wisdom in the established path. Know the rules before bending them.'],
    ['The Lovers','union, choice, alignment, values','imbalance, misalignment, temptation','A meaningful choice is in front of you. Choose what matches who you are.'],
    ['The Chariot','momentum, determination, victory, direction','lack of control, aggression, drifting','Pull opposing forces into one direction and the road opens.'],
    ['Strength','courage, compassion, patience, gentle power','self-doubt, raw emotion, insecurity','Soft hands tame the wildest things. Calm confidence wins this one.'],
    ['The Hermit','introspection, solitude, guidance, search for truth','isolation, loneliness, withdrawal','Step back from the crowd. Your own lantern is enough light for the next step.'],
    ['Wheel of Fortune','cycles, fate, turning points, luck','resistance to change, bad timing, setbacks','The wheel is turning. Ride the change instead of bracing against it.'],
    ['Justice','fairness, truth, cause and effect, accountability','dishonesty, unfairness, avoiding consequences','What is true will come to light. Act so the scales stay even.'],
    ['The Hanged Man','surrender, new perspective, pause, letting go','stalling, resistance, needless sacrifice','Hang upside down for a while. The pause reveals what the push could not.'],
    ['Death','endings, transformation, transition, release','fear of change, clinging, stagnation','Something is ending so something else can begin. Let the old leaves fall.'],
    ['Temperance','balance, moderation, blending, patience','excess, imbalance, impatience','Mix carefully and take your time. The middle way is the magic here.'],
    ['The Devil','attachment, temptation, shadow, materialism','release, breaking chains, reclaiming power','Notice what holds you. The chains are looser than they look.'],
    ['The Tower','upheaval, revelation, sudden change, awakening','averted disaster, fear of change, delayed collapse','What was built on a false foundation is coming down. Clear ground follows.'],
    ['The Star','hope, renewal, inspiration, serenity','despair, disconnection, lost faith','After the storm, a quiet light. Healing is already underway.'],
    ['The Moon','illusion, intuition, dreams, the unknown','confusion lifting, fear released, clarity','Not everything is as it seems. Walk slowly and trust your instincts.'],
    ['The Sun','joy, success, vitality, clarity','temporary gloom, overconfidence, delayed joy','Warmth, clarity and good news. Let yourself be seen.'],
    ['Judgement','awakening, reckoning, calling, rebirth','self-doubt, ignoring the call, harsh judgment','A call to rise. Review the past honestly and answer what you hear.'],
    ['The World','completion, wholeness, integration, travel','loose ends, incompletion, shortcuts','A cycle is complete. Celebrate, then step into the larger circle.']
  ];
  const SUITS = {
    wands:     {name:'Wands',     element:'Fire',  domain:'passion, energy and ambition'},
    cups:      {name:'Cups',      element:'Water', domain:'feelings, relationships and intuition'},
    swords:    {name:'Swords',    element:'Air',   domain:'thought, conflict and truth'},
    pentacles: {name:'Pentacles', element:'Earth', domain:'money, work, body and home'}
  };
  const RANKS = ['','Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
  const MINOR = {
    wands: [null,
      ['inspiration, spark, new venture','delays, lack of direction','A spark of inspiration wants to become something real.'],
      ['planning, vision, future choices','fear of the unknown, poor planning','You can see the horizon. Decide which way to go.'],
      ['expansion, foresight, progress','obstacles, lack of foresight','Your ships are coming in. Keep looking ahead.'],
      ['celebration, home, harmony','instability, tension at home','A moment worth celebrating with the people who matter.'],
      ['competition, friction, rivalry','avoiding conflict, inner tension','Healthy friction sharpens everyone. Keep it playful.'],
      ['recognition, victory, confidence','ego, fall from grace','Public success. Accept the applause gracefully.'],
      ['defiance, standing your ground','overwhelm, giving up','Hold your position. You have the higher ground.'],
      ['swiftness, momentum, news','delays, frustration','Things are moving fast. Ride the momentum.'],
      ['resilience, persistence, last stand','exhaustion, paranoia','You are nearly there. One more push.'],
      ['burden, responsibility, hard work','delegating, release','You are carrying too much. Set some of it down.'],
      ['curiosity, enthusiasm, exploration','scattered energy, impatience','A curious messenger brings an exciting idea.'],
      ['adventure, action, boldness','haste, recklessness','Charge forward, but look where you are going.'],
      ['confidence, warmth, determination','jealousy, insecurity','Radiant, sure and warm. Lead with your light.'],
      ['vision, leadership, entrepreneurship','impulsiveness, overbearing','A visionary leader who turns fire into direction.']],
    cups: [null,
      ['new love, compassion, overflowing feeling','blocked emotion, emptiness','Your cup is filling. Open your heart to receive.'],
      ['partnership, mutual attraction, connection','imbalance, broken bond','Two hearts meet in equal exchange.'],
      ['friendship, community, celebration','overindulgence, gossip','Raise a glass with friends who lift you up.'],
      ['contemplation, apathy, reevaluation','new awareness, acceptance','Look up: an offer is being held out to you.'],
      ['loss, regret, grief','acceptance, moving on','Mourn what spilled, then turn to the cups still standing.'],
      ['nostalgia, innocence, memories','stuck in the past','A sweet memory or an old friend returns.'],
      ['choices, fantasy, illusion','clarity, decisiveness','Many shimmering options. Which ones are real?'],
      ['walking away, seeking deeper meaning','fear of leaving, aimlessness','It is time to leave what no longer fulfills you.'],
      ['contentment, wishes granted, satisfaction','smugness, unmet wishes','The wish card. Let yourself enjoy it.'],
      ['harmony, family, emotional fulfillment','broken harmony, disconnection','Lasting joy and a full house.'],
      ['intuitive message, creativity, sensitivity','emotional immaturity, blocks','A sweet, surprising message from the heart.'],
      ['romance, charm, following the heart','moodiness, unrealistic ideals','An invitation, an offer, a romantic gesture.'],
      ['compassion, intuition, emotional security','codependence, overwhelm','Deep empathy held with calm boundaries.'],
      ['emotional balance, diplomacy, wisdom','manipulation, coldness','Steady feeling, wise counsel, calm waters.']],
    swords: [null,
      ['clarity, breakthrough, truth','confusion, chaos','A clear idea cuts through the fog.'],
      ['stalemate, difficult choice, denial','information overload, indecision','You cannot avoid this choice forever. Lift the blindfold.'],
      ['heartbreak, sorrow, painful truth','healing, forgiveness','A painful truth hurts, and it also clears the air.'],
      ['rest, recovery, contemplation','restlessness, burnout','Lay down your weapons and rest.'],
      ['conflict, hollow victory, tension','reconciliation, making amends','Ask whether winning this argument is worth the cost.'],
      ['transition, moving on, calmer waters','unfinished business, resistance','You are moving toward calmer waters.'],
      ['strategy, stealth, cunning','confession, coming clean','Think strategically, and stay honest with yourself.'],
      ['restriction, self-imposed limits','release, new perspective','The bindings are looser than you think. Step out.'],
      ['anxiety, worry, sleepless nights','hope, recovery','Night fears grow in the dark. Morning shrinks them.'],
      ['ending, rock bottom, release','recovery, regeneration','The worst is over. There is only up from here.'],
      ['curiosity, new ideas, vigilance','gossip, scattered thinking','A sharp mind full of questions.'],
      ['ambition, fast action, drive','impulsiveness, burnout','Charging in with conviction. Aim carefully.'],
      ['clear boundaries, perception, independence','coldness, bitterness','Clear-eyed honesty with a fair heart.'],
      ['intellect, authority, truth','misuse of power, harshness','Decisive judgment grounded in principle.']],
    pentacles: [null,
      ['opportunity, prosperity, new venture','missed chance, poor planning','A solid opportunity lands in your hand.'],
      ['balance, adaptability, juggling','overwhelm, disorganization','You are juggling a lot. Stay flexible.'],
      ['teamwork, craftsmanship, collaboration','misalignment, poor quality','Good work shared with skilled people.'],
      ['security, saving, holding on','greed, scarcity mindset','Protect what you have without clutching it.'],
      ['hardship, insecurity, exclusion','recovery, help arriving','Hard times, but the door to help is nearby.'],
      ['generosity, sharing, charity','debt, strings attached','Give and receive with an open hand.'],
      ['patience, long-term view, investment','impatience, poor returns','Your garden is growing. Patience pays.'],
      ['skill, diligence, mastery','perfectionism, shortcuts','Steady practice turns effort into mastery.'],
      ['independence, luxury, self-sufficiency','overwork, hollow success','Enjoy the abundance you created.'],
      ['legacy, wealth, family, roots','financial loss, family conflict','Lasting security and a legacy worth keeping.'],
      ['ambition, study, manifestation','procrastination, lack of focus','A student with a practical new goal.'],
      ['hard work, routine, reliability','boredom, stagnation','Slow and steady, one furrow at a time.'],
      ['nurturing, practicality, comfort','self-neglect, work-life imbalance','Down-to-earth care that makes a house a home.'],
      ['abundance, security, discipline','greed, stubbornness','A generous provider with a steady hand.']]
  };

  const CARDS = [];
  MAJORS.forEach((m, i) => CARDS.push({id:`major-${i}`, arcana:'major', num:i, name:m[0], upright:m[1], reversed:m[2], meaning:m[3]}));
  Object.keys(SUITS).forEach(s => {
    for (let r = 1; r <= 14; r++) {
      const d = MINOR[s][r];
      CARDS.push({id:`${s}-${r}`, arcana:'minor', suit:s, rank:r, name:`${RANKS[r]} of ${SUITS[s].name}`, upright:d[0], reversed:d[1], meaning:d[2]});
    }
  });

  // ---------- SVG rendering ----------
  const W = 600, H = 1000, INK = '#2b1a0e', GOLD = '#f2c14e', CREAM = '#fff4c9';
  const PALETTES = {
    major:     ['#f6a03a','#f7d046','#e2553e','#b8467a','#7b4aa0','#2f8f8a','#3a6fb0','#5fae5a'],
    wands:     ['#f6a03a','#f7d046','#e2553e','#ff7a3d','#b8467a','#f2c14e'],
    cups:      ['#3a6fb0','#2f8f8a','#7fb6d9','#7b4aa0','#5fd1c4','#b8467a'],
    swords:    ['#9fb7e8','#7b4aa0','#e9e4d8','#3a6fb0','#c79be0','#5a7fc0'],
    pentacles: ['#5fae5a','#f2c14e','#3f7d4a','#c9a227','#8bc34a','#e2a03a']
  };
  const BG = {major:'#2b5b6b', wands:'#5b2b2b', cups:'#173f5f', swords:'#2d2a52', pentacles:'#2b4a30'};

  function rng(seed){ let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const R = (r, a, b) => a + r() * (b - a);
  const f = n => n.toFixed(1);
  const path = (d, w = 5, c = INK, fill = 'none') => `<path d="${d}" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

  function waves(r, cx, cy, pal) {
    let out = ''; const n = 44;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + R(r, -.03, .03), amp = R(r, 6, 12), fr = R(r, .035, .055), ph = R(r, 0, 6);
      let pts = '';
      for (let rad = 40; rad < 900; rad += 12) {
        const off = amp * Math.sin(rad * fr + ph) * (rad / 300);
        pts += `${f(cx + rad * Math.cos(a) - off * Math.sin(a))},${f(cy + rad * Math.sin(a) + off * Math.cos(a))} `;
      }
      out += `<polyline points="${pts}" fill="none" stroke="${pal[i % pal.length]}" stroke-width="${f(R(r, 9, 15))}" stroke-linecap="round" opacity=".88"/>`;
    }
    return out;
  }
  function mushroom(r, x, y, s, cap) {
    let dots = ''; for (let i = 0; i < 6; i++) dots += `<circle cx="${f(x + R(r, -30, 30) * s)}" cy="${f(y - 58 * s + R(r, -14, 4) * s)}" r="${f(R(r, 3, 6) * s)}" fill="#f7e6b0"/>`;
    return `<path d="M${x - 10 * s},${y} Q${x - 6 * s},${y - 40 * s} ${x - 8 * s},${y - 50 * s} L${x + 8 * s},${y - 50 * s} Q${x + 6 * s},${y - 40 * s} ${x + 10 * s},${y} Z" fill="#efd9a8" stroke="${INK}" stroke-width="2"/>` +
      `<path d="M${x - 46 * s},${y - 48 * s} Q${x},${y - 100 * s} ${x + 46 * s},${y - 48 * s} Q${x},${y - 58 * s} ${x - 46 * s},${y - 48 * s} Z" fill="${cap}" stroke="${INK}" stroke-width="2.5"/>` + dots;
  }
  function flower(x, y, s, col) {
    let p = '';
    for (let k = 0; k < 6; k++) { const px = x + 12 * s * Math.cos(k * Math.PI / 3), py = y + 12 * s * Math.sin(k * Math.PI / 3); p += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(9 * s)}" ry="${f(6 * s)}" transform="rotate(${k * 60} ${f(px)} ${f(py)})" fill="${col}" stroke="${INK}" stroke-width="1.5"/>`; }
    return p + `<circle cx="${x}" cy="${y}" r="${6 * s}" fill="#f7d046" stroke="${INK}" stroke-width="1.5"/>`;
  }
  function foreground(r, hill) {
    let g = `<path d="M20,805 Q150,745 300,775 T580,752 L580,880 L20,880 Z" fill="${hill}" stroke="#2a3b1e" stroke-width="2"/>`;
    [[95, 1.0, '#b8467a'], [505, 1.15, '#f6a03a'], [168, .7, '#7b4aa0'], [440, .65, '#2f8f8a']].forEach(([x, s, c]) => g += mushroom(r, x, 856, s, c));
    [[60, 846, 1, '#e2553e'], [300, 850, .9, '#f6a03a'], [250, 836, .7, '#7b4aa0'], [548, 842, .9, '#e2553e'], [370, 855, .8, '#3a6fb0']].forEach(([x, y, s, c]) => g += flower(x, y, s, c));
    return g;
  }
  function star(cx, cy, Ro, Ri, n = 8, fill = GOLD) {
    let pts = ''; for (let k = 0; k < 2 * n; k++) { const rr = k % 2 ? Ri : Ro, a = k * Math.PI / n - Math.PI / 2; pts += `${f(cx + rr * Math.cos(a))},${f(cy + rr * Math.sin(a))} `; }
    return `<polygon points="${pts}" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  }

  // Suit symbols, centered at (x, y), scale s (1 ≈ 120px tall)
  const SYM = {
    cups: (x, y, s, fill = GOLD) =>
      path(`M${x - 34 * s},${y - 50 * s} Q${x - 34 * s},${y + 10 * s} ${x},${y + 10 * s} Q${x + 34 * s},${y + 10 * s} ${x + 34 * s},${y - 50 * s} Z`, 3.5 * Math.max(s, .6), INK, fill) +
      path(`M${x - 6 * s},${y + 10 * s} L${x - 8 * s},${y + 42 * s} L${x - 26 * s},${y + 54 * s} L${x + 26 * s},${y + 54 * s} L${x + 8 * s},${y + 42 * s} L${x + 6 * s},${y + 10 * s}`, 3.5 * Math.max(s, .6), INK, fill) +
      `<ellipse cx="${x}" cy="${y - 50 * s}" rx="${34 * s}" ry="${8 * s}" fill="#e2553e" stroke="${INK}" stroke-width="${3 * Math.max(s, .6)}"/>`,
    wands: (x, y, s) =>
      path(`M${x - 12 * s},${y + 64 * s} L${x + 12 * s},${y - 64 * s}`, 22 * s + 6, INK) + path(`M${x - 12 * s},${y + 64 * s} L${x + 12 * s},${y - 64 * s}`, 22 * s, '#f0c98a') + path(`M${x - 8 * s},${y + 50 * s} L${x + 6 * s},${y - 40 * s}`, 5 * s, '#b07a3e') +
      [[-.35, -20], [.15, 18], [-.1, -45], [.4, 40]].map(([t, dx]) => { const px = x + t * 20 * s, py = y + t * -120 * s; return `<ellipse cx="${f(px + dx * .45 * s)}" cy="${f(py)}" rx="${f(12 * s)}" ry="${f(6 * s)}" transform="rotate(${dx > 0 ? -30 : 30} ${f(px + dx * .45 * s)} ${f(py)})" fill="#7cd36a" stroke="${INK}" stroke-width="${2.5 * Math.max(s, .7)}"/>`; }).join(''),
    swords: (x, y, s) =>
      `<polygon points="${x},${y - 66 * s} ${x + 9 * s},${y - 48 * s} ${x + 9 * s},${y + 28 * s} ${x - 9 * s},${y + 28 * s} ${x - 9 * s},${y - 48 * s}" fill="#f4f7fc" stroke="${INK}" stroke-width="${5 * Math.max(s, .6)}" stroke-linejoin="round"/>` + path(`M${x},${y - 52 * s} L${x},${y + 24 * s}`, 2.5 * s, '#9aa8c4') +
      path(`M${x - 30 * s},${y + 30 * s} L${x + 30 * s},${y + 30 * s}`, 10 * s + 3, INK) + path(`M${x - 30 * s},${y + 30 * s} L${x + 30 * s},${y + 30 * s}`, 10 * s, GOLD) +
      path(`M${x},${y + 34 * s} L${x},${y + 56 * s}`, 9 * s + 3, INK) + path(`M${x},${y + 34 * s} L${x},${y + 56 * s}`, 9 * s, '#b8467a') +
      `<circle cx="${x}" cy="${y + 62 * s}" r="${7 * s}" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>`,
    pentacles: (x, y, s) =>
      `<circle cx="${x}" cy="${y}" r="${46 * s}" fill="${GOLD}" stroke="${INK}" stroke-width="${3.5 * Math.max(s, .6)}"/><circle cx="${x}" cy="${y}" r="${38 * s}" fill="none" stroke="${INK}" stroke-width="${1.6 * Math.max(s, .6)}"/>` +
      star(x, y, 34 * s, 13 * s, 5, '#e2553e')
  };

  // Pip arrangements for 2–10 (unit coords within the art area)
  const PIPS = {
    2: [[0, -.6], [0, .6]], 3: [[0, -.75], [0, 0], [0, .75]], 4: [[-.5, -.55], [.5, -.55], [-.5, .55], [.5, .55]],
    5: [[-.5, -.6], [.5, -.6], [0, 0], [-.5, .6], [.5, .6]], 6: [[-.5, -.7], [.5, -.7], [-.5, 0], [.5, 0], [-.5, .7], [.5, .7]],
    7: [[-.5, -.75], [.5, -.75], [0, -.38], [-.5, 0], [.5, 0], [-.5, .75], [.5, .75]],
    8: [[-.5, -.8], [.5, -.8], [-.5, -.27], [.5, -.27], [-.5, .27], [.5, .27], [-.5, .8], [.5, .8]],
    9: [[-.5, -.8], [.5, -.8], [-.5, -.27], [.5, -.27], [0, 0], [-.5, .27], [.5, .27], [-.5, .8], [.5, .8]],
    10: [[-.5, -.85], [.5, -.85], [0, -.57], [-.5, -.28], [.5, -.28], [-.5, .28], [.5, .28], [0, .57], [-.5, .85], [.5, .85]]
  };

  const glowDisc = (cx, cy, r, c = '#fff2b0', o = .35) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="${o}"/>`;
  function crown(x, y, s, fill = GOLD) {
    return path(`M${x - 50 * s},${y + 22 * s} L${x - 56 * s},${y - 26 * s} L${x - 26 * s},${y} L${x},${y - 38 * s} L${x + 26 * s},${y} L${x + 56 * s},${y - 26 * s} L${x + 50 * s},${y + 22 * s} Z`, 4, INK, fill) +
      [-56, 0, 56].map(dx => `<circle cx="${x + dx * s}" cy="${y + (dx ? -30 : -42) * s}" r="${7 * s}" fill="#e2553e" stroke="${INK}" stroke-width="2"/>`).join('');
  }
  const knightPiece = (x, y, s) => path(`M${x - 40 * s},${y + 60 * s} L${x + 44 * s},${y + 60 * s} L${x + 38 * s},${y + 22 * s} C${x + 46 * s},${y - 10 * s} ${x + 40 * s},${y - 58 * s} ${x - 4 * s},${y - 66 * s} L${x - 12 * s},${y - 80 * s} L${x - 18 * s},${y - 62 * s} C${x - 40 * s},${y - 50 * s} ${x - 58 * s},${y - 22 * s} ${x - 54 * s},${y - 2 * s} L${x - 20 * s},${y - 10 * s} C${x - 26 * s},${y + 14 * s} ${x - 40 * s},${y + 30 * s} ${x - 40 * s},${y + 60 * s} Z`, 4, INK, '#e9d3a6') + `<circle cx="${x + 2 * s}" cy="${y - 36 * s}" r="${5 * s}" fill="${INK}"/>`;
  const scroll = (x, y, s) => path(`M${x - 50 * s},${y - 30 * s} L${x + 50 * s},${y - 30 * s} L${x + 50 * s},${y + 30 * s} L${x - 50 * s},${y + 30 * s} Z`, 4, INK, '#f7e6b0') + path(`M${x - 34 * s},${y - 12 * s} L${x + 34 * s},${y - 12 * s} M${x - 34 * s},${y + 2 * s} L${x + 26 * s},${y + 2 * s} M${x - 34 * s},${y + 16 * s} L${x + 18 * s},${y + 16 * s}`, 2.5, '#8a5a2b');

  function majorEmblem(n) {
    const c = 300;
    switch (n) {
      case 0: return glowDisc(430, 210, 80, '#fff2b0', .5) + star(430, 210, 70, 52, 16) + `<circle cx="430" cy="210" r="48" fill="#f7d046" stroke="${INK}" stroke-width="3"/>` + path('M130,620 L380,330', 12, INK) + path('M130,620 L380,330', 7, '#c98b4a') + `<circle cx="385" cy="345" r="34" fill="#e2553e" stroke="${INK}" stroke-width="3"/>` + path('M180,760 L250,690 L360,700 L420,780', 5, INK, '#8a6a4a');
      case 1: return glowDisc(c, 380, 150, '#1d1430', .5) + path('M300,250 C255,205 205,230 205,262 C205,295 255,318 300,262 C345,206 395,230 395,262 C395,295 345,318 300,262 Z', 8, GOLD) + path('M300,300 L300,560', 14, INK) + path('M300,300 L300,560', 8, GOLD) + `<circle cx="300" cy="295" r="16" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>` + SYM.cups(160, 560, .55) + SYM.swords(440, 560, .55) + SYM.wands(210, 650, .5) + SYM.pentacles(390, 660, .55);
      case 2: return [180, 420].map((x, i) => `<rect x="${x - 34}" y="200" width="68" height="520" fill="${i ? '#efe6d2' : '#2b1a0e'}" stroke="${INK}" stroke-width="4"/><text x="${x}" y="260" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="${i ? INK : CREAM}">${i ? 'J' : 'B'}</text>`).join('') + path('M300,260 A90,90 0 1,0 300,480 A70,70 0 1,1 300,260 Z', 4, INK, GOLD) + scroll(300, 600, .9);
      case 3: return glowDisc(c, 380, 160) + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(k => { const a = -Math.PI + k * Math.PI / 11; return star(300 + 120 * Math.cos(a), 300 + 70 * Math.sin(a), 16, 7, 6); }).join('') + `<circle cx="300" cy="420" r="70" fill="none" stroke="${INK}" stroke-width="16"/><circle cx="300" cy="420" r="70" fill="none" stroke="${GOLD}" stroke-width="10"/>` + path('M300,490 L300,620 M250,560 L350,560', 16, INK) + path('M300,490 L300,620 M250,560 L350,560', 10, GOLD) + [190, 410].map(x => path(`M${x},760 Q${x - 20},660 ${x},600 Q${x + 20},660 ${x},760`, 3, INK, '#f2c14e')).join('');
      case 4: return `<rect x="170" y="260" width="260" height="420" rx="10" fill="#8a3a2a" stroke="${INK}" stroke-width="5"/>` + path('M210,320 C150,280 150,200 230,220 M390,320 C450,280 450,200 370,220', 10, INK) + path('M210,320 C150,280 150,200 230,220 M390,320 C450,280 450,200 370,220', 6, CREAM) + crown(300, 380, 1.1) + `<circle cx="300" cy="540" r="44" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>` + path('M300,496 L300,470 M286,478 L314,478', 6, INK);
      case 5: return glowDisc(c, 380, 150) + path('M300,220 L300,640 M250,300 L350,300 M230,370 L370,370 M210,440 L390,440', 16, INK) + path('M300,220 L300,640 M250,300 L350,300 M230,370 L370,370 M210,440 L390,440', 10, GOLD) + [[200, 610, 30], [400, 610, -30]].map(([x, y, rot]) => `<g transform="rotate(${rot} ${x} ${y})"><circle cx="${x}" cy="${y - 50}" r="24" fill="none" stroke="${INK}" stroke-width="10"/><circle cx="${x}" cy="${y - 50}" r="24" fill="none" stroke="${GOLD}" stroke-width="6"/>${path(`M${x},${y - 26} L${x},${y + 50} M${x},${y + 30} L${x + 18},${y + 30} M${x},${y + 44} L${x + 14},${y + 44}`, 6, GOLD)}</g>`).join('');
      case 6: return glowDisc(c, 230, 90, '#fff2b0', .55) + star(300, 230, 80, 56, 16) + `<circle cx="300" cy="230" r="52" fill="#f7d046" stroke="${INK}" stroke-width="3"/>` + [[230, 470], [370, 470]].map(([x, y]) => path(`M${x},${y + 80} C${x - 90},${y} ${x - 60},${y - 70} ${x},${y - 30} C${x + 60},${y - 70} ${x + 90},${y} ${x},${y + 80} Z`, 4, INK, x < 300 ? '#e2553e' : '#b8467a')).join('') + path('M150,380 Q120,300 200,320 M450,380 Q480,300 400,320', 6, CREAM);
      case 7: return path('M150,250 L450,250 L430,300 L170,300 Z', 4, INK, '#3a6fb0') + [200, 260, 320, 380].map(x => star(x, 275, 10, 4, 6)).join('') + `<rect x="190" y="320" width="220" height="250" fill="#c79be0" stroke="${INK}" stroke-width="5"/>` + star(300, 420, 46, 18, 8) + [[210, 640, INK], [390, 640, '#efe6d2']].map(([x, y, col]) => `<circle cx="${x}" cy="${y}" r="56" fill="${col}" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="14" fill="${GOLD}" stroke="${INK}" stroke-width="3"/>` + [0, 45, 90, 135].map(a => path(`M${x + 50 * Math.cos(a * Math.PI / 180)},${y + 50 * Math.sin(a * Math.PI / 180)} L${x - 50 * Math.cos(a * Math.PI / 180)},${y - 50 * Math.sin(a * Math.PI / 180)}`, 3, GOLD)).join('')).join('');
      case 8: return glowDisc(c, 420, 170) + path('M300,210 C265,175 225,195 225,220 C225,246 265,262 300,220 C335,178 375,195 375,220 C375,246 335,262 300,220 Z', 7, GOLD) + `<circle cx="300" cy="440" r="120" fill="#f6a03a" stroke="${INK}" stroke-width="5"/>` + [...Array(18)].map((_, k) => { const a = k / 18 * Math.PI * 2; return path(`M${300 + 120 * Math.cos(a)},${440 + 120 * Math.sin(a)} L${300 + 150 * Math.cos(a)},${440 + 150 * Math.sin(a)}`, 12, '#c96a1a'); }).join('') + `<circle cx="300" cy="440" r="80" fill="#f7d046" stroke="${INK}" stroke-width="4"/><circle cx="270" cy="420" r="9" fill="${INK}"/><circle cx="330" cy="420" r="9" fill="${INK}"/>` + path('M280,470 Q300,485 320,470', 5) + [200, 250, 300, 350, 400].map(x => flower(x, 620, .9, '#e2553e')).join('');
      case 9: return path('M110,800 L300,420 L490,800 Z', 4, INK, '#4a4f6a') + star(470, 170, 36, 12, 8, CREAM) + path('M380,250 L380,720', 10, INK) + path('M380,250 L380,720', 6, '#c98b4a') + path('M180,330 L180,250', 6) + `<rect x="140" y="330" width="80" height="140" rx="10" fill="#3b2a1a" stroke="${INK}" stroke-width="4"/>` + glowDisc(180, 400, 46, '#fff2b0', .6) + star(180, 400, 34, 14, 6, '#fff2b0') + path('M130,330 L230,330 L180,300 Z', 3, INK, '#3b2a1a');
      case 10: return glowDisc(c, 420, 190) + `<circle cx="300" cy="420" r="170" fill="#e2553e" stroke="${INK}" stroke-width="6"/><circle cx="300" cy="420" r="128" fill="#f7d046" stroke="${INK}" stroke-width="4"/><circle cx="300" cy="420" r="46" fill="#3a6fb0" stroke="${INK}" stroke-width="4"/>` + [...Array(8)].map((_, k) => { const a = k / 8 * Math.PI * 2; return path(`M${300 + 46 * Math.cos(a)},${420 + 46 * Math.sin(a)} L${300 + 128 * Math.cos(a)},${420 + 128 * Math.sin(a)}`, 5); }).join('') + ['T', 'A', 'R', 'O'].map((t, k) => { const a = -Math.PI / 2 + k * Math.PI / 2; return `<text x="${300 + 150 * Math.cos(a)}" y="${420 + 150 * Math.sin(a) + 12}" text-anchor="middle" font-family="Georgia,serif" font-size="34" font-weight="700" fill="${CREAM}">${t}</text>`; }).join('');
      case 11: return glowDisc(c, 420, 170) + path('M300,220 L300,640', 12, INK) + path('M300,220 L300,640', 7, GOLD) + path('M150,330 L450,330', 8, INK) + [[170, 330], [430, 330]].map(([x, y]) => path(`M${x},${y} L${x - 50},${y + 130} L${x + 50},${y + 130} Z M${x - 50},${y + 130} Q${x},${y + 175} ${x + 50},${y + 130}`, 4, INK, GOLD)).join('') + `<g transform="translate(-20 0)">${SYM.swords(320, 560, .9)}</g>` + path('M240,660 L360,660 L340,700 L260,700 Z', 4, INK, '#8a3a2a');
      case 12: return path('M200,200 L400,200 M300,200 L300,320', 16, INK) + path('M200,200 L400,200 M300,200 L300,320', 10, '#5fae5a') + glowDisc(300, 600, 90, '#fff2b0', .6) + star(300, 600, 80, 58, 18) + `<circle cx="300" cy="600" r="52" fill="#f7d046" stroke="${INK}" stroke-width="3"/>` + path('M300,320 L300,440 M300,440 L240,520 M300,440 L360,520', 12, INK) + path('M300,320 L300,440 M300,440 L240,520 M300,440 L360,520', 6, '#3a6fb0');
      case 13: return glowDisc(300, 560, 160, '#fff2b0', .45) + path('M150,600 Q300,420 450,600 Z', 4, INK, '#f6a03a') + [150, 450].map(x => `<rect x="${x - 40}" y="330" width="80" height="320" fill="#4a4f6a" stroke="${INK}" stroke-width="4"/>` + path(`M${x - 40},330 L${x},290 L${x + 40},330`, 4, INK, '#4a4f6a')).join('') + [...Array(10)].map((_, k) => { const a = k / 10 * Math.PI * 2; return `<ellipse cx="${300 + 26 * Math.cos(a)}" cy="${300 + 26 * Math.sin(a)}" rx="30" ry="18" transform="rotate(${k * 36} ${300 + 26 * Math.cos(a)} ${300 + 26 * Math.sin(a)})" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`; }).join('') + `<circle cx="300" cy="300" r="16" fill="#f7d046" stroke="${INK}" stroke-width="2.5"/>`;
      case 14: return glowDisc(c, 420, 170) + path('M300,250 L370,370 L230,370 Z', 4, INK, '#f6a03a') + `<rect x="240" y="380" width="120" height="120" fill="none" stroke="${INK}" stroke-width="6"/>` + SYM.cups(190, 560, .8, '#7fb6d9') + SYM.cups(410, 660, .8, '#7fb6d9') + path('M210,530 C260,540 330,560 390,610', 10, '#5fd1c4');
      case 15: return star(300, 300, 110, 42, 5, '#e2553e') + `<g transform="rotate(180 300 300)"></g>` + path('M300,190 L300,410', 0) + path('M180,560 Q240,640 300,560 Q360,640 420,560', 8, '#8a8f9a') + [180, 240, 300, 360, 420].map(x => `<circle cx="${x}" cy="${560 + (x % 120 ? 30 : 0)}" r="14" fill="none" stroke="#c0c4cc" stroke-width="6"/>`).join('') + path('M470,640 L470,420', 10, INK) + path('M470,640 L470,420', 6, '#c98b4a') + path('M470,420 C440,380 470,340 470,300 C490,350 510,380 470,420 Z', 3, INK, '#f6a03a');
      case 16: return path('M220,800 L250,300 L350,300 L380,800 Z', 5, INK, '#8a7a6a') + crown(300, 270, .9, GOLD) + `<rect x="270" y="380" width="60" height="70" fill="#f6a03a" stroke="${INK}" stroke-width="3"/><rect x="270" y="520" width="60" height="70" fill="#f6a03a" stroke="${INK}" stroke-width="3"/>` + path('M470,100 L380,260 L430,260 L340,420', 14, INK) + path('M470,100 L380,260 L430,260 L340,420', 8, '#fff2b0') + [...Array(10)].map((_, k) => `<circle cx="${180 + k * 26}" cy="${180 + (k * 37) % 120}" r="7" fill="#f7d046"/>`).join('');
      case 17: { let s = star(300, 250, 110, 40, 8) + star(300, 250, 60, 24, 8, CREAM); [[150, 160], [450, 160], [130, 330], [470, 330], [200, 420], [400, 420], [300, 420]].forEach(([x, y]) => s += star(x, y, 24, 10, 8)); return s + path('M170,800 Q230,600 300,560 Q370,600 430,800 Z', 3, INK, '#3a6fb0') + SYM.cups(220, 560, .7, '#7fb6d9') + SYM.cups(380, 560, .7, '#7fb6d9'); }
      case 18: return glowDisc(300, 250, 120, '#e7ecf5', .4) + `<circle cx="300" cy="250" r="96" fill="#e9e4d8" stroke="${INK}" stroke-width="4"/>` + path('M300,154 A96,96 0 0,0 300,346 A70,96 0 0,1 300,154 Z', 0, INK, '#c9c2b2') + [140, 460].map(x => `<rect x="${x - 34}" y="460" width="68" height="260" fill="#4a4f6a" stroke="${INK}" stroke-width="4"/>` + path(`M${x - 34},460 L${x},420 L${x + 34},460`, 4, INK, '#4a4f6a')).join('') + path('M300,780 C260,700 340,640 300,560 C280,520 300,480 300,470', 10, '#f7d046') + [...Array(9)].map((_, k) => path(`M${230 + k * 18},${370 + (k % 3) * 18} l0,18`, 5, '#f7d046')).join('');
      case 19: return glowDisc(300, 300, 190, '#fff2b0', .55) + [...Array(24)].map((_, k) => { const a = k / 24 * Math.PI * 2; return path(`M${300 + 120 * Math.cos(a)},${300 + 120 * Math.sin(a)} L${300 + (k % 2 ? 160 : 190) * Math.cos(a)},${300 + (k % 2 ? 160 : 190) * Math.sin(a)}`, 10, k % 2 ? '#f6a03a' : '#f7d046'); }).join('') + `<circle cx="300" cy="300" r="118" fill="#f7d046" stroke="${INK}" stroke-width="5"/><circle cx="262" cy="282" r="11" fill="${INK}"/><circle cx="338" cy="282" r="11" fill="${INK}"/>` + path('M250,330 Q300,372 350,330', 6) + [170, 240, 360, 430].map((x, i) => path(`M${x},780 L${x},${600 + i % 2 * 30}`, 6, '#3f7d4a') + flower(x, 590 + i % 2 * 30, 2, '#f7d046')).join('');
      case 20: return glowDisc(300, 260, 160, '#fff2b0', .4) + [...Array(14)].map((_, k) => { const a = Math.PI + k / 13 * Math.PI; return path(`M300,330 L${300 + 260 * Math.cos(a)},${330 + 260 * Math.sin(a)}`, 4, '#fff2b0'); }).join('') + path('M180,420 L420,260 L440,300 L200,440 Z', 4, INK, GOLD) + path('M420,260 C460,220 500,240 480,300 C470,320 450,310 440,300 Z', 4, INK, GOLD) + `<rect x="250" y="300" width="70" height="50" fill="#fff" stroke="${INK}" stroke-width="3"/>` + path('M285,300 L285,350 M250,325 L320,325', 6, '#e2553e') + [[200, 640], [300, 610], [400, 640]].map(([x, y]) => `<rect x="${x - 45}" y="${y}" width="90" height="120" rx="8" fill="#8a7a6a" stroke="${INK}" stroke-width="4"/>` + path(`M${x},${y - 10} L${x},${y - 60} M${x - 26},${y - 50} L${x},${y - 70} L${x + 26},${y - 50}`, 5, CREAM)).join('');
      case 21: return glowDisc(300, 420, 170) + `<ellipse cx="300" cy="430" rx="150" ry="230" fill="none" stroke="#3f7d4a" stroke-width="30"/>` + [...Array(28)].map((_, k) => { const a = k / 28 * Math.PI * 2, x = 300 + 150 * Math.cos(a), y = 430 + 230 * Math.sin(a); return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="16" ry="8" transform="rotate(${f(a * 180 / Math.PI + 90)} ${f(x)} ${f(y)})" fill="#5fae5a" stroke="${INK}" stroke-width="2"/>`; }).join('') + star(300, 430, 70, 28, 8) + SYM.wands(110, 150, .45) + SYM.cups(490, 150, .45) + SYM.swords(110, 700, .45) + SYM.pentacles(490, 710, .45);
    }
    return '';
  }

  function minorEmblem(card) {
    const s = card.suit, r = card.rank, draw = SYM[s];
    if (r === 1) return glowDisc(300, 420, 180, '#fff2b0', .4) + star(300, 420, 190, 150, 24, 'rgba(255,242,176,.25)') + draw(300, 430, 2.1);
    if (r <= 10) { const cx = 300, cy = 440, sx = 170, sy = 300, sc = r <= 4 ? 1.05 : r <= 7 ? .85 : .7; const k = (s === 'wands' || s === 'swords') ? 1.12 : 1; return PIPS[r].map(([u, v]) => `<circle cx="${f(cx + u * sx)}" cy="${f(cy + v * sy)}" r="${f(68 * sc)}" fill="#140a22" opacity=".42"/>`).join('') + PIPS[r].map(([u, v]) => draw(cx + u * sx, cy + v * sy, sc * k)).join(''); }
    const head = r === 11 ? scroll(300, 250, 1.1) : r === 12 ? knightPiece(300, 290, 1.4) : crown(300, 280, r === 14 ? 1.5 : 1.2, r === 14 ? GOLD : '#e2a8c8');
    return `<circle cx="300" cy="560" r="110" fill="#140a22" opacity=".4"/>` + glowDisc(300, 300, 120, '#fff2b0', .25) + head + draw(300, 560, 1.4) + (r === 14 ? star(300, 170, 22, 9, 8, CREAM) : '');
  }

  function cardSVG(card) {
    const id = card.id, seed = [...id].reduce((a, ch) => a * 31 + ch.charCodeAt(0) | 0, 7);
    const r = rng(seed), group = card.arcana === 'major' ? 'major' : card.suit;
    const focus = card.arcana === 'major' ? [300, 330] : [300, 430];
    const title = card.name.toUpperCase(), fs = title.length <= 12 ? 50 : title.length <= 16 ? 42 : 34;
    const num = card.arcana === 'major' ? ROMAN[card.num] : '';
    const uid = id.replace(/[^a-z0-9]/gi, '');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${card.name}">
<defs><clipPath id="a${uid}"><rect x="30" y="30" width="540" height="830"/></clipPath>
<radialGradient id="g${uid}" cx="${focus[0] / W}" cy="${focus[1] / H}" r=".38"><stop offset="0" stop-color="#fff2b0" stop-opacity="${card.arcana === 'minor' && card.rank > 1 ? .45 : .9}"/><stop offset=".5" stop-color="#f6a03a" stop-opacity=".4"/><stop offset="1" stop-color="#f6a03a" stop-opacity="0"/></radialGradient></defs>
<rect width="${W}" height="${H}" rx="18" fill="#f1c47c"/>
<g clip-path="url(#a${uid})"><rect x="30" y="30" width="540" height="830" fill="${BG[group]}"/>${waves(r, focus[0], focus[1], PALETTES[group])}
<rect x="30" y="30" width="540" height="830" fill="url(#g${uid})"/>${card.arcana === 'major' ? majorEmblem(card.num) : minorEmblem(card)}${foreground(r, group === 'cups' ? '#2f6f6a' : group === 'swords' ? '#4a5f7a' : '#3f7d4a')}</g>
<rect x="30" y="30" width="540" height="830" fill="none" stroke="${INK}" stroke-width="4"/>
${num ? `<rect x="250" y="44" width="100" height="50" rx="8" fill="#f2c983" stroke="${INK}" stroke-width="3"/><text x="300" y="82" text-anchor="middle" font-family="Georgia,serif" font-size="32" fill="${INK}">${num}</text>` : ''}
<rect x="30" y="880" width="540" height="92" fill="#f2c983" stroke="${INK}" stroke-width="4"/>
<text x="300" y="${943 - (50 - fs) / 3}" text-anchor="middle" font-family="'Book Antiqua','Palatino Linotype',Georgia,serif" font-size="${fs}" fill="${INK}" letter-spacing="1">${title}</text></svg>`;
  }

  function backSVG() {
    let rays = '';
    for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2; rays += `<path d="M300,500 L${f(300 + 520 * Math.cos(a))},${f(500 + 520 * Math.sin(a))}" stroke="${k % 2 ? '#7b4aa0' : '#b8467a'}" stroke-width="22" opacity=".55"/>`; }
    let ring = ''; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ring += star(300 + 150 * Math.cos(a), 500 + 150 * Math.sin(a), 18, 7, 8); }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Card back"><defs><clipPath id="bk"><rect x="30" y="30" width="540" height="940" rx="10"/></clipPath></defs>
<rect width="${W}" height="${H}" rx="18" fill="#f1c47c"/><g clip-path="url(#bk)"><rect width="${W}" height="${H}" fill="#2a1645"/>${rays}
<circle cx="300" cy="500" r="200" fill="#1b0f30" stroke="${GOLD}" stroke-width="6"/>${ring}<circle cx="300" cy="500" r="90" fill="none" stroke="${GOLD}" stroke-width="4"/>${star(300, 500, 80, 30, 8)}<circle cx="300" cy="500" r="18" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
<text x="300" y="900" text-anchor="middle" font-family="Georgia,serif" font-size="38" letter-spacing="10" fill="${GOLD}">ZEPHYR</text></g>
<rect x="30" y="30" width="540" height="940" rx="10" fill="none" stroke="${INK}" stroke-width="4"/></svg>`;
  }

  function face(card) {
    if (PAINTED[card.id]) return `<img src="${PAINTED[card.id]}" alt="${card.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`;
    return cardSVG(card);
  }

  global.ZephyrTarot = { CARDS, SUITS, PAINTED, face, cardSVG, backSVG };
})(window);
