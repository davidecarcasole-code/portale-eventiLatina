#!/usr/bin/env node
// Script locale per fare scraping di teatro.it (dalla tua macchina) e inviare gli eventi all'API su Vercel
// Uso: node scripts/ingest-teatro.mjs [--preview]
// --preview: mostra gli eventi trovati senza inviarli

const BASE = "https://www.teatro.it/spettacoli/latina";
const ADMIN_EMAIL = "admin@eventinlatina.it";
const ADMIN_PASSWORD = "Admin123!";
const API_BASE = "https://portale-eventi-latina.vercel.app";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "it-IT,it;q=0.9,en;q=0.5",
};

function extractJsonLd(html) {
  const results = [];
  const regex = /<script[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed["@type"] === "ItemList" && Array.isArray(parsed.itemListElement)) {
        for (const item of parsed.itemListElement) {
          if (item.item?.["@type"] === "TheaterEvent") {
            results.push(item.item);
          }
        }
      }
    } catch { /* skip */ }
  }
  return results;
}

function parseDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
}

function mapCategory(genre) {
  const g = (genre || "").toLowerCase();
  if (g.includes("music") || g.includes("concerto")) return "cat_music";
  if (g.includes("comico") || g.includes("commedia")) return "cat_entertainment";
  if (g.includes("teatro") || g.includes("prosa") || g.includes("dramma")) return "cat_theater";
  if (g.includes("famiglia") || g.includes("bambini") || g.includes("family")) return "cat_kids";
  if (g.includes("danza") || g.includes("ballo")) return "cat_culture";
  if (g.includes("classica") || g.includes("lirica") || g.includes("opera")) return "cat_culture";
  if (g.includes("incontro culturale") || g.includes("extra")) return "cat_culture";
  if (g.includes("intrattenimento")) return "cat_entertainment";
  if (g.includes("musical") || g.includes("varietà")) return "cat_entertainment";
  return "cat_entertainment";
}

async function scrapePage(page) {
  const url = page === 1 ? `${BASE}?format=json` : `${BASE}?format=json&page=${page}`;
  console.log(`[Teatro.it] Fetching page ${page}...`);
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
  if (!res.ok) {
    console.log(`[Teatro.it] HTTP ${res.status} for page ${page}`);
    return [];
  }
  const html = await res.text();
  if (html.length < 10000) {
    console.log(`[Teatro.it] Response too short (${html.length} bytes)`);
    return [];
  }
  return extractJsonLd(html);
}

async function scrapeAll() {
  const seen = new Set();
  const events = [];

  for (let page = 1; page <= 5; page++) {
    const items = await scrapePage(page);
    if (items.length === 0) break;

    for (const item of items) {
      const title = item.name?.trim();
      if (!title || seen.has(title)) continue;
      seen.add(title);

      const startDate = parseDate(item.startDate);
      if (!startDate) continue;

      const location = item.location || {};
      const venue = location.name || "";
      const address = location.address || {};
      const city = address.addressLocality || "";

      events.push({
        title,
        description: item.description?.trim() || undefined,
        date: startDate,
        end_date: item.endDate ? parseDate(item.endDate) || undefined : undefined,
        location: venue || city || undefined,
        city: city || "Latina",
        province: "LT",
        category_id: mapCategory(item.performer?.["@type"] === "PerformingGroup" ? item.performer.name || "" : ""),
        image_url: item.image?.replace(/^https:\/\/www\.teatro\.it\/https:/, "https:") || undefined,
        source_url: item.url || undefined,
        source_name: "Teatro.it",
      });
    }

    if (items.length < 20) break;
  }

  return events;
}

async function getToken() {
  console.log("[Auth] Logging in...");
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  console.log("[Auth] Logged in as", data.user?.email);
  return data.token;
}

async function sendEvents(events, token) {
  console.log(`[Ingest] Sending ${events.length} events to Vercel...`);
  const res = await fetch(`${API_BASE}/api/scraper/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ events, sourceName: "Teatro.it" }),
  });
  const data = await res.json();
  console.log("[Ingest] Result:", JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  const isPreview = process.argv.includes("--preview");

  console.log("=== Teatro.it Ingest Tool ===");
  const events = await scrapeAll();
  console.log(`[Teatro.it] ${events.length} eventi trovati`);

  if (events.length === 0) {
    console.log("[Teatro.it] Nessun evento trovato.");
    return;
  }

  if (isPreview) {
    console.log("\n--- ANTEPRIMA (non inviati) ---");
    for (const e of events) {
      console.log(`  - ${e.date} | ${e.title} | ${e.city}`);
    }
    console.log(`\nTotale: ${events.length} eventi`);
    return;
  }

  try {
    const token = await getToken();
    await sendEvents(events, token);
  } catch (err) {
    console.error("[Error]", err.message);
    process.exit(1);
  }
}

main();
