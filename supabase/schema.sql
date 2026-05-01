-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  MUSLIM STUDENT COMPANION — Supabase Schema (Production)       ║
-- ║                                                                  ║
-- ║  SAFE TO RE-RUN: Drops and recreates all RLS policies.          ║
-- ║  Content: READ ONLY for anon. Reports: INSERT only.             ║
-- ║  Favourites: SELECT + INSERT + DELETE.                           ║
-- ║  Write to content: service_role / dashboard only.                ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ─── Tables ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS universities (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT,
  city TEXT NOT NULL, state TEXT, country TEXT NOT NULL DEFAULT 'US',
  latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
  timezone TEXT DEFAULT 'America/New_York', is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_entries (
  id TEXT PRIMARY KEY, university_id TEXT NOT NULL REFERENCES universities(id),
  name TEXT NOT NULL, location_name TEXT, hall_name TEXT, station_name TEXT,
  category TEXT NOT NULL DEFAULT 'dining-hall', dietary_type TEXT NOT NULL DEFAULT 'halal',
  availability TEXT NOT NULL DEFAULT 'menu_rotates', explanation TEXT, notes TEXT,
  brand TEXT, product_line TEXT, label_note TEXT, live_menu_url TEXT,
  address TEXT, latitude DOUBLE PRECISION, longitude DOUBLE PRECISION, distance TEXT,
  hours_text TEXT, hours_last_verified DATE,
  source TEXT NOT NULL, source_note TEXT, source_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified', verified_by TEXT,
  evidence_note TEXT, contact_method TEXT,
  last_verified DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prayer_spaces (
  id TEXT PRIMARY KEY, university_id TEXT NOT NULL REFERENCES universities(id),
  name TEXT NOT NULL, building TEXT, floor TEXT,
  type TEXT NOT NULL DEFAULT 'campus', featured BOOLEAN DEFAULT false,
  address TEXT, latitude DOUBLE PRECISION, longitude DOUBLE PRECISION, distance TEXT,
  tags TEXT[] DEFAULT '{}', hours_text TEXT, hours_last_verified DATE, notes TEXT,
  source TEXT NOT NULL, source_note TEXT, source_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified', verified_by TEXT,
  evidence_note TEXT, contact_method TEXT,
  last_verified DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_links (
  id TEXT PRIMARY KEY, university_id TEXT NOT NULL REFERENCES universities(id),
  title TEXT NOT NULL, description TEXT, url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  university_id TEXT REFERENCES universities(id),
  target_type TEXT NOT NULL, target_id TEXT NOT NULL,
  issue_type TEXT NOT NULL, message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  item_type TEXT NOT NULL, item_id TEXT NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_type, item_id)
);

-- ─── Indexes ───────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_food_university ON food_entries(university_id);
CREATE INDEX IF NOT EXISTS idx_food_category ON food_entries(category);
CREATE INDEX IF NOT EXISTS idx_spaces_university ON prayer_spaces(university_id);
CREATE INDEX IF NOT EXISTS idx_links_university ON community_links(university_id);
CREATE INDEX IF NOT EXISTS idx_reports_target ON user_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_saved_item ON saved_items(item_type, item_id);

-- ─── Updated_at trigger ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$ BEGIN CREATE TRIGGER food_entries_updated BEFORE UPDATE ON food_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER prayer_spaces_updated BEFORE UPDATE ON prayer_spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER community_links_updated BEFORE UPDATE ON community_links FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
--
-- This section DROPS ALL existing policies first, then creates
-- clean production policies. Safe to re-run any number of times.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- Drop ALL old policies (both old naming and new naming)
DROP POLICY IF EXISTS "Allow all read" ON universities;
DROP POLICY IF EXISTS "Allow all read" ON food_entries;
DROP POLICY IF EXISTS "Allow all read" ON prayer_spaces;
DROP POLICY IF EXISTS "Allow all read" ON community_links;
DROP POLICY IF EXISTS "Allow all read" ON saved_items;
DROP POLICY IF EXISTS "Allow all insert" ON food_entries;
DROP POLICY IF EXISTS "Allow all update" ON food_entries;
DROP POLICY IF EXISTS "Allow all delete" ON food_entries;
DROP POLICY IF EXISTS "Allow all insert" ON prayer_spaces;
DROP POLICY IF EXISTS "Allow all update" ON prayer_spaces;
DROP POLICY IF EXISTS "Allow all delete" ON prayer_spaces;
DROP POLICY IF EXISTS "Allow all insert" ON community_links;
DROP POLICY IF EXISTS "Allow all update" ON community_links;
DROP POLICY IF EXISTS "Allow all delete" ON community_links;
DROP POLICY IF EXISTS "Allow all insert" ON user_reports;
DROP POLICY IF EXISTS "Allow all insert" ON saved_items;
DROP POLICY IF EXISTS "Allow all delete" ON saved_items;
DROP POLICY IF EXISTS "public_read" ON universities;
DROP POLICY IF EXISTS "public_read" ON food_entries;
DROP POLICY IF EXISTS "public_read" ON prayer_spaces;
DROP POLICY IF EXISTS "public_read" ON community_links;
DROP POLICY IF EXISTS "public_read" ON saved_items;
DROP POLICY IF EXISTS "public_insert" ON user_reports;
DROP POLICY IF EXISTS "public_insert" ON saved_items;
DROP POLICY IF EXISTS "public_delete" ON saved_items;

-- Content tables: public SELECT only (no insert/update/delete for anon)
CREATE POLICY "public_read" ON universities FOR SELECT USING (true);
CREATE POLICY "public_read" ON food_entries FOR SELECT USING (true);
CREATE POLICY "public_read" ON prayer_spaces FOR SELECT USING (true);
CREATE POLICY "public_read" ON community_links FOR SELECT USING (true);

-- user_reports: public INSERT only
CREATE POLICY "public_insert" ON user_reports FOR INSERT WITH CHECK (true);

-- saved_items: public SELECT + INSERT + DELETE
CREATE POLICY "public_read" ON saved_items FOR SELECT USING (true);
CREATE POLICY "public_insert" ON saved_items FOR INSERT WITH CHECK (true);
CREATE POLICY "public_delete" ON saved_items FOR DELETE USING (true);
