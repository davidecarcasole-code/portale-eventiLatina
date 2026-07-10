#!/usr/bin/env node
// Uso: npx tsx scripts/ingest-lazioeventi.mjs [--preview]
// Importa lo scraper TypeScript e invia gli eventi all'API su Vercel

import { runLazioEventiScraper } from '../lib/scraper/lazioeventiScraper.ts';

const ADMIN_EMAIL = 'admin@eventinlatina.it';
const ADMIN_PASSWORD = 'Admin123!';
const API_BASE = 'https://portale-eventi-latina.vercel.app';

async function getToken() {
  console.log('[Auth] Logging in...');
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  console.log('[Auth] Logged in as', data.user?.email);
  return data.token;
}

async function sendEvents(events, token) {
  console.log(`[Ingest] Sending ${events.length} events to Vercel...`);
  const res = await fetch(`${API_BASE}/api/scraper/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ events, sourceName: 'LazioEventi.com' }),
  });
  const data = await res.json();
  console.log('[Ingest] Result:', JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  const isPreview = process.argv.includes('--preview');
  console.log('=== LazioEventi.com Ingest Tool ===');

  const events = await runLazioEventiScraper();
  console.log(`[LazioEventi] ${events.length} eventi trovati`);

  if (events.length === 0) {
    console.log('[LazioEventi] Nessun evento trovato.');
    return;
  }

  if (isPreview) {
    console.log('\n--- ANTEPRIMA (non inviati) ---');
    for (const e of events) {
      console.log(`  - ${e.date} | ${e.title.slice(0, 60)} | ${e.city} | ${e.category_id}`);
    }
    console.log(`\nTotale: ${events.length} eventi`);
    return;
  }

  try {
    const token = await getToken();
    await sendEvents(events, token);
  } catch (err) {
    console.error('[Error]', err.message);
    process.exit(1);
  }
}

main();
