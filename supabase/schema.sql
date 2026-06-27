-- ============================================================
-- SportsTripz — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- ── TOURNAMENTS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournaments (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  name          TEXT NOT NULL,
  sport         TEXT NOT NULL DEFAULT 'Boxing',
  country       TEXT NOT NULL,
  city          TEXT NOT NULL,
  flag          TEXT DEFAULT '🏆',
  start_date    DATE NOT NULL,
  end_date      DATE,
  age_groups    TEXT[] DEFAULT '{}',
  entry_fee     TEXT,
  visa_notes    TEXT,
  description   TEXT,
  level         TEXT DEFAULT 'International',
  total_teams   INTEGER DEFAULT 0
);

-- ── REVIEWS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                    BIGSERIAL PRIMARY KEY,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  tournament_id         BIGINT REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  team_name             TEXT NOT NULL,
  country               TEXT,
  flag                  TEXT DEFAULT '🏳️',
  coach                 TEXT,
  accommodation         TEXT,
  total_cost_per_person TEXT,
  flight_route          TEXT,
  tips                  TEXT NOT NULL,
  rating                INTEGER CHECK (rating BETWEEN 1 AND 5) DEFAULT 5,
  date_attended         TEXT
);

-- ── INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tournaments_sport    ON tournaments(sport);
CREATE INDEX IF NOT EXISTS idx_tournaments_country  ON tournaments(country);
CREATE INDEX IF NOT EXISTS idx_tournaments_start    ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_reviews_tournament   ON reviews(tournament_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────────
-- Enable RLS on both tables
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews     ENABLE ROW LEVEL SECURITY;

-- Tournaments: anyone can READ
CREATE POLICY "Public can read tournaments"
  ON tournaments FOR SELECT
  USING (true);

-- Tournaments: only authenticated users can INSERT
CREATE POLICY "Authenticated users can add tournaments"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tournaments: only the owner can UPDATE/DELETE
CREATE POLICY "Owners can update their tournaments"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their tournaments"
  ON tournaments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reviews: anyone can READ
CREATE POLICY "Public can read reviews"
  ON reviews FOR SELECT
  USING (true);

-- Reviews: only authenticated users can INSERT
CREATE POLICY "Authenticated users can add reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Reviews: only the owner can UPDATE/DELETE
CREATE POLICY "Owners can update their reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ── SEED DATA — 5 Boxing Tournaments ─────────────────────
-- Paste this AFTER running the schema above
-- (or run it in the same query — it will work either way)

INSERT INTO tournaments (name, sport, country, city, flag, start_date, end_date, age_groups, entry_fee, visa_notes, description, level, total_teams) VALUES
(
  'Sarajevo Open Boxing Championship', 'Boxing', 'Bosnia & Herzegovina', 'Sarajevo', '🇧🇦',
  '2025-03-14', '2025-03-18',
  ARRAY['Youth (15-17)', 'Junior (18-22)'],
  '€180 per boxer',
  'Schengen visa NOT required for most EU passport holders. UK nationals: visa-free for 90 days. US nationals: visa-free. Check requirements 6 weeks in advance.',
  'One of the Balkans'' most celebrated amateur boxing tournaments, held in the historic Zetra Olympic Hall. Attracts elite clubs from across Europe.',
  'International', 24
),
(
  'Sofia International Boxing Cup', 'Boxing', 'Bulgaria', 'Sofia', '🇧🇬',
  '2025-05-08', '2025-05-12',
  ARRAY['Youth (15-17)', 'Junior (18-22)', 'Senior (23-40)'],
  '€150 per boxer',
  'Bulgaria is EU but NOT yet Schengen. EU/EEA nationals: ID card sufficient. UK nationals: passport required, visa-free 90 days. US nationals: visa-free.',
  'Annual cup hosted by the Bulgarian Boxing Federation at the National Sports Palace. Known for competitive Senior and Junior categories.',
  'International', 18
),
(
  'Belgrade Golden Gloves', 'Boxing', 'Serbia', 'Belgrade', '🇷🇸',
  '2025-07-22', '2025-07-27',
  ARRAY['Junior (18-22)', 'Senior (23-40)'],
  '€200 per boxer',
  'Serbia is NOT in the EU or Schengen. EU nationals: visa-free 90 days. UK nationals: visa-free 90 days. US nationals: visa-free 90 days. No visa required for most Western countries.',
  'The premier summer boxing tournament in the Western Balkans. Held at Hala Pionir arena. Features 32 national teams and draws significant media coverage.',
  'Elite International', 32
),
(
  'Zagreb Croatia Boxing Classic', 'Boxing', 'Croatia', 'Zagreb', '🇭🇷',
  '2025-09-19', '2025-09-22',
  ARRAY['Youth (15-17)'],
  '€130 per boxer',
  'Croatia IS in Schengen since 2023. Standard Schengen rules apply. EU nationals: ID card sufficient. UK nationals: passport required, visa-free 90 days. US nationals: visa-free.',
  'Youth-focused tournament run by the Croatian Boxing Association. Great first international for younger squads — well-supported, safe environment.',
  'Regional', 14
),
(
  'Warsaw Winter Boxing Cup', 'Boxing', 'Poland', 'Warsaw', '🇵🇱',
  '2025-11-07', '2025-11-10',
  ARRAY['Junior (18-22)', 'Senior (23-40)'],
  '€160 per boxer',
  'Poland is in Schengen. EU nationals: ID card sufficient. UK nationals: visa-free 90 days. US nationals: visa-free. PLN currency accepted everywhere; euros less common.',
  'Late-season European circuit fixture held at Legia Warsaw Sports Centre. Draws strong entries from Poland, Ukraine, Czech Republic, and UK clubs.',
  'International', 20
);
