# Codex Operating Notes

## Project Snapshot

This is a Vite + React app for tracking a Panini FIFA World Cup 2026 sticker album.

- Entry point: `src/main.jsx` renders `src/App.jsx`.
- App shell: `src/App.jsx` owns page routing state, auth gating, collection state, and sync wiring.
- Pages: `src/pages/` contains Dashboard, Album, Missing, Duplicates, and Stats views.
- Components: `src/components/` contains the nav, auth gate, sticker slot controls, and voice input.
- Data: `src/data/stickers.js` defines sections, teams, stickers, and totals used throughout the UI.
- State: `src/hooks/useCollection.js` persists collection data in `localStorage` under `panini-wc2026`.
- Auth and sync: `src/hooks/useAuth.js`, `src/hooks/useSync.js`, and `src/lib/supabase.js` use Supabase via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Hosting: production is deployed on Vercel. No Vercel project metadata is committed in this repo.

## Infrastructure

- Production URL: https://panini-wc26-one.vercel.app
- GitHub repo: https://github.com/paul12ruh/panini-wc26
- Hosting: Vercel — auto-deploys on push to `main`, branches get preview URLs
- Backend: Supabase project ref `wjnttgjbcttabpjzamoh` (URL: https://wjnttgjbcttabpjzamoh.supabase.co)
- Auth providers enabled: Google OAuth + Email magic link
- Database: current production table is `collections` (user_id uuid PK → auth.users, data jsonb, updated_at timestamptz) with RLS policy `auth.uid() = user_id`; shared album migration SQL lives in `supabase/migrations/`
- Env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set in both `.env` (local) and Vercel → Project Settings → Environment Variables

## Common Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production assets: `npm run build`
- Lint: `npm run lint`
- Preview production build: `npm run preview`

## Operating Model

Use one orchestrator agent as the owner of each session.

- The orchestrator keeps the overall task list, decides sequencing, reviews work, integrates changes, and owns the final push.
- Spawn sub-agents for bounded implementation, investigation, or verification tasks when work can proceed in parallel.
- Give each sub-agent a clear responsibility and file/module ownership to avoid overlapping edits.
- **Sub-agents must work on a separate branch.** Never run a sub-agent that commits directly to `main`. Use git worktrees or feature branches so the orchestrator can review before merging.
- Sub-agents must commit their own work frequently with focused commit messages — small, frequent commits over big batches.
- The orchestrator should inspect sub-agent results before continuing, resolve integration issues, and make follow-up commits as needed.
- Do not leave unrelated local edits mixed into task commits. If unrelated changes already exist, preserve them and work around them.
- At the end of every session, the orchestrator pushes the completed session branch after confirming the working tree and test/build status.

## Branching and Vercel Deployments

- Treat `main` as the production branch unless the Vercel project is configured differently.
- Do risky or exploratory work on a named branch such as `feature/album-controls`, `fix/sync-race`, or `experiment/voice-input`.
- Push feature branches to get Vercel preview deployments. Test the preview URL before merging to production.
- Merge to the production branch only after the branch has been reviewed and the relevant checks have run.
- Keep production and preview environment variables aligned enough to test real flows, but use separate Supabase projects or tables if a change could corrupt production data.
- The orchestrator owns the final merge/push decision. Worker agents can commit and push branches, but should not merge to production without explicit instruction.

## Autonomous QA and Debugging

When asked to let agents test and improve the app, use a bounded QA mission rather than an open-ended rewrite.

- Start from a clean branch.
- Run `npm run dev` and exercise the app in a browser, preferably with desktop and mobile viewport checks.
- Inspect console errors, broken flows, layout issues, auth/sync behavior, and build/lint failures.
- Spawn focused sub-agents when useful, for example visual QA, state/sync review, auth flow review, or lint/build cleanup.
- Ask each sub-agent to commit focused fixes and report changed files, remaining risks, and checks run.
- The orchestrator reviews the commits, resolves integration issues, runs final checks, and pushes the branch for Vercel preview.

## Task Tracking

`TODO.md` at repo root is the canonical task list. Read it at the start of each session and update it whenever a task is added, started, or completed. Do not rely on in-tool task trackers — they do not persist across sessions or between Codex and Claude.

## Commit Principles

- Commit after each coherent task or checkpoint, not only at the end.
- Keep commits small enough to review and revert independently.
- Prefer messages in the form `area: concise change summary`, for example `album: improve sticker controls`.
- Run relevant checks before committing when practical. For broad UI changes, prefer at least `npm run build`; for logic changes, also run `npm run lint`.
- If a check cannot run, record that in the handoff or final session summary.

## Working With Codex and Claude Code

- Use Git as the shared coordination layer between tools.
- Keep handoffs clean: check `git status`, commit coherent work, and push before switching tools when practical.
- Put durable instructions in repo files such as `CODEX.md` and `CLAUDE.md` so both tools have the same operating context.
- Avoid running two independent orchestrators on the same branch at the same time.
- If multiple agents are active, assign file or module ownership up front and keep their commits small.
- Pull or rebase before starting a new session if another tool has pushed changes.
- Resolve conflicts manually and preserve user work; do not reset or overwrite unrelated edits.

## Codebase Preferences

- Follow existing React function component and hook patterns.
- Collection records are shaped as `{ [stickerId]: { qty, rarity, variants } }`, where `qty` is total owned, `rarity` is the highest owned color for display, and `variants` stores base/blue/red/purple/green/black quantities.
- Use `SECTIONS`, `ALL_STICKERS`, and `TOTAL` from `src/data/stickers.js` rather than duplicating sticker metadata.
- Preserve both local persistence and Supabase sync behavior when changing collection logic.
- Keep UI changes consistent with the current compact dashboard/album tool style.
- Avoid broad refactors unless they are necessary for the requested task.
