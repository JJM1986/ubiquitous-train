-- =====================================================================
--  Dateispeicher fuer Baustellenfotos, Aufbauplaene und Dokumente
--  Im Supabase SQL-Editor nach 01-schema.sql ausfuehren.
--
--  Der Bucket ist PRIVAT: Dateien sind nur fuer angemeldete Benutzer
--  ueber signierte Links abrufbar, die nach einer Stunde ablaufen
--  (siehe src/lib/storageUrl.js).
--
--  Das Skript kann gefahrlos erneut ausgefuehrt werden. Bei einem
--  bestehenden Projekt stellt es einen oeffentlichen Bucket auf privat um.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do update set public = false;

drop policy if exists "uploads_insert" on storage.objects;
drop policy if exists "uploads_select" on storage.objects;
drop policy if exists "uploads_delete" on storage.objects;

-- Angemeldete Benutzer duerfen hochladen
create policy "uploads_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'uploads');

-- Nur angemeldete Benutzer duerfen lesen (und damit signierte Links erzeugen)
create policy "uploads_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'uploads');

-- Nur Admin und Bauleiter duerfen loeschen
create policy "uploads_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'uploads' and public.auth_role() in ('admin','bauleiter'));
