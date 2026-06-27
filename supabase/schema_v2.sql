-- ============================================================
-- SportsTripz v2 — Complete Supabase Schema
-- Run this entire file in Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- ── DROP OLD TABLES (run only if upgrading from v1) ───────
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS tournaments CASCADE;

-- ── 1. USERS TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL,
  name              TEXT,
  club_name         TEXT,
  country           TEXT,
  passport_country  TEXT,
  role              TEXT DEFAULT 'coach' CHECK (role IN ('coach', 'athlete', 'admin')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, club_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'club'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 2. TOURNAMENTS TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS tournaments (
  id                  BIGSERIAL PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
  verified            BOOLEAN DEFAULT FALSE,

  name                TEXT NOT NULL,
  sport               TEXT NOT NULL DEFAULT 'Boxing',
  country             TEXT NOT NULL,
  city                TEXT NOT NULL,
  flag                TEXT DEFAULT '🏆',
  start_date          DATE NOT NULL,
  end_date            DATE,
  age_groups          TEXT[] DEFAULT '{}',
  entry_fee_usd       INTEGER,
  entry_fee           TEXT,
  visa_notes          TEXT,
  description         TEXT,
  level               TEXT DEFAULT 'International',
  total_teams         INTEGER DEFAULT 0,
  official_hotel_url  TEXT
);

-- ── 3. TEAM REVIEWS TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS team_reviews (
  id                        BIGSERIAL PRIMARY KEY,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  tournament_id             BIGINT REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id                   UUID REFERENCES users(id) ON DELETE SET NULL,

  team_name                 TEXT NOT NULL,
  country                   TEXT,
  flag                      TEXT DEFAULT '🏳️',
  coach                     TEXT,
  sport                     TEXT,
  accommodation_type        TEXT,
  accommodation_name        TEXT,
  accommodation_cost_usd    INTEGER,
  accommodation             TEXT,
  total_cost_per_person_usd INTEGER,
  total_cost_per_person     TEXT,
  flight_route              TEXT,
  tips                      TEXT NOT NULL,
  rating                    INTEGER CHECK (rating BETWEEN 1 AND 5) DEFAULT 5,
  date_attended             TEXT
);

-- ── 4. KNOWN ROUTES TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS known_routes (
  id                    BIGSERIAL PRIMARY KEY,
  last_updated          TIMESTAMPTZ DEFAULT NOW(),

  departure_region      TEXT NOT NULL,
  departure_country     TEXT,
  destination_city      TEXT NOT NULL,
  destination_country   TEXT NOT NULL,
  transit_hubs          TEXT[] DEFAULT '{}',
  airlines              TEXT[] DEFAULT '{}',
  avg_cost_usd          INTEGER,
  cost_range_min        INTEGER,
  cost_range_max        INTEGER,
  flight_hours          TEXT,
  passport_restrictions TEXT[] DEFAULT '{}',
  visa_notes            TEXT,
  tips                  TEXT,
  community_tips        TEXT[] DEFAULT '{}'
);

-- ── 5. TRIP PLANS TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_plans (
  id                  BIGSERIAL PRIMARY KEY,
  saved_at            TIMESTAMPTZ DEFAULT NOW(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  sport               TEXT NOT NULL,
  athletes_count      INTEGER DEFAULT 1,
  coaches_count       INTEGER DEFAULT 1,
  passport_country    TEXT NOT NULL,
  budget_usd          INTEGER,
  destination         TEXT NOT NULL,
  travel_month        TEXT,
  equipment           BOOLEAN DEFAULT FALSE,
  ai_itinerary_json   JSONB,
  title               TEXT
);

-- ── INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tournaments_sport_country   ON tournaments(sport, country);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date      ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_team_reviews_tournament     ON team_reviews(tournament_id);
CREATE INDEX IF NOT EXISTS idx_known_routes_departure_dest ON known_routes(departure_region, destination_country);
CREATE INDEX IF NOT EXISTS idx_trip_plans_user             ON trip_plans(user_id);

-- ── TOURNAMENT SUMMARY VIEW ───────────────────────────────
CREATE OR REPLACE VIEW tournament_summary AS
SELECT
  t.*,
  ROUND(AVG(r.rating), 1)   AS avg_rating,
  COUNT(r.id)                AS review_count,
  MIN(r.total_cost_per_person_usd) AS min_cost_usd,
  MAX(r.total_cost_per_person_usd) AS max_cost_usd
FROM tournaments t
LEFT JOIN team_reviews r ON r.tournament_id = t.id
GROUP BY t.id;

-- ── ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_plans   ENABLE ROW LEVEL SECURITY;

-- Users: can read all, edit own
CREATE POLICY "Public read users"          ON users FOR SELECT USING (true);
CREATE POLICY "Users edit own profile"     ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Tournaments: public read, auth insert, owner edit
CREATE POLICY "Public read tournaments"    ON tournaments FOR SELECT USING (true);
CREATE POLICY "Auth insert tournaments"    ON tournaments FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owner update tournaments"   ON tournaments FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Owner delete tournaments"   ON tournaments FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Reviews: public read, auth insert, owner edit
CREATE POLICY "Public read reviews"        ON team_reviews FOR SELECT USING (true);
CREATE POLICY "Auth insert reviews"        ON team_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update reviews"       ON team_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner delete reviews"       ON team_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Known routes: public read, admin write
CREATE POLICY "Public read routes"         ON known_routes FOR SELECT USING (true);
CREATE POLICY "Auth add community tips"    ON known_routes FOR UPDATE TO authenticated USING (true);

-- Trip plans: private to owner
CREATE POLICY "Owner read trip plans"      ON trip_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner insert trip plans"    ON trip_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete trip plans"    ON trip_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── SEED: TOURNAMENTS ─────────────────────────────────────
INSERT INTO tournaments (name, sport, country, city, flag, start_date, end_date, age_groups, entry_fee_usd, entry_fee, visa_notes, description, level, total_teams) VALUES
('Sarajevo Open Boxing Championship','Boxing','Bosnia & Herzegovina','Sarajevo','🇧🇦','2025-03-14','2025-03-18',ARRAY['Youth (15-17)','Junior (18-22)'],195,'€180 per boxer','Schengen visa NOT required for most EU passport holders. UK nationals: visa-free for 90 days. US nationals: visa-free. Samoan passport: Schengen visa required — apply 8 weeks in advance through German or Austrian embassy.','One of the Balkans'' most celebrated amateur boxing tournaments, held in the historic Zetra Olympic Hall.','International',24),
('Sofia International Boxing Cup','Boxing','Bulgaria','Sofia','🇧🇬','2025-05-08','2025-05-12',ARRAY['Youth (15-17)','Junior (18-22)','Senior (23-40)'],165,'€150 per boxer','Bulgaria is EU but NOT yet Schengen. EU/EEA nationals: ID card sufficient. UK nationals: passport required, visa-free 90 days. Samoan passport: visa-free for Bulgaria specifically (not Schengen).','Annual cup hosted by the Bulgarian Boxing Federation at the National Sports Palace.','International',18),
('Belgrade Golden Gloves','Boxing','Serbia','Belgrade','🇷🇸','2025-07-22','2025-07-27',ARRAY['Junior (18-22)','Senior (23-40)'],215,'€200 per boxer','Serbia is NOT in the EU or Schengen. Most Western passports: visa-free 90 days. Samoan passport: visa-free for Serbia — no issues.','The premier summer boxing tournament in the Western Balkans. Held at Hala Pionir arena.','Elite International',32),
('Zagreb Croatia Boxing Classic','Boxing','Croatia','Zagreb','🇭🇷','2025-09-19','2025-09-22',ARRAY['Youth (15-17)'],140,'€130 per boxer','Croatia IS in Schengen since 2023. Samoan passport: Schengen visa required — apply through Croatian embassy.','Youth-focused tournament run by the Croatian Boxing Association.','Regional',14),
('Warsaw Winter Boxing Cup','Boxing','Poland','Warsaw','🇵🇱','2025-11-07','2025-11-10',ARRAY['Junior (18-22)','Senior (23-40)'],175,'€160 per boxer','Poland is in Schengen. Samoan passport: Schengen visa required — apply 8 weeks in advance.','Late-season European circuit at Legia Warsaw Sports Centre.','International',20);

-- ── SEED: KNOWN ROUTES ────────────────────────────────────
INSERT INTO known_routes (departure_region, departure_country, destination_city, destination_country, transit_hubs, airlines, avg_cost_usd, cost_range_min, cost_range_max, flight_hours, passport_restrictions, visa_notes, tips) VALUES

-- Pacific → Europe via Singapore
('Pacific Islands','Samoa','Multiple European Cities','Europe (via Singapore)',
 ARRAY['Singapore (SIN)'],
 ARRAY['Samoa Airways to AKL/SYD','Singapore Airlines','Lufthansa','Turkish Airlines'],
 1650, 1200, 2200, '24-30 hours total',
 ARRAY['Samoan passport requires Schengen visa for most of Europe'],
 'Samoan passport holders need a Schengen visa for most of Europe (except Bulgaria, Serbia, Kosovo). Apply 8-10 weeks in advance through the nearest embassy. Singapore transit: visa-free for Samoan passports under 96hrs.',
 'Singapore Airlines via SIN is the most reliable Pacific-Europe routing. Book 3-4 months out. Budget €200-300 for Schengen visa application. Serbia, Bosnia and Bulgaria are Schengen-free alternatives.'),

-- Pacific → Europe via Dubai
('Pacific Islands','Samoa','Multiple European Cities','Europe (via Dubai)',
 ARRAY['Dubai (DXB)'],
 ARRAY['Fiji Airways to SYD/MEL','Emirates'],
 1550, 1100, 2100, '26-32 hours total',
 ARRAY['Samoan passport requires Schengen visa for most of Europe','UAE transit visa may be required — verify'],
 'Samoan passport holders: check UAE transit visa requirements before booking. Emirates may require transit visa for Samoan passport — contact airline directly. Schengen visa still required for Europe.',
 'Emirates via Dubai is often the cheapest option. Check transit visa requirements carefully. Good baggage allowance for sports equipment — 30kg checked on most fares.'),

-- Pacific → Europe via Istanbul
('Pacific Islands','Samoa','Multiple European Cities','Europe (via Istanbul)',
 ARRAY['Istanbul (IST)'],
 ARRAY['Fiji Airways to AKL','Turkish Airlines'],
 1400, 950, 1900, '26-34 hours total',
 ARRAY['Samoan passport: Turkey visa on arrival available','Schengen visa required for EU destinations'],
 'Turkish Airlines offers e-visa for Samoan passport holders to transit Turkey (around $50 USD). Serbia and Bosnia do NOT require Schengen visa — ideal for Samoan passport holders. Good prices via Turkish Airlines.',
 'Turkish Airlines via IST is often the best value. For Samoan passport holders, Serbia (Belgrade Golden Gloves) and Bosnia (Sarajevo Open) are ideal — no Schengen visa needed. Istanbul layover can be long — Turkish Airlines lounge access on business class.'),

-- Pacific → Europe via Doha
('Pacific Islands','Samoa','Multiple European Cities','Europe (via Doha)',
 ARRAY['Doha (DOH)'],
 ARRAY['Fiji Airways to SYD','Qatar Airways'],
 1500, 1050, 2000, '26-32 hours total',
 ARRAY['Samoan passport: Qatar transit visa-free under 24hrs','Schengen visa required for EU'],
 'Qatar Airways offers transit visa-free for Samoan passports under 24hrs. Excellent service, good equipment allowance. Schengen visa still required for EU countries.',
 'Qatar Airways via DOH is premium quality at mid-range price. Business class upgrades worthwhile for long haul. Doha airport is excellent for long layovers. Book well in advance for group discounts.'),

-- Pacific → USA via Fiji
('Pacific Islands','Samoa','Los Angeles','United States (via Fiji)',
 ARRAY['Nadi (NAN)'],
 ARRAY['Samoa Airways','Fiji Airways'],
 1100, 750, 1600, '14-18 hours total',
 ARRAY['Samoan passport: US visa required (B1/B2 or athlete visa)','US visa processing can take 8-12 weeks'],
 'Samoan passport holders need a US visa for USA travel. B1/B2 tourist visa or P1 athlete visa. Apply at US Embassy in Apia. Processing time 8-12 weeks. US visa interview required.',
 'Fiji Airways via NAN is the standard Pacific-USA route. Apply for US visa as early as possible — minimum 3 months lead time. Fiji Airways has reasonable group rates. Samoa Airways connects to NAN.'),

-- Pacific → USA via Auckland
('Pacific Islands','Samoa','Los Angeles','United States (via Auckland)',
 ARRAY['Auckland (AKL)'],
 ARRAY['Samoa Airways','Air New Zealand'],
 1200, 850, 1750, '16-20 hours total',
 ARRAY['Samoan passport: US visa required','New Zealand transit: NZeTA required for Samoan passport ($17 NZD)'],
 'NZeTA (Electronic Travel Authority) required for Samoa passport to transit NZ — apply online, $17 NZD, takes 72hrs. US visa still required for USA entry.',
 'Air New Zealand via AKL offers excellent service. NZeTA is cheap and easy to get online. Good option if Fiji routing is full. Air NZ has good group booking policies.'),

-- Pacific → USA via Sydney
('Pacific Islands','Samoa','Los Angeles','United States (via Sydney)',
 ARRAY['Sydney (SYD)'],
 ARRAY['Samoa Airways','Qantas','United Airlines'],
 1300, 900, 1850, '18-22 hours total',
 ARRAY['Samoan passport: Australian transit visa required (free, online)','US visa required'],
 'Australian transit visa required for Samoan passport — apply online for free, takes 1-5 days. Then US visa required for final destination.',
 'Qantas via SYD is reliable but pricier. Australian transit visa is free and quick online. Good option for flexibility. Sydney airport has long transits so plan accordingly.');

-- ── SEED: SAMPLE TEAM REVIEWS ────────────────────────────
-- (These will be linked to tournament IDs 1-5 from seed above)
-- Run after inserting tournaments and confirming their IDs

INSERT INTO team_reviews (tournament_id, team_name, country, flag, coach, accommodation, total_cost_per_person_usd, total_cost_per_person, flight_route, tips, rating, date_attended) VALUES
(1, 'Dublin BC', 'Ireland', '🇮🇪', 'Paddy Doyle', 'Hotel Central Sarajevo — €45/night, 10 min walk to venue', 670, '€620', 'Dublin → Vienna (Ryanair) → Sarajevo (Austrian Air) — approx €160 return', 'Book flights 3 months out. Weigh-in is strict — bring your own scales. Venue has no café so pack snacks.', 5, 'March 2024'),
(1, 'Glasgow Caledonian ABC', 'Scotland', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Steven Reid', 'Hostel City Center — €28/night, basic but clean', 530, '€490', 'Glasgow → London Heathrow → Sarajevo — approx €195 return', 'Fantastic atmosphere. Sarajevo taxis are cash only. Sponsors provide free airport transport if you register on time.', 4, 'March 2024'),
(2, 'Kronk Gym UK', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Marcus Bell', 'Radisson Blu — €90/night', 845, '€780', 'London Heathrow → Sofia (British Airways) — approx €210 return', 'Excellent organisation. Metro is cheap and runs to the venue. Bring euros — many places don''t take card.', 5, 'May 2024'),
(3, 'Berlin Boxring eV', 'Germany', '🇩🇪', 'Klaus Müller', 'Mama Shelter Belgrade — €65/night', 585, '€540', 'Berlin Brandenburg → Belgrade (Air Serbia) — approx €120 return', 'Air Serbia flies direct from many European hubs. Serbian dinars needed — exchange at airport. July heat can affect weight management.', 5, 'July 2024'),
(3, 'Lyon Boxe Club', 'France', '🇫🇷', 'Antoine Beaumont', 'Hotel Metropol — €55/night, 15 min to arena', 660, '€610', 'Lyon → Belgrade via Vienna — approx €180 return', 'One of the best tournaments in Europe. AIBA certified officials. Belgrade nightlife is legendary — manage your boxers the night before bouts!', 4, 'July 2024'),
(4, 'Swansea ABC', 'Wales', '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Gareth Evans', 'Hostel Bureau Zagreb — €22/night, excellent and central', 425, '€390', 'Bristol → Zagreb (Wizz Air) — approx €85 return', 'Perfect first international for youth teams. Zagreb is stunning and safe. Bring your own wraps.', 5, 'September 2024'),
(5, 'Northside BC Dublin', 'Ireland', '🇮🇪', 'Jim Connolly', 'ibis Budget Warsaw Centre — €38/night', 550, '€510', 'Dublin → Warsaw (Ryanair) — approx €90 return, direct', 'November is cold — pack thermals. Warsaw is brilliant value. Polish food is hearty and perfect for fighters.', 4, 'November 2024');
