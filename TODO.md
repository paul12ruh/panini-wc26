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

- [ ] [dev] Add shared album database migration — create `albums`, `album_members`, invite support, and RLS policies so multiple users can read/write one collection
- [ ] [dev] Add shared album selector and invite UI — let users create/switch albums, invite collaborators, and view member roles
- [ ] [dev] Migrate personal collection sync to album-based sync — move from `collections.user_id` ownership to `collections.album_id`, preserving existing personal data
- [ ] [dev] Add shared edit conflict/activity handling — avoid whole-collection overwrite issues when multiple collaborators edit close together
- [ ] [dev] Add mobile quick-add mode — create a phone-first flow for rapidly entering team/number stickers without relying on browser voice support
- [ ] [dev] Add pack-opening session mode — let the user enter a batch of new stickers, review duplicates/new hits, then commit the pack
- [ ] [dev] Add trade/share mode — generate a clean shareable missing/duplicates view for trading with other collectors
- [ ] [dev] Add recent activity and undo history — show recent sticker changes and allow reverting more than the current voice undo toast
- [ ] [dev] Add collection insights — show useful “cool stats” such as hardest-hit teams, duplicate concentration, variant counts, and progress trends
- [ ] [future] Native iPhone app for voice input — Web Speech API doesn't work on iOS Safari. Separate React Native / Expo project that reads/writes the same Supabase `collections` table via the user's session

## Done

- [x] 2026-05-13 — Track per-sticker color variants while keeping duplicate counts based on total quantity
- [x] 2026-05-13 — Review phone web UX and document current mobile behavior
- [x] 2026-05-13 — Add cool feature ideas backlog
- [x] 2026-05-13 — Verify and clarify cross-device autosave/backup behavior
- [x] 2026-05-13 — Extend voice input to recognize sticker/player names
- [x] 2026-05-13 — Add voice input instructions and color parsing
- [x] 2026-05-13 — Change Album filters from confederations to groups
- [x] 2026-05-13 — Add confederation view to Stats
- [x] 2026-05-13 — Add normal sticker 00 before FWC-1
- [x] 2026-05-13 — Improve sync error visibility and conflict handling
- [x] 2026-05-13 — Harden collection data validation for local cache, imports, and cloud payloads
- [x] 2026-05-13 — Tighten voice input parsing to avoid short team alias substring matches
- [x] 2026-05-13 — Add Album empty state for search/filter misses
- [x] 2026-05-13 — Fix sticker edit popover edge cases: stale quantity controls, modal accessibility, and owned-click behavior
- [x] 2026-05-13 — Fix top navigation cropping in smaller browser windows
- [x] 2026-05-13 — Extensive UX/test audit fixes: lint config, keyboard access for clickable tiles/sections, mobile/touch edit controls, clipboard error states, mobile nav sign-out layout, and sync reset on sign-out
- [x] 2026-05-13 — Google OAuth: create Client ID in Google Cloud Console
- [x] 2026-05-13 — Google OAuth: enable Google provider in Supabase
- [x] 2026-05-13 — Verify Vercel env vars match new Supabase project (confirmed via prod bundle inspection)
