# Live Read-Only Share Links Plan

Goal: let Paul create a revocable public link that shows current collection progress without requiring sign-in and without allowing edits.

## Scope

- Add live read-only share links for the current owner's collection.
- Public viewers can see progress, missing stickers, duplicates, and stats.
- Public viewers cannot mutate collection data or see private account details.
- Owner can create, copy, disable, and regenerate the share link.

## Data Model

Add a `collection_shares` table:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `slug text unique not null`
- `enabled boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

The share page reads the owner's existing `collections` row through an enabled share slug. It should not duplicate the collection payload unless we later add snapshots.

## Security

- Slugs must be random and unguessable.
- RLS should allow owners to manage only their own share rows.
- Public read access should expose only enabled share rows and the matching collection data needed for the read-only page.
- Public responses must not include email, auth metadata, or anything from `auth.users`.
- Disabling a share row should immediately make the URL unusable.

## App Work

1. Add Supabase migration for share table, helper read view/function, and RLS policies.
2. Add a public share loader by slug.
3. Add an unauthenticated read-only page for `/share/:slug`.
4. Reuse dashboard/missing/duplicates summary components where practical, but remove all edit controls.
5. Add owner controls in Tools: create share link, copy link, disable link, regenerate link.
6. Show sync/error states for share-link actions.
7. Update README/TODO after implementation.

## Testing Plan

- Unit or smoke-test slug creation and disabled-link behavior where practical.
- Browser smoke test owner create/copy/disable flow.
- Browser smoke test public share URL while signed out.
- Confirm the public share URL cannot edit stickers.
- Confirm disabled or invalid slugs show a clean not-found state.
- Confirm `npm run lint` and `npm run build` pass.

## Branch Strategy

Build and test this on `feature/read-only-share-links`, then merge only after the Supabase policies and read-only page are verified.

## Implementation Notes

- Migration: `supabase/migrations/202605140001_read_only_share_links.sql`
- Owner controls: `Tools` -> `Share Progress` -> `Read-only Share Link`
- Public route: `/share/:slug`
- Public data loader: `usePublicShare(slug)` calls `get_shared_collection(share_slug)`
- Owner actions: `useShareLink()` calls `create_or_replace_collection_share()` and `disable_collection_share(share_id)`
- Public share pages poll every 30 seconds to pick up recently synced cloud changes.
- Public viewers can browse the Album tab, expand teams, open sticker inventory, and cannot edit quantities or variants.
- Smoke coverage: `npm run test:smoke` mocks the public-share RPC and verifies read-only Album browsing plus absence of edit controls.
