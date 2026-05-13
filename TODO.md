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

- [ ] [user] Identify the "00" sticker — figure out what the sticker numbered 00 (appears before FWC-1) actually shows on its face, so it can be added to `src/data/stickers.js`
- [ ] [future] Native iPhone app for voice input — Web Speech API doesn't work on iOS Safari. Separate React Native / Expo project that reads/writes the same Supabase `collections` table via the user's session

## Done

- [x] 2026-05-13 — Google OAuth: create Client ID in Google Cloud Console
- [x] 2026-05-13 — Google OAuth: enable Google provider in Supabase
- [x] 2026-05-13 — Verify Vercel env vars match new Supabase project (confirmed via prod bundle inspection)
