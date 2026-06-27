# SportsTripz — Deployment Guide

> A tournament directory for travelling sports teams. Built with React + Vite + Supabase.  
> Zero cost to run on free tiers.

---

## What you need (all free)

| Service | Purpose | Cost |
|---|---|---|
| [GitHub](https://github.com) | Code hosting | Free |
| [Supabase](https://supabase.com) | Database + Auth | Free tier |
| [Vercel](https://vercel.com) | Hosting + deployment | Free tier |

---

## Step 1 — Set up Supabase (10 minutes)

### 1a. Create a project
1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **New project**
3. Name it `sportstripz`, choose a region close to your users, set a database password
4. Wait ~2 minutes for it to spin up

### 1b. Run the database schema
1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase/schema.sql` from this project
4. Paste the entire contents into the editor
5. Click **Run** — this creates your tables, security rules, and seed data

### 1c. Get your API keys
1. Go to **Settings → API** in your Supabase project
2. Copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## Step 2 — Set up the project locally (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env

# 3. Edit .env and paste your Supabase values:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key...

# 4. Run locally
npm run dev
# → Open http://localhost:5173
```

The app will load your real Supabase data. The 5 seeded tournaments should appear.

---

## Step 3 — Push to GitHub (5 minutes)

```bash
# In your project folder:
git init
git add .
git commit -m "Initial SportsTripz commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/sportstripz.git
git push -u origin main
```

---

## Step 4 — Deploy to Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com) and sign up / log in (use your GitHub account)
2. Click **Add New → Project**
3. Import your `sportstripz` GitHub repo
4. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Deploy**

Vercel will build and deploy. In ~2 minutes you'll have a live URL like `sportstripz.vercel.app`.

---

## Step 5 — Set up email auth in Supabase

By default, Supabase sends a confirmation email when coaches sign up.

### To configure the confirmation email:
1. Go to **Authentication → Email Templates** in Supabase
2. Customise the "Confirm signup" template with your branding if you want

### To allow sign-up without email confirmation (easier for early testing):
1. Go to **Authentication → Providers → Email**
2. Toggle off **"Enable email confirmations"**
3. Users can now sign up and immediately sign in

### Custom domain for emails (optional):
- Go to **Settings → Custom SMTP** and add your email provider (e.g. Resend, SendGrid)
- This makes confirmation emails come from `noreply@yourdomain.com` instead of Supabase

---

## Step 6 — Add a custom domain (optional)

In Vercel:
1. Go to your project → **Settings → Domains**
2. Add your domain (e.g. `sportstripz.com`)
3. Update your DNS records as instructed
4. Vercel handles HTTPS automatically

---

## App features

| Feature | Status |
|---|---|
| Tournament listings | ✅ Live |
| Filter by sport / country / month / age group | ✅ Live |
| Tournament detail page with visa notes | ✅ Live |
| Team reviews with cost / flight / tips | ✅ Live |
| Coach sign up + sign in | ✅ Live |
| Add new tournament (coaches only) | ✅ Live |
| Add review (coaches only) | ✅ Live |
| Mobile responsive | ✅ Live |
| Dark mode | ✅ Always on |

---

## How the app works without Supabase

If the `.env` file is missing or the Supabase keys are not set, the app automatically falls back to the 5 built-in mock tournaments. Everything still works — auth, filters, reviews — but nothing is saved. This is useful for demos.

---

## Database tables

### `tournaments`
| Column | Type | Description |
|---|---|---|
| id | bigint | Auto-generated primary key |
| name | text | Tournament name |
| sport | text | e.g. Boxing |
| country | text | Host country |
| city | text | Host city |
| flag | text | Country emoji flag |
| start_date | date | First day |
| end_date | date | Last day |
| age_groups | text[] | Array of age group strings |
| entry_fee | text | e.g. €180 per boxer |
| visa_notes | text | Entry requirements for travellers |
| description | text | About the tournament |
| level | text | Community / Regional / International / Elite |
| total_teams | integer | Expected team count |
| user_id | uuid | Coach who submitted it |

### `reviews`
| Column | Type | Description |
|---|---|---|
| id | bigint | Auto-generated primary key |
| tournament_id | bigint | Links to tournaments table |
| team_name | text | Club name |
| country | text | Where they're from |
| coach | text | Coach's name |
| accommodation | text | Where they stayed + cost |
| total_cost_per_person | text | All-in trip cost |
| flight_route | text | Route taken + approx fare |
| tips | text | Advice for other coaches |
| rating | integer | 1–5 stars |
| date_attended | text | e.g. "March 2024" |
| user_id | uuid | Who submitted the review |

---

## Next features to build

- [ ] **Admin moderation** — approve tournaments before they go live
- [ ] **Search** — full-text search across tournament names and cities
- [ ] **Map view** — see tournaments on a map of Europe
- [ ] **Email alerts** — coaches get notified of new tournaments matching their sport
- [ ] **User profiles** — coach profile pages with their reviews
- [ ] **Image uploads** — venue photos attached to tournaments
- [ ] **Sharing** — share a tournament listing via link
- [ ] **More sports** — Wrestling, Judo, Taekwondo, Kickboxing

---

## Tech stack

- **React 18** + **Vite** — fast build tooling
- **Supabase** — Postgres database + row-level security + auth
- **Vercel** — hosting with automatic deploys on every `git push`
- **Google Fonts** — Bebas Neue + Inter
- Zero paid services on the free tier
