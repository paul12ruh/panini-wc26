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

- [ ] [dev] Add Playwright smoke tests for main flows — cover dev auth, dashboard, album edit, missing list, tools CSV export, and mobile viewport
- [ ] [future] Shared albums for collaborative collecting — use the planned album/member schema so multiple signed-in users can share one collection with roles, invites, and conflict-safe edits
- [ ] [future] Native iPhone app for voice input — Web Speech API doesn't work on iOS Safari. Separate React Native / Expo project that reads/writes the same Supabase `collections` table via the user's session

## Done

- [x] 2026-05-13 — Make voice confirmation toast navigate to the updated sticker
- [x] 2026-05-13 — Color duplicate chips by duplicated sticker variant
- [x] 2026-05-13 — Show exact unmatched entries after pack opening import
- [x] 2026-05-13 — Align dashboard side cards with Team Completion panel
- [x] 2026-05-13 — Replace default Vite link metadata with Panini WC26 site metadata
- [x] 2026-05-13 — Remove incorrect synthetic 00 sticker from album data
- [x] 2026-05-13 — Add CSV export to the trade sheet tools
- [x] 2026-05-13 — Simplify Missing tab rows to show only missing sticker IDs and names
- [x] 2026-05-13 — Clean up Tools page ordering and section demarcation
- [x] 2026-05-13 — Add collection insights
- [x] 2026-05-13 — Add recent activity and undo history
- [x] 2026-05-13 — Add trade/share mode
- [x] 2026-05-13 — Add pack-opening session mode
- [x] 2026-05-13 — Add mobile quick-add mode
- [x] 2026-05-13 — Track per-sticker color variants while keeping duplicate counts based on total quantity
- [x] 2026-05-13 — Review phone web UX and document current mobile behavior
- [x] 2026-05-13 — Add cool feature ideas backlog
- [x] 2026-05-13 — Verify and clarify cross-device autosave/backup behavior
- [x] 2026-05-13 — Extend voice input to recognize sticker/player names
- [x] 2026-05-13 — Add voice input instructions and color parsing
- [x] 2026-05-13 — Change Album filters from confederations to groups
- [x] 2026-05-13 — Add confederation view to Stats
- [x] 2026-05-13 — Investigate suspected 00 sticker before confirming it was the We Are Panini sticker
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
