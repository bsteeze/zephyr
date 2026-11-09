/* Zephyr Mayan — printable PDFs (personal reading and compatibility), white-paper layout.
   Uses self-hosted /jspdf.umd.min.js (loaded on demand) and window.ZephyrMaya.
   ZephyrMayaPDF.reading({date, ai})  ·  ZephyrMayaPDF.compat({dateA, dateB, nameA, nameB, ai}) */
(function (global) {
  'use strict';
  const PW = 612, PH = 792, M = 58, CW = PW - M * 2, TOP = 78, BOTTOM = PH - 62;
  const INK = [29, 36, 51], MUTED = [96, 104, 120], GOLD = [160, 118, 40], RULE = [222, 206, 168], LINE = [214, 218, 226];
  const GREEN = [46, 140, 104], CORAL = [184, 80, 92];
  const Z = () => global.ZephyrMaya;

  let loading = null;
  function loadJsPDF() {
    if (global.jspdf && global.jspdf.jsPDF) return Promise.resolve(global.jspdf.jsPDF);
    if (!loading) loading = new Promise((resolve, reject) => {
      const s = document.createElement('script'); s.src = '/jspdf.umd.min.js'; s.async = true;
      s.onload = () => global.jspdf ? resolve(global.jspdf.jsPDF) : reject(new Error('jsPDF did not load'));
      s.onerror = () => { loading = null; reject(new Error('Could not load the PDF library')); };
      document.head.appendChild(s);
    });
    return loading;
  }
  const clean = t => String(t == null ? '' : t).replace(/[✦★☆✧]/g, '').replace(/≈/g, '~')
    .replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ–—‘’“”•…]/g, '').replace(/[ \t]+/g, ' ').trim();
  const paras = t => String(t || '').split(/\n\s*\n/).map(clean).filter(Boolean);
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const prettyDate = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); };

  // ---------- Layout kit ----------
  function kit(doc) {
    const k = { y: TOP };
    const color = c => doc.setTextColor(c[0], c[1], c[2]);
    const font = (f, s, z) => { doc.setFont(f, s); doc.setFontSize(z); };
    k.color = color; k.font = font;
    k.tracked = (s, x, yy, size, c, o = {}) => {
      font('helvetica', 'bold', size); color(c);
      const sp = o.space == null ? size * 0.18 : o.space, str = clean(s).toUpperCase();
      const w = doc.getTextWidth(str) + sp * Math.max(0, str.length - 1);
      doc.text(str, o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x, yy, { charSpace: sp }); return w;
    };
    k.rule = (x1, yy, x2, c = RULE, w = 0.6) => { doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(w); doc.line(x1, yy, x2, yy); };
    k.diamond = (cx, cy, r, c = GOLD) => { doc.setFillColor(c[0], c[1], c[2]); doc.lines([[r, r], [-r, r], [-r, -r], [r, -r]], cx, cy - r, [1, 1], 'F', true); };
    k.ornament = (cx, yy, half = 60) => { k.rule(cx - half, yy, cx - 8); k.rule(cx + 8, yy, cx + half); k.diamond(cx, yy, 3); };
    k.star = (cx, cy, r) => { doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]); doc.setLineWidth(0.7); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, l = i % 2 ? r * .55 : r; doc.line(cx, cy, cx + l * Math.cos(a), cy + l * Math.sin(a)); } doc.setFillColor(255, 255, 255); doc.circle(cx, cy, r * .22, 'FD'); };
    k.newPage = () => { doc.addPage(); k.y = TOP; };
    k.ensure = h => { if (k.y + h > BOTTOM) { k.newPage(); return true; } return false; };
    k.text = (str, o = {}) => {
      const size = o.size || 10.5, lead = size * (o.lead || 1.48), x = o.x == null ? M : o.x, w = o.w || CW;
      font(o.face || 'times', o.style || 'normal', size); color(o.color || INK);
      doc.splitTextToSize(clean(str), w).forEach(line => { k.ensure(lead); doc.text(line, o.align === 'center' ? x + w / 2 : x, k.y + size * .92, o.align === 'center' ? { align: 'center' } : undefined); k.y += lead; });
      k.y += o.after == null ? size * .7 : o.after;
    };
    k.eyebrow = (s, o = {}) => { k.ensure(28); k.tracked(s, o.x == null ? M : o.x, k.y + 8, o.size || 7.5, o.color || GOLD); k.y += o.after == null ? 16 : o.after; };
    k.heading = (s, size = 18) => { k.ensure(size * 2.4); k.text(s, { size, style: 'bold', lead: 1.2, after: 8 }); };
    k.section = s => { k.y += 10; k.ensure(60); k.eyebrow(s); k.rule(M, k.y, PW - M); k.y += 14; };
    k.bullets = arr => arr.forEach(item => { k.ensure(28); k.diamond(M + 4, k.y + 7, 2.6); k.text(item, { x: M + 16, w: CW - 16, size: 10.8, after: 7 }); });
    k.labeled = (label, body) => { k.ensure(40); k.tracked(label, M, k.y + 7, 6.8, GOLD, { space: 1.2 }); k.y += 13; k.text(body, { size: 10.8, after: 10 }); };
    // Maya bar-and-dot numeral
    k.numeral = (n, cx, top, unit, c = GOLD) => {
      doc.setFillColor(c[0], c[1], c[2]);
      const bars = Math.floor(n / 5), dots = n % 5, w = unit * 4.4; let y = top;
      if (dots) { const gap = unit * 1.1, sx = cx - (dots - 1) * gap / 2; for (let i = 0; i < dots; i++) doc.circle(sx + i * gap, y + unit * .4, unit * .4, 'F'); y += unit * 1.3; }
      for (let i = 0; i < bars; i++) { doc.roundedRect(cx - w / 2, y, w, unit * .75, unit * .37, unit * .37, 'F'); y += unit * 1.15; }
      return y;
    };
    k.cover = (eyebrowTxt, title, sub) => {
      doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]); doc.setLineWidth(1.1); doc.rect(28, 28, PW - 56, PH - 56); doc.setLineWidth(.4); doc.rect(33, 33, PW - 66, PH - 66);
      k.star(PW / 2, 70, 13);
      k.tracked('Zephyr Observatory', PW / 2, 102, 8.5, GOLD, { align: 'center', space: 2.6 });
      k.tracked(eyebrowTxt, PW / 2, 132, 7.5, MUTED, { align: 'center', space: 1.8 });
      k.y = 146; k.text(title, { size: 27, style: 'bold', align: 'center', lead: 1.15, after: 6, x: M + 20, w: CW - 40 });
      if (sub) k.text(sub, { size: 13, style: 'italic', color: MUTED, align: 'center', x: M + 30, w: CW - 60, after: 4 });
      k.y += 12; k.ornament(PW / 2, k.y); k.y += 26;
    };
    k.finish = (headerTxt, stamp) => {
      const n = doc.getNumberOfPages();
      for (let p = 2; p <= n; p++) {
        doc.setPage(p);
        k.tracked(headerTxt, M, 46, 6.5, GOLD, { space: 1.5 });
        font('times', 'italic', 9); color(MUTED); doc.text(stamp, PW - M, 46, { align: 'right' });
        k.rule(M, 54, PW - M); k.rule(M, PH - 44, PW - M);
        font('helvetica', 'normal', 6.8); color(MUTED);
        doc.text('For reflection, not prediction or professional advice.  ·  zephyr.guru/mayan', M, PH - 32);
        doc.text(`${p - 1} / ${n - 1}`, PW - M, PH - 32, { align: 'right' });
      }
    };
    return k;
  }

  // Draw one day "card" (numeral + name) inside a box
  function dayBox(doc, k, x, y, w, h, day, label, highlight) {
    const z = Z();
    doc.setDrawColor(...(highlight ? GOLD : LINE)); doc.setLineWidth(highlight ? 1.1 : .7);
    if (highlight) { doc.setFillColor(251, 246, 234); doc.roundedRect(x, y, w, h, 8, 8, 'FD'); } else doc.roundedRect(x, y, w, h, 8, 8, 'S');
    k.tracked(label, x + w / 2, y + 14, 6, GOLD, { align: 'center', space: 1 });
    const bottom = k.numeral(day.number, x + w / 2, y + 22, 5.2, highlight ? GOLD : MUTED);
    k.font('times', 'bold', 12.5); k.color(INK); doc.text(clean(`${day.number} ${z.NAMES[day.sign][1]}`), x + w / 2, Math.max(bottom + 13, y + h - 22), { align: 'center' });
    k.font('helvetica', 'normal', 7.5); k.color(MUTED); doc.text(clean(`${z.NAMES[day.sign][2]} · ${z.NAMES[day.sign][0]}`), x + w / 2, Math.max(bottom + 25, y + h - 10), { align: 'center' });
  }
  function crossDiagram(doc, k, c, top) {
    const z = Z(), w = 120, h = 92, gx = 14, gy = 12, cx = PW / 2;
    const cell = { conception: [0, -1], right: [-1, 0], center: [0, 0], left: [1, 0], destiny: [0, 1] };
    z.CROSS_POSITIONS.forEach(p => {
      const [ix, iy] = cell[p.key];
      dayBox(doc, k, cx - w / 2 + ix * (w + gx), top + (iy + 1) * (h + gy), w, h, c.cross[p.key], p.label, p.key === 'center');
    });
    return top + 3 * h + 2 * gy;
  }

  async function reading(state) {
    const jsPDF = await loadJsPDF(), z = Z(), c = z.chartFor(state.date); if (!c) throw new Error('Invalid date');
    const doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true }), k = kit(doc), ai = state.ai;
    const t = c.trad, p = z.PROFILES[t.sign], dir = z.DIRECTIONS[t.sign % 4], lvl = z.intensity(t.number);
    const title = clean(ai && ai.title) || `${t.number} ${z.NAMES[t.sign][1]}`;
    k.cover('A Mayan Birth Reading', title, `Born ${prettyDate(state.date)}`);
    // Big glyph
    const gTop = k.y;
    k.y = k.numeral(t.number, PW / 2, gTop, 11) + 18;
    k.text(`${t.number} ${z.NAMES[t.sign][1]} · ${z.NAMES[t.sign][2]}`, { size: 16, style: 'bold', align: 'center', after: 2 });
    k.text(`Yucatec ${z.NAMES[t.sign][0]}  ·  ${dir.dir} (${dir.color})  ·  number ${t.number}, ${lvl}`, { size: 10, color: MUTED, align: 'center', after: 14 });
    k.font('helvetica', 'normal', 8.5); k.color(MUTED);
    const facts = [`Haab' ${t.haabDay} ${z.HAAB[t.haabMonth]}`, `Long Count ${t.lc}`, `Day ${t.pos} of 260`, `Dreamspell Kin ${c.ds.kin}: ${c.ds.color} ${z.TONES[c.ds.tone]} ${z.SEALS[c.ds.seal - 1]}`];
    doc.text(facts.join('   ·   '), PW / 2, k.y, { align: 'center' }); k.y += 22;
    crossDiagram(doc, k, c, k.y);
    k.font('times', 'italic', 10); k.color(MUTED); doc.text('Your Maya Cross', PW / 2, PH - 74, { align: 'center' });
    k.tracked('zephyr.guru', PW / 2, PH - 48, 6.5, GOLD, { align: 'center', space: 1.6 });

    k.newPage();
    if (ai) {
      k.eyebrow('Your Zephyr Reading'); k.heading(title, 20);
      paras(ai.opening).forEach(x => k.text(x, { size: 11.5, lead: 1.5, after: 9 }));
      ai.sections.forEach(s => { k.y += 6; k.ensure(70); k.text(s.heading, { size: 14, style: 'bold', lead: 1.25, after: 5 }); paras(s.body).forEach(x => k.text(x, { size: 11, after: 8 })); });
      k.section('Try This'); k.bullets(ai.advice);
      if (ai.closing) { k.y += 8; k.ensure(60); k.ornament(PW / 2, k.y); k.y += 20; paras(ai.closing).forEach(x => k.text(x, { size: 11.5, style: 'italic', align: 'center', x: M + 30, w: CW - 60, after: 8 })); }
      k.y += 10;
    }
    k.section(`Your Day Sign · ${z.NAMES[t.sign][1]} (${z.NAMES[t.sign][2]})`);
    k.labeled('Essence', p.essence); k.labeled('Gifts', p.gifts); k.labeled('Shadow', p.shadow);
    k.labeled('Love & friendship', p.love); k.labeled('Work & purpose', p.work);
    k.labeled(`The number ${t.number}: ${z.NUMBERS[t.number][0].toLowerCase()}`, `${z.NUMBERS[t.number][1]} ${z.INTENSITY_TEXT[lvl]}`);
    k.labeled(`The ${dir.dir}`, `${z.NAMES[t.sign][1]} belongs to the ${dir.dir} and the color ${dir.color.toLowerCase()}: ${dir.theme}.`);
    k.labeled('Traditionally a good day for', cap(p.day));
    k.section('Your Maya Cross');
    z.CROSS_POSITIONS.forEach(pos => { const d = c.cross[pos.key]; k.labeled(`${pos.label} · ${d.number} ${z.NAMES[d.sign][1]} (${z.NAMES[d.sign][2]})`, `${pos.meaning} ${(z.PROFILES[d.sign].essence.match(/^.*?[.!?](\s|$)/) || [''])[0]}`); });
    k.text("A practitioners' reading from the living K'iche' tradition (conception -8 days, destiny +8, sides -6 and +6). Daykeepers differ on the finer points.", { size: 8.5, face: 'helvetica', color: MUTED });
    k.section('Dreamspell · A Modern Lens');
    const o = c.ds.oracle;
    k.text(`Kin ${c.ds.kin}, ${c.ds.color} ${z.TONES[c.ds.tone]} ${z.SEALS[c.ds.seal - 1]}. Guide: ${z.SEALS[o.guide - 1]}. Support (analog): ${z.SEALS[o.analog - 1]}. Challenge (antipode): ${z.SEALS[o.antipode - 1]}. Hidden (occult): ${z.SEALS[o.occult - 1]}.`, { size: 10.8 });
    k.text('Dreamspell (José Argüelles, 1987) anchors to the Gregorian year and skips Feb 29, so it drifts from the traditional count.', { size: 8.5, face: 'helvetica', color: MUTED });
    k.finish('Zephyr Observatory · Mayan Reading', prettyDate(state.date));
    doc.setProperties({ title: `${title} · Zephyr Mayan Reading`, author: 'Zephyr Observatory', creator: 'zephyr.guru' });
    doc.save(`zephyr-mayan-${state.date}.pdf`);
    return doc;
  }

  async function compat(state) {
    const jsPDF = await loadJsPDF(), z = Z();
    const nA = state.nameA || 'Person one', nB = state.nameB || 'Person two';
    const r = z.compatibility(state.dateA, state.dateB, state.nameA || 'You', state.nameB || 'they'); if (!r) throw new Error('Invalid dates');
    const doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true }), k = kit(doc), ai = state.ai;
    const TAG = { best: 'Best for', good: 'Good for', work: 'Takes work in' }, order = { best: 0, good: 1, work: 2 };
    const title = clean(ai && ai.title) || `${nA} & ${nB}`;
    k.cover('A Mayan Compatibility Reading', title, `${nA} · ${prettyDate(state.dateA)}   +   ${nB} · ${prettyDate(state.dateB)}`);
    const w = 150, h = 112, top = k.y + 6;
    dayBox(doc, k, PW / 2 - w - 30, top, w, h, r.a.trad, nA, true);
    dayBox(doc, k, PW / 2 + 30, top, w, h, r.b.trad, nB, true);
    k.font('times', 'normal', 26); k.color(GOLD); doc.text('+', PW / 2, top + h / 2 + 8, { align: 'center' });
    k.y = top + h + 30;
    r.verdicts.slice().sort((x, y) => order[x.rating] - order[y.rating]).forEach(v => {
      const c = v.rating === 'best' ? GREEN : v.rating === 'work' ? CORAL : GOLD;
      doc.setDrawColor(...LINE); doc.setLineWidth(.7); doc.roundedRect(M + 40, k.y, CW - 80, 46, 8, 8, 'S');
      k.tracked(TAG[v.rating], M + 56, k.y + 18, 7, c, { space: 1.2 });
      k.font('times', 'bold', 14); k.color(INK); doc.text(v.label, M + 160, k.y + 19);
      k.font('times', 'italic', 9.5); k.color(MUTED); doc.text(doc.splitTextToSize(clean(v.reason), CW - 220)[0], M + 160, k.y + 34);
      k.y += 56;
    });
    k.font('helvetica', 'normal', 7.5); k.color(MUTED);
    doc.text(doc.splitTextToSize("There is no ancient compatibility chart. Zephyr builds these ratings from traditional relationships between days and Dreamspell's oracle partners, plus each sign's natural leanings.", CW - 80), PW / 2, PH - 92, { align: 'center' });
    k.tracked('zephyr.guru', PW / 2, PH - 48, 6.5, GOLD, { align: 'center', space: 1.6 });

    k.newPage();
    if (ai) {
      k.eyebrow('Your Zephyr Comparison'); k.heading(title, 20);
      paras(ai.summary).forEach(x => k.text(x, { size: 11.5, lead: 1.5, after: 9 }));
      ['love', 'friendship', 'business'].sort((x, y) => order[ai.ratings[x]] - order[ai.ratings[y]]).forEach(d => {
        const v = ai[d]; k.y += 6; k.ensure(80);
        k.tracked(`${TAG[ai.ratings[d]]} ${z.DOMAIN_LABEL[d]}`, M, k.y + 7, 7, ai.ratings[d] === 'best' ? GREEN : ai.ratings[d] === 'work' ? CORAL : GOLD); k.y += 13;
        k.text(v.headline, { size: 14, style: 'bold', lead: 1.25, after: 5 }); paras(v.body).forEach(x => k.text(x, { size: 11, after: 8 }));
      });
      k.section('Where You Shine'); k.bullets(ai.strengths);
      k.section('Where You Rub'); k.bullets(ai.friction);
      k.section('Try This Together'); k.bullets(ai.advice);
      if (ai.closing) { k.y += 8; k.ensure(60); k.ornament(PW / 2, k.y); k.y += 20; paras(ai.closing).forEach(x => k.text(x, { size: 11.5, style: 'italic', align: 'center', x: M + 30, w: CW - 60, after: 8 })); }
      k.y += 10;
    }
    k.section('Why These Ratings');
    r.verdicts.forEach(v => k.labeled(`${TAG[v.rating]} ${v.label}`, v.reasons.length ? v.reasons.join(' · ') : v.reason));
    k.section('Traditional Count');
    const sig = sys => r.signals.filter(s => s.system === sys);
    const list = arr => arr.length ? arr.forEach(s => k.labeled(s.title, s.text)) : k.text('No special relationship in this system, so each sign’s natural leanings carry more weight.', { size: 10.5, color: MUTED });
    list(sig('traditional'));
    k.section('Dreamspell'); list(sig('dreamspell'));
    [[nA, r.a], [nB, r.b]].forEach(([n, c]) => {
      const t = c.trad, p = z.PROFILES[t.sign];
      k.section(`${n} · ${t.number} ${z.NAMES[t.sign][1]} (${z.NAMES[t.sign][2]})`);
      k.labeled('Essence', p.essence); k.labeled('In love', p.love); k.labeled('At work', p.work);
      k.labeled('Maya Cross', z.CROSS_POSITIONS.map(pos => `${pos.label}: ${c.cross[pos.key].number} ${z.NAMES[c.cross[pos.key].sign][1]}`).join(' · '));
    });
    k.finish('Zephyr Observatory · Compatibility', `${nA} & ${nB}`);
    doc.setProperties({ title: `${title} · Zephyr Compatibility`, author: 'Zephyr Observatory', creator: 'zephyr.guru' });
    doc.save(`zephyr-compatibility-${state.dateA}-${state.dateB}.pdf`);
    return doc;
  }

  global.ZephyrMayaPDF = { reading, compat };
})(window);
