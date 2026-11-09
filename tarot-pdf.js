/* Zephyr Tarot — printable keepsake PDF.
   White-paper layout built with jsPDF (self-hosted /jspdf.umd.min.js, loaded on demand).
   Usage: ZephyrTarotPDF.download({spread, spreadName, positions, celticPos, question, cards, ai}) */
(function (global) {
  'use strict';

  const JSPDF_SRC = '/jspdf.umd.min.js';
  const PW = 612, PH = 792, M = 58, CW = PW - M * 2;          // US Letter, points
  const TOP = 78, BOTTOM = PH - 62;
  const INK = [29, 36, 51], MUTED = [96, 104, 120], GOLD = [160, 118, 40], RULE = [222, 206, 168], LINE = [214, 218, 226];
  const T = () => global.ZephyrTarot, CORR = () => global.ZephyrTarotCorrespondences;

  let loading = null;
  function loadJsPDF() {
    if (global.jspdf && global.jspdf.jsPDF) return Promise.resolve(global.jspdf.jsPDF);
    if (!loading) loading = new Promise((resolve, reject) => {
      const s = document.createElement('script'); s.src = JSPDF_SRC; s.async = true;
      s.onload = () => global.jspdf ? resolve(global.jspdf.jsPDF) : reject(new Error('jsPDF did not load'));
      s.onerror = () => { loading = null; reject(new Error('Could not load the PDF library')); };
      document.head.appendChild(s);
    });
    return loading;
  }

  // Standard PDF fonts only cover Western characters: keep typographic quotes and dashes, drop the rest.
  const clean = t => String(t == null ? '' : t)
    .replace(/[֐-׿]+/g, '').replace(/\(\s*\)/g, '').replace(/≈/g, '~').replace(/[✦★☆✧]/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ–—‘’“”•…]/g, '')
    .replace(/[ \t]+/g, ' ').replace(/ ,/g, ',').trim();
  const paras = t => String(t || '').split(/\n\s*\n/).map(clean).filter(Boolean);
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  // ---------- Card art → JPEG (white behind rounded corners) ----------
  function loadImage(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Card image failed to load')); i.src = src; });
  }
  async function cardJPEG(card, rotation, w) {
    const h = Math.round(w * 1000 / 600), painted = T().PAINTED && T().PAINTED[card.id];
    let url = painted, revoke = null;
    if (!painted) { url = revoke = URL.createObjectURL(new Blob([T().cardSVG(card)], { type: 'image/svg+xml' })); }
    try {
      const img = await loadImage(url);
      const side = rotation % 180 !== 0, cw = side ? h : w, ch = side ? w : h;
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      const x = c.getContext('2d');
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, cw, ch);
      x.translate(cw / 2, ch / 2); x.rotate(rotation * Math.PI / 180);
      if (painted) {
        const r = w * 0.03, s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s;
        x.beginPath(); if (x.roundRect) x.roundRect(-w / 2, -h / 2, w, h, r); else x.rect(-w / 2, -h / 2, w, h); x.clip();
        x.drawImage(img, -iw / 2, -ih / 2, iw, ih);
      } else x.drawImage(img, -w / 2, -h / 2, w, h);
      return c.toDataURL('image/jpeg', 0.9);
    } finally { if (revoke) URL.revokeObjectURL(revoke); }
  }

  // ---------- Document builder ----------
  async function build(state) {
    const jsPDF = await loadJsPDF();
    const doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const ai = state.ai || null, cards = state.cards, pos = state.positions;
    const aiByIndex = {}; if (ai && Array.isArray(ai.cards)) ai.cards.forEach(c => { aiByIndex[c.position_index] = c; });
    const title = clean(ai && ai.title) || 'Your Tarot Reading';
    const celtic = state.spread === 'celtic';

    const imgs = await Promise.all(cards.map(d => cardJPEG(d.card, d.reversed ? 180 : 0, 420)));
    const crossImg = celtic && cards[1] ? await cardJPEG(cards[1].card, cards[1].reversed ? 270 : 90, 420) : null;

    let y = TOP;
    const color = c => doc.setTextColor(c[0], c[1], c[2]);
    const font = (face, style, size) => { doc.setFont(face, style); doc.setFontSize(size); };
    const tracked = (s, x, yy, size, c, opts = {}) => {
      font('helvetica', 'bold', size); color(c);
      const sp = opts.space == null ? size * 0.18 : opts.space, str = clean(s).toUpperCase();
      const w = doc.getTextWidth(str) + sp * Math.max(0, str.length - 1);
      const sx = opts.align === 'center' ? x - w / 2 : opts.align === 'right' ? x - w : x;
      doc.text(str, sx, yy, { charSpace: sp }); return w;
    };
    const rule = (x1, yy, x2, c = RULE, wgt = 0.6) => { doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(wgt); doc.line(x1, yy, x2, yy); };
    const diamond = (cx, cy, r, c = GOLD) => { doc.setFillColor(c[0], c[1], c[2]); doc.lines([[r, r], [-r, r], [-r, -r], [r, -r]], cx, cy - r, [1, 1], 'F', true); };
    const star = (cx, cy, r) => {
      doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]); doc.setLineWidth(0.7);
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, l = k % 2 ? r * 0.55 : r; doc.line(cx, cy, cx + l * Math.cos(a), cy + l * Math.sin(a)); }
      doc.setFillColor(255, 255, 255); doc.circle(cx, cy, r * 0.22, 'FD');
    };
    const ornament = (cx, yy, half = 60) => { rule(cx - half, yy, cx - 8, RULE); rule(cx + 8, yy, cx + half, RULE); diamond(cx, yy, 3); };

    function newPage() { doc.addPage(); y = TOP; }
    function ensure(h) { if (y + h > BOTTOM) { newPage(); return true; } return false; }
    function text(str, o = {}) {
      const size = o.size || 10.5, lead = size * (o.lead || 1.48), x = o.x == null ? M : o.x, w = o.w || CW;
      font(o.face || 'times', o.style || 'normal', size); color(o.color || INK);
      const lines = doc.splitTextToSize(clean(str), w);
      lines.forEach(line => { ensure(lead); doc.text(line, o.align === 'center' ? x + w / 2 : x, y + size * 0.92, o.align === 'center' ? { align: 'center' } : undefined); y += lead; });
      y += o.after == null ? size * 0.7 : o.after;
    }
    function eyebrow(str, o = {}) { ensure(28); tracked(str, o.x == null ? M : o.x, y + 8, o.size || 7.5, o.color || GOLD); y += o.after == null ? 16 : o.after; }
    function heading(str, size = 18) { ensure(size * 2.4); text(str, { size, style: 'bold', lead: 1.2, after: 8 }); }
    function sectionGap(h = 18) { y += h; }

    // ===== Cover =====
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]); doc.setLineWidth(1.1); doc.rect(28, 28, PW - 56, PH - 56);
    doc.setLineWidth(0.4); doc.rect(33, 33, PW - 66, PH - 66);
    star(PW / 2, 70, 13);
    tracked('Zephyr Observatory', PW / 2, 102, 8.5, GOLD, { align: 'center', space: 2.6 });
    tracked(celtic ? 'A Celtic Cross Reading' : 'A Three Card Reading', PW / 2, 132, 7.5, MUTED, { align: 'center', space: 1.8 });
    y = 146;
    text(title, { size: 27, style: 'bold', align: 'center', lead: 1.15, after: 6, x: M + 20, w: CW - 40 });
    if (state.question) text(`“${state.question}”`, { size: 13, style: 'italic', color: MUTED, align: 'center', x: M + 30, w: CW - 60, after: 4 });
    if (!celtic) { tracked(pos.map(p => p.name).join(' · '), PW / 2, y + 10, 6.8, MUTED, { align: 'center', space: 1.1 }); y += 26; } else y += 8; ornament(PW / 2, y); y += 22;

    if (!celtic) {
      const cw = 136, ch = cw * 1000 / 600, gap = 24, total = cards.length * cw + (cards.length - 1) * gap;
      let x = (PW - total) / 2; const top = Math.max(y + 20, 290);
      cards.forEach((d, i) => {
        doc.addImage(imgs[i], 'JPEG', x, top, cw, ch);
        tracked(`${i + 1} · ${pos[i].name}`, x + cw / 2, top + ch + 20, 7, GOLD, { align: 'center', space: 1.3 });
        font('times', 'bold', 12); color(INK); doc.text(clean(d.card.name), x + cw / 2, top + ch + 36, { align: 'center' });
        if (d.reversed) { font('times', 'italic', 10); color(MUTED); doc.text('Reversed', x + cw / 2, top + ch + 50, { align: 'center' }); }
        x += cw + gap;
      });
    } else {
      // Celtic frame is 600×730 units, card 100×167
      const s = Math.min(0.6, (PH - 92 - 100 - y) / 730), fw = 600 * s, fh = 730 * s, ox = (PW - fw) / 2, oy = y + 4, cw = 100 * s, ch = 167 * s;
      state.celticPos.forEach(([cx, cy], i) => {
        if (!cards[i]) return;
        const X = ox + cx * s, Y = oy + cy * s;
        if (i === 1) doc.addImage(crossImg, 'JPEG', X - ch / 2, Y - cw / 2, ch, cw);
        else doc.addImage(imgs[i], 'JPEG', X - cw / 2, Y - ch / 2, cw, ch);
        const lx = i === 1 ? X + ch / 2 + 2 : X - cw / 2 - 2, ly = i === 1 ? Y - cw / 2 - 2 : Y - ch / 2 - 2;
        doc.setFillColor(255, 255, 255); doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]); doc.setLineWidth(0.8); doc.circle(lx, ly, 7.5, 'FD');
        font('helvetica', 'bold', 7.5); color(GOLD); doc.text(String(i + 1), lx, ly + 2.6, { align: 'center' });
      });
      y = oy + fh + 18;
      const colW = CW / 2 - 10;
      pos.forEach((p, i) => {
        const col = i < 5 ? 0 : 1, row = i % 5, x = M + col * (colW + 20), yy = y + row * 15;
        font('helvetica', 'bold', 7.5); color(GOLD); doc.text(String(i + 1), x, yy);
        font('times', 'bold', 9.5); color(INK); doc.text(clean(p.name), x + 12, yy);
        const nw = doc.getTextWidth(clean(p.name));
        font('times', cards[i] && cards[i].reversed ? 'italic' : 'normal', 9.5); color(MUTED);
        doc.text(clean(cards[i] ? `${cards[i].card.name}${cards[i].reversed ? ' (reversed)' : ''}` : ''), x + 12 + nw + 6, yy);
      });
    }
    font('times', 'italic', 10); color(MUTED); doc.text(date, PW / 2, PH - 62, { align: 'center' });
    tracked('zephyr.guru', PW / 2, PH - 48, 6.5, GOLD, { align: 'center', space: 1.6 });

    // ===== Overview =====
    newPage();
    if (ai && ai.opening) {
      eyebrow('Overview'); heading(title, 20);
      paras(ai.opening).forEach(p => text(p, { size: 11.5, lead: 1.5, after: 9 }));
      sectionGap(14);
    }

    // ===== The cards =====
    eyebrow('The Cards', { after: 10 }); rule(M, y, PW - M); y += 18;
    const thumbW = 84, thumbH = thumbW * 1000 / 600, colX = M + thumbW + 20, colW = CW - thumbW - 20;
    cards.forEach((d, i) => {
      const c = d.card, a = aiByIndex[i];
      ensure(thumbH + 24);
      const startY = y, startPage = doc.getNumberOfPages();
      doc.addImage(imgs[i], 'JPEG', M, y, thumbW, thumbH);
      eyebrow(`${i + 1} · ${pos[i].name}`, { x: colX, after: 14 });
      font('times', 'bold', 16); color(INK); doc.text(clean(c.name), colX, y + 13);
      if (d.reversed) { const nw = doc.getTextWidth(clean(c.name)); tracked('Reversed', colX + nw + 10, y + 12, 6.5, [176, 74, 74], { space: 1.2 }); }
      y += 22;
      text(cap(d.reversed ? c.reversed : c.upright), { x: colX, w: colW, size: 9.5, style: 'italic', color: MUTED, after: 8 });
      if (pos[i].desc) text(pos[i].desc, { x: colX, w: colW, size: 9, face: 'helvetica', color: MUTED, after: 8 });
      if (a) {
        if (a.headline) text(a.headline, { x: colX, w: colW, size: 12.5, style: 'bolditalic', lead: 1.3, after: 6 });
        paras(a.reading).forEach(p => text(p, { x: colX, w: colW, size: 10.5, after: 7 }));
        if (a.background) {
          y += 2; ensure(30); tracked('Background', colX, y + 7, 6.5, GOLD, { space: 1.3 }); y += 13;
          paras(a.background).forEach(p => text(p, { x: colX, w: colW, size: 9.2, color: MUTED, after: 6 }));
        }
      } else {
        const meaning = `${d.reversed ? `Reversed, this card points to ${c.reversed}. Its energy is blocked, delayed or turned inward. ` : ''}${c.meaning}`;
        text(meaning, { x: colX, w: colW, size: 10.5, after: 7 });
      }
      const k = CORR() && CORR().forCard(c.id);
      if (k) {
        const rows = [['Astrology', k.astrology], ['Element', k.element], ['Hebrew letter', k.hebrew], ['Kabbalah', k.kabbalah], ['Golden Dawn title', k.title], ['Tetragrammaton', k.letter], ['Numerology', k.numerology]].filter(r => r[1]);
        font('times', 'normal', 8.8);
        const tableH = rows.reduce((h, r) => h + doc.splitTextToSize(cap(clean(r[1])), colW - 92).length * 11.5 + 2.5, 0);
        y += 3; ensure(tableH + 14); rule(colX, y, colX + colW, LINE, 0.5); y += 9;
        rows.forEach(([label, val]) => {
          font('times', 'normal', 8.8); const lines = doc.splitTextToSize(cap(clean(val)), colW - 92);
          ensure(lines.length * 11.5 + 2);
          tracked(label, colX, y + 7.5, 5.8, MUTED, { space: 0.8 });
          font('times', 'normal', 8.8); color(INK); lines.forEach((ln, j) => doc.text(ln, colX + 92, y + 8 + j * 11.5));
          y += lines.length * 11.5 + 2.5;
        });
      }
      if (doc.getNumberOfPages() === startPage) y = Math.max(y, startY + thumbH);
      y += 14;
      if (i < cards.length - 1) { ensure(10); ornament(PW / 2, y, 40); y += 22; }
    });

    // ===== Story, advice, questions =====
    if (ai) {
      if (ai.story) {
        if (y > PH * 0.55) newPage(); else sectionGap(16);
        eyebrow('A Story Told by Your Cards'); heading(ai.story_title || 'Your Story', 19);
        paras(ai.story).forEach(p => text(p, { size: 11.5, lead: 1.55, after: 9 }));
        if (ai.story_meaning) {
          y += 4; const top = y, pg = doc.getNumberOfPages();
          text(ai.story_meaning, { x: M + 16, w: CW - 16, size: 11, style: 'italic', color: INK, after: 2 });
          if (doc.getNumberOfPages() === pg) { doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]); doc.rect(M, top, 2.2, y - top, 'F'); }
          y += 10;
        }
      }
      if (Array.isArray(ai.advice) && ai.advice.length) {
        sectionGap(12); ensure(70); eyebrow('Try This Week'); rule(M, y, PW - M); y += 14;
        ai.advice.forEach(item => { ensure(28); const top = y; diamond(M + 4, top + 7, 2.6); text(item, { x: M + 16, w: CW - 16, size: 10.8, after: 7 }); });
      }
      if (Array.isArray(ai.reflection_questions) && ai.reflection_questions.length) {
        sectionGap(12); ensure(110); eyebrow('Questions to Sit With'); rule(M, y, PW - M); y += 14;
        ai.reflection_questions.forEach((q, n) => {
          ensure(80);
          font('times', 'bold', 11); color(GOLD); doc.text(`${n + 1}.`, M, y + 10);
          text(q, { x: M + 18, w: CW - 18, size: 11, style: 'italic', after: 6 });
          for (let l = 0; l < 3; l++) { y += 19; rule(M + 18, y, PW - M, LINE, 0.5); }
          y += 16;
        });
      }
      if (ai.closing) {
        sectionGap(8); ensure(60); ornament(PW / 2, y); y += 20;
        paras(ai.closing).forEach(p => text(p, { size: 11.5, style: 'italic', align: 'center', x: M + 30, w: CW - 60, after: 8 }));
      }
    } else {
      if (y > PH * 0.6) newPage(); else sectionGap(16);
      eyebrow('Notes & Reflections'); rule(M, y, PW - M); y += 6;
      while (y + 24 < BOTTOM - 20) { y += 24; rule(M, y, PW - M, LINE, 0.5); }
    }

    // ===== Running header / footer on interior pages =====
    const n = doc.getNumberOfPages();
    for (let p = 2; p <= n; p++) {
      doc.setPage(p);
      tracked('Zephyr Observatory · Tarot', M, 46, 6.5, GOLD, { space: 1.5 });
      font('times', 'italic', 9); color(MUTED); doc.text(date, PW - M, 46, { align: 'right' });
      rule(M, 54, PW - M);
      rule(M, PH - 44, PW - M);
      font('helvetica', 'normal', 6.8); color(MUTED);
      doc.text('Tarot is a tool for reflection, not prediction or professional advice.  ·  zephyr.guru/tarot', M, PH - 32);
      doc.text(`${p - 1} / ${n - 1}`, PW - M, PH - 32, { align: 'right' });
    }
    doc.setProperties({ title: `${title} · Zephyr Tarot`, subject: state.question || 'Tarot reading', author: 'Zephyr Observatory', creator: 'zephyr.guru' });
    return doc;
  }

  async function download(state) {
    const doc = await build(state);
    const d = new Date(), stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    doc.save(`zephyr-tarot-${stamp}.pdf`);
    return doc;
  }

  global.ZephyrTarotPDF = { build, download };
})(window);
