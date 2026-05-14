-- Live read-only share links for the current user-scoped collection model.
-- Public viewers read through a narrow RPC; collections RLS should remain private.

create extension if not exists pgcrypto;

create table if not exists public.collection_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_accessed_at timestamptz
);

create unique index if not exists collection_shares_one_enabled_per_user
  on public.collection_shares(user_id)
  where enabled;

alter table public.collection_shares enable row level security;

drop policy if exists "Users can read own collection shares" on public.collection_shares;
create policy "Users can read own collection shares"
  on public.collection_shares for select
  using (user_id = auth.uid());

drop policy if exists "Users can create own collection shares" on public.collection_shares;
create policy "Users can create own collection shares"
  on public.collection_shares for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can update own collection shares" on public.collection_shares;
create policy "Users can update own collection shares"
  on public.collection_shares for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own collection shares" on public.collection_shares;
create policy "Users can delete own collection shares"
  on public.collection_shares for delete
  using (user_id = auth.uid());

create or replace function public.generate_share_slug()
returns text
language sql
volatile
as $$
  select regexp_replace(
    translate(encode(gen_random_bytes(18), 'base64'), '+/', '-_'),
    '=+$',
    ''
  );
$$;

create or replace function public.create_or_replace_collection_share()
returns public.collection_shares
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.collection_shares;
  new_slug text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.collection_shares
  set enabled = false, updated_at = now()
  where user_id = auth.uid()
    and enabled = true;

  loop
    new_slug := public.generate_share_slug();
    begin
      insert into public.collection_shares(user_id, slug)
      values (auth.uid(), new_slug)
      returning * into result;
      return result;
    exception when unique_violation then
      -- Extremely unlikely; retry with a new slug.
    end;
  end loop;
end;
$$;

create or replace function public.disable_collection_share(share_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.collection_shares
  set enabled = false, updated_at = now()
  where id = share_id
    and user_id = auth.uid();
$$;

create or replace function public.get_shared_collection(share_slug text)
returns table (
  share_id uuid,
  collection_data jsonb,
  collection_updated_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    s.id as share_id,
    c.data as collection_data,
    c.updated_at as collection_updated_at
  from public.collection_shares s
  join public.collections c on c.user_id = s.user_id
  where s.slug = share_slug
    and s.enabled = true
  limit 1;
$$;

revoke all on function public.create_or_replace_collection_share() from public;
revoke all on function public.disable_collection_share(uuid) from public;
revoke all on function public.get_shared_collection(text) from public;

grant execute on function public.create_or_replace_collection_share() to authenticated;
grant execute on function public.disable_collection_share(uuid) to authenticated;
grant execute on function public.get_shared_collection(text) to anon, authenticated;
