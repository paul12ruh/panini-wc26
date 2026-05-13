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

Note: `README.md` still describes the app as browser-only/no backend, but the current code includes Supabase sign-in and cloud sync.

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
- Sub-agents should commit their own completed work frequently with focused commit messages.
- The orchestrator should inspect sub-agent results before continuing, resolve integration issues, and make follow-up commits as needed.
- Do not leave unrelated local edits mixed into task commits. If unrelated changes already exist, preserve them and work around them.
- At the end of every session, the orchestrator pushes the completed session branch after confirming the working tree and test/build status.

## Commit Principles

- Commit after each coherent task or checkpoint, not only at the end.
- Keep commits small enough to review and revert independently.
- Prefer messages in the form `area: concise change summary`, for example `album: improve sticker controls`.
- Run relevant checks before committing when practical. For broad UI changes, prefer at least `npm run build`; for logic changes, also run `npm run lint`.
- If a check cannot run, record that in the handoff or final session summary.

## Codebase Preferences

- Follow existing React function component and hook patterns.
- Keep collection records shaped as `{ [stickerId]: { qty, rarity } }` unless a migration is intentionally planned.
- Use `SECTIONS`, `ALL_STICKERS`, and `TOTAL` from `src/data/stickers.js` rather than duplicating sticker metadata.
- Preserve both local persistence and Supabase sync behavior when changing collection logic.
- Keep UI changes consistent with the current compact dashboard/album tool style.
- Avoid broad refactors unless they are necessary for the requested task.
