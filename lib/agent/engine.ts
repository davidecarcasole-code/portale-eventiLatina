import { CATEGORY_LIST } from './config';

export interface AgentResult {
  task: string;
  processed: number;
  details: string;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

/* ───── Provider-agnostic AI fetch ───── */

async function aiFetch(system: string, prompt: string, maxTokens = 200, temp = 0.2): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Prefer Groq (Llama 3), fallback to Gemini
  if (groqKey) return groqFetch(groqKey, system, prompt, maxTokens, temp);
  if (geminiKey) return geminiFetch(geminiKey, system, prompt, maxTokens, temp);
  throw new Error('Nessuna API key configurata. Imposta GROQ_API_KEY o GEMINI_API_KEY nel .env');
}

/* ───── Groq (Llama 3 70B) ───── */

async function groqFetch(key: string, system: string, prompt: string, maxTokens: number, temp: number): Promise<string> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  for (let attempt = 0; attempt < 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
          max_tokens: maxTokens,
          temperature: temp,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        if (res.status === 429 && attempt < 2) { await delay(3000 * (attempt + 1)); continue; }
        throw new Error(`Groq ${res.status}: ${errText.slice(0, 150)}`);
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error('Risposta vuota');
      return text.trim();
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('Timeout 25s');
      if (err.message?.includes('429') && attempt < 2) { await delay(3000 * (attempt + 1)); continue; }
      throw err;
    }
  }
  throw new Error('Max retries');
}

/* ───── Gemini ───── */

async function geminiFetch(key: string, system: string, prompt: string, maxTokens: number, temp: number): Promise<string> {
  const model = process.env.AI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens, temperature: temp },
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        if (res.status === 429 && attempt < 2) { await delay(3000 * (attempt + 1)); continue; }
        throw new Error(`Gemini ${res.status}: ${errText.slice(0, 150)}`);
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Risposta vuota');
      return text.trim();
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('Timeout 20s');
      if (err.message?.includes('429') && attempt < 2) { await delay(3000 * (attempt + 1)); continue; }
      throw err;
    }
  }
  throw new Error('Max retries');
}

/* ───── Classificazione (1 chiamata batch) ───── */

export async function classifyAllEvents(): Promise<AgentResult> {
  const prisma = await (await import("@/lib/prisma")).prisma;
  const events = await prisma.event.findMany({
    where: { categoryId: null, isPublished: true },
    take: 30,
    select: { id: true, title: true, description: true },
  });

  if (!events.length) return { task: 'classify', processed: 0, details: 'Nessun evento senza categoria' };

  const cats = CATEGORY_LIST.map(c => c.slug).join(', ');
  const list = events.map(e => `${e.id}: ${e.title}${e.description ? ` — ${e.description.slice(0, 80)}` : ''}`).join('\n');

  try {
    const text = await aiFetch(
      `Sei un classificatore. Categorie: ${cats}. Rispondi SOLO con un JSON array: [{"id":numero,"cat":"slug"}]. Default: "spettacolo".`,
      `Classifica:\n${list}`, 500, 0.1
    );
    const json = text.slice(text.indexOf('['), text.lastIndexOf(']') + 1);
    const parsed = JSON.parse(json);
    let updated = 0;
    for (const item of parsed) {
      const cat = await prisma.category.findUnique({ where: { slug: item.cat } });
      if (cat) { await prisma.event.update({ where: { id: item.id }, data: { categoryId: cat.id } }); updated++; }
    }
    return { task: 'classify', processed: updated, details: `Classificati ${updated}/${events.length}` };
  } catch (err: any) {
    return { task: 'classify', processed: 0, details: `Errore: ${err.message?.slice(0, 200)}` };
  }
}

/* ───── Arricchimento descrizioni (template offline + AI fallback) ───── */

