'use strict';

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 8;
const requests = new Map();
const PLANETS = new Set(['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto']);
const SIGNS = new Set(['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']);
const ASPECTS = new Set(['conjunction','sextile','square','trine','opposition']);

const reportSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title','subtitle','synthesis','sections','closing','disclaimer'],
  properties: {
    title: {type:'string',minLength:3,maxLength:100},
    subtitle: {type:'string',minLength:3,maxLength:160},
    synthesis: {type:'string',minLength:180,maxLength:1200},
    sections: {
      type:'array',minItems:8,maxItems:12,
      items:{
        type:'object',additionalProperties:false,
        required:['id','category','eyebrow','title','body','confidence','evidence'],
        properties:{
          id:{type:'string',pattern:'^[a-z0-9-]{3,60}$'},
          category:{type:'string',enum:['identity','emotions','communication','relationships','motivation','vocation','growth','major-aspect','integration','spiritual-life','resources','community']},
          eyebrow:{type:'string',minLength:3,maxLength:80},
          title:{type:'string',minLength:3,maxLength:120},
          body:{type:'string',minLength:160,maxLength:1100},
          confidence:{type:'string',enum:['primary','supporting','subtle']},
          evidence:{
            type:'array',minItems:1,maxItems:6,
            items:{
              type:'object',additionalProperties:false,
              required:['type','planets','sign','house','aspect','orb'],
              properties:{
                type:{type:'string',enum:['placement','aspect','angle','pattern','house']},
                planets:{type:'array',maxItems:3,items:{type:'string'}},
                sign:{type:'string'},
                house:{type:'integer',minimum:0,maximum:12},
                aspect:{type:'string'},
                orb:{type:'number',minimum:0,maximum:15}
              }
            }
          }
        }
      }
    },
    closing:{type:'string',minLength:100,maxLength:800},
    disclaimer:{type:'string',minLength:30,maxLength:300}
  }
};

