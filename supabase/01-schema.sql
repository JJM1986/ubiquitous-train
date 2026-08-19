-- =====================================================================
--  OPTIONAL: Alles zuruecksetzen
--  Nur ausfuehren, wenn das Schema schon einmal eingespielt wurde und
--  noch KEINE echten Daten drin sind. Loescht alle Tabellen unwiderruflich.
-- ---------------------------------------------------------------------
--  drop schema public cascade;
--  create schema public;
--  grant usage on schema public to anon, authenticated, service_role;
--  grant all on all tables in schema public to anon, authenticated, service_role;
-- =====================================================================

-- =====================================================================
--  GerüstMeister – Datenbankschema (PostgreSQL / Supabase)
--  Automatisch erzeugt aus den 27 Base44-Datenmodellen.
--  Im Supabase SQL-Editor komplett einfügen und ausführen.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Benutzerprofile: haelt die Rolle (admin | bauleiter | monteur)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'monteur'
              check (role in ('admin','bauleiter','monteur')),
  created_date timestamptz not null default now()
);

-- Rolle des angemeldeten Benutzers ermitteln
create or replace function public.auth_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'monteur');
$$;

alter table public.profiles enable row level security;

drop policy if exists "profil_selbst_lesen" on public.profiles;
create policy "profil_selbst_lesen" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "admin_liest_alle_profile" on public.profiles;
create policy "admin_liest_alle_profile" on public.profiles
  for select using (public.auth_role() = 'admin');
drop policy if exists "admin_aendert_profile" on public.profiles;
create policy "admin_aendert_profile" on public.profiles
  for update using (public.auth_role() = 'admin');

-- Neue Registrierung automatisch als Profil anlegen
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Zeitstempel bei Aenderung mitfuehren
create or replace function public.touch_updated_date()
returns trigger language plpgsql as $$
begin new.updated_date = now(); return new; end; $$;


