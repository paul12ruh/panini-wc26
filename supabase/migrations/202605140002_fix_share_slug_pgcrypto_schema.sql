-- Supabase installs pgcrypto into the extensions schema. Keep the share
-- slug generator explicit so it works under restricted function search paths.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.generate_share_slug()
returns text
language sql
volatile
as $$
  select regexp_replace(
    translate(encode(extensions.gen_random_bytes(18), 'base64'), '+/', '-_'),
    '=+$',
    ''
  );
$$;