const instructions = `You are Zephyr's expert natal-chart interpreter. Produce an original, rigorous whole-chart synthesis for a curious adult reader.

Method:
- Treat the supplied JSON as the only source of chart facts. Never invent, correct, or infer a placement, house, aspect, orb, angle, or dominance not present.
- Synthesize repeated themes across the chart rather than listing placements.
- Weight Sun, Moon, Ascendant, chart rulers, angularity, tight major aspects, repeated elements/modes, and house emphasis most heavily.
- Treat aspects under 3 degrees as especially strong; wider aspects are supporting unless they repeat a major theme.
- Reconcile contradictions. Explain how apparently different placements can operate together.
- Distinguish primary, supporting, and subtle conclusions honestly.
- Use psychologically perceptive, warm, intimate, witty, conversational prose. Maintain Zephyr's own voice; do not imitate any named author.
- Make the reader feel recognized in ordinary life. Include at least one plausible, concrete scenario in every section: a conversation, work habit, relationship reflex, family moment, private ritual, decision, or familiar social situation. Present scenarios as possibilities, never facts.
- Celebrate strengths with specificity and generosity. Name what the reader may do unusually well and why the chart supports it.
- Give shadow patterns affectionate, playful jabs: the tone of a perceptive friend who can lovingly point out an overpacked calendar, a grudge with its own filing cabinet, a heroic attempt to optimize breakfast, or another chart-relevant human quirk.
- Humor must illuminate the interpretation. Keep it clever, brief, varied, and kind. Never mock trauma, identity, appearance, intelligence, mental health, disability, faith, culture, finances, or circumstances outside the chart.
- Pair every playful jab with a useful stretch: one concrete experiment, reframing, or behavior the reader can try. Avoid scolding and self-help clichés.
- Vary the emotional rhythm. Not every paragraph needs a joke; moments of depth should be allowed to land cleanly.
- Aim for the pleasure of reading this aloud over wine with close friends: candid enough to provoke an "okay, rude—but accurate," warm enough that the reader feels included rather than exposed, and insightful enough that the laughter gives way to recognition.
- Prefer crisp, quotable observations over polished corporate prose. Use vivid domestic and social details when the chart supports them: the text drafted and deleted six times, the emergency snacks, the color-coded vacation plan nobody requested, the argument mentally rehearsed in the shower, or the declaration of being "fine" delivered with courtroom-level evidence.
- Let the chart's contradictions create comedy. Affectionately notice when one placement wants spontaneity while another has already made the spreadsheet, or when a craving for intimacy arrives with a security system and visiting hours.
- Include one memorable "loving call-out" in most sections, but never force a punchline into grief, vulnerability, or genuinely tender material.
- Do not sound like a horoscope meme, stand-up routine, insult comic, therapist, or lifestyle influencer. The astrology remains expert; the humor makes its rawness easier to recognize.
- Keep the whole-chart synthesis between 130 and 190 words, divided into 2 or 3 short paragraphs separated by a blank line.
- Keep each section between 110 and 165 words. Divide it into exactly 3 compact paragraphs separated by blank lines: (1) the clear interpretation and strength, (2) a recognizable life scene with an optional loving call-out, and (3) the shadow-to-growth stretch.
- Keep paragraphs to 2 or 3 sentences. Prefer one sharp example over a catalogue of placements. Do not restate every supporting placement in prose when the evidence labels already show the receipts.
- Give the reader visual breathing room: use short sentences among longer ones, avoid throat-clearing, and end before the point becomes a lecture.
- Write at roughly an eighth-grade reading level so teens and adults can enjoy the same report. Sound smart, never academic or childish.
- Use familiar words, contractions, and mostly short sentences. Say "you want closeness but still need an exit" instead of "you negotiate the tension between intimacy and autonomy."
- Avoid college-essay language and abstract filler, including words such as modality, polarity, relational, interpersonal, psyche, archetypal, discernment, synthesis, transformative, manifestation, dynamic, framework, and tendency unless the word is truly needed and immediately explained in plain English.
- Keep astrology terms out of the main prose when possible. Put the technical receipts in the evidence labels. If an astrology term matters, explain it like a bright friend who is new to astrology.
- Make section titles short, playful, and easy to say out loud: usually 3 to 8 words. Favor personality hooks such as "The Velvet Scalpel," "CEO of Overthinking," or "Soft Heart, Security System" over essay titles.
- Let the humor arrive early. Each section should reveal a recognizable personality quirk within its first few sentences, not wait until the final line.
- Use the voice of a sharp, affectionate older cousin at the table: honest, funny, a little nosy, and firmly on the reader's side.
- Make people chuckle because a habit feels accurately exposed. Favor behavior over theory: what they text, avoid, organize, replay, promise, defend, collect, rehearse, or pretend not to care about.
- Do not use semicolons. Avoid sentences with more than 24 words. Break a complicated thought into two clean ones.
- Before returning the report, silently replace any word or sentence that a bright fourteen-year-old would have to reread. Keep the insight. Lose the homework.
- Avoid fatalism, diagnosis, certainty about events, fear, flattery, and generic horoscope filler.
- Address identity, emotional needs, communication, relationships, motivation, vocation, growth, at least one major aspect, and integration.
- Every section must cite visible evidence. Evidence must match the supplied chart exactly.
- Write for an intelligent beginner while preserving expert astrological depth.
- The report is reflective interpretation, not medical, legal, financial, or predictive advice.`;

