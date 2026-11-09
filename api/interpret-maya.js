'use strict';

// Zephyr Mayan interpretation engine: a personal reading or a two-person comparison.
// Same OpenAI setup as interpret-chart.js / interpret-tarot.js (OPENAI_API_KEY, optional OPENAI_MODEL).
// The client sends only dates (and optional first names). All calendar facts and the
// Best for / Good for / Takes work ratings are recomputed here from ../maya-core.js.

const M = require('../maya-core.js');

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 12;
const requests = new Map();

const VOICE = `Voice:
- Warm, perceptive, conversational, at roughly an eighth-grade reading level. Smart, never academic. Use contractions and mostly short sentences. No semicolons.
- Make the reader feel recognized with concrete, everyday scenes (a text drafted twice, the friend who always plans the trip, the coworker who fixes the spreadsheet at midnight). Present scenes as possibilities, not facts.
- Gentle, affectionate humor is welcome. Never mock identity, trauma, health, faith, culture, money or appearance.
- Respect the living tradition. The traditional Tzolk'in (Cholq'ij) is kept by K'iche' Maya daykeepers (ajq'ijab'). Use the K'iche' day names supplied. Don't claim secret or ancient knowledge, and don't invent ceremonies.
- Dreamspell is a modern (1987) system by José Argüelles. Mention it as a separate, modern lens, never as ancient Maya.
- Use only the facts supplied. Don't invent placements, numbers or relationships.
- This is reflection, not prediction, medical, legal or financial advice. Avoid fatalism.`;

const readingSchema = {
  type: 'object', additionalProperties: false,
  required: ['title', 'opening', 'sections', 'advice', 'closing'],
  properties: {
    title: { type: 'string' },
    opening: { type: 'string' },
    sections: { type: 'array', minItems: 5, maxItems: 7, items: {
      type: 'object', additionalProperties: false, required: ['heading', 'body'],
      properties: { heading: { type: 'string' }, body: { type: 'string' } } } },
    advice: { type: 'array', minItems: 3, maxItems: 4, items: { type: 'string' } },
    closing: { type: 'string' }
  }
};
const verdictSchema = { type: 'object', additionalProperties: false, required: ['headline', 'body'],
  properties: { headline: { type: 'string' }, body: { type: 'string' } } };
const compatSchema = {
  type: 'object', additionalProperties: false,
  required: ['title', 'summary', 'love', 'friendship', 'business', 'strengths', 'friction', 'advice', 'closing'],
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    love: verdictSchema, friendship: verdictSchema, business: verdictSchema,
    strengths: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string' } },
    friction: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string' } },
    advice: { type: 'array', minItems: 3, maxItems: 4, items: { type: 'string' } },
    closing: { type: 'string' }
  }
};

const READING_INSTRUCTIONS = `You are Zephyr's Mayan calendar interpreter. Write a rich, personal reading from the supplied birth facts.

Structure:
- title: a short, warm, sayable title (3 to 8 words).
- opening: 2 short paragraphs (blank line between) that introduce the birth day sign and number as one living energy.
- sections, in this order, each with a short playful heading and a body of 2 or 3 short paragraphs (110 to 170 words):
  1. The heart of the day sign: essence, gifts and how it shows up day to day.
  2. The number: what this number and its intensity (gentle, balanced or strong) do to the sign.
  3. Light and shadow: the strengths and the shadow pattern, with one loving call-out and one concrete stretch.
  4. Love and friendship.
  5. Work and purpose.
  6. The Maya Cross: tell the story of conception (roots), the two side helpers, and destiny (where life is heading), naming each supplied day.
  7. Optional, the Dreamspell lens: 1 short paragraph on the modern Dreamspell signature as a contrasting mirror.
- advice: 3 or 4 practical, specific suggestions.
- closing: 1 short paragraph.

${VOICE}`;

const COMPAT_INSTRUCTIONS = `You are Zephyr's Mayan calendar interpreter. Compare two people's birth energies and explain how they fit in love, friendship and business.

Rules:
- The ratings for love, friendship and business are already decided and supplied (best, good or work). Explain them. Do not change or contradict them. "work" means "takes work", never "doomed": show what makes it work.
- Ground each explanation in the supplied signals (traditional and Dreamspell) and each person's day sign, number and Maya Cross. Name the specific signs.
- title: a short, warm title for the pair (3 to 8 words).
- summary: 2 short paragraphs on the overall chemistry.
- love, friendship, business: each with a short headline and a body of 2 short paragraphs (90 to 150 words), including one concrete everyday scene.
- strengths and friction: 2 to 4 short sentences each.
- advice: 3 or 4 specific things this pair can do.
- closing: 1 short paragraph.
- Refer to the people by the names supplied. If a name is "Person A" or "Person B", use "you" and "they" naturally instead.

${VOICE}`;

