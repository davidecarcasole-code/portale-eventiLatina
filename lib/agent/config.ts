import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.AI_MODEL || 'gemini-2.0-flash';

export function getClient(): GoogleGenerativeAI {
  if (!API_KEY) throw new Error('GEMINI_API_KEY non configurata');
  return new GoogleGenerativeAI(API_KEY);
}

export function getModel(): string {
  return MODEL;
}

export function getGenModel() {
  const genAI = getClient();
  return genAI.getGenerativeModel({ model: getModel() });
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