function clientAddress(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

function limited(req) {
  const now=Date.now(), key=clientAddress(req);
  const recent=(requests.get(key)||[]).filter(t=>now-t<RATE_WINDOW_MS);
  recent.push(now);requests.set(key,recent);
  return recent.length>RATE_LIMIT;
}

function validChart(chart) {
  if(!chart || typeof chart!=='object') return false;
  if(!Array.isArray(chart.planets) || chart.planets.length<10 || chart.planets.length>12) return false;
  if(!Array.isArray(chart.aspects) || chart.aspects.length>80) return false;
  return chart.planets.every(p=>PLANETS.has(p.key)&&SIGNS.has(p.sign)&&Number.isFinite(p.longitude)&&p.house>=0&&p.house<=12)
    && chart.aspects.every(a=>PLANETS.has(a.planetA)&&PLANETS.has(a.planetB)&&ASPECTS.has(a.aspect)&&Number.isFinite(a.orb));
}

function normalizeChart(chart) {
  if(!chart || typeof chart!=='object')return chart;
  return {
    ...chart,
    aspects:Array.isArray(chart.aspects)
      ?chart.aspects.filter(a=>a&&PLANETS.has(a.planetA)&&PLANETS.has(a.planetB)&&ASPECTS.has(a.aspect)&&Number.isFinite(a.orb)).slice(0,80)
      :chart.aspects
  };
}

function validateEvidence(report, chart) {
  const placement=new Map(chart.planets.map(p=>[p.key,p]));
  const aspectKeys=new Set(chart.aspects.map(a=>[a.planetA,a.planetB].sort().join('|')+'|'+a.aspect));
  report.sections=report.sections.map(section=>({
    ...section,
    evidence:section.evidence.filter(e=>{
      if(!e.planets.every(p=>PLANETS.has(p)))return false;
      if(e.type==='placement'){
        const p=placement.get(e.planets[0]);
        return !!p && (!e.sign||e.sign===p.sign) && (!e.house||e.house===p.house);
      }
      if(e.type==='aspect'){
        return e.planets.length===2 && aspectKeys.has([...e.planets].sort().join('|')+'|'+e.aspect);
      }
      if(e.type==='house')return e.house>=1&&e.house<=12;
      if(e.type==='angle')return e.sign===''||SIGNS.has(e.sign);
      return true;
    })
  })).filter(section=>section.evidence.length);
  if(report.sections.length<6)throw new Error('The interpretation did not retain enough verifiable chart evidence.');
  return report;
}

module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const origin=req.headers.origin;
  if(origin){
    try{if(new URL(origin).host!==req.headers.host)return res.status(403).json({error:'Cross-origin requests are not allowed.'});}
    catch{return res.status(403).json({error:'Invalid request origin.'});}
  }
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Expert interpretation is not configured yet.'});
  if(limited(req))return res.status(429).json({error:'Interpretation limit reached. Please try again later.'});

  const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body||{});
  if(Buffer.byteLength(raw,'utf8')>100000)return res.status(413).json({error:'Chart request is too large.'});
  let body;
  try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return res.status(400).json({error:'Invalid chart request.'});}
  if(body?.chart)body.chart=normalizeChart(body.chart);
  if(!validChart(body?.chart))return res.status(400).json({error:'The calculated chart data is incomplete or invalid.'});

  try{
    const response=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL||'gpt-5.6',
        store:false,
        max_output_tokens:6500,
        reasoning:{effort:'medium'},
        instructions,
        input:`Interpret this calculated natal chart. Return only the requested structured report.\n\n${JSON.stringify(body.chart)}`,
        text:{format:{type:'json_schema',name:'zephyr_natal_report',strict:true,schema:reportSchema}}
      })
    });
    const data=await response.json();
    if(!response.ok){
      console.error('OpenAI error',response.status,data?.error?.code||data?.error?.type||'unknown');
      return res.status(response.status===429?429:502).json({error:response.status===429?'The interpretation service is busy. Please try again shortly.':'The expert interpretation could not be completed.'});
    }
    const outputText=data.output_text||data.output?.flatMap(item=>item.content||[]).find(item=>item.type==='output_text')?.text;
    if(!outputText)throw new Error('No structured interpretation returned.');
    const report=validateEvidence(JSON.parse(outputText),body.chart);
    return res.status(200).json({report,model:data.model||process.env.OPENAI_MODEL||'gpt-5.6'});
  }catch(error){
    console.error('Interpretation failure',error?.message||error);
    return res.status(502).json({error:'The expert interpretation could not be completed. Your curated Zephyr reading is still available.'});
  }
};
