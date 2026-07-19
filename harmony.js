(() => {
  'use strict';

  const YEAR = 365.2422;
  const ROOT_HZ = 261.625565; // C4
  const NOTE_NAMES = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const SIGNS = [
    ['Capricorn', 1, 1], ['Aquarius', 1, 20], ['Pisces', 2, 19], ['Aries', 3, 21],
    ['Taurus', 4, 20], ['Gemini', 5, 21], ['Cancer', 6, 21], ['Leo', 7, 23],
    ['Virgo', 8, 23], ['Libra', 9, 23], ['Scorpio', 10, 23], ['Sagittarius', 11, 22], ['Capricorn', 12, 22]
  ];
  const SIGN_ORDER = ['Capricorn','Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius'];
  const SIGN_META = {
    Capricorn:{element:'earth', dates:'Dec 22 – Jan 19'},
    Aquarius:{element:'air', dates:'Jan 20 – Feb 18'},
    Pisces:{element:'water', dates:'Feb 19 – Mar 20'},
    Aries:{element:'fire', dates:'Mar 21 – Apr 19'},
    Taurus:{element:'earth', dates:'Apr 20 – May 20'},
    Gemini:{element:'air', dates:'May 21 – Jun 20'},
    Cancer:{element:'water', dates:'Jun 21 – Jul 22'},
    Leo:{element:'fire', dates:'Jul 23 – Aug 22'},
    Virgo:{element:'earth', dates:'Aug 23 – Sep 22'},
    Libra:{element:'air', dates:'Sep 23 – Oct 22'},
    Scorpio:{element:'water', dates:'Oct 23 – Nov 21'},
    Sagittarius:{element:'fire', dates:'Nov 22 – Dec 21'}
  };

  // Original engraved line icons. These are SVG paths, not font or emoji glyphs.
  // Each icon is drawn in a compact 48×48 local coordinate system.
  const SIGN_PATHS = {
    Aries:[['M8 29 C8 13 17 8 24 19 C31 8 40 13 40 29',1],['M24 19 L24 41',1]],
    Taurus:[['M12 10 C14 19 19 22 24 22 C29 22 34 19 36 10',1],['M14 31 C14 22 34 22 34 31 C34 40 14 40 14 31 Z',1]],
    Gemini:[['M13 9 C20 12 28 12 35 9',1],['M13 39 C20 36 28 36 35 39',1],['M17 11 L17 37',1],['M31 11 L31 37',1]],
    Cancer:[['M9 18 C16 8 30 9 36 17',1],['M36 30 C29 40 15 39 9 31',1],['M14 17 A4 4 0 1 0 14.1 17',1],['M34 31 A4 4 0 1 0 34.1 31',1]],
    Leo:[['M15 31 C7 26 11 16 18 17 C26 18 24 29 20 32',1],['M20 32 C28 40 40 35 37 24 C35 17 29 18 28 24',1]],
    Virgo:[['M8 10 L8 39',1],['M8 18 C12 10 17 11 17 19 L17 39',1],['M17 18 C21 10 26 11 26 19 L26 39',1],['M26 18 C31 10 35 13 35 22 C35 31 30 36 24 39',1],['M29 29 L39 39',1]],
    Libra:[['M9 36 L39 36',1],['M9 28 L16 28 C16 18 32 18 32 28 L39 28',1]],
    Scorpio:[['M8 10 L8 38',1],['M8 18 C12 10 17 11 17 19 L17 38',1],['M17 18 C21 10 26 11 26 19 L26 38',1],['M26 18 C31 10 35 13 35 22 L35 37',1],['M35 37 L41 31',1],['M35 37 L29 32',1]],
    Sagittarius:[['M11 37 L37 11',1],['M23 11 L37 11 L37 25',1],['M13 22 L26 35',1]],
    Capricorn:[['M8 12 L8 37',1],['M8 20 C13 10 19 11 19 21 L19 36',1],['M19 22 C25 12 33 17 32 26 C31 34 23 35 22 29',1],['M22 29 C25 43 42 39 39 27',1]],
    Aquarius:[['M8 18 L14 13 L20 18 L26 13 L32 18 L38 13',1],['M8 31 L14 26 L20 31 L26 26 L32 31 L38 26',1]],
    Pisces:[['M13 9 C22 14 22 34 13 39',1],['M35 9 C26 14 26 34 35 39',1],['M12 24 L36 24',1]]
  };

  function drawSignIcon(NS, parent, name, x, y, size, opacity) {
    const g=document.createElementNS(NS,'g');
    g.setAttribute('transform',`translate(${x-size/2} ${y-size/2}) scale(${size/48})`);
    g.setAttribute('opacity',opacity);
    g.setAttribute('fill','none');
    g.setAttribute('stroke','url(#goldGrad)');
    g.setAttribute('stroke-width','2.15');
    g.setAttribute('stroke-linecap','round');
    g.setAttribute('stroke-linejoin','round');
    g.setAttribute('filter','url(#goldGlow)');
    (SIGN_PATHS[name]||[]).forEach(([d])=>{ const p=document.createElementNS(NS,'path'); p.setAttribute('d',d); g.appendChild(p); });
    parent.appendChild(g);
  }

  const ELEMENT_COLORS = {
    fire:'rgba(255,151,77,.20)', earth:'rgba(96,204,138,.18)',
    air:'rgba(91,190,255,.18)', water:'rgba(157,112,255,.20)'
  };
  const DEFAULTS = [
    {name:'May 15', date:'1976-05-15', role:'root'},
    {name:'April 27', date:'1980-04-27', role:'member'},
    {name:'April 7', date:'2000-04-07', role:'member'},
    {name:'October 12', date:'2002-10-12', role:'member'},
    {name:'October 24', date:'2004-10-24', role:'member'}
  ];

  const state = { people: [], mode: 'continuous', astroOpacity: .82, layers: {stars:true,zodiac:true,months:true,elements:true,notes:true,aspects:true} };
  let audioCtx = null;
  let activeVoice = null;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const wheel = $('#wheel');
  const list = $('#peopleList');
  const tpl = $('#personTemplate');

  function monthDayToOrdinal(dateStr) {
    if (!dateStr) return 1;
    const [,m,d] = dateStr.split('-').map(Number);
    const fixed = new Date(Date.UTC(2025, m - 1, d));
    const start = new Date(Date.UTC(2025, 0, 1));
    return Math.floor((fixed - start) / 86400000) + 1;
  }

  function dateLabel(dateStr) {
    if (!dateStr) return 'Unknown';
    const [,m,d] = dateStr.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', {month:'long', day:'numeric', timeZone:'UTC'}).format(new Date(Date.UTC(2025,m-1,d)));
  }

  function zodiac(dateStr) {
    const [,m,d] = dateStr.split('-').map(Number);
    let result = 'Capricorn';
    for (const [name, sm, sd] of SIGNS) {
      if (m > sm || (m === sm && d >= sd)) result = name;
    }
    return result;
  }

  function signedDayDiff(fromOrdinal, toOrdinal) {
    let d = toOrdinal - fromOrdinal;
    if (d > YEAR / 2) d -= YEAR;
    if (d < -YEAR / 2) d += YEAR;
    return d;
  }

  function rootPerson() { return state.people.find(p => p.role === 'root') || state.people[0]; }

  function enrich() {
    const root = rootPerson();
    const rootOrd = monthDayToOrdinal(root.date);
    return state.people.map((p, i) => {
      const ord = monthDayToOrdinal(p.date);
      const dayDiff = signedDayDiff(rootOrd, ord);
      const exactCents = dayDiff / YEAR * 1200;
      const displayCents = state.mode === 'snap' ? Math.round(exactCents / 100) * 100 : exactCents;
      const semitone = Math.round(displayCents / 100);
      const noteIndex = ((semitone % 12) + 12) % 12;
      const octave = 4 + Math.floor((semitone + 0) / 12);
      const freq = ROOT_HZ * Math.pow(2, displayCents / 1200);
      const deviation = exactCents - Math.round(exactCents/100)*100;
      return {...p, i, ord, dayDiff, exactCents, displayCents, note: NOTE_NAMES[noteIndex], octave, freq, deviation, sign:zodiac(p.date)};
    });
  }

  function intervalName(absCents) {
    const pc = Math.round(absCents / 100) % 12;
    return ['unison','minor 2nd','major 2nd','minor 3rd','major 3rd','perfect 4th','tritone','perfect 5th','minor 6th','major 6th','minor 7th','major 7th'][pc];
  }

  function consonance(absCents) {
    const pc = Math.round(absCents / 100) % 12;
    const scores = [1,.18,.45,.72,.86,.9,.12,.96,.66,.82,.52,.35];
    return scores[pc];
  }

  function init() {
    const saved = localStorage.getItem('harmonyOfYear');
    try { state.people = saved ? JSON.parse(saved).people : structuredClone(DEFAULTS); }
    catch { state.people = structuredClone(DEFAULTS); }
    if (!Array.isArray(state.people) || !state.people.length) state.people = structuredClone(DEFAULTS);
    renderPeople();
    bind();
    update();
  }

  function renderPeople() {
    list.innerHTML = '';
    state.people.forEach((p, idx) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.index = idx;
      node.querySelector('.person-index').textContent = idx + 1;
      node.querySelector('.person-name').value = p.name;
      node.querySelector('.person-date').value = p.date;
      node.querySelector('.person-role').value = p.role;
      node.querySelector('.remove-person').disabled = state.people.length <= 1;
      list.appendChild(node);
    });
  }

  function bind() {
    list.addEventListener('input', e => {
      const card = e.target.closest('.person-card'); if (!card) return;
      const i = Number(card.dataset.index);
      if (e.target.classList.contains('person-name')) state.people[i].name = e.target.value || `Person ${i+1}`;
      if (e.target.classList.contains('person-date')) state.people[i].date = e.target.value;
      if (e.target.classList.contains('person-role')) {
        if (e.target.value === 'root') state.people.forEach((p,j) => p.role = j === i ? 'root' : 'member');
        else if (state.people[i].role === 'root') state.people[0].role = 'root';
        renderPeople();
      }
      update();
    });
    list.addEventListener('click', e => {
      if (!e.target.classList.contains('remove-person')) return;
      const i = Number(e.target.closest('.person-card').dataset.index);
      const wasRoot = state.people[i].role === 'root';
      state.people.splice(i,1);
      if (wasRoot && state.people[0]) state.people[0].role = 'root';
      renderPeople(); update();
    });
    $('#addPersonBtn').addEventListener('click', () => {
      if (state.people.length >= 12) return toast('Maximum 12 people in this prototype.');
      state.people.push({name:`Person ${state.people.length+1}`, date:'1990-01-01', role:'member'});
      renderPeople(); update();
    });
    $('#resetBtn').addEventListener('click', () => { state.people = structuredClone(DEFAULTS); state.mode='continuous'; $('#titleInput').value='Family Chord'; renderPeople(); syncSegments(); update(); });
    $('#saveBtn').addEventListener('click', () => { localStorage.setItem('harmonyOfYear', JSON.stringify({people:state.people,title:$('#titleInput').value})); toast('Saved in this browser.'); });
    $('#shareBtn').addEventListener('click', copySummary);
    const playBtn = $('#playBtn');
    const startHeldChord = e => {
      e.preventDefault();
      if (playBtn.setPointerCapture && e.pointerId != null) {
        try { playBtn.setPointerCapture(e.pointerId); } catch {}
      }
      startChord();
    };
    const stopHeldChord = e => {
      if (e) e.preventDefault();
      stopChord();
    };
    playBtn.addEventListener('pointerdown', startHeldChord);
    playBtn.addEventListener('pointerup', stopHeldChord);
    playBtn.addEventListener('pointercancel', stopHeldChord);
    playBtn.addEventListener('lostpointercapture', stopHeldChord);
    playBtn.addEventListener('keydown', e => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) startHeldChord(e);
    });
    playBtn.addEventListener('keyup', e => {
      if (e.key === ' ' || e.key === 'Enter') stopHeldChord(e);
    });
    window.addEventListener('blur', stopChord);
    $('#titleInput').addEventListener('input', update);
    $$('.segment').forEach(btn => btn.addEventListener('click', () => { state.mode=btn.dataset.mode; syncSegments(); update(); }));
    $$('[data-layer]').forEach(input => input.addEventListener('change', () => {
      state.layers[input.dataset.layer] = input.checked;
      update();
    }));
    const opacity = $('#astroOpacity');
    if (opacity) opacity.addEventListener('input', () => {
      state.astroOpacity = Number(opacity.value) / 100;
      $('#astroOpacityValue').textContent = `${opacity.value}%`;
      update();
    });
  }

  function syncSegments() { $$('.segment').forEach(b => b.classList.toggle('active', b.dataset.mode === state.mode)); }

  function update() {
    if (!state.people.some(p => p.role === 'root')) state.people[0].role = 'root';
    const data = enrich();
    $('#groupTitle').textContent = $('#titleInput').value || 'Untitled Chord';
    const root = data.find(p => p.role === 'root') || data[0];
    $('#rootDateLabel').textContent = dateLabel(root.date);
    $('#rootNoteLabel').textContent = `C4 · ${ROOT_HZ.toFixed(2)} Hz`;

    data.forEach((p,i) => {
      const card = list.children[i]; if (!card) return;
      card.querySelector('.person-note').textContent = state.mode === 'snap' ? `${p.note}${p.octave}` : `${p.note}${p.deviation >= 0 ? '+' : ''}${p.deviation.toFixed(0)}¢`;
      card.querySelector('.person-sign').textContent = `${p.sign} · ${dateLabel(p.date)}`;
      card.querySelector('.person-interval').textContent = p.role === 'root' ? 'Tonic / root' : `${p.dayDiff >= 0 ? '+' : ''}${p.dayDiff.toFixed(0)} days · ${p.exactCents >= 0 ? '+' : ''}${p.exactCents.toFixed(0)} cents`;
    });
    drawWheel(data);
    renderAnalysis(data);
  }

  function polar(cx, cy, r, deg) { const a=(deg-90)*Math.PI/180; return [cx+r*Math.cos(a), cy+r*Math.sin(a)]; }
  function arcPath(cx, cy, r1, r2, a0, a1) {
    const [x1,y1]=polar(cx,cy,r2,a0), [x2,y2]=polar(cx,cy,r2,a1), [x3,y3]=polar(cx,cy,r1,a1), [x4,y4]=polar(cx,cy,r1,a0);
    const large = a1-a0 > 180 ? 1 : 0;
    return `M${x1},${y1} A${r2},${r2} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 ${large} 0 ${x4},${y4} Z`;
  }

  function layerOn(name) { return state.layers[name] !== false; }

  function drawWheel(data) {
    const NS='http://www.w3.org/2000/svg'; wheel.innerHTML='';
    const defs=document.createElementNS(NS,'defs'); defs.innerHTML=`
      <radialGradient id="bgGrad"><stop offset="0" stop-color="#172044"/><stop offset=".56" stop-color="#0b1430"/><stop offset="1" stop-color="#050814"/></radialGradient>
      <radialGradient id="astroGlow"><stop offset="0" stop-color="#17295f" stop-opacity=".62"/><stop offset="1" stop-color="#050814" stop-opacity="0"/></radialGradient>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a7"/><stop offset=".38" stop-color="#e6b85d"/><stop offset="1" stop-color="#9c6422"/></linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="goldGlow"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    wheel.appendChild(defs);

    const bg=document.createElementNS(NS,'circle');
    bg.setAttribute('cx',380); bg.setAttribute('cy',380); bg.setAttribute('r',350);
    bg.setAttribute('fill','url(#bgGrad)'); bg.setAttribute('stroke','rgba(241,194,98,.62)'); bg.setAttribute('stroke-width','2');
    wheel.appendChild(bg);

    const aura=document.createElementNS(NS,'circle');
    aura.setAttribute('cx',380); aura.setAttribute('cy',380); aura.setAttribute('r',300); aura.setAttribute('fill','url(#astroGlow)');
    wheel.appendChild(aura);

    // Antique-observatory crosshairs and central solar ornament.
    const ornament=document.createElementNS(NS,'g'); ornament.setAttribute('opacity',state.astroOpacity);
    [0,45,90,135].forEach(deg=>{
      const [x1,y1]=polar(380,380,74,deg), [x2,y2]=polar(380,380,344,deg);
      const line=document.createElementNS(NS,'line'); line.setAttribute('x1',x1);line.setAttribute('y1',y1);line.setAttribute('x2',x2);line.setAttribute('y2',y2);
      line.setAttribute('stroke','rgba(231,189,104,.12)'); line.setAttribute('stroke-dasharray','2 9'); ornament.appendChild(line);
    });
    const sun=document.createElementNS(NS,'circle');sun.setAttribute('cx',380);sun.setAttribute('cy',380);sun.setAttribute('r',10);sun.setAttribute('fill','url(#goldGrad)');sun.setAttribute('filter','url(#goldGlow)');ornament.appendChild(sun);
    wheel.appendChild(ornament);

    // Deterministic star field—pure SVG, so the wheel stays crisp at any size.
    if (layerOn('stars')) for(let i=0;i<118;i++){
      const a=((i*137.508)%360), r=72+((i*47)%270), [x,y]=polar(380,380,r,a);
      const star=document.createElementNS(NS,'circle');
      star.setAttribute('cx',x); star.setAttribute('cy',y); star.setAttribute('r',i%17===0?1.8:(i%5===0?1.15:.65));
      star.setAttribute('fill',i%7===0?'rgba(255,226,163,.86)':'rgba(205,225,255,.66)');
      wheel.appendChild(star);
    }

    const signRanges=[
      ['Capricorn',1,19],['Aquarius',20,49],['Pisces',50,79],['Aries',80,109],
      ['Taurus',110,140],['Gemini',141,171],['Cancer',172,204],['Leo',205,235],
      ['Virgo',236,266],['Libra',267,296],['Scorpio',297,326],['Sagittarius',327,355],['Capricorn',356,365.2422]
    ];

    signRanges.forEach(([name,startDay,endDay],idx)=>{
      const a0=(startDay-1)/YEAR*360, a1=endDay/YEAR*360;
      const meta=SIGN_META[name];
      const sector=document.createElementNS(NS,'path');
      sector.setAttribute('d',arcPath(380,380,270,349,a0,a1));
      sector.setAttribute('fill', layerOn('elements') ? ELEMENT_COLORS[meta.element] : 'rgba(18,25,49,.42)');
      sector.setAttribute('opacity', state.astroOpacity);
      sector.setAttribute('stroke','rgba(240,202,123,.32)'); sector.setAttribute('stroke-width','1');
      wheel.appendChild(sector);

      // Capricorn is split by New Year; label it once on the December portion.
      if(name==='Capricorn' && startDay===1) return;
      const mid=(a0+a1)/2;
      const [gx,gy]=polar(380,380,304,mid);
      drawSignIcon(NS, wheel, name, gx, gy, 42, layerOn('zodiac') ? state.astroOpacity : 0);

      const [nx,ny]=polar(380,380,334,mid);
      const nameText=document.createElementNS(NS,'text');
      nameText.setAttribute('x',nx); nameText.setAttribute('y',ny); nameText.setAttribute('fill','#f3d58f'); nameText.setAttribute('opacity', layerOn('zodiac') ? state.astroOpacity : 0);
      nameText.setAttribute('font-size','10.5'); nameText.setAttribute('font-weight','800'); nameText.setAttribute('letter-spacing','1.1');
      nameText.setAttribute('text-anchor','middle'); nameText.setAttribute('dominant-baseline','middle');
      nameText.textContent=name.toUpperCase(); wheel.appendChild(nameText);

      const [dx,dy]=polar(380,380,319,mid);
      const dates=document.createElementNS(NS,'text');
      dates.setAttribute('x',dx); dates.setAttribute('y',dy); dates.setAttribute('fill','rgba(230,218,190,.72)'); dates.setAttribute('opacity', layerOn('zodiac') ? state.astroOpacity : 0);
      dates.setAttribute('font-size','7.5'); dates.setAttribute('text-anchor','middle'); dates.setAttribute('dominant-baseline','middle');
      dates.textContent=meta.dates.replace(' – ','–'); wheel.appendChild(dates);
    });

    // Month ticks make the zodiac sit visibly behind the exact calendar positions.
    const monthStarts=[1,32,60,91,121,152,182,213,244,274,305,335];
    const monthNames=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    monthStarts.forEach((day,i)=>{
      const deg=(day-1)/YEAR*360;
      const [x1,y1]=polar(380,380,349,deg), [x2,y2]=polar(380,380,357,deg);
      const tick=document.createElementNS(NS,'line'); tick.setAttribute('x1',x1);tick.setAttribute('y1',y1);tick.setAttribute('x2',x2);tick.setAttribute('y2',y2);tick.setAttribute('stroke','#e7bd68');tick.setAttribute('stroke-width','1.5');tick.setAttribute('opacity',layerOn('months')?state.astroOpacity:0);wheel.appendChild(tick);
      const next=monthStarts[(i+1)%12] + (i===11?365:0); const midDay=(day+next)/2; const midDeg=((midDay-1)%YEAR)/YEAR*360;
      const [mx,my]=polar(380,380,363,midDeg); const mt=document.createElementNS(NS,'text');
      mt.setAttribute('x',mx);mt.setAttribute('y',my);mt.setAttribute('fill','rgba(244,210,139,.82)');mt.setAttribute('opacity',layerOn('months')?state.astroOpacity:0);mt.setAttribute('font-size','8');mt.setAttribute('font-weight','800');mt.setAttribute('text-anchor','middle');mt.setAttribute('dominant-baseline','middle');mt.textContent=monthNames[i];wheel.appendChild(mt);
    });

    // Chromatic note ring.
    for(let i=0;i<12;i++){
      const [x1,y1]=polar(380,380,220,i*30), [x2,y2]=polar(380,380,270,i*30);
      const l=document.createElementNS(NS,'line'); l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('stroke','rgba(174,207,255,.16)');l.setAttribute('opacity',layerOn('notes')?1:0);wheel.appendChild(l);
      const [nx,ny]=polar(380,380,245,i*30+15); const n=document.createElementNS(NS,'text');
      n.setAttribute('x',nx);n.setAttribute('y',ny);n.setAttribute('fill','#eef2ff');n.setAttribute('opacity',layerOn('notes')?1:0);n.setAttribute('font-size','17');n.setAttribute('font-family','Georgia, Times New Roman, serif');n.setAttribute('font-weight','700');n.setAttribute('text-anchor','middle');n.setAttribute('dominant-baseline','middle');n.textContent=NOTE_NAMES[i];wheel.appendChild(n);
    }
    [220,270,349].forEach((r,i)=>{const c=document.createElementNS(NS,'circle');c.setAttribute('cx',380);c.setAttribute('cy',380);c.setAttribute('r',r);c.setAttribute('fill','none');c.setAttribute('stroke',i===2?'rgba(238,193,101,.64)':'rgba(170,207,255,.18)');c.setAttribute('stroke-width',i===2?'2':'1');wheel.appendChild(c);});

    const root=data.find(p=>p.role==='root')||data[0];
    if (layerOn('aspects')) data.filter(p=>p!==root).forEach(p=>{
      const deg=((p.ord-1)/YEAR*360), rdeg=((root.ord-1)/YEAR*360);
      const [x1,y1]=polar(380,380,195,rdeg), [x2,y2]=polar(380,380,195,deg);
      const line=document.createElementNS(NS,'line'); line.setAttribute('x1',x1);line.setAttribute('y1',y1);line.setAttribute('x2',x2);line.setAttribute('y2',y2);
      const con=consonance(Math.abs(p.exactCents)); line.setAttribute('stroke',con>.7?'rgba(101,224,178,.68)':'rgba(255,111,145,.62)');line.setAttribute('stroke-width',Math.max(1.5,con*4));wheel.appendChild(line);
    });

    data.forEach(p=>{
      const deg=((p.ord-1)/YEAR*360), [x,y]=polar(380,380,195,deg);
      const g=document.createElementNS(NS,'g');g.setAttribute('filter','url(#glow)');
      const c=document.createElementNS(NS,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',p.role==='root'?12:9);c.setAttribute('fill',p.role==='root'?'#ffd36f':'#8f7cff');c.setAttribute('stroke','#fff');c.setAttribute('stroke-width','2');g.appendChild(c);
      const t=document.createElementNS(NS,'text');t.setAttribute('x',x);t.setAttribute('y',y-17);t.setAttribute('fill','#fff');t.setAttribute('font-size','12');t.setAttribute('font-weight','900');t.setAttribute('text-anchor','middle');t.textContent=p.name;g.appendChild(t);
      wheel.appendChild(g);
    });
  }

  function renderAnalysis(data) {
    const pcs=[...new Set(data.map(p=>((Math.round(p.exactCents/100)%12)+12)%12))].sort((a,b)=>a-b);
    const chord=detectChord(pcs);
    $('#chordName').textContent=chord.name;
    $('#qualityBadge').textContent=chord.quality;
    $('#analysisLead').textContent=chord.description;
    const cents=data.map(p=>p.exactCents).sort((a,b)=>a-b);
    $('#spreadMetric').textContent=`${Math.round(cents.at(-1)-cents[0])}¢`;
    let closest={d:Infinity,a:null,b:null};
    for(let i=0;i<data.length;i++) for(let j=i+1;j<data.length;j++){const d=Math.abs(data[i].exactCents-data[j].exactCents);if(d<closest.d)closest={d,a:data[i],b:data[j]};}
    $('#closestMetric').textContent=closest.a?`${closest.d.toFixed(0)}¢`:'—';
    const avg=data.filter(p=>p.role!=='root').reduce((s,p)=>s+(1-consonance(Math.abs(p.exactCents))),0)/Math.max(1,data.length-1);
    $('#tensionMetric').textContent=avg<.3?'Low':avg<.55?'Moderate':'High';

    const root=data.find(p=>p.role==='root')||data[0];
    $('#intervalTable').innerHTML=`<table><thead><tr><th>Person</th><th>Date</th><th>Sign</th><th>Solar interval</th><th>Nearest note</th><th>Frequency</th></tr></thead><tbody>${data.map(p=>`<tr><td><strong>${escapeHtml(p.name)}</strong>${p.role==='root'?' · Root':''}</td><td>${dateLabel(p.date)}</td><td>${p.sign}</td><td>${p.role==='root'?'Unison':intervalName(Math.abs(p.exactCents))} · ${p.exactCents>=0?'+':''}${p.exactCents.toFixed(1)}¢</td><td>${p.note}${p.octave} (${p.deviation>=0?'+':''}${p.deviation.toFixed(1)}¢)</td><td>${p.freq.toFixed(2)} Hz</td></tr>`).join('')}</tbody></table>`;
  }

  function detectChord(pcs) {
    const key=pcs.join(',');
    const known={
      '0,4,7':['C major','Consonant','A clear major triad: stable, bright, and strongly resolved.'],
      '0,3,7':['C minor','Consonant','A minor triad: cohesive, inward, and emotionally weighted.'],
      '0,5,7':['Csus4','Suspended','A suspended chord: supportive and spacious, but intentionally unresolved.'],
      '0,2,7':['Csus2','Open','An open suspended chord: curious, airy, and collaborative.'],
      '0,4,7,10':['C7','Dynamic','A dominant seventh: charismatic, energetic, and always pressing toward motion.'],
      '0,4,7,11':['Cmaj7','Luminous','A major seventh: elegant, intimate, and richly layered.'],
      '0,3,6':['C diminished','Tense','A diminished structure: compact, catalytic, and highly transformative.'],
      '0,6':['C tritone','Tense','A tritone polarity: maximum contrast, challenge, and potential breakthrough.'],
      '0,5':['C–F suspension','Suspended','A tonic-and-fourth relationship: protective, rooted, and unresolved.'],
      '0,11':['C with leading tone','Charged','The root and leading tone sit almost together, creating familiarity with constant forward pull.'],
      '0,5,11':['Cmaj7(add4)','Complex','A dense suspended-major-seven color: grounded at the center, protective at the fourth, and sharpened by a leading-tone tension.']
    };
    const found=known[key];
    if(found)return{name:found[0],quality:found[1],description:found[2]};
    if(pcs.length<=2)return{name:'Solar interval',quality:'Focused',description:'This group behaves more like a strong interval than a full chord. Its character comes from reinforcement or contrast between two tonal centers.'};
    return{name:'Solar cluster',quality:'Complex',description:'This is not a conventional major or minor chord. The dates form a colored cluster with both reinforcement and tension—closer to cinematic or modern harmony than a simple triad.'};
  }

  async function startChord() {
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtx)return toast('Web Audio is not supported in this browser.');
    if (activeVoice) return;

    audioCtx ||= new AudioCtx();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    const now=audioCtx.currentTime;
    const master=audioCtx.createGain();
    const compressor=audioCtx.createDynamicsCompressor();
    const warmth=audioCtx.createBiquadFilter();

    // Bell-friendly output chain: louder, bright enough for phone speakers,
    // but limited so overlapping partials do not clip harshly.
    warmth.type='highshelf';
    warmth.frequency.setValueAtTime(1700,now);
    warmth.gain.setValueAtTime(4.5,now);
    compressor.threshold.setValueAtTime(-8,now);
    compressor.knee.setValueAtTime(7,now);
    compressor.ratio.setValueAtTime(7,now);
    compressor.attack.setValueAtTime(.004,now);
    compressor.release.setValueAtTime(.32,now);

    master.gain.setValueAtTime(.0001,now);
    master.gain.exponentialRampToValueAtTime(1.38,now+.055);
    master.connect(warmth);
    warmth.connect(compressor);
    compressor.connect(audioCtx.destination);

    const sources=[];
    const gains=[];
    const people=enrich();
    const noteDelay=.115; // each bell enters separately so the harmony blooms
    const voiceLevel=1.55/Math.max(1.7,Math.sqrt(people.length));

    people.forEach((p,i)=>{
      const strike=now+i*noteDelay;

      // Inharmonic partials create a bell rather than an organ/synth tone.
      // The fundamental is held quietly while brighter overtones decay away.
      const partials=[
        {ratio:1.000, level:.78, decay:7.2, type:'sine'},
        {ratio:2.010, level:.34, decay:4.8, type:'sine'},
        {ratio:2.710, level:.22, decay:3.3, type:'sine'},
        {ratio:4.060, level:.13, decay:2.35, type:'sine'},
        {ratio:5.430, level:.075,decay:1.65, type:'sine'}
      ];

      partials.forEach((part,pi)=>{
        const osc=audioCtx.createOscillator();
        const gain=audioCtx.createGain();
        const freq=Math.min(12000,p.freq*part.ratio);
        osc.type=part.type;
        osc.frequency.setValueAtTime(freq,strike);

        const peak=Math.max(.0002,voiceLevel*part.level);
        const sustain=pi===0 ? peak*.17 : .00012;
        gain.gain.setValueAtTime(.0001,strike);
        gain.gain.exponentialRampToValueAtTime(peak,strike+.012);
        gain.gain.exponentialRampToValueAtTime(Math.max(.0001,sustain),strike+part.decay);

        osc.connect(gain);
        gain.connect(master);
        osc.start(strike);
        sources.push(osc);
        gains.push(gain);
      });
    });

    activeVoice={master,warmth,compressor,sources,gains};
    $('#playBtn').classList.add('playing');
    $('#playBtn').textContent='■ Release bells';
  }

  function stopChord() {
    if (!activeVoice || !audioCtx) return;
    const voice=activeVoice;
    activeVoice=null;
    const now=audioCtx.currentTime;

    // Let the bells ring naturally after release, then guarantee silence.
    const tail=2.8;
    try {
      voice.gains.forEach(gain=>{
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(Math.max(.0001,gain.gain.value),now);
        gain.gain.exponentialRampToValueAtTime(.0001,now+tail);
      });
      voice.master.gain.cancelScheduledValues(now);
      voice.master.gain.setValueAtTime(Math.max(.0001,voice.master.gain.value),now);
      voice.master.gain.exponentialRampToValueAtTime(.0001,now+tail+.15);
      voice.sources.forEach(src=>src.stop(now+tail+.22));
    } catch {}

    setTimeout(()=>{
      try {
        voice.sources.forEach(src=>src.disconnect());
        voice.gains.forEach(g=>g.disconnect());
        voice.master.disconnect();
        voice.warmth.disconnect();
        voice.compressor.disconnect();
      } catch {}
    },Math.ceil((tail+.35)*1000));

    const btn=$('#playBtn');
    btn.classList.remove('playing');
    btn.textContent='▶ Hold to ring';
  }

  async function copySummary() {
    const data=enrich(); const root=data.find(p=>p.role==='root')||data[0];
    const text=`${$('#titleInput').value || 'Harmony chord'}\nRoot: ${root.name} — ${dateLabel(root.date)} (C4)\n`+data.map(p=>`${p.name}: ${dateLabel(p.date)}, ${p.sign}, ${p.exactCents>=0?'+':''}${p.exactCents.toFixed(1)} cents, ${p.note}${p.octave}`).join('\n');
    try{await navigator.clipboard.writeText(text);toast('Summary copied.');}catch{toast('Could not copy automatically.');}
  }
  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function toast(msg){const d=document.createElement('div');d.className='toast';d.textContent=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),2200);}
  init();
})();
