# Panini WC26 Sticker Tracker

A personal web app for tracking a physical Panini FIFA World Cup 2026 sticker album.

## What it is

This app mirrors the structure of the Panini FIFA World Cup 2026 sticker album. Sign in with Google or an email magic link, mark stickers as collected, track duplicates for trading, tag frame variants, and review what is still missing.

Collection changes are saved immediately in the browser as a local cache, then synced to Supabase for signed-in users. Supabase is the cross-device source of truth after sign-in; the local cache keeps the app responsive and preserves edits if cloud sync is temporarily unavailable.

## Features

### Dashboard
- Overall completion percentage with a progress bar
- Section and team completion heatmap
- Sort completion by group, A-Z, or percent complete
- Most-complete and needs-attention lists
- Counts for owned stickers, missing stickers, duplicates, and rare parallels

### Album
- Full album view organized by introduction sections and national teams
- Search by sticker ID, player name, section, or team name
- Filter by confederation or introduction sections
- Expand/collapse individual sections or all filtered sections
- Click a sticker to mark it owned
- Edit owned stickers to adjust quantity and rarity

### Sticker controls
- Quantity controls for duplicates
- Rarity variants: Base, Blue, Red, Purple, Green, and Black
- One-tap unmark action

### Missing list
- Full list of unowned stickers grouped by section
- Copy a formatted missing list to the clipboard
- Export missing stickers as `missing-stickers.txt`

### Duplicates / trade list
- All stickers with quantity greater than 1, grouped by section
- Extra duplicate count per sticker
- Rarity indicators for non-base duplicates
- Copy a formatted trade list to the clipboard

### Stats
- Foil and parallel rarity breakdown
- Completion totals by confederation

### Read-only sharing
- Create a revocable public share link from Tools
- Share links show current synced progress without requiring sign-in
- Viewers can inspect progress, missing stickers, duplicates, and stats but cannot edit

### Voice input
- Browser speech-recognition shortcut for marking stickers by saying a team and number, such as "France 7"
- Duplicate guard with undo toast after marking

### Authentication and sync
- Google sign-in
- Email magic-link sign-in
- Supabase-backed cloud sync through a `collections` table
- Local browser cache under the `localStorage` keys `panini-wc2026` and `panini-wc2026:meta`

## Tech stack

| Layer | Library / tool |
|---|---|
| UI framework | React 18 |
| Build tool | Vite 5 |
| Auth / backend | Supabase |
| Charts | Recharts |
| Local cache | `localStorage` |
| Linting | ESLint 9 |

## Getting started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set the Supabase values in `.env`:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENABLE_DEV_AUTH=false
```

For local authenticated UI smoke testing without a real Supabase session, set `VITE_ENABLE_DEV_AUTH=true` in `.env` and restart `npm run dev`. This is dev-only, uses local cache only, and does not sync the mock user to Supabase.

Run browser smoke tests with:

```bash
npm run test:smoke
```

The current smoke coverage includes the public read-only share route, Album tab browsing, team expansion, sticker inventory viewing, and a check that viewer mode does not expose sticker edit controls.

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` creates a production build.
- `npm run lint` runs ESLint.
- `npm run preview` serves the production build locally.

## Deployment

The app is deployed on Vercel at https://panini-wc26-one.vercel.app — auto-deploys on push to `main`, feature branches get preview URLs. Source repo: https://github.com/paul12ruh/panini-wc26.

The backend is a Supabase project (ref `wjnttgjbcttabpjzamoh`) with Google OAuth + email magic link enabled and a `collections` table (RLS scoped to `auth.uid()`).

Read-only public share links require the `collection_shares` migration and RPCs in `supabase/migrations/202605140001_read_only_share_links.sql`. Public viewers read through a narrow RPC keyed by an enabled share slug; the `collections` table should remain private under RLS. If `generate_share_slug()` fails on Supabase with `gen_random_bytes(integer) does not exist`, apply `supabase/migrations/202605140002_fix_share_slug_pgcrypto_schema.sql`.

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set in both `.env` (local) and Vercel → Project Settings → Environment Variables.

Recommended workflow:

- Keep production deployments tied to the production branch, normally `main`.
- Do changes on feature, fix, or experiment branches.
- Push branches to Vercel preview deployments and test the preview URL before merging.
- Merge to the production branch only after the branch is reviewed and checks have run.
- Use separate preview/production Supabase configuration if a change could affect real collection data.

## Data persistence

Collection data is cached locally in the browser and synced to Supabase after sign-in.

On first sign-in, the app compares the local cache timestamp with the user's Supabase collection timestamp. If no cloud record exists, the current local collection is inserted as the starting cloud record. If both exist, the newer copy wins. Later collection changes are debounced for about two seconds and upserted to Supabase.

Signed-in devices should converge through Supabase when they use the same account. An already-open second device refreshes from cloud when the tab/window regains focus or becomes visible again; this is not a live multiplayer stream, so allow the save indicator to finish or refocus/reload the other device before comparing.

Clearing browser data can remove the local cache, but a signed-in user can restore from the Supabase record on the next load.

## Shared Albums Plan

The current production sync model is one collection per signed-in user: `collections.user_id` is scoped by RLS to `auth.uid()`. Shared collecting should be added as an album-based model rather than by sharing a password or bypassing RLS.

Planned backend shape:

```sql
albums (
  id uuid primary key,
  name text not null,
  owner_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
)

album_members (
  album_id uuid references albums(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (album_id, user_id)
)

collections (
  album_id uuid primary key references albums(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
)
```

RLS should allow users to read/write collections only when they are members of the album, with writes limited to `owner` and `editor`. The existing personal collection can become the user's first private album during migration.

For shared editing, whole-document saves are acceptable for the first implementation but are not ideal for simultaneous edits. A later activity/event model can store per-sticker mutations so two collaborators do not overwrite nearby changes.

## Mobile web

The current phone experience is the responsive web app. Under narrow widths, the top navigation becomes a bottom tab bar, the dashboard collapses to one column, and sticker grids use smaller columns for thumb-friendly browsing.

Voice input is hidden on mobile because iOS Safari does not support the Web Speech API used by the browser voice shortcut. Use the Album tab, Missing tab, and future mobile quick-add flow for phone entry. Signed-in phone sessions sync through Supabase the same way desktop sessions do.
