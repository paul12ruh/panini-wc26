# Claude Code Operating Notes

## Project Snapshot

Vite + React app for tracking a Panini FIFA World Cup 2026 sticker album.

- Entry: `src/main.jsx` → `src/App.jsx`
- App shell: `src/App.jsx` owns page routing, auth gating, collection state, sync wiring, and the heatmap sort
- Pages: `src/pages/` — Dashboard, Album, Missing, Duplicates, Stats
- Components: `src/components/` — NavBar, AuthGate, StickerSlot, VoiceInput
- Data: `src/data/stickers.js` — SECTIONS (teams + intros), TEAMS, GROUPS, CONFEDERATIONS, TOTAL
- Collection state: `src/hooks/useCollection.js` — persists to `localStorage` under `panini-wc2026`
- Auth + cloud sync: `src/hooks/useAuth.js`, `src/hooks/useSync.js`, `src/lib/supabase.js` — Supabase via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Deploy: Vercel, auto-deploys on push to `main` (see Infrastructure below)

## Infrastructure

| Thing | Value |
|---|---|
| Production URL | https://panini-wc26-one.vercel.app |
| GitHub repo | https://github.com/paul12ruh/panini-wc26 |
| Hosting | Vercel — auto-deploys on push to `main`, branches get preview URLs |
| Backend | Supabase project ref `wjnttgjbcttabpjzamoh` |
| Supabase URL | https://wjnttgjbcttabpjzamoh.supabase.co |
| Auth providers enabled | Google OAuth + Email magic link |
| Database table | `collections` (user_id uuid PK → auth.users, data jsonb, updated_at timestamptz) with Row Level Security: `auth.uid() = user_id` |

**Env vars** — must be set identically in `.env` (local) and Vercel → Project Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (publishable key in `sb_publishable_...` format — safe for client; RLS protects data)

To verify Vercel env vars without dashboard access:
```bash
curl -s https://panini-wc26-one.vercel.app/ | grep -oE 'assets/[^"]+\.js' | head -1
# then curl that JS bundle and grep for the supabase URL/key — they're inlined by Vite
```

To verify Supabase auth providers without dashboard access:
```bash
curl -s "https://wjnttgjbcttabpjzamoh.supabase.co/auth/v1/settings" -H "apikey: <anon key>" | python3 -m json.tool
```

## Common Commands

- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Preview prod build: `npm run preview`

## Operating Model — Orchestrator + Sub-agents

Paul works as the product owner. The active Claude Code session is the **orchestrator / tech lead**, not the implementer.

- Orchestrator owns: task list, sequencing, reviewing diffs, integration, the final push
- Spawn sub-agents (via the Agent tool) for bounded implementation, investigation, or parallel work
- Each sub-agent gets a clear responsibility and ideally non-overlapping file ownership
- **Sub-agents must work on a separate branch.** Use the Agent tool's `isolation: "worktree"` parameter — it creates an isolated git worktree on a temp branch, so the sub-agent's commits never land on `main` until the orchestrator reviews and merges them
- **Sub-agents must commit their own work** — always include "commit your changes with a focused message before finishing" in the agent prompt
- After a sub-agent finishes, orchestrator: (1) reviews the diff, (2) merges the branch into `main` only if it passes review, (3) deletes the temp branch
- Don't mix unrelated local edits into a task commit
- At end of session, orchestrator pushes after confirming working tree is clean

Paul prefers the orchestrator stay hands-off on large implementations — delegate, don't dive in. Small fixes (1-2 file edits) are fine to do directly on `main`.

## Commit Principles

- **Commit frequently** — after every coherent change, not at the end of a long stretch. Paul has called this out explicitly: small, frequent, focused commits over big batched ones
- Each commit should be small enough to review and revert independently
- Message form: `area: concise change summary` (e.g. `album: improve sticker controls`)
- `git add -A` is risky here — there may be untracked files from other tools (CODEX.md, etc). Prefer `git add <specific files>` or check `git status` first
- Never commit `.env` (gitignored)
- Don't push without explicit ask

## Task Tracking

**`TODO.md` at repo root is the source of truth for open work.** Always read it at the start of a session, and update it whenever a task is added, started, or completed. Do not use the TaskCreate tool — it doesn't survive across sessions or tools (Codex can't see it). Mark items done by flipping `[ ]` to `[x]` and moving under the `## Done` section with a date.

## Branch Hygiene

- Orchestrator's small fixes: directly on `main` is fine, push when asked
- Sub-agent work: **always on a separate branch** (worktree isolation), merged into `main` only after orchestrator review
- Never let two parallel sub-agents touch the same files — assign non-overlapping file ownership per task
- If a sub-agent branch fails review, the branch stays unmerged; fix-up or discard rather than force-merging

## Codebase Preferences

- Function components + hooks; no class components
- Collection record shape: `{ [stickerId]: { qty, rarity } }` — don't change without migration plan
- Use `SECTIONS`, `ALL_STICKERS`, `TOTAL` from `src/data/stickers.js`; don't duplicate sticker metadata
- Any change to collection logic must preserve both localStorage persistence and Supabase sync
- UI style: dark glass morphism, compact, CSS variables in `src/index.css` `:root`
- Rarity tiers: `base`, `blue`, `red`, `purple`, `green`, `black` — color-only in the UI, no text labels on tiles
- Avoid broad refactors unless required by the task

## Known Coordination

- `CODEX.md` exists for the OpenAI Codex CLI when Paul falls back to it during Claude rate limits. Keep both files roughly in sync if making structural changes
- `README.md` may lag behind reality (still mentions browser-only). Update if the change is user-facing
