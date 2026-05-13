-- Shared album support for Panini WC26.
-- Apply in Supabase SQL editor after reviewing against the current production schema.

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Album',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.album_members (
  album_id uuid not null references public.albums(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (album_id, user_id)
);

create table if not exists public.collection_events (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sticker_id text not null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.collections
  add column if not exists album_id uuid references public.albums(id) on delete cascade;

create unique index if not exists collections_album_id_key
  on public.collections(album_id)
  where album_id is not null;

create index if not exists album_members_user_id_idx on public.album_members(user_id);
create index if not exists collection_events_album_id_created_at_idx
  on public.collection_events(album_id, created_at desc);

alter table public.albums enable row level security;
alter table public.album_members enable row level security;
alter table public.collection_events enable row level security;

drop policy if exists "Albums are visible to members" on public.albums;
create policy "Albums are visible to members"
  on public.albums for select
  using (
    exists (
      select 1 from public.album_members m
      where m.album_id = albums.id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create owned albums" on public.albums;
create policy "Users can create owned albums"
  on public.albums for insert
  with check (owner_id = auth.uid());

drop policy if exists "Owners can update albums" on public.albums;
create policy "Owners can update albums"
  on public.albums for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Album members are visible to members" on public.album_members;
create policy "Album members are visible to members"
  on public.album_members for select
  using (
    exists (
      select 1 from public.album_members m
      where m.album_id = album_members.album_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "Owners can manage album members" on public.album_members;
create policy "Owners can manage album members"
  on public.album_members for all
  using (
    exists (
      select 1 from public.album_members m
      where m.album_id = album_members.album_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.album_members m
      where m.album_id = album_members.album_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

drop policy if exists "Collection events are visible to members" on public.collection_events;
create policy "Collection events are visible to members"
  on public.collection_events for select
  using (
    exists (
      select 1 from public.album_members m
      where m.album_id = collection_events.album_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "Editors can create collection events" on public.collection_events;
create policy "Editors can create collection events"
  on public.collection_events for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.album_members m
      where m.album_id = collection_events.album_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'editor')
    )
  );

-- Existing collections RLS should be replaced when the app fully migrates to album_id.
-- During rollout, keep the current user_id policy in place for backward compatibility.
drop policy if exists "Album members can read collections" on public.collections;
create policy "Album members can read collections"
  on public.collections for select
  using (
    album_id is not null
    and exists (
      select 1 from public.album_members m
      where m.album_id = collections.album_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "Album editors can write collections" on public.collections;
create policy "Album editors can write collections"
  on public.collections for all
  using (
    album_id is not null
    and exists (
      select 1 from public.album_members m
      where m.album_id = collections.album_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'editor')
    )
  )
  with check (
    album_id is not null
    and exists (
      select 1 from public.album_members m
      where m.album_id = collections.album_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'editor')
    )
  );
