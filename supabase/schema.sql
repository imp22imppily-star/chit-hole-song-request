create extension if not exists "pgcrypto";

create table if not exists public.song_requests (
  id uuid primary key default gen_random_uuid(),
  table_number text null,
  song_title text not null,
  artist text null,
  message text null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.song_requests enable row level security;

drop policy if exists "Public can insert song requests" on public.song_requests;
create policy "Public can insert song requests"
on public.song_requests
for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "Public can read pending song requests" on public.song_requests;
create policy "Public can read song requests"
on public.song_requests
for select
to anon, authenticated
using (true);

drop policy if exists "Public dashboard can update song requests" on public.song_requests;
create policy "Public dashboard can update song requests"
on public.song_requests
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public dashboard can delete song requests" on public.song_requests;
create policy "Public dashboard can delete song requests"
on public.song_requests
for delete
to anon, authenticated
using (true);

create index if not exists song_requests_pending_created_at_idx
on public.song_requests (created_at)
where status = 'pending';

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'song_requests'
  ) then
    alter publication supabase_realtime add table public.song_requests;
  end if;
end $$;

-- MVP note: update/delete is public so /musician works without login.
-- For production, add a musician password, auth, or service-role protected API route.
