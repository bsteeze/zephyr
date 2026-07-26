(() => {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const ENGINE = window.ZephyrNatalEngine;
  const chart = $('#natalChart');
  if (!ENGINE || !chart) return;

  const PLANETS = {
    sun:{symbol:'☉',label:'Sun',role:'Core identity'},
    moon:{symbol:'☽',label:'Moon',role:'Emotional nature'},
    mercury:{symbol:'☿',label:'Mercury',role:'Mind and communication'},
    venus:{symbol:'♀',label:'Venus',role:'Love and values'},
    mars:{symbol:'♂',label:'Mars',role:'Drive and desire'},
    jupiter:{symbol:'♃',label:'Jupiter',role:'Growth and meaning'},
    saturn:{symbol:'♄',label:'Saturn',role:'Structure and mastery'},
    uranus:{symbol:'♅',label:'Uranus',role:'Freedom and disruption'},
    neptune:{symbol:'♆',label:'Neptune',role:'Imagination and ideals'},
    pluto:{symbol:'♇',label:'Pluto',role:'Power and transformation'}
  };
  const SIGNS = [
    {key:'aries',label:'Aries',symbol:'♈︎',element:'Fire'},
    {key:'taurus',label:'Taurus',symbol:'♉︎',element:'Earth'},
    {key:'gemini',label:'Gemini',symbol:'♊︎',element:'Air'},
    {key:'cancer',label:'Cancer',symbol:'♋︎',element:'Water'},
    {key:'leo',label:'Leo',symbol:'♌︎',element:'Fire'},
    {key:'virgo',label:'Virgo',symbol:'♍︎',element:'Earth'},
    {key:'libra',label:'Libra',symbol:'♎︎',element:'Air'},
    {key:'scorpio',label:'Scorpio',symbol:'♏︎',element:'Water'},
    {key:'sagittarius',label:'Sagittarius',symbol:'♐︎',element:'Fire'},
    {key:'capricorn',label:'Capricorn',symbol:'♑︎',element:'Earth'},
    {key:'aquarius',label:'Aquarius',symbol:'♒︎',element:'Air'},
    {key:'pisces',label:'Pisces',symbol:'♓︎',element:'Water'}
  ];
  const SIGN_COLORS = ['#c86553','#b68a52','#c1a84e','#6fa7b5','#d18d48','#76a37e','#82a9c5','#7962a8','#a96855','#5d927d','#4f89aa','#7262af'];
  const SIGN_TONE = {
    aries:'direct, initiating, and energized',
    taurus:'steady, sensory, and determined',
    gemini:'curious, adaptive, and conversational',
    cancer:'protective, intuitive, and emotionally responsive',
    leo:'expressive, generous, and creatively centered',
    virgo:'observant, practical, and improvement-minded',
    libra:'relational, aesthetic, and balance-seeking',
    scorpio:'intense, private, and transformative',
    sagittarius:'exploratory, candid, and meaning-driven',
    capricorn:'structured, responsible, and long-range',
    aquarius:'independent, conceptual, and future-facing',
    pisces:'imaginative, permeable, and compassionate'
  };
  const HOUSE_THEMES = [
    'identity, presence, and beginnings','resources, values, and self-worth','learning, language, and immediate environment',
    'home, ancestry, and emotional foundations','creativity, pleasure, and self-expression','craft, service, health, and daily systems',
    'partnership, mirrors, and commitment','intimacy, shared resources, and transformation','belief, travel, and the search for meaning',
    'vocation, reputation, and public contribution','community, friendship, and future vision','rest, surrender, and the inner world'
  ];
  const SIGN_MODES = {aries:'Cardinal',taurus:'Fixed',gemini:'Mutable',cancer:'Cardinal',leo:'Fixed',virgo:'Mutable',libra:'Cardinal',scorpio:'Fixed',sagittarius:'Mutable',capricorn:'Cardinal',aquarius:'Fixed',pisces:'Mutable'};
  const SIGN_RULERS = {aries:'Mars',taurus:'Venus',gemini:'Mercury',cancer:'Moon',leo:'Sun',virgo:'Mercury',libra:'Venus',scorpio:'Pluto',sagittarius:'Jupiter',capricorn:'Saturn',aquarius:'Uranus',pisces:'Neptune'};
  const ELEMENT_ARCHETYPES = {Fire:'Catalyst',Earth:'Builder',Air:'Interpreter',Water:'Empath'};
  const MODE_ARCHETYPES = {Cardinal:'Initiator',Fixed:'Sustainer',Mutable:'Explorer'};
  const RULER_ARCHETYPES = {Sun:'Creator',Moon:'Guardian',Mercury:'Messenger',Venus:'Harmonizer',Mars:'Pioneer',Jupiter:'Teacher',Saturn:'Architect',Uranus:'Inventor',Neptune:'Dreamer',Pluto:'Transformer'};
  const state = {
    horoscope:null,
    layers:{aspects:true,houses:true,labels:false},
    profile:null,
    focus:'sun',
    focusActive:false,
    followReading:true,
    readingObserver:null,
    sectionObserver:null,
    dockObserver:null,
    chartExpanded:false
  };

  function norm(n) { return ((n%360)+360)%360; }
  function polar(cx,cy,r,deg) { const a=(deg-90)*Math.PI/180; return [cx+r*Math.cos(a),cy+r*Math.sin(a)]; }
  function ringPath(cx,cy,r1,r2,a0,a1) {
    const p1=polar(cx,cy,r2,a0),p2=polar(cx,cy,r2,a1),p3=polar(cx,cy,r1,a1),p4=polar(cx,cy,r1,a0);
    return `M${p1} A${r2},${r2} 0 0 1 ${p2} L${p3} A${r1},${r1} 0 0 0 ${p4} Z`;
  }
  function svg(name,attrs={}) { const el=document.createElementNS(NS,name); Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v)); return el; }
  function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function decimal(obj,path='Ecliptic') { return obj?.ChartPosition?.[path]?.DecimalDegrees ?? 0; }
  function signByKey(key){ return SIGNS.find(s=>s.key===key)||SIGNS[0]; }
  function degreesInSign(body){ return body?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30 || '—'; }

  function getProfile() {
    const date=$('#natalDate').value;
    const time=$('#natalTime').value;
    const [year,month,day]=(date||'').split('-').map(Number);
    const [hour,minute]=(time||'').split(':').map(Number);
    return {
      name:$('#natalName').value.trim()||'Unnamed chart',
      city:$('#natalCity').value.trim(),
      date,time,year,month:month-1,day,hour,minute,
      latitude:Number($('#natalLatitude').value),
      longitude:Number($('#natalLongitude').value),
      houseSystem:$('#natalHouseSystem').value,
      zodiac:$('#natalZodiac').value
    };
  }
  function validProfile(p) {
    if(!p.date) return 'Birth date is required.';
    if(!p.time || !Number.isFinite(p.hour)) return 'Exact local birth time is required for houses and the Ascendant.';
    if(!Number.isFinite(p.latitude)||p.latitude < -90||p.latitude > 90) return 'Enter a valid latitude between −90 and 90.';
    if(!Number.isFinite(p.longitude)||p.longitude < -180||p.longitude > 180) return 'Enter a valid longitude between −180 and 180.';
    return '';
  }
  function setStatus(kind,title,detail){
    const box=$('#natalStatus');box.className=`natal-status ${kind||''}`;
    box.querySelector('b').textContent=title;box.querySelector('small').textContent=detail;
  }

  function generate() {
    const p=getProfile(); const error=validProfile(p);
    if(error){setStatus('error','Details needed',error);return;}
    setStatus('working','Calculating','Resolving the sky, houses, and aspects…');
    try {
      const origin=new ENGINE.Origin({year:p.year,month:p.month,date:p.day,hour:p.hour,minute:p.minute,latitude:p.latitude,longitude:p.longitude});
      const horoscope=new ENGINE.Horoscope({
        origin,houseSystem:p.houseSystem,zodiac:p.zodiac,
        aspectPoints:['bodies','angles'],aspectWithPoints:['bodies','angles'],aspectTypes:['major'],
        customOrbs:{conjunction:8,opposition:8,trine:7,square:7,sextile:5},language:'en'
      });
      state.profile=p;state.horoscope=horoscope;
      $('#natalTimezone').textContent=`Resolved time zone: ${origin.timezone?.name||'local zone'} · UTC birth time ${origin.utcTimeFormatted||''}`;
      renderAll();
      updateProfileSummary();
      setStatus('','Chart complete',`${horoscope.SunSign?.label||'Natal'} chart · ${labelHouseSystem(p.houseSystem)} houses`);
      try{localStorage.setItem('zephyrNatalDraftV1',JSON.stringify(p));}catch{}
    } catch(err) {
      console.error(err);
      setStatus('error','Could not calculate',err?.message||'Check the birth details and try again.');
    }
  }

  function labelHouseSystem(v){return ({'whole-sign':'Whole Sign','equal-house':'Equal House',placidus:'Placidus',koch:'Koch',campanus:'Campanus',regiomontanus:'Regiomontanus',topocentric:'Topocentric'})[v]||v;}
  // Astrology wheels advance through the zodiac counterclockwise. Keep the
  // Ascendant fixed at the left-hand horizon (270° in this SVG coordinate
  // system) and reverse the screen angle as ecliptic longitude increases.
  function angleForLongitude(lon,asc){return norm(270-(lon-asc));}

  function renderAll(){
    renderChart();
    renderAngles();
    renderBigThree();
    renderGlance();
    renderReading();
    renderAspectList();
    renderHouseList();
    renderTable();
    renderFocus(state.focus || 'sun', false);
    setupReadingObserver();
    setupSectionObserver();
    setupChartDock();
  }

  function renderChart() {
    const h=state.horoscope,p=state.profile; chart.innerHTML='';
    const asc=decimal(h.Ascendant);
    const defs=svg('defs');
    defs.innerHTML='<radialGradient id="natalBg"><stop offset="0" stop-color="#172044"/><stop offset=".7" stop-color="#091329"/><stop offset="1" stop-color="#040813"/></radialGradient><filter id="natalGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    chart.appendChild(defs);
    chart.appendChild(svg('circle',{cx:400,cy:400,r:370,fill:'url(#natalBg)',stroke:'#d8ad58','stroke-width':2}));
    for(let i=0;i<12;i++){
      const a0=angleForLongitude((i+1)*30,asc),a1=a0+30;
      const sector=svg('path',{class:'natal-sign-sector','data-sign':SIGNS[i].key,d:ringPath(400,400,295,370,a0,a1),fill:SIGN_COLORS[i],opacity:.24,stroke:'rgba(236,199,120,.42)','stroke-width':1});
      chart.appendChild(sector);
      const mid=a0+15,[sx,sy]=polar(400,400,338,mid);
      const glyph=svg('text',{x:sx,y:sy-3,fill:'#f1cb77','font-size':25,'font-family':'Georgia,serif','text-anchor':'middle','dominant-baseline':'middle'});
      glyph.textContent=SIGNS[i].symbol;chart.appendChild(glyph);
      if(state.layers.labels){
        const name=svg('text',{x:sx,y:sy+18,fill:'rgba(242,214,154,.82)','font-size':8,'font-weight':900,'letter-spacing':1,'text-anchor':'middle'});
        name.textContent=SIGNS[i].label.toUpperCase();chart.appendChild(name);
      }
    }
    chart.appendChild(svg('circle',{cx:400,cy:400,r:295,fill:'none',stroke:'rgba(177,205,255,.24)'}));
    chart.appendChild(svg('circle',{cx:400,cy:400,r:235,fill:'none',stroke:'rgba(177,205,255,.18)'}));
    chart.appendChild(svg('circle',{cx:400,cy:400,r:125,fill:'rgba(4,8,19,.55)',stroke:'rgba(231,183,84,.35)'}));

    if(state.layers.houses) h.Houses.forEach((house,i)=>{
      const lon=house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
      const a=angleForLongitude(lon,asc),p1=polar(400,400,125,a),p2=polar(400,400,295,a);
      chart.appendChild(svg('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],class:'natal-house-line','data-house':i+1,stroke:i===0?'#4ed6ff':'rgba(183,209,255,.28)','stroke-width':i===0?2.5:1}));
      const next=h.Houses[(i+1)%12].ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
      let span=norm(next-lon);if(!span)span=30;
      const mid=angleForLongitude(lon+span/2,asc),hp=polar(400,400,274,mid);
      const ht=svg('text',{x:hp[0],y:hp[1],fill:'rgba(214,224,247,.74)','font-size':9,'font-weight':800,'text-anchor':'middle','dominant-baseline':'middle'});
      ht.textContent=String(i+1);chart.appendChild(ht);
    });

    const bodies=Object.keys(PLANETS).map(k=>h.CelestialBodies[k]).filter(Boolean);
    if(state.layers.aspects) h.Aspects.all.filter(a=>PLANETS[a.point1Key]&&PLANETS[a.point2Key]).forEach(a=>{
      const b1=h.CelestialBodies[a.point1Key],b2=h.CelestialBodies[a.point2Key];
      const p1=polar(400,400,205,angleForLongitude(decimal(b1),asc)),p2=polar(400,400,205,angleForLongitude(decimal(b2),asc));
      chart.appendChild(svg('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],class:`natal-aspect-line ${a.aspectKey}`,'data-planet-a':a.point1Key,'data-planet-b':a.point2Key,stroke:'rgba(120,160,220,.5)','stroke-width':Math.max(.7,2.2-(a.orb||0)/6)}));
    });

    const occupied=[];
    bodies.forEach((body,index)=>{
      const actual=angleForLongitude(decimal(body),asc);
      let radius=218;
      if(occupied.some(a=>Math.min(norm(actual-a),norm(a-actual))<7)) radius=index%2?190:242;
      occupied.push(actual);
      const anchor=polar(400,400,235,actual),pos=polar(400,400,radius,actual);
      chart.appendChild(svg('line',{x1:anchor[0],y1:anchor[1],x2:pos[0],y2:pos[1],stroke:'rgba(219,229,255,.3)','stroke-width':1}));
      const g=svg('g',{class:'natal-planet','data-planet':body.key,tabindex:0,role:'button','aria-label':`${body.label} in ${body.Sign.label}`});
      g.appendChild(svg('circle',{cx:pos[0],cy:pos[1],r:16,fill:'#111d39',stroke:'#e5bc68','stroke-width':1.4,filter:'url(#natalGlow)'}));
      const symbol=svg('text',{x:pos[0],y:pos[1]+1,fill:'#fff4cf','font-size':18,'text-anchor':'middle','dominant-baseline':'middle'});
      symbol.textContent=PLANETS[body.key]?.symbol||'•';g.appendChild(symbol);
      if(state.layers.labels){
        const label=svg('text',{x:pos[0],y:pos[1]-23,fill:'#f5f7ff','font-size':9,'font-weight':800,'text-anchor':'middle'});
        label.textContent=body.label;g.appendChild(label);
      }
      g.addEventListener('click',()=>focusPlanet(body.key));
      g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();focusPlanet(body.key);}});
      chart.appendChild(g);
    });
    const axis=(lon,label,color)=>{
      const a=angleForLongitude(lon,asc),p1=polar(400,400,120,a),p2=polar(400,400,375,a);
      chart.appendChild(svg('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],stroke:color,'stroke-width':2.2}));
      const tpos=polar(400,400,385,a),t=svg('text',{x:tpos[0],y:tpos[1],fill:color,'font-size':10,'font-weight':900,'text-anchor':'middle','dominant-baseline':'middle'});
      t.textContent=label;chart.appendChild(t);
    };
    axis(decimal(h.Ascendant),'ASC','#4ed6ff');
    axis(decimal(h.Midheaven),'MC','#e7b754');
    $('#natalChartTitle').textContent=`${p.name}’s celestial map`;
    $('#natalCenterName').textContent=p.name;
    $('#natalCenterMeta').textContent=`${h.CelestialBodies.sun.Sign.label} Sun`;
  }


  function aspectSymbol(key){return ({conjunction:'☌',sextile:'⚹',square:'□',trine:'△',opposition:'☍'})[key]||'◇';}
  function aspectTone(key){return ({conjunction:'fuses these energies',sextile:'creates an easy opportunity between them',square:'creates productive friction between them',trine:'lets them flow naturally together',opposition:'asks them to find balance across a polarity'})[key]||'connects these energies';}
  function renderFocus(key, highlight=true){
    const h=state.horoscope;if(!h)return;
    const body=h.CelestialBodies[key]||h.CelestialBodies.sun;
    state.focus=body.key;
    state.focusActive=highlight;
    const meta=PLANETS[body.key],reading=interpretationFor(body),house=body.House?.id;
    $('#natalFocusSymbol').textContent=meta.symbol;
    $('#natalFocusEyebrow').textContent=meta.role.toUpperCase();
    $('#natalFocusTitle').textContent=`${meta.label} in ${body.Sign.label}`;
    $('#natalFocusText').textContent=reading.text;
    $('#natalFocusMeta').innerHTML=[degreesInSign(body),house?`House ${house}`:'No house',signByKey(body.Sign.key).element,body.isRetrograde?'Retrograde':'Direct'].map(x=>`<span>${esc(x)}</span>`).join('');
    const aspects=h.Aspects.all.filter(a=>(a.point1Key===body.key||a.point2Key===body.key)&&PLANETS[a.point1Key]&&PLANETS[a.point2Key]).sort((a,b)=>(a.orb||99)-(b.orb||99)).slice(0,5);
    $('#natalFocusAspects').innerHTML=aspects.length?aspects.map(a=>{const other=a.point1Key===body.key?a.point2Key:a.point1Key;return `<button type="button" data-focus-planet="${other}"><span>${aspectSymbol(a.aspectKey)} ${esc(a.label)} ${esc(PLANETS[other].label)}</span><small>${Number(a.orb||0).toFixed(1)}° orb</small></button>`}).join(''):'<span class="muted">No major aspects displayed.</span>';
    $$('#natalFocusAspects [data-focus-planet]').forEach(b=>b.addEventListener('click',()=>focusPlanet(b.dataset.focusPlanet)));
    $$('.natal-planet').forEach(g=>g.classList.toggle('is-active',highlight&&g.dataset.planet===body.key));
    $$('.natal-sign-sector').forEach(sector=>sector.classList.toggle('is-active',highlight&&sector.dataset.sign===body.Sign.key));
    $$('.natal-house-line').forEach(line=>line.classList.toggle('is-active',highlight&&String(line.dataset.house)===String(house)));
    $$('.natal-aspect-line').forEach(line=>{
      if(!highlight){ line.style.opacity=''; line.style.strokeWidth=''; return; }
      const linked=line.dataset.planetA===body.key||line.dataset.planetB===body.key;
      line.style.opacity=linked?'.95':'.16';
      line.style.strokeWidth=linked?'2.4':'0.9';
    });
    const label=$('#natalObservingLabel');
    if(label) label.textContent=highlight?`Now observing · ${meta.label} in ${body.Sign.label}${house?` · House ${house}`:''}`:'Full chart · scroll to begin exploring';
  }
  function setFollowReading(enabled){
    state.followReading=enabled;
    const button=$('#natalFollowReading');
    if(button){button.classList.toggle('active',enabled);button.setAttribute('aria-pressed',String(enabled));button.textContent=enabled?'Following reading':'Focus locked';}
  }
  function focusPlanet(key){
    setFollowReading(false);
    renderFocus(key, true);
    $$('.evidence-card').forEach(card=>card.classList.toggle('is-active',(card.dataset.planets||'').split(',').includes(key)));
  }
  function focusEvidenceCard(card,lock=false){
    const keys=(card.dataset.planets||'').split(',').filter(Boolean);
    if(!keys.length)return;
    if(lock)setFollowReading(false);
    renderFocus(keys[0],true);
    if(keys.length>1){
      $$('.natal-planet').forEach(g=>g.classList.toggle('is-active',keys.includes(g.dataset.planet)));
      $$('.natal-aspect-line').forEach(line=>{
        const exact=keys.includes(line.dataset.planetA)&&keys.includes(line.dataset.planetB);
        line.style.opacity=exact?'.98':'.12';
        line.style.strokeWidth=exact?'3':'0.8';
      });
      const label=$('#natalObservingLabel');
      if(label)label.textContent=`Now observing · ${card.querySelector('strong')?.textContent||'Major aspect'}`;
    }
    $$('.evidence-card').forEach(x=>x.classList.toggle('is-active',x===card));
  }
  function focusHouse(houseNumber,card=null,lock=false){
    const h=state.horoscope;if(!h)return;
    if(lock)setFollowReading(false);
    const number=Number(houseNumber),next=number===12?1:number+1;
    const residents=Object.keys(PLANETS).filter(key=>Number(h.CelestialBodies[key]?.House?.id)===number);
    const house=h.Houses[number-1],cuspSign=house?.Sign?.key||signAt(decimal(house)).key;
    $$('.natal-planet').forEach(g=>g.classList.toggle('is-active',residents.includes(g.dataset.planet)));
    $$('.natal-sign-sector').forEach(sector=>sector.classList.toggle('is-active',sector.dataset.sign===cuspSign));
    $$('.natal-house-line').forEach(line=>line.classList.toggle('is-active',[number,next].includes(Number(line.dataset.house))));
    $$('.natal-aspect-line').forEach(line=>{
      const linked=residents.includes(line.dataset.planetA)||residents.includes(line.dataset.planetB);
      line.style.opacity=linked?'.7':'.1';
      line.style.strokeWidth=linked?'1.8':'0.7';
    });
    $$('.evidence-card').forEach(x=>x.classList.toggle('is-active',x===card));
    const label=$('#natalObservingLabel');
    if(label)label.textContent=`Now observing · House ${number} · ${HOUSE_THEMES[number-1]}`;
  }
  function clearFocus(){
    setFollowReading(true);
    renderFocus(state.focus||'sun',false);
    $$('.evidence-card').forEach(card=>card.classList.remove('is-active'));
  }
  function updateProfileSummary(){
    const p=state.profile||getProfile();
    const d=p.date?new Date(`${p.date}T12:00:00`).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):'Date needed';
    const city=(p.city||'Location needed').split(',').slice(0,2).join(',');
    const el=$('#natalProfileSummary');if(el)el.textContent=`${p.name||'Unnamed'} · ${d} · ${city}`;
  }

  function renderAngles(){
    const h=state.horoscope;
    const entries=[
      ['ASC',h.Ascendant],['MC',h.Midheaven],
      ['DSC',{Sign:signAt(norm(decimal(h.Ascendant)+180)),ChartPosition:{Ecliptic:{DecimalDegrees:norm(decimal(h.Ascendant)+180),ArcDegreesFormatted30:formatDegree(norm(decimal(h.Ascendant)+180))}}}],
      ['IC',{Sign:signAt(norm(decimal(h.Midheaven)+180)),ChartPosition:{Ecliptic:{DecimalDegrees:norm(decimal(h.Midheaven)+180),ArcDegreesFormatted30:formatDegree(norm(decimal(h.Midheaven)+180))}}}]
    ];
    $('#natalAngleStrip').innerHTML=entries.map(([key,x])=>`<article><span>${key}</span><b>${esc(x.Sign.label)}</b><small>${esc(x.ChartPosition.Ecliptic.ArcDegreesFormatted30||formatDegree(decimal(x)))}</small></article>`).join('');
  }
  function signAt(lon){return SIGNS[Math.floor(norm(lon)/30)];}
  function formatDegree(lon){const d=norm(lon)%30,m=Math.floor((d-Math.floor(d))*60);return `${Math.floor(d)}° ${String(m).padStart(2,'0')}′`;}

  function renderBigThree(){
    const h=state.horoscope;
    const items=[
      {title:'SUN',body:h.CelestialBodies.sun,symbol:'☉',meaning:'Your central will—the qualities you grow into and consciously express.'},
      {title:'MOON',body:h.CelestialBodies.moon,symbol:'☽',meaning:'Your instinctive emotional rhythm, needs, memory, and private response.'},
      {title:'RISING',body:h.Ascendant,symbol:'ASC',meaning:'The way you enter situations, meet the world, and are initially perceived.'}
    ];
    $('#bigThreeGrid').innerHTML=items.map((x,i)=>`<article class="big-three-card" ${i<2?`data-focus-planet="${i===0?'sun':'moon'}"`:''}><header><i class="planet-symbol">${x.symbol}</i><div><span>${x.title}</span><strong>${esc(x.body.Sign.label)}</strong></div></header><p>${x.meaning}</p><small>${esc(x.body.ChartPosition.Ecliptic.ArcDegreesFormatted30||formatDegree(decimal(x.body)))} · ${signByKey(x.body.Sign.key).element}</small></article>`).join('');
    $$('[data-focus-planet]').forEach(b=>b.addEventListener('click',()=>focusPlanet(b.dataset.focusPlanet)));
  }

  function dominantKey(counts){
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0]||'—';
  }
  function renderGlance(){
    const h=state.horoscope;
    const elements={Fire:0,Earth:0,Air:0,Water:0};
    const modes={Cardinal:0,Fixed:0,Mutable:0};
    Object.keys(PLANETS).forEach(key=>{
      const body=h.CelestialBodies[key];if(!body)return;
      const weight=(key==='sun'||key==='moon')?2:1;
      elements[signByKey(body.Sign.key).element]+=weight;
      modes[SIGN_MODES[body.Sign.key]]+=weight;
    });
    const rising=h.Ascendant?.Sign?.key;
    if(rising){elements[signByKey(rising).element]+=2;modes[SIGN_MODES[rising]]+=2;}
    const element=dominantKey(elements),mode=dominantKey(modes),ruler=SIGN_RULERS[rising]||'—';
    const archetypes=[ELEMENT_ARCHETYPES[element],MODE_ARCHETYPES[mode],RULER_ARCHETYPES[ruler]].filter(Boolean);
    $('#natalArchetypes').innerHTML=archetypes.map((x,i)=>`<span class="archetype-${i+1}">${esc(x)}</span>`).join('');
    $('#natalDominantElement').textContent=element;
    $('#natalElementDetail').textContent=`${elements[element]} weighted points · ${ELEMENT_ARCHETYPES[element]||'distinctive'} energy`;
    $('#natalDominantMode').textContent=mode;
    $('#natalModeDetail').textContent=`${modes[mode]} weighted points · ${MODE_ARCHETYPES[mode]||'adaptive'} pattern`;
    const displayedRuler=rising==='scorpio'?'Mars / Pluto':rising==='aquarius'?'Saturn / Uranus':rising==='pisces'?'Jupiter / Neptune':ruler;
    $('#natalChartRuler').textContent=displayedRuler;
    $('#natalRulerDetail').textContent=rising==='scorpio'?'Traditional / modern rulers of Scorpio rising':`Ruler of ${h.Ascendant.Sign.label} rising`;
    const theme={
      Fire:'turn inspiration into visible movement',
      Earth:'build something tangible enough to last',
      Air:'connect ideas, people, and possibilities',
      Water:'translate deep feeling into understanding'
    }[element];
    const movement={Cardinal:'by beginning decisively',Fixed:'through patience and sustained commitment',Mutable:'by staying curious and responsive'}[mode];
    $('#natalTheme').textContent=`Your chart’s strongest invitation is to ${theme} ${movement}. ${ruler} describes the instrument you use most naturally to do it.`;
  }

  function interpretationFor(body){
    const meta=PLANETS[body.key]||{label:body.label,role:'Chart point'};
    const house=body.House?.id;
    const tone=SIGN_TONE[body.Sign.key]||'distinctive and personally expressed';
    const gifts={
      sun:'Your vitality strengthens when your choices feel authentic rather than merely expected.',
      moon:'Your emotional intelligence grows when you honor the rhythm between response and reflection.',
      mercury:'Your mind becomes clearest when curiosity has a practical question to pursue.',
      venus:'You recognize value through what feels sincere, beautiful, and worth tending over time.',
      mars:'Your drive is strongest when desire has a clear direction and a meaningful challenge.',
      jupiter:'Growth arrives through experiences that enlarge your frame of reference.',
      saturn:'Mastery develops slowly here, rewarding patience, boundaries, and earned confidence.',
      uranus:'This part of you resists stale patterns and looks for a freer, more original approach.',
      neptune:'Imagination makes this placement receptive to symbols, ideals, and subtle emotional weather.',
      pluto:'Transformation asks for honesty about power, attachment, and what has outlived its purpose.'
    }[body.key]||'This placement adds a distinct voice to the whole chart.';
    return {
      eyebrow:meta.role,
      title:`${meta.label} in ${body.Sign.label}${house?` · House ${house}`:''}`,
      text:`Your ${meta.label.toLowerCase()} operates in a ${tone} way${house?`, concentrating its expression through ${HOUSE_THEMES[house-1]}`:''}. ${gifts} This is one strand of the chart; its aspects show how the rest of you answers back.`
    };
  }
  function renderReading(){
    const h=state.horoscope;
    const cards=Object.keys(PLANETS).filter(key=>h.CelestialBodies[key]).map(key=>({
      ...interpretationFor(h.CelestialBodies[key]),
      planets:[key],
      symbol:PLANETS[key].symbol
    }));
    const strongest=h.Aspects.all.filter(a=>PLANETS[a.point1Key]&&PLANETS[a.point2Key]).sort((a,b)=>(a.orb||99)-(b.orb||99))[0];
    if(strongest) cards.push({
      eyebrow:'Strongest major aspect',
      title:`${strongest.point1Label} ${strongest.label} ${strongest.point2Label}`,
      text:`With an orb of ${strongest.orb.toFixed(1)}°, this is one of the chart’s clearest internal conversations. The ${strongest.label.toLowerCase()} ${aspectTone(strongest.aspectKey)}—a relationship to work with consciously rather than a fixed outcome.`,
      planets:[strongest.point1Key,strongest.point2Key],
      symbol:aspectSymbol(strongest.aspectKey)
    });
    $('#natalReading').innerHTML=cards.map((x,i)=>`<article class="reading-card evidence-card" tabindex="0" data-reading="${i<10?x.planets[0]:'aspect'}" data-planets="${x.planets.join(',')}"><i>${x.symbol}</i><div><span>${esc(x.eyebrow)}</span><strong>${esc(x.title)}</strong><small>${esc(x.text)}</small><button type="button">Observe in chart</button></div></article>`).join('');
    $$('.reading-card').forEach(card=>{
      const activate=()=>focusEvidenceCard(card,true);
      card.addEventListener('click',activate);
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
    });
  }
  function renderAspectList(){
    const aspects=state.horoscope.Aspects.all
      .filter(a=>PLANETS[a.point1Key]&&PLANETS[a.point2Key])
      .sort((a,b)=>(a.orb||99)-(b.orb||99));
    $('#natalAspectList').innerHTML=aspects.map(a=>`
      <article class="aspect-evidence-card evidence-card" tabindex="0" data-planets="${a.point1Key},${a.point2Key}">
        <i>${aspectSymbol(a.aspectKey)}</i>
        <div><span>${esc(a.label)} · ${Number(a.orb||0).toFixed(1)}° orb</span>
        <strong>${esc(a.point1Label)} ${esc(a.label)} ${esc(a.point2Label)}</strong>
        <small>This ${a.label.toLowerCase()} ${aspectTone(a.aspectKey)}. Observe the exact line above, then notice how both placements participate in the larger pattern.</small></div>
      </article>`).join('');
    $$('.aspect-evidence-card').forEach(card=>{
      const activate=()=>focusEvidenceCard(card,true);
      card.addEventListener('click',activate);
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
    });
  }
  function renderHouseList(){
    const h=state.horoscope;
    $('#natalHouseList').innerHTML=h.Houses.map((house,index)=>{
      const number=index+1;
      const residents=Object.keys(PLANETS).filter(key=>Number(h.CelestialBodies[key]?.House?.id)===number);
      const names=residents.map(key=>PLANETS[key].label).join(', ')||'No planets';
      return `<article class="house-evidence-card evidence-card" tabindex="0" data-house="${number}">
        <i>${number}</i><div><span>${esc(house.Sign?.label||signAt(decimal(house)).label)} on the cusp</span>
        <strong>House ${number}</strong><small>${esc(HOUSE_THEMES[index])}. <b>${esc(names)}</b>${residents.length?' live here in this chart.':'—an empty house is still active through its ruler and transits.'}</small></div>
      </article>`;
    }).join('');
    $$('.house-evidence-card').forEach(card=>{
      const activate=()=>focusHouse(card.dataset.house,card,true);
      card.addEventListener('click',activate);
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
    });
  }
  function switchNatalSection(section){
    $$('[data-natal-section]').forEach(button=>button.classList.toggle('active',button.dataset.natalSection===section));
    if(section==='aspects'&&!state.layers.aspects){state.layers.aspects=true;$('[data-natal-layer="aspects"]')?.classList.add('active');renderChart();}
    if(section==='houses'&&!state.layers.houses){state.layers.houses=true;$('[data-natal-layer="houses"]')?.classList.add('active');renderChart();}
    const panel=$(`[data-natal-panel="${section}"]`);
    panel?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function setupReadingObserver(){
    state.readingObserver?.disconnect();
    if(!('IntersectionObserver' in window))return;
    const mobile=matchMedia('(max-width:720px)').matches;
    state.readingObserver=new IntersectionObserver(entries=>{
      if(!state.followReading)return;
      const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible)return;
      const card=visible.target;
      if(card.dataset.house)focusHouse(card.dataset.house,card,false);
      else focusEvidenceCard(card,false);
    },{root:null,rootMargin:mobile?'-54% 0px -20% 0px':'-28% 0px -52% 0px',threshold:[0,.1,.35,.7]});
    $$('.evidence-card').forEach(card=>state.readingObserver.observe(card));
  }
  function setupSectionObserver(){
    state.sectionObserver?.disconnect();
    if(!('IntersectionObserver' in window))return;
    state.sectionObserver=new IntersectionObserver(entries=>{
      const active=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!active)return;
      const section=active.target.dataset.natalPanel;
      $$('[data-natal-section]').forEach(button=>button.classList.toggle('active',button.dataset.natalSection===section));
      if(section==='study')renderFocus(state.focus||'sun',false);
    },{root:null,rootMargin:'-42% 0px -43% 0px',threshold:[0,.05,.2,.5]});
    $$('[data-natal-panel]').forEach(panel=>state.sectionObserver.observe(panel));
  }
  function setupChartDock(){
    state.dockObserver?.disconnect();
    const sentinel=$('#natalChartSentinel'),stage=$('.natal-chart-stage');
    if(!sentinel||!stage||!('IntersectionObserver' in window))return;
    if(innerWidth>720){stage.classList.remove('is-docked','is-expanded');return;}
    state.dockObserver=new IntersectionObserver(entries=>{
      const entry=entries[0];
      const docked=!entry.isIntersecting&&entry.boundingClientRect.top<0&&!state.chartExpanded;
      stage.classList.toggle('is-docked',docked);
    },{root:null,threshold:0});
    state.dockObserver.observe(sentinel);
  }
  function toggleChartExpanded(force){
    const stage=$('.natal-chart-stage'),button=$('#natalExpandChart');
    if(!stage||innerWidth>720)return;
    state.chartExpanded=typeof force==='boolean'?force:!state.chartExpanded;
    stage.classList.toggle('is-expanded',state.chartExpanded);
    if(state.chartExpanded)stage.classList.remove('is-docked');
    button?.setAttribute('aria-pressed',String(state.chartExpanded));
    if(button)button.textContent=state.chartExpanded?'Collapse map':'Expand map';
    document.body.classList.toggle('natal-chart-expanded',state.chartExpanded);
    if(!state.chartExpanded)setupChartDock();
  }
  function renderTable(){
    const h=state.horoscope;
    const bodies=Object.keys(PLANETS).map(k=>h.CelestialBodies[k]).filter(Boolean);
    $('#natalDataTable').innerHTML=`<table><thead><tr><th>Planet</th><th>Sign</th><th>Degree</th><th>House</th><th>Motion</th></tr></thead><tbody>${bodies.map(b=>`<tr><td><span class="planet-cell"><i>${PLANETS[b.key].symbol}</i>${esc(b.label)}</span></td><td>${esc(b.Sign.label)}</td><td>${esc(degreesInSign(b))}</td><td>${b.House?.id||'—'}</td><td>${b.isRetrograde?'Retrograde':'Direct'}</td></tr>`).join('')}</tbody></table>`;
  }

  async function findCity(){
    const q=$('#natalCity').value.trim(),results=$('#cityResults');
    if(q.length<2){setStatus('error','City needed','Type at least two characters.');return;}
    setStatus('working','Finding city','Searching locations and time zones…');
    try{
      const url=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`;
      const response=await fetch(url);if(!response.ok)throw new Error('Location search unavailable.');
      const data=await response.json(),places=data.results||[];
      if(!places.length)throw new Error('No matching city found. You can enter coordinates manually.');
      results.hidden=false;
      results.innerHTML=places.map((x,i)=>`<button class="city-result" data-city-index="${i}" type="button"><b>${esc(x.name)}, ${esc(x.admin1||x.country)}</b><small>${esc(x.country)} · ${x.latitude.toFixed(4)}, ${x.longitude.toFixed(4)} · ${esc(x.timezone||'')}</small></button>`).join('');
      results.querySelectorAll('[data-city-index]').forEach(btn=>btn.addEventListener('click',()=>{
        const x=places[Number(btn.dataset.cityIndex)];
        $('#natalCity').value=[x.name,x.admin1,x.country].filter(Boolean).join(', ');
        $('#natalLatitude').value=x.latitude;$('#natalLongitude').value=x.longitude;
        $('#natalTimezone').textContent=`Selected time zone: ${x.timezone}. Historical offset will be resolved for the birth date.`;
        results.hidden=true;updateProfileSummary();setStatus('','Location selected','Generate the chart when the remaining details are ready.');
      }));
      setStatus('','Choose a location',`${places.length} possible matches found.`);
    }catch(err){setStatus('error','Location search failed',err.message);$('.coordinates-panel').open=true;}
  }

  function switchView(view){
    const natal=view==='natal';
    $('#natalApp').hidden=!natal;$('#solarApp').hidden=natal;
    document.body.classList.toggle('natal-mode',natal);
    $$('[data-app-view]').forEach(b=>b.classList.toggle('active',b.dataset.appView===view));
    if(natal){$('#natalApp').scrollIntoView({behavior:'smooth',block:'start'});if(!state.horoscope)generate();}
    else if(view==='people'){$('#solarApp').hidden=false;document.body.classList.remove('natal-mode');document.querySelector('.controls-panel')?.scrollIntoView({behavior:'smooth'});}
    else if(view==='guide'){$('#solarApp').hidden=false;document.body.classList.remove('natal-mode');$('#faq')?.scrollIntoView({behavior:'smooth'});}
  }
  function restore(){
    try{
      const p=JSON.parse(localStorage.getItem('zephyrNatalProfileV1')||localStorage.getItem('zephyrNatalDraftV1')||'null');
      if(!p)return;
      $('#natalName').value=p.name||'';$('#natalCity').value=p.city||'';$('#natalDate').value=p.date||'';$('#natalTime').value=p.time||'';
      $('#natalLatitude').value=p.latitude;$('#natalLongitude').value=p.longitude;$('#natalHouseSystem').value=p.houseSystem||'placidus';$('#natalZodiac').value=p.zodiac||'tropical';
    }catch{}
  }
  function bind(){
    $$('[data-app-view]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.appView)));
    $('#generateNatalBtn').addEventListener('click',generate);
    $('#findCityBtn').addEventListener('click',findCity);
    $('#natalCity').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();findCity();}});
    $('#saveNatalBtn').addEventListener('click',()=>{const p=getProfile(),error=validProfile(p);if(error){setStatus('error','Details needed',error);return;}localStorage.setItem('zephyrNatalProfileV1',JSON.stringify(p));setStatus('','Profile saved','Birth details are stored only in this browser.');});
    $('#natalFollowReading')?.addEventListener('click',()=>{setFollowReading(!state.followReading);if(state.followReading)setupReadingObserver();});
    $('#natalClearFocus')?.addEventListener('click',clearFocus);
    $('#natalExpandChart')?.addEventListener('click',()=>toggleChartExpanded());
    $('.natal-center')?.addEventListener('click',()=>innerWidth<=720&&toggleChartExpanded());
    $$('[data-natal-section]').forEach(button=>button.addEventListener('click',()=>switchNatalSection(button.dataset.natalSection)));
    $$('[data-natal-layer]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.natalLayer;state.layers[k]=!state.layers[k];b.classList.toggle('active',state.layers[k]);if(state.horoscope){renderChart();renderFocus(state.focus, state.focusActive);}}));
    ['natalHouseSystem','natalZodiac'].forEach(id=>$('#'+id).addEventListener('change',()=>state.horoscope&&generate()));
    let resizeTimer;
    addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!state.horoscope)return;setupReadingObserver();setupSectionObserver();setupChartDock();},180);},{passive:true});
  }
  restore();updateProfileSummary();bind();
})();
