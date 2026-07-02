drop policy if exists "Public can read pending song requests" on public.song_requests;
drop policy if exists "Public can read song requests" on public.song_requests;

create policy "Public can read song requests"
on public.song_requests
for select
to anon, authenticated
using (true);
