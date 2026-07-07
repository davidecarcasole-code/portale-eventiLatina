-- Run this in Supabase Dashboard > SQL Editor

-- Users
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "avatar" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "theme" TEXT DEFAULT 'system',
  "accent_color" TEXT DEFAULT 'blue',
  "password_hash" TEXT,
  "google_id" TEXT UNIQUE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "icon" TEXT,
  "color" TEXT,
  "parent_id" INTEGER REFERENCES "categories"("id")
);

-- Events
CREATE TABLE IF NOT EXISTS "events" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category_id" INTEGER REFERENCES "categories"("id") ON DELETE SET NULL,
  "date" DATE,
  "end_date" DATE,
  "time" TEXT,
  "time_period" TEXT,
  "location" TEXT,
  "address" TEXT,
  "city" TEXT,
  "province" TEXT,
  "region" TEXT DEFAULT 'Lazio',
  "price" TEXT,
  "suitable_for" TEXT,
  "image_url" TEXT,
  "source_url" TEXT,
  "source_name" TEXT,
  "is_auto_generated" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_published" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_by" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON "events"("date");
CREATE INDEX IF NOT EXISTS idx_events_category ON "events"("category_id");
CREATE INDEX IF NOT EXISTS idx_events_city ON "events"("city");
CREATE INDEX IF NOT EXISTS idx_events_province ON "events"("province");
CREATE INDEX IF NOT EXISTS idx_events_time_period ON "events"("time_period");

-- Saved Events
CREATE TABLE IF NOT EXISTS "saved_events" (
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "event_id" INTEGER NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "saved_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("user_id", "event_id")
);

-- Search Config
CREATE TABLE IF NOT EXISTS "search_config" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT 'default',
  "cities" TEXT,
  "provinces" TEXT,
  "categories" TEXT,
  "keywords" TEXT,
  "radius_km" INTEGER,
  "auto_scrape" BOOLEAN NOT NULL DEFAULT FALSE,
  "scrape_interval_hours" INTEGER DEFAULT 24
);

-- Scraped Sources
CREATE TABLE IF NOT EXISTS "scraped_sources" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'html',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "selectors" TEXT,
  "city" TEXT,
  "province" TEXT,
  "category_id" INTEGER REFERENCES "categories"("id") ON DELETE SET NULL,
  "last_scraped_at" TIMESTAMP WITH TIME ZONE,
  "config_id" INTEGER REFERENCES "search_config"("id") ON DELETE CASCADE
);

-- Radio Settings
CREATE TABLE IF NOT EXISTS "radio_settings" (
  "id" SERIAL PRIMARY KEY,
  "station_name" TEXT,
  "station_description" TEXT,
  "stream_url" TEXT,
  "is_live" BOOLEAN NOT NULL DEFAULT FALSE,
  "current_track" TEXT,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Radio Podcasts
CREATE TABLE IF NOT EXISTS "radio_podcasts" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "file_path" TEXT,
  "duration" INTEGER,
  "file_size" INTEGER,
  "file_type" TEXT,
  "is_published" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_by" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Radio Live Chunks
CREATE TABLE IF NOT EXISTS "radio_live_chunks" (
  "id" SERIAL PRIMARY KEY,
  "chunk_data" TEXT,
  "chunk_index" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed categories
INSERT INTO "categories" ("name", "slug", "icon", "color") VALUES
  ('Musica', 'musica', 'music', '#FF6B6B'),
  ('Teatro', 'teatro', 'theater', '#FFA94D'),
  ('Cultura', 'cultura', 'book', '#FFD43B'),
  ('Sport', 'sport', 'trophy', '#69DB7C'),
  ('Natura', 'natura', 'leaf', '#38D9A9'),
  ('Trekking', 'trekking', 'mountain', '#4C6EF5'),
  ('Montagna', 'montagna', 'mountain-snow', '#748FFC'),
  ('Gite', 'gite', 'car', '#DA77F2'),
  ('Spettacolo', 'spettacolo', 'sparkles', '#F783AC'),
  ('Enogastronomia', 'enogastronomia', 'wine', '#E67700'),
  ('Bambini', 'bambini', 'baby', '#FCC419')
ON CONFLICT ("slug") DO NOTHING;
