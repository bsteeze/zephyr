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
  const state = { horoscope:null, layers:{aspects:true,houses:true,labels:true}, profile:null };

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
    renderReading();
    renderTable();
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
      const sector=svg('path',{d:ringPath(400,400,295,370,a0,a1),fill:SIGN_COLORS[i],opacity:.24,stroke:'rgba(236,199,120,.42)','stroke-width':1});
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
      chart.appendChild(svg('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],stroke:i===0?'#4ed6ff':'rgba(183,209,255,.28)','stroke-width':i===0?2.5:1}));
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
      chart.appendChild(svg('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],class:`natal-aspect-line ${a.aspectKey}`,stroke:'rgba(120,160,220,.5)','stroke-width':Math.max(.7,2.2-(a.orb||0)/6)}));
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
      g.addEventListener('click',()=>focusReading(body.key));chart.appendChild(g);
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
    $('#bigThreeGrid').innerHTML=items.map(x=>`<article class="big-three-card"><header><i class="planet-symbol">${x.symbol}</i><div><span>${x.title}</span><strong>${esc(x.body.Sign.label)}</strong></div></header><p>${x.meaning}</p><small>${esc(x.body.ChartPosition.Ecliptic.ArcDegreesFormatted30||formatDegree(decimal(x.body)))} · ${signByKey(x.body.Sign.key).element}</small></article>`).join('');
  }

  function interpretationFor(body){
    const meta=PLANETS[body.key]||{label:body.label,role:'Chart point'};
    const house=body.House?.id;
    const tone=SIGN_TONE[body.Sign.key]||'distinctive and personally expressed';
    return {
      eyebrow:meta.role,
      title:`${meta.label} in ${body.Sign.label}${house?` · House ${house}`:''}`,
      text:`Your ${meta.label.toLowerCase()} operates in a ${tone} way${house?`, concentrating its expression through ${HOUSE_THEMES[house-1]}`:''}. This is one strand of the chart rather than a verdict: aspects and the rest of the chart can soften, redirect, or intensify it.`
    };
  }
  function renderReading(){
    const h=state.horoscope;
    const cards=[
      interpretationFor(h.CelestialBodies.sun),
      interpretationFor(h.CelestialBodies.moon),
      interpretationFor(h.CelestialBodies.mercury),
      interpretationFor(h.CelestialBodies.venus),
      interpretationFor(h.CelestialBodies.mars)
    ];
    const strongest=h.Aspects.all.filter(a=>PLANETS[a.point1Key]&&PLANETS[a.point2Key]).sort((a,b)=>(a.orb||99)-(b.orb||99))[0];
    if(strongest) cards.push({eyebrow:'Strongest major aspect',title:`${strongest.point1Label} ${strongest.label} ${strongest.point2Label}`,text:`With an orb of ${strongest.orb.toFixed(1)}°, this is one of the chart’s clearest internal conversations. A ${strongest.label.toLowerCase()} describes how these two drives combine, cooperate, or challenge one another.`});
    $('#natalReading').innerHTML=cards.map((x,i)=>`<article class="reading-card" data-reading="${i<5?Object.keys(PLANETS)[i]:'aspect'}"><i>${i<5?PLANETS[Object.keys(PLANETS)[i]].symbol:'◇'}</i><div><span>${esc(x.eyebrow)}</span><strong>${esc(x.title)}</strong><small>${esc(x.text)}</small></div></article>`).join('');
  }
  function focusReading(key){
    const card=$(`[data-reading="${key}"]`);
    if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.animate([{background:'rgba(78,214,255,.15)'},{background:'rgba(255,255,255,.02)'}],{duration:1200});}
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
        results.hidden=true;setStatus('','Location selected','Generate the chart when the remaining details are ready.');
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
    $$('[data-natal-layer]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.natalLayer;state.layers[k]=!state.layers[k];b.classList.toggle('active',state.layers[k]);if(state.horoscope)renderChart();}));
    ['natalHouseSystem','natalZodiac'].forEach(id=>$('#'+id).addEventListener('change',()=>state.horoscope&&generate()));
  }
  restore();bind();
  const requestedView=new URLSearchParams(location.search).get('view')||location.hash.replace(/^#/,'');
  if(requestedView==='natal') switchView('natal');
})();
