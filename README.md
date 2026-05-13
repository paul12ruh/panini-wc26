# Panini WC26 Sticker Tracker

A personal web app for tracking your physical Panini FIFA World Cup 2026 sticker album.

## What it is

A browser-only tracker that mirrors the structure of the official Panini FIFA World Cup 2026 sticker album. Mark stickers as you collect them, log duplicates for trading, and keep a running list of what you still need — no account, no server, no internet connection required after the first load.

## Features

### Dashboard
- Overall completion percentage with a progress bar
- Per-team completion heatmap — click any team tile to jump directly to that section in the Album view
- Rarity breakdown: base stickers, foil stickers, blue-frame parallels, and green-frame parallels
- Most-complete and needs-attention team lists

### Album
- Full album view organized by section (introduction pages + all 48 national teams)
- Search by sticker ID, player name, or team name
- Filter by confederation (UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC) or introduction section
- Expand/collapse team sections individually, or expand/collapse all at once
- Click a sticker to mark it owned; click again to open the detail popover

### Sticker detail popover
- Quantity controls (increment/decrement) to record duplicates
- Frame variant selection: Base / Blue / Green
- One-tap unmark button

### Missing list
- Full list of unowned stickers grouped by section
- Copy to clipboard (plain text, grouped by team)
- Export as `missing-stickers.txt`

### Duplicates / trade list
- All stickers with quantity > 1, grouped by section, showing the extra count
- Copy to clipboard as a formatted trade list (e.g. `ARG14×2`)

### Import / Export
- Export your collection as a JSON file for backup or sharing
- Import a previously exported JSON file to restore your collection

## Tech stack

| Layer | Library / tool |
|---|---|
| UI framework | React 18 |
| Build tool | Vite 5 |
| Charts | Recharts |
| State persistence | `localStorage` (key: `panini-wc2026`) |
| Backend | None |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Data persistence

All collection data is stored in your browser's `localStorage`. Nothing is sent to any server. If you clear your browser data or switch browsers, your collection will be lost unless you export it first.

**To back up:** use the Export JSON button (available in the nav bar) to download `panini-wc2026-collection.json`. To restore on another browser or device, use the Import JSON button and select that file.
