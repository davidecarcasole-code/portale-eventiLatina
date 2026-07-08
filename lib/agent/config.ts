import OpenAI from 'openai';

const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

export function getClient(): OpenAI {
  if (!API_KEY) throw new Error('OPENAI_API_KEY non configurata');
  return new OpenAI({ apiKey: API_KEY });
}

export function getModel(): string {
  return MODEL;
}

export const CATEGORY_LIST = [
  { slug: 'musica', name: 'Musica' },
  { slug: 'teatro', name: 'Teatro' },
  { slug: 'cultura', name: 'Cultura' },
  { slug: 'sport', name: 'Sport' },
  { slug: 'natura', name: 'Natura' },
  { slug: 'trekking', name: 'Trekking' },
  { slug: 'montagna', name: 'Montagna' },
  { slug: 'gite', name: 'Gite' },
  { slug: 'spettacolo', name: 'Spettacolo' },
  { slug: 'enogastronomia', name: 'Enogastronomia' },
  { slug: 'bambini', name: 'Bambini' },
];
