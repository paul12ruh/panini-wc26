# Panini WC26 Sticker Tracker

A personal web app for tracking a physical Panini FIFA World Cup 2026 sticker album.

## What it is

This app mirrors the structure of the Panini FIFA World Cup 2026 sticker album. Sign in with Google or an email magic link, mark stickers as collected, track duplicates for trading, tag frame variants, and review what is still missing.

Collection changes are saved locally in the browser and synced to Supabase for signed-in users.

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

### Voice input
- Browser speech-recognition shortcut for marking stickers by saying a team and number, such as "France 7"
- Duplicate guard with undo toast after marking

### Authentication and sync
- Google sign-in
- Email magic-link sign-in
- Supabase-backed cloud sync through a `collections` table
- Local `localStorage` persistence under the key `panini-wc2026`

## Tech stack

| Layer | Library / tool |
|---|---|
| UI framework | React 18 |
| Build tool | Vite 5 |
| Auth / backend | Supabase |
| Charts | Recharts |
| Local persistence | `localStorage` |
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
```

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

## Data persistence

Collection data is stored locally in the browser and synced to Supabase after sign-in.

On first sign-in, the app attempts to load the user's Supabase collection. If no cloud record exists, the current local collection is inserted as the starting cloud record. Later collection changes are debounced and upserted to Supabase.

Clearing browser data can remove the local copy, but a signed-in user can restore from the Supabase record on the next load.
