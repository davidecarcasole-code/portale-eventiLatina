import { CATEGORY_LIST } from './config';

async function getPrisma() {
  const mod = await import("@/lib/prisma");
  return mod.prisma;
}

export interface AgentResult {
  task: string;
  processed: number;
  details: string;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

/* ───── Fetch diretto Gemini con timeout ───── */

async function geminiFetch(system: string, prompt: string, maxTokens = 200, temp = 0.2): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY mancante');

  const model = process.env.AI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: temp },
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        if (res.status === 429 && attempt < 2) {
          await delay(3000 * (attempt + 1));
          continue;
        }
        throw new Error(`${res.status} ${errText.slice(0, 150)}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Risposta vuota');
      return text.trim();
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('Timeout 20s');
      if (err.message?.includes('429') && attempt < 2) {
        await delay(3000 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries');
}

/* ───── Classificazione (1 chiamata batch) ───── */

export async function classifyAllEvents(): Promise<AgentResult> {
  const prisma = await getPrisma();
  const events = await prisma.event.findMany({
    where: { categoryId: null, isPublished: true },
    take: 30,
    select: { id: true, title: true, description: true },
  });

  if (!events.length) return { task: 'classify', processed: 0, details: 'Nessun evento senza categoria' };

  const cats = CATEGORY_LIST.map(c => c.slug).join(', ');
  const list = events.map(e => `${e.id}: ${e.title}${e.description ? ` — ${e.description.slice(0, 80)}` : ''}`).join('\n');

  try {
    const text = await geminiFetch(
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

/* ───── Arricchimento descrizioni (batch 5 per chiamata) ───── */

export async function enrichAllDescriptions(): Promise<AgentResult> {
  const prisma = await getPrisma();
  const events = await prisma.event.findMany({
    where: { isPublished: true, OR: [{ description: null }, { description: '' }] },
    take: 10,
    select: { id: true, title: true, date: true, city: true, categoryId: true, description: true },
  });

  if (!events.length) return { task: 'enrich', processed: 0, details: 'Nessun evento senza descrizione' };

  let errors: string[] = [];
  const batchSize = 5;

  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    const catIds: number[] = batch.map(e => e.categoryId).filter((id): id is number => id !== null);
    const cats = await prisma.category.findMany({ where: { id: { in: catIds } }, select: { id: true, slug: true } });
    const catMap = new Map(cats.map(c => [c.id, c.slug]));

    const list = batch.map(e =>
      `#${e.id} | ${e.title} | ${e.date?.toISOString().split('T')[0] || ''} | ${e.city || 'Latina'} | ${catMap.get(e.categoryId!) || 'evento'}`
    ).join('\n');

    try {
      const text = await geminiFetch(
        'Sei un copywriter eventi. Genera max 3 frasi accattivanti in italiano per ogni evento.',
        `Per ogni evento, rispondi con "#ID:" seguito dalla descrizione su una nuova riga.\n\nEventi:\n${list}`,
        800, 0.7
      );

      for (const e of batch) {
        const match = text.match(new RegExp(`#${e.id}:\\s*(.+?)(?=\\n#\\d|$)`, 's'));
        const desc = match?.[1]?.trim();
        if (desc && desc.length > 15) {
          await prisma.event.update({ where: { id: e.id }, data: { description: desc } });
        }
      }
    } catch (err: any) {
      errors.push(`batch ${i + 1}: ${err.message?.slice(0, 100)}`);
    }
  }

  return { task: 'enrich', processed: batchSize * Math.ceil(events.length / batchSize) - errors.length * batchSize, details: `Arricchite ${events.length}${errors.length ? ` (errori: ${errors.join('; ')})` : ''}` };
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
  const prisma = await getPrisma();
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
      if (tokenJaccard(a.title, b.title) >= 0.65) {
        group.push(j);
        checked.add(j);
      }
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

/* ───── Riassunto eventi (1 chiamata) ───── */

export async function summarizeEvents(): Promise<AgentResult> {
  const prisma = await getPrisma();
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
    const text = await geminiFetch(
      'Sei un organizzatore eventi. Crea un riassunto accattivante in italiano, max 200 parole, raggruppa per categoria.',
      `Riassunto eventi prossimi giorni:\n${list}`, 400, 0.7
    );
    return { task: 'summarize', processed: events.length, details: text || 'Nessun riassunto' };
  } catch (err: any) {
    return { task: 'summarize', processed: 0, details: `Errore: ${err.message?.slice(0, 150)}` };
  }
}