export async function enrichAllDescriptions(): Promise<AgentResult> {
  const prisma = await (await import("@/lib/prisma")).prisma;
  const events = await prisma.event.findMany({
    where: { isPublished: true, OR: [{ description: null }, { description: '' }] },
    take: 20,
    select: { id: true, title: true, date: true, city: true, location: true, time: true, categoryId: true },
  });

  if (!events.length) return { task: 'enrich', processed: 0, details: 'Nessun evento senza descrizione' };

  const catIds: number[] = events.map(e => e.categoryId).filter((id): id is number => id !== null);
  const cats = await prisma.category.findMany({ where: { id: { in: catIds } }, select: { id: true, slug: true, name: true } });
  const catMap = new Map(cats.map(c => [c.id, { slug: c.slug, name: c.name }]));

  const hasAiKey = !!(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY);
  let aiUpdated: number[] = [];
  let aiErrors: string[] = [];

  if (hasAiKey) {
    const batchSize = 5;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      const list = batch.map(e =>
        `#${e.id} | ${e.title} | ${e.date?.toISOString().split('T')[0] || ''} | ${e.city || 'Latina'} | ${catMap.get(e.categoryId!)?.slug || 'evento'}`
      ).join('\n');

      try {
        const text = await aiFetch(
          'Sei un copywriter eventi. Genera max 3 frasi accattivanti in italiano per ogni evento.',
          `Per ogni evento, rispondi con "#ID:" seguito dalla descrizione su una nuova riga.\n\nEventi:\n${list}`,
          800, 0.7
        );
        for (const e of batch) {
          const match = text.match(new RegExp(`#${e.id}:\\s*(.+?)(?=\\n#\\d|$)`, 's'));
          const desc = match?.[1]?.trim();
          if (desc && desc.length > 15) {
            await prisma.event.update({ where: { id: e.id }, data: { description: desc } });
            aiUpdated.push(e.id);
          }
        }
      } catch (err: any) {
        aiErrors.push(`batch ${i + 1}: ${err.message?.slice(0, 100)}`);
      }
    }
  }

  // Template engine offline – solo eventi non ancora arricchiti dall'AI
  const { enrichBatch } = await import('./templates');
  const toEnrich = events.filter(e => !aiUpdated.includes(e.id)).map(e => ({
    id: e.id,
    title: e.title,
    date: e.date,
    city: e.city,
    location: e.location,
    time: e.time,
    categorySlug: catMap.get(e.categoryId!)?.slug || 'spettacolo',
    categoryName: catMap.get(e.categoryId!)?.name || 'Spettacolo',
  }));

  let templateUpdated = 0;
  if (toEnrich.length > 0) {
    const descriptions = enrichBatch(toEnrich);
    for (const [id, desc] of descriptions) {
      await prisma.event.update({ where: { id }, data: { description: desc } });
      templateUpdated++;
    }
  }

  const method = aiUpdated.length > 0 ? 'AI' : 'template offline';
  const total = aiUpdated.length + templateUpdated;
  const details = [`Arricchite ${total} eventi (metodo: ${method})`];
  if (aiUpdated.length > 0) details.push(`AI: ${aiUpdated.length}`);
  if (templateUpdated > 0) details.push(`template: ${templateUpdated}`);
  if (aiErrors.length > 0) details.push(`errori AI: ${aiErrors.join('; ')}`);
  return { task: 'enrich', processed: total, details: details.join(' | ') };
}

/* ───── Dedup avanzato ───── */

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function tokenJaccard(a: string, b: string): number {
  const ta = new Set(normalize(a).split(' ').filter(Boolean));
  const tb = new Set(normalize(b).split(' ').filter(Boolean));
  if (!ta.size && !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return union ? inter / union : 0;
}

export async function dedupEvents(): Promise<AgentResult> {
  const prisma = await (await import("@/lib/prisma")).prisma;
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    select: { id: true, title: true, date: true, city: true },
    orderBy: { date: 'asc' },
  });

  let removed = 0;
  const groups: number[][] = [];
  const checked = new Set<number>();

  for (let i = 0; i < events.length; i++) {
    if (checked.has(i)) continue;
    const group = [i];
    checked.add(i);
    for (let j = i + 1; j < events.length; j++) {
      if (checked.has(j)) continue;
      const a = events[i];
      const b = events[j];
      const sameDate = a.date && b.date && a.date.toISOString().split('T')[0] === b.date.toISOString().split('T')[0];
      const sameCity = a.city && b.city && normalize(a.city) === normalize(b.city);
      if (!sameDate && !sameCity) continue;
      if (tokenJaccard(a.title, b.title) >= 0.65) { group.push(j); checked.add(j); }
    }
    if (group.length > 1) groups.push(group);
  }

  for (const group of groups) {
    const ids = group.map(i => events[i].id);
    const remove = ids.slice(1);
    if (remove.length > 0) {
      await prisma.event.deleteMany({ where: { id: { in: remove } } });
      removed += remove.length;
    }
  }

  return { task: 'dedup', processed: removed, details: `Rimossi ${removed} duplicati su ${events.length} eventi (${groups.length} gruppi)` };
}

/* ───── Riassunto eventi ───── */

export async function summarizeEvents(): Promise<AgentResult> {
  const prisma = await (await import("@/lib/prisma")).prisma;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + 14);

  const events = await prisma.event.findMany({
    where: { isPublished: true, date: { gte: today, lte: end } },
    orderBy: { date: 'asc' },
    take: 30,
    select: { title: true, date: true, city: true, categoryId: true },
  });

  if (!events.length) return { task: 'summarize', processed: 0, details: 'Nessun evento nei prossimi 14 giorni' };

  const catNames = await prisma.category.findMany({ select: { id: true, name: true } });
  const catMap = new Map(catNames.map(c => [c.id, c.name]));
  const list = events.map(e =>
    `${e.date?.toISOString().split('T')[0] || ''} | ${e.title} | ${e.city || '?'} | ${catMap.get(e.categoryId!) || '?'}`
  ).join('\n');

  try {
    const text = await aiFetch(
      'Sei un organizzatore eventi. Crea un riassunto accattivante in italiano, max 200 parole, raggruppa per categoria.',
      `Riassunto eventi prossimi giorni:\n${list}`, 400, 0.7
    );
    return { task: 'summarize', processed: events.length, details: text || 'Nessun riassunto' };
  } catch (err: any) {
    return { task: 'summarize', processed: 0, details: `Errore: ${err.message?.slice(0, 150)}` };
  }
}