function clientAddress(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}
function limited(req) {
  const now = Date.now(), key = clientAddress(req);
  const recent = (requests.get(key) || []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now); requests.set(key, recent);
  return recent.length > RATE_LIMIT;
}
const cleanName = (v, fallback) => {
  const s = typeof v === 'string' ? v.replace(/[^\p{L}\p{M}' .-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 30) : '';
  return s || fallback;
};

function buildRequest(body) {
  if (!body || typeof body !== 'object') return null;
  if (body.mode === 'reading') {
    const c = M.chartFor(body.date); if (!c) return null;
    return { mode: 'reading', input: { person: M.factsFor(c) } };
  }
  if (body.mode === 'compat') {
    const nameA = cleanName(body.nameA, 'Person A'), nameB = cleanName(body.nameB, 'Person B');
    const r = M.compatibility(body.dateA, body.dateB, nameA === 'Person A' ? 'You' : nameA, nameB === 'Person B' ? 'they' : nameB);
    if (!r) return null;
    const ratings = Object.fromEntries(r.verdicts.map(v => [v.domain, v.rating]));
    return { mode: 'compat', ratings, input: {
      people: [{ name: nameA, ...M.factsFor(r.a) }, { name: nameB, ...M.factsFor(r.b) }],
      ratings,
      signals: r.signals.map(s => ({ system: s.system, title: s.title, detail: s.text, leans: { love: s.w[0], friendship: s.w[1], business: s.w[2] } }))
    } };
  }
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const origin = req.headers.origin;
  if (origin) {
    try { if (new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'Cross-origin requests are not allowed.' }); }
    catch { return res.status(403).json({ error: 'Invalid request origin.' }); }
  }
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'The Mayan interpretation engine is not configured yet.' });

  const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  if (Buffer.byteLength(raw, 'utf8') > 2000) return res.status(413).json({ error: 'Request is too large.' });
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return res.status(400).json({ error: 'Invalid request.' }); }
  const job = buildRequest(body);
  if (!job) return res.status(400).json({ error: 'Please enter valid birth dates between 1600 and 2200.' });
  if (limited(req)) return res.status(429).json({ error: 'You have reached the reading limit for now. Please try again in a little while.' });

  const reading = job.mode === 'reading';
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6',
        store: false,
        max_output_tokens: 6000,
        reasoning: { effort: 'low' },
        instructions: reading ? READING_INSTRUCTIONS : COMPAT_INSTRUCTIONS,
        input: `${reading ? 'Write the personal Mayan reading.' : 'Write the compatibility comparison.'} Return only the structured result.\n\n${JSON.stringify(job.input)}`,
        text: { format: { type: 'json_schema', name: reading ? 'zephyr_maya_reading' : 'zephyr_maya_compat', strict: true, schema: reading ? readingSchema : compatSchema } }
      })
    });
    const data = await response.json();
    if (!response.ok) {
      const code = data?.error?.code || data?.error?.type || 'unknown';
      console.error('OpenAI error', response.status, code, data?.error?.message);
      return res.status(response.status === 429 ? 429 : 502).json({ error: response.status === 429 ? 'The interpreter is busy. Please try again shortly.' : 'The interpretation could not be completed.', detail: `OpenAI ${response.status}: ${code}${data?.error?.message ? ' — ' + String(data.error.message).slice(0, 200) : ''}` });
    }
    const outputText = data.output_text || data.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text;
    if (!outputText) throw new Error('No interpretation returned.');
    const result = JSON.parse(outputText);
    if (!reading) result.ratings = job.ratings; // server-decided ratings always win
    return res.status(200).json({ mode: job.mode, result });
  } catch (error) {
    console.error('Maya interpretation failure', error?.message || error);
    return res.status(502).json({ error: 'The interpretation could not be completed.', detail: String(error?.message || error).slice(0, 200) });
  }
};
