-- =====================================================================
--  Dateispeicher fuer Baustellenfotos, Aufbauplaene und Dokumente
--  Im Supabase SQL-Editor nach 01-schema.sql ausfuehren.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Angemeldete Benutzer duerfen hochladen
create policy "uploads_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'uploads');

-- Dateien sind oeffentlich lesbar (Bilder werden direkt eingebunden)
create policy "uploads_select" on storage.objects
  for select using (bucket_id = 'uploads');

-- Nur Admin und Bauleiter duerfen loeschen
create policy "uploads_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'uploads' and public.auth_role() in ('admin','bauleiter'));
