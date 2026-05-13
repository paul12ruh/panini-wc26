# TODO

Persistent task list for the Panini WC26 tracker. Update this file whenever a task is added, started, or finished. Source of truth across Claude / Codex / browser sessions.

## Format

Each item: `- [ ] [owner] short title — details`
Mark done by flipping `[ ]` → `[x]` and moving under "## Done" with the completion date.

Owners:
- **user** — only Paul can do this (dashboard click, credit card, external account)
- **dev** — code or repo work (Claude, Codex, or Paul in editor)
- **future** — parking lot, not actively planned

## Open

- [ ] [dev] Harden collection data validation — normalize localStorage/import/cloud data to known sticker IDs, valid quantities, and supported rarities
- [ ] [dev] Improve sync error visibility and conflict handling — surface Supabase save/load failures and avoid silently overwriting newer local changes on sign-in
- [ ] [dev] Tighten voice input parsing — avoid matching short team aliases inside unrelated words or phrases
- [ ] [user] Identify the "00" sticker — figure out what the sticker numbered 00 (appears before FWC-1) actually shows on its face, so it can be added to `src/data/stickers.js`
- [ ] [future] Native iPhone app for voice input — Web Speech API doesn't work on iOS Safari. Separate React Native / Expo project that reads/writes the same Supabase `collections` table via the user's session

## Done

- [x] 2026-05-13 — Add Album empty state for search/filter misses
- [x] 2026-05-13 — Fix sticker edit popover edge cases: stale quantity controls, modal accessibility, and owned-click behavior
- [x] 2026-05-13 — Fix top navigation cropping in smaller browser windows
- [x] 2026-05-13 — Extensive UX/test audit fixes: lint config, keyboard access for clickable tiles/sections, mobile/touch edit controls, clipboard error states, mobile nav sign-out layout, and sync reset on sign-out
- [x] 2026-05-13 — Google OAuth: create Client ID in Google Cloud Console
- [x] 2026-05-13 — Google OAuth: enable Google provider in Supabase
- [x] 2026-05-13 — Verify Vercel env vars match new Supabase project (confirmed via prod bundle inspection)