-- ---------------------------------------------------------------------
-- AbnahmeCheckliste
-- ---------------------------------------------------------------------
create table if not exists public.abnahme_checkliste (
  id            text primary key default gen_random_uuid()::text,
  project_id               text not null,
  project_name             text,
  customer_name            text,
  inspection_date          date not null,
  inspector_name           text,
  client_representative    text,
  status                   text default 'Entwurf' check (status in ('Entwurf','Bestätigt','Abgeschlossen')),
  checkpoints              jsonb,
  overall_result           text check (overall_result in ('Freigegeben','Freigegeben mit Auflagen','Nicht freigegeben')),
  conditions               text,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists abnahme_checkliste_created_date_idx on public.abnahme_checkliste (created_date desc);
create index if not exists abnahme_checkliste_project_id_idx on public.abnahme_checkliste (project_id);
drop trigger if exists abnahme_checkliste_touch on public.abnahme_checkliste;
create trigger abnahme_checkliste_touch before update on public.abnahme_checkliste
  for each row execute function public.touch_updated_date();
alter table public.abnahme_checkliste enable row level security;
drop policy if exists "abnahme_checkliste_select" on public.abnahme_checkliste;
create policy "abnahme_checkliste_select" on public.abnahme_checkliste for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "abnahme_checkliste_insert" on public.abnahme_checkliste;
create policy "abnahme_checkliste_insert" on public.abnahme_checkliste for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "abnahme_checkliste_update" on public.abnahme_checkliste;
create policy "abnahme_checkliste_update" on public.abnahme_checkliste for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "abnahme_checkliste_delete" on public.abnahme_checkliste;
create policy "abnahme_checkliste_delete" on public.abnahme_checkliste for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Assignment
-- ---------------------------------------------------------------------
create table if not exists public.assignment (
  id            text primary key default gen_random_uuid()::text,
  project_id               text not null,
  employee_id              text not null,
  date                     date not null,
  start_time               text,
  end_time                 text,
  hours                    numeric,
  task                     text,
  status                   text default 'Geplant' check (status in ('Geplant','In Arbeit','Abgeschlossen')),
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists assignment_created_date_idx on public.assignment (created_date desc);
create index if not exists assignment_project_id_idx on public.assignment (project_id);
drop trigger if exists assignment_touch on public.assignment;
create trigger assignment_touch before update on public.assignment
  for each row execute function public.touch_updated_date();
alter table public.assignment enable row level security;
drop policy if exists "assignment_select" on public.assignment;
create policy "assignment_select" on public.assignment for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "assignment_insert" on public.assignment;
create policy "assignment_insert" on public.assignment for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "assignment_update" on public.assignment;
create policy "assignment_update" on public.assignment for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "assignment_delete" on public.assignment;
create policy "assignment_delete" on public.assignment for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Aufbauplan
-- ---------------------------------------------------------------------
create table if not exists public.aufbauplan (
  id            text primary key default gen_random_uuid()::text,
  title                    text not null,
  document_type            text default 'Aufbauplan' check (document_type in ('Aufbauplan','Skizze','Montageplan','Abnahmeskizze','Sonstiges')),
  project_id               text,
  project_name             text,
  file_url                 text not null,
  has_deviation            boolean default false,
  deviation_note           text,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists aufbauplan_created_date_idx on public.aufbauplan (created_date desc);
create index if not exists aufbauplan_project_id_idx on public.aufbauplan (project_id);
drop trigger if exists aufbauplan_touch on public.aufbauplan;
create trigger aufbauplan_touch before update on public.aufbauplan
  for each row execute function public.touch_updated_date();
alter table public.aufbauplan enable row level security;
drop policy if exists "aufbauplan_select" on public.aufbauplan;
create policy "aufbauplan_select" on public.aufbauplan for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "aufbauplan_insert" on public.aufbauplan;
create policy "aufbauplan_insert" on public.aufbauplan for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "aufbauplan_update" on public.aufbauplan;
create policy "aufbauplan_update" on public.aufbauplan for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "aufbauplan_delete" on public.aufbauplan;
create policy "aufbauplan_delete" on public.aufbauplan for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- BaustellenFoto
-- ---------------------------------------------------------------------
create table if not exists public.baustellen_foto (
  id            text primary key default gen_random_uuid()::text,
  project_id               text,
  project_name             text,
  title                    text,
  photo_url                text not null,
  latitude                 numeric,
  longitude                numeric,
  taken_at                 text not null,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists baustellen_foto_created_date_idx on public.baustellen_foto (created_date desc);
create index if not exists baustellen_foto_project_id_idx on public.baustellen_foto (project_id);
drop trigger if exists baustellen_foto_touch on public.baustellen_foto;
create trigger baustellen_foto_touch before update on public.baustellen_foto
  for each row execute function public.touch_updated_date();
alter table public.baustellen_foto enable row level security;
drop policy if exists "baustellen_foto_select" on public.baustellen_foto;
create policy "baustellen_foto_select" on public.baustellen_foto for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "baustellen_foto_insert" on public.baustellen_foto;
create policy "baustellen_foto_insert" on public.baustellen_foto for insert with check (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "baustellen_foto_update" on public.baustellen_foto;
create policy "baustellen_foto_update" on public.baustellen_foto for update using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "baustellen_foto_delete" on public.baustellen_foto;
create policy "baustellen_foto_delete" on public.baustellen_foto for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- CompanySetting
-- ---------------------------------------------------------------------
create table if not exists public.company_setting (
  id            text primary key default gen_random_uuid()::text,
  company_name             text not null,
  address                  text,
  zip                      text,
  city                     text,
  phone                    text,
  email                    text,
  website                  text,
  vat_id                   text,
  tax_number               text,
  logo_url                 text,
  bank_name                text,
  iban                     text,
  bic                      text,
  ceo                      text,
  trade_register           text,
  description              text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists company_setting_created_date_idx on public.company_setting (created_date desc);
drop trigger if exists company_setting_touch on public.company_setting;
create trigger company_setting_touch before update on public.company_setting
  for each row execute function public.touch_updated_date();
alter table public.company_setting enable row level security;
drop policy if exists "company_setting_select" on public.company_setting;
create policy "company_setting_select" on public.company_setting for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "company_setting_insert" on public.company_setting;
create policy "company_setting_insert" on public.company_setting for insert with check (public.auth_role() in ('admin'));
drop policy if exists "company_setting_update" on public.company_setting;
create policy "company_setting_update" on public.company_setting for update using (public.auth_role() in ('admin'));
drop policy if exists "company_setting_delete" on public.company_setting;
create policy "company_setting_delete" on public.company_setting for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Customer
-- ---------------------------------------------------------------------
create table if not exists public.customer (
  id            text primary key default gen_random_uuid()::text,
  name                     text not null,
  company                  text,
  email                    text,
  phone                    text,
  address                  text,
  city                     text,
  zip                      text,
  notes                    text,
  status                   text default 'aktiv' check (status in ('aktiv','inaktiv')),
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists customer_created_date_idx on public.customer (created_date desc);
drop trigger if exists customer_touch on public.customer;
create trigger customer_touch before update on public.customer
  for each row execute function public.touch_updated_date();
alter table public.customer enable row level security;
drop policy if exists "customer_select" on public.customer;
create policy "customer_select" on public.customer for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "customer_insert" on public.customer;
create policy "customer_insert" on public.customer for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "customer_update" on public.customer;
create policy "customer_update" on public.customer for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "customer_delete" on public.customer;
create policy "customer_delete" on public.customer for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Dokument
-- ---------------------------------------------------------------------
create table if not exists public.dokument (
  id            text primary key default gen_random_uuid()::text,
  title                    text not null,
  document_type            text default 'Sonstiges' check (document_type in ('Freigabeprotokoll','Einsatzbericht','Abnahmecheckliste','Rechnung','Sonstiges')),
  project_id               text,
  project_name             text,
  file_url                 text not null,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists dokument_created_date_idx on public.dokument (created_date desc);
create index if not exists dokument_project_id_idx on public.dokument (project_id);
drop trigger if exists dokument_touch on public.dokument;
create trigger dokument_touch before update on public.dokument
  for each row execute function public.touch_updated_date();
alter table public.dokument enable row level security;
drop policy if exists "dokument_select" on public.dokument;
create policy "dokument_select" on public.dokument for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "dokument_insert" on public.dokument;
create policy "dokument_insert" on public.dokument for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "dokument_update" on public.dokument;
create policy "dokument_update" on public.dokument for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "dokument_delete" on public.dokument;
create policy "dokument_delete" on public.dokument for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Employee
-- ---------------------------------------------------------------------
create table if not exists public.employee (
  id            text primary key default gen_random_uuid()::text,
  first_name               text not null,
  last_name                text not null,
  role                     text check (role in ('Vorarbeiter','Monteur','Helfer','Fahrer','Bauleiter')),
  phone                    text,
  email                    text,
  hourly_rate              numeric,
  status                   text default 'aktiv' check (status in ('aktiv','inaktiv','krank','urlaub')),
  hired_date               date,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists employee_created_date_idx on public.employee (created_date desc);
drop trigger if exists employee_touch on public.employee;
create trigger employee_touch before update on public.employee
  for each row execute function public.touch_updated_date();
alter table public.employee enable row level security;
drop policy if exists "employee_select" on public.employee;
create policy "employee_select" on public.employee for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "employee_insert" on public.employee;
create policy "employee_insert" on public.employee for insert with check (public.auth_role() in ('admin'));
drop policy if exists "employee_update" on public.employee;
create policy "employee_update" on public.employee for update using (public.auth_role() in ('admin'));
drop policy if exists "employee_delete" on public.employee;
create policy "employee_delete" on public.employee for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Fahrzeug
-- ---------------------------------------------------------------------
create table if not exists public.fahrzeug (
  id            text primary key default gen_random_uuid()::text,
  bezeichnung              text not null,
  kennzeichen              text,
  typ                      text default 'Transporter' check (typ in ('Transporter','LKW','PKW','Anhänger','Kran','Sonstiges')),
  marke                    text,
  modell                   text,
  baujahr                  numeric,
  kilometerstand           numeric,
  zul_gesamtmasse          numeric,
  leergewicht              numeric,
  tuv                      date,
  inspect_date             date,
  status                   text default 'aktiv' check (status in ('aktiv','werkstatt','ausgemustert')),
  fahrer_id                text,
  fahrer_name              text,
  kolonne_id               text,
  einsatz_project_id       text,
  einsatz_project_name     text,
  location                 text,
  photo_url                text,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists fahrzeug_created_date_idx on public.fahrzeug (created_date desc);
drop trigger if exists fahrzeug_touch on public.fahrzeug;
create trigger fahrzeug_touch before update on public.fahrzeug
  for each row execute function public.touch_updated_date();
alter table public.fahrzeug enable row level security;
drop policy if exists "fahrzeug_select" on public.fahrzeug;
create policy "fahrzeug_select" on public.fahrzeug for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "fahrzeug_insert" on public.fahrzeug;
create policy "fahrzeug_insert" on public.fahrzeug for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "fahrzeug_update" on public.fahrzeug;
create policy "fahrzeug_update" on public.fahrzeug for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "fahrzeug_delete" on public.fahrzeug;
create policy "fahrzeug_delete" on public.fahrzeug for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Geruestfreigabe
-- ---------------------------------------------------------------------
create table if not exists public.geruestfreigabe (
  id            text primary key default gen_random_uuid()::text,
  project_name             text not null,
  site_address             text,
  customer_name            text,
  scaffold_type            text,
  scaffold_height          numeric,
  scaffold_area            numeric,
  scaffold_class           text default 'Lastklasse 3' check (scaffold_class in ('Lastklasse 1','Lastklasse 2','Lastklasse 3','Lastklasse 4','Lastklasse 5','Lastklasse 6')),
  inspection_type          text default 'Erstprüfung' check (inspection_type in ('Erstprüfung','Wiederholungsprüfung','Außerordentliche Prüfung')),
  inspector_name           text not null,
  inspection_date          date not null,
  result                   text default 'Freigegeben' check (result in ('Freigegeben','Freigegeben mit Auflagen','Nicht freigegeben')),
  checkpoints              jsonb,
  conditions               text,
  notes                    text,
  status                   text default 'Entwurf' check (status in ('Entwurf','Freigegeben','Abgelehnt')),
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists geruestfreigabe_created_date_idx on public.geruestfreigabe (created_date desc);
drop trigger if exists geruestfreigabe_touch on public.geruestfreigabe;
create trigger geruestfreigabe_touch before update on public.geruestfreigabe
  for each row execute function public.touch_updated_date();
alter table public.geruestfreigabe enable row level security;
drop policy if exists "geruestfreigabe_select" on public.geruestfreigabe;
create policy "geruestfreigabe_select" on public.geruestfreigabe for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "geruestfreigabe_insert" on public.geruestfreigabe;
create policy "geruestfreigabe_insert" on public.geruestfreigabe for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "geruestfreigabe_update" on public.geruestfreigabe;
create policy "geruestfreigabe_update" on public.geruestfreigabe for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "geruestfreigabe_delete" on public.geruestfreigabe;
create policy "geruestfreigabe_delete" on public.geruestfreigabe for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- GeruestrechnerResult
-- ---------------------------------------------------------------------
create table if not exists public.geruestrechner_result (
  id            text primary key default gen_random_uuid()::text,
  scaffold_type            text not null,
  title                    text not null,
  parameters               text,
  materials                jsonb,
  total_items              numeric,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists geruestrechner_result_created_date_idx on public.geruestrechner_result (created_date desc);
drop trigger if exists geruestrechner_result_touch on public.geruestrechner_result;
create trigger geruestrechner_result_touch before update on public.geruestrechner_result
  for each row execute function public.touch_updated_date();
alter table public.geruestrechner_result enable row level security;
drop policy if exists "geruestrechner_result_select" on public.geruestrechner_result;
create policy "geruestrechner_result_select" on public.geruestrechner_result for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "geruestrechner_result_insert" on public.geruestrechner_result;
create policy "geruestrechner_result_insert" on public.geruestrechner_result for insert with check (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "geruestrechner_result_update" on public.geruestrechner_result;
create policy "geruestrechner_result_update" on public.geruestrechner_result for update using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "geruestrechner_result_delete" on public.geruestrechner_result;
create policy "geruestrechner_result_delete" on public.geruestrechner_result for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Hilfeartikel
-- ---------------------------------------------------------------------
create table if not exists public.hilfeartikel (
  id            text primary key default gen_random_uuid()::text,
  title                    text not null,
  category                 text default 'Erste Schritte' check (category in ('Erste Schritte','Gerüstplanung','Material','Freigaben','Einsatzplanung','System')),
  summary                  text,
  content                  text,
  sort_order               numeric default 0,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists hilfeartikel_created_date_idx on public.hilfeartikel (created_date desc);
drop trigger if exists hilfeartikel_touch on public.hilfeartikel;
create trigger hilfeartikel_touch before update on public.hilfeartikel
  for each row execute function public.touch_updated_date();
alter table public.hilfeartikel enable row level security;
drop policy if exists "hilfeartikel_select" on public.hilfeartikel;
create policy "hilfeartikel_select" on public.hilfeartikel for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "hilfeartikel_insert" on public.hilfeartikel;
create policy "hilfeartikel_insert" on public.hilfeartikel for insert with check (public.auth_role() in ('admin'));
drop policy if exists "hilfeartikel_update" on public.hilfeartikel;
create policy "hilfeartikel_update" on public.hilfeartikel for update using (public.auth_role() in ('admin'));
drop policy if exists "hilfeartikel_delete" on public.hilfeartikel;
create policy "hilfeartikel_delete" on public.hilfeartikel for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Kolonne
-- ---------------------------------------------------------------------
create table if not exists public.kolonne (
  id            text primary key default gen_random_uuid()::text,
  name                     text not null,
  leader_id                text,
  leader_name              text,
  member_ids               jsonb,
  member_count             numeric default 0,
  status                   text default 'aktiv' check (status in ('aktiv','inaktiv')),
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists kolonne_created_date_idx on public.kolonne (created_date desc);
drop trigger if exists kolonne_touch on public.kolonne;
create trigger kolonne_touch before update on public.kolonne
  for each row execute function public.touch_updated_date();
alter table public.kolonne enable row level security;
drop policy if exists "kolonne_select" on public.kolonne;
create policy "kolonne_select" on public.kolonne for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "kolonne_insert" on public.kolonne;
create policy "kolonne_insert" on public.kolonne for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "kolonne_update" on public.kolonne;
create policy "kolonne_update" on public.kolonne for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "kolonne_delete" on public.kolonne;
create policy "kolonne_delete" on public.kolonne for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Ladeliste
-- ---------------------------------------------------------------------
create table if not exists public.ladeliste (
  id            text primary key default gen_random_uuid()::text,
  title                    text not null,
  project_id               text,
  project_name             text,
  fahrzeug_id              text,
  fahrzeug_name            text,
  date                     date not null,
  total_weight             numeric,
  materials                jsonb,
  status                   text default 'Geplant' check (status in ('Geplant','Beladen','Unterwegs','Entladen')),
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists ladeliste_created_date_idx on public.ladeliste (created_date desc);
create index if not exists ladeliste_project_id_idx on public.ladeliste (project_id);
drop trigger if exists ladeliste_touch on public.ladeliste;
create trigger ladeliste_touch before update on public.ladeliste
  for each row execute function public.touch_updated_date();
alter table public.ladeliste enable row level security;
drop policy if exists "ladeliste_select" on public.ladeliste;
create policy "ladeliste_select" on public.ladeliste for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "ladeliste_insert" on public.ladeliste;
create policy "ladeliste_insert" on public.ladeliste for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "ladeliste_update" on public.ladeliste;
create policy "ladeliste_update" on public.ladeliste for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "ladeliste_delete" on public.ladeliste;
create policy "ladeliste_delete" on public.ladeliste for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Material
-- ---------------------------------------------------------------------
create table if not exists public.material (
  id            text primary key default gen_random_uuid()::text,
  name                     text not null,
  category                 text check (category in ('Gerüstrahmen','Beläge','Kupplungen','Rohre','Sicherheit','Zubehör','Sonstiges')),
  unit                     text default 'Stück',
  stock                    numeric default 0,
  min_stock                numeric default 0,
  location                 text,
  purchase_price           numeric,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists material_created_date_idx on public.material (created_date desc);
drop trigger if exists material_touch on public.material;
create trigger material_touch before update on public.material
  for each row execute function public.touch_updated_date();
alter table public.material enable row level security;
drop policy if exists "material_select" on public.material;
create policy "material_select" on public.material for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "material_insert" on public.material;
create policy "material_insert" on public.material for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "material_update" on public.material;
create policy "material_update" on public.material for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "material_delete" on public.material;
create policy "material_delete" on public.material for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- MaterialMovement
-- ---------------------------------------------------------------------
create table if not exists public.material_movement (
  id            text primary key default gen_random_uuid()::text,
  material_id              text not null,
  project_id               text,
  type                     text not null check (type in ('Zugang','Abgang','Ausgabe','Rückgabe')),
  quantity                 numeric not null,
  date                     date not null,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists material_movement_created_date_idx on public.material_movement (created_date desc);
create index if not exists material_movement_project_id_idx on public.material_movement (project_id);
drop trigger if exists material_movement_touch on public.material_movement;
create trigger material_movement_touch before update on public.material_movement
  for each row execute function public.touch_updated_date();
alter table public.material_movement enable row level security;
drop policy if exists "material_movement_select" on public.material_movement;
create policy "material_movement_select" on public.material_movement for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "material_movement_insert" on public.material_movement;
create policy "material_movement_insert" on public.material_movement for insert with check (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "material_movement_update" on public.material_movement;
create policy "material_movement_update" on public.material_movement for update using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "material_movement_delete" on public.material_movement;
create policy "material_movement_delete" on public.material_movement for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Materialbestellung
-- ---------------------------------------------------------------------
create table if not exists public.materialbestellung (
  id            text primary key default gen_random_uuid()::text,
  material_name            text not null,
  material_id              text,
  quantity                 numeric not null default 1,
  unit                     text default 'Stk',
  supplier                 text,
  order_date               date not null,
  expected_delivery        date,
  status                   text default 'Offen' check (status in ('Offen','Bestellt','Unterwegs','Teilgeliefert','Geliefert','Storniert')),
  project_id               text,
  cost                     numeric,
  tracking_note            text,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists materialbestellung_created_date_idx on public.materialbestellung (created_date desc);
create index if not exists materialbestellung_project_id_idx on public.materialbestellung (project_id);
drop trigger if exists materialbestellung_touch on public.materialbestellung;
create trigger materialbestellung_touch before update on public.materialbestellung
  for each row execute function public.touch_updated_date();
alter table public.materialbestellung enable row level security;
drop policy if exists "materialbestellung_select" on public.materialbestellung;
create policy "materialbestellung_select" on public.materialbestellung for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "materialbestellung_insert" on public.materialbestellung;
create policy "materialbestellung_insert" on public.materialbestellung for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "materialbestellung_update" on public.materialbestellung;
create policy "materialbestellung_update" on public.materialbestellung for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "materialbestellung_delete" on public.materialbestellung;
create policy "materialbestellung_delete" on public.materialbestellung for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Offer
-- ---------------------------------------------------------------------
create table if not exists public.offer (
  id            text primary key default gen_random_uuid()::text,
  offer_number             text not null,
  project_id               text,
  customer_id              text not null,
  date                     date not null,
  valid_until              date,
  status                   text default 'Entwurf' check (status in ('Entwurf','Gesendet','Angenommen','Abgelehnt')),
  positions                jsonb,
  subtotal                 numeric,
  tax_rate                 numeric default 19,
  total                    numeric,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists offer_created_date_idx on public.offer (created_date desc);
create index if not exists offer_project_id_idx on public.offer (project_id);
drop trigger if exists offer_touch on public.offer;
create trigger offer_touch before update on public.offer
  for each row execute function public.touch_updated_date();
alter table public.offer enable row level security;
drop policy if exists "offer_select" on public.offer;
create policy "offer_select" on public.offer for select using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "offer_insert" on public.offer;
create policy "offer_insert" on public.offer for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "offer_update" on public.offer;
create policy "offer_update" on public.offer for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "offer_delete" on public.offer;
create policy "offer_delete" on public.offer for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Project
-- ---------------------------------------------------------------------
create table if not exists public.project (
  id            text primary key default gen_random_uuid()::text,
  title                    text not null,
  customer_id              text not null,
  address                  text,
  city                     text,
  status                   text default 'Anfrage' check (status in ('Anfrage','Angebot','Beauftragt','In Arbeit','Abgeschlossen','Storniert')),
  start_date               date,
  end_date                 date,
  assembly_date            date,
  disassembly_date         date,
  kolonne_id               text,
  baustelle_status         text default 'geplant' check (baustelle_status in ('geplant','läuft','fertig')),
  scaffold_type            text,
  scaffold_area            numeric,
  scaffold_height          numeric,
  description              text,
  notes                    text,
  latitude                 numeric,
  longitude                numeric,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists project_created_date_idx on public.project (created_date desc);
drop trigger if exists project_touch on public.project;
create trigger project_touch before update on public.project
  for each row execute function public.touch_updated_date();
alter table public.project enable row level security;
drop policy if exists "project_select" on public.project;
create policy "project_select" on public.project for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "project_insert" on public.project;
create policy "project_insert" on public.project for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "project_update" on public.project;
create policy "project_update" on public.project for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "project_delete" on public.project;
create policy "project_delete" on public.project for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- ProjektHistorie
-- ---------------------------------------------------------------------
create table if not exists public.projekt_historie (
  id            text primary key default gen_random_uuid()::text,
  project_id               text not null,
  project_name             text,
  action_type              text not null check (action_type in ('Statuswechsel','Erstellt','Bearbeitet','Verhinderung gemeldet','Verhinderung behoben')),
  field_changed            text,
  old_value                text,
  new_value                text,
  user_name                text,
  timestamp                text not null,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists projekt_historie_created_date_idx on public.projekt_historie (created_date desc);
create index if not exists projekt_historie_project_id_idx on public.projekt_historie (project_id);
drop trigger if exists projekt_historie_touch on public.projekt_historie;
create trigger projekt_historie_touch before update on public.projekt_historie
  for each row execute function public.touch_updated_date();
alter table public.projekt_historie enable row level security;
drop policy if exists "projekt_historie_select" on public.projekt_historie;
create policy "projekt_historie_select" on public.projekt_historie for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "projekt_historie_insert" on public.projekt_historie;
create policy "projekt_historie_insert" on public.projekt_historie for insert with check (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "projekt_historie_update" on public.projekt_historie;
create policy "projekt_historie_update" on public.projekt_historie for update using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "projekt_historie_delete" on public.projekt_historie;
create policy "projekt_historie_delete" on public.projekt_historie for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Reklamation
-- ---------------------------------------------------------------------
create table if not exists public.reklamation (
  id            text primary key default gen_random_uuid()::text,
  title                    text not null,
  description              text,
  project_id               text not null,
  project_name             text,
  customer_name            text,
  status                   text default 'Gemeldet' check (status in ('Gemeldet','In Bearbeitung','Behoben','Abgewiesen')),
  priority                 text default 'Mittel' check (priority in ('Niedrig','Mittel','Hoch','Dringend')),
  reported_by              text,
  reported_date            date,
  handled_by               text,
  resolution               text,
  verlauf                  jsonb,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists reklamation_created_date_idx on public.reklamation (created_date desc);
create index if not exists reklamation_project_id_idx on public.reklamation (project_id);
drop trigger if exists reklamation_touch on public.reklamation;
create trigger reklamation_touch before update on public.reklamation
  for each row execute function public.touch_updated_date();
alter table public.reklamation enable row level security;
drop policy if exists "reklamation_select" on public.reklamation;
create policy "reklamation_select" on public.reklamation for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "reklamation_insert" on public.reklamation;
create policy "reklamation_insert" on public.reklamation for insert with check (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "reklamation_update" on public.reklamation;
create policy "reklamation_update" on public.reklamation for update using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "reklamation_delete" on public.reklamation;
create policy "reklamation_delete" on public.reklamation for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Sicherheitsunterweisung
-- ---------------------------------------------------------------------
create table if not exists public.sicherheitsunterweisung (
  id            text primary key default gen_random_uuid()::text,
  title                    text not null,
  topic                    text,
  date                     date not null,
  location                 text,
  instructor               text,
  participants             jsonb,
  status                   text default 'Geplant' check (status in ('Geplant','Durchgeführt')),
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists sicherheitsunterweisung_created_date_idx on public.sicherheitsunterweisung (created_date desc);
drop trigger if exists sicherheitsunterweisung_touch on public.sicherheitsunterweisung;
create trigger sicherheitsunterweisung_touch before update on public.sicherheitsunterweisung
  for each row execute function public.touch_updated_date();
alter table public.sicherheitsunterweisung enable row level security;
drop policy if exists "sicherheitsunterweisung_select" on public.sicherheitsunterweisung;
create policy "sicherheitsunterweisung_select" on public.sicherheitsunterweisung for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "sicherheitsunterweisung_insert" on public.sicherheitsunterweisung;
create policy "sicherheitsunterweisung_insert" on public.sicherheitsunterweisung for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "sicherheitsunterweisung_update" on public.sicherheitsunterweisung;
create policy "sicherheitsunterweisung_update" on public.sicherheitsunterweisung for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "sicherheitsunterweisung_delete" on public.sicherheitsunterweisung;
create policy "sicherheitsunterweisung_delete" on public.sicherheitsunterweisung for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Standortbestand
-- ---------------------------------------------------------------------
create table if not exists public.standortbestand (
  id            text primary key default gen_random_uuid()::text,
  material_name            text not null,
  material_id              text,
  quantity                 numeric not null default 1,
  unit                     text default 'Stk',
  location                 text not null,
  project_id               text,
  barcode                  text,
  scan_date                text not null,
  latitude                 numeric,
  longitude                numeric,
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists standortbestand_created_date_idx on public.standortbestand (created_date desc);
create index if not exists standortbestand_project_id_idx on public.standortbestand (project_id);
drop trigger if exists standortbestand_touch on public.standortbestand;
create trigger standortbestand_touch before update on public.standortbestand
  for each row execute function public.touch_updated_date();
alter table public.standortbestand enable row level security;
drop policy if exists "standortbestand_select" on public.standortbestand;
create policy "standortbestand_select" on public.standortbestand for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "standortbestand_insert" on public.standortbestand;
create policy "standortbestand_insert" on public.standortbestand for insert with check (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "standortbestand_update" on public.standortbestand;
create policy "standortbestand_update" on public.standortbestand for update using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "standortbestand_delete" on public.standortbestand;
create policy "standortbestand_delete" on public.standortbestand for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Stundenkonto
-- ---------------------------------------------------------------------
create table if not exists public.stundenkonto (
  id            text primary key default gen_random_uuid()::text,
  project_id               text not null,
  project_name             text,
  planned_hours            numeric not null,
  actual_hours_override    numeric,
  period                   text default 'Gesamt',
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists stundenkonto_created_date_idx on public.stundenkonto (created_date desc);
create index if not exists stundenkonto_project_id_idx on public.stundenkonto (project_id);
drop trigger if exists stundenkonto_touch on public.stundenkonto;
create trigger stundenkonto_touch before update on public.stundenkonto
  for each row execute function public.touch_updated_date();
alter table public.stundenkonto enable row level security;
drop policy if exists "stundenkonto_select" on public.stundenkonto;
create policy "stundenkonto_select" on public.stundenkonto for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "stundenkonto_insert" on public.stundenkonto;
create policy "stundenkonto_insert" on public.stundenkonto for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "stundenkonto_update" on public.stundenkonto;
create policy "stundenkonto_update" on public.stundenkonto for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "stundenkonto_delete" on public.stundenkonto;
create policy "stundenkonto_delete" on public.stundenkonto for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Subunternehmer
-- ---------------------------------------------------------------------
create table if not exists public.subunternehmer (
  id            text primary key default gen_random_uuid()::text,
  company_name             text not null,
  contact_person           text,
  email                    text,
  phone                    text,
  address                  text,
  trade                    text,
  hourly_rate              numeric,
  status                   text default 'aktiv' check (status in ('aktiv','inaktiv')),
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists subunternehmer_created_date_idx on public.subunternehmer (created_date desc);
drop trigger if exists subunternehmer_touch on public.subunternehmer;
create trigger subunternehmer_touch before update on public.subunternehmer
  for each row execute function public.touch_updated_date();
alter table public.subunternehmer enable row level security;
drop policy if exists "subunternehmer_select" on public.subunternehmer;
create policy "subunternehmer_select" on public.subunternehmer for select using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "subunternehmer_insert" on public.subunternehmer;
create policy "subunternehmer_insert" on public.subunternehmer for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "subunternehmer_update" on public.subunternehmer;
create policy "subunternehmer_update" on public.subunternehmer for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "subunternehmer_delete" on public.subunternehmer;
create policy "subunternehmer_delete" on public.subunternehmer for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- SubunternehmerEinsatz
-- ---------------------------------------------------------------------
create table if not exists public.subunternehmer_einsatz (
  id            text primary key default gen_random_uuid()::text,
  subcontractor_id         text not null,
  subcontractor_name       text,
  project_id               text not null,
  project_name             text,
  date                     date not null,
  task                     text,
  hours                    numeric,
  cost                     numeric,
  status                   text default 'Geplant' check (status in ('Geplant','In Arbeit','Abgeschlossen')),
  notes                    text,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists subunternehmer_einsatz_created_date_idx on public.subunternehmer_einsatz (created_date desc);
create index if not exists subunternehmer_einsatz_project_id_idx on public.subunternehmer_einsatz (project_id);
drop trigger if exists subunternehmer_einsatz_touch on public.subunternehmer_einsatz;
create trigger subunternehmer_einsatz_touch before update on public.subunternehmer_einsatz
  for each row execute function public.touch_updated_date();
alter table public.subunternehmer_einsatz enable row level security;
drop policy if exists "subunternehmer_einsatz_select" on public.subunternehmer_einsatz;
create policy "subunternehmer_einsatz_select" on public.subunternehmer_einsatz for select using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "subunternehmer_einsatz_insert" on public.subunternehmer_einsatz;
create policy "subunternehmer_einsatz_insert" on public.subunternehmer_einsatz for insert with check (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "subunternehmer_einsatz_update" on public.subunternehmer_einsatz;
create policy "subunternehmer_einsatz_update" on public.subunternehmer_einsatz for update using (public.auth_role() in ('admin','bauleiter'));
drop policy if exists "subunternehmer_einsatz_delete" on public.subunternehmer_einsatz;
create policy "subunternehmer_einsatz_delete" on public.subunternehmer_einsatz for delete using (public.auth_role() in ('admin'));

-- ---------------------------------------------------------------------
-- Verhinderung
-- ---------------------------------------------------------------------
create table if not exists public.verhinderung (
  id            text primary key default gen_random_uuid()::text,
  project_id               text not null,
  project_name             text,
  reason                   text not null,
  trade                    text check (trade in ('Malerarbeiten','Maurerarbeiten','Dachdecker','Elektro','Sanitär/Heizung','Erdarbeiten','Kran/Hebezeug','Witterung','Materiallieferung','Behörde/Genehmigung','Sonstiges Fremdgewerk')),
  reported_by              text,
  reported_date            date not null,
  start_date               date,
  expected_end_date        date,
  status                   text default 'Offen' check (status in ('Offen','Bestätigt','Behoben','Abgewiesen')),
  impact_hours             numeric,
  description              text,
  resolution               text,
  admin_seen               boolean default false,
  auto_suggested           boolean default false,
  resolved_date            date,
  created_by             text,
  created_date           timestamptz not null default now(),
  updated_date           timestamptz not null default now()
);
create index if not exists verhinderung_created_date_idx on public.verhinderung (created_date desc);
create index if not exists verhinderung_project_id_idx on public.verhinderung (project_id);
drop trigger if exists verhinderung_touch on public.verhinderung;
create trigger verhinderung_touch before update on public.verhinderung
  for each row execute function public.touch_updated_date();
alter table public.verhinderung enable row level security;
drop policy if exists "verhinderung_select" on public.verhinderung;
create policy "verhinderung_select" on public.verhinderung for select using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "verhinderung_insert" on public.verhinderung;
create policy "verhinderung_insert" on public.verhinderung for insert with check (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "verhinderung_update" on public.verhinderung;
create policy "verhinderung_update" on public.verhinderung for update using (public.auth_role() in ('admin','bauleiter','monteur'));
drop policy if exists "verhinderung_delete" on public.verhinderung;
create policy "verhinderung_delete" on public.verhinderung for delete using (public.auth_role() in ('admin'));
