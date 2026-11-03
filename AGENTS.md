# AGENTS.md

## Projektkontext

GerüstMeister ist eine React-App (Vite, Tailwind, shadcn/ui) mit Supabase als Backend. Sie wurde von Base44 auf Supabase umgezogen. Behandle den Code als Anwendung des Nutzers: Änderungen eng am Auftrag halten und bestehende Konventionen beibehalten.

Für Setup, Umgebungsvariablen und Deployment siehe `README.md`.

## Wichtige Dateien

- `src/`: Frontend-Quellcode (`pages/`, `components/`, `components/ui/` für shadcn).
- `src/api/backend.js`: Adapter, der die alte Base44-API (`entities`, `auth`, `integrations`) auf Supabase abbildet.
- `src/api/base44Client.js`: exportiert den Adapter unter dem Namen `base44`, damit die bestehenden Aufrufe funktionieren.
- `src/api/supabaseClient.js`: Supabase-Client und Hilfsfunktionen (`tableName`, `parseSort`).
- `supabase/01-schema.sql`, `supabase/02-storage.sql`: Datenbankschema und Storage-Bucket.
- `supabase/functions/send-email/`: Edge Function für den SMTP-Versand.
- `base44/`: Altlast aus der Base44-Zeit, wird von der App nicht verwendet.

## Arbeitshinweise

- Lokal entwickeln mit `npm run dev`. Base44-CLI-Befehle (`base44 dev` usw.) gelten nicht mehr.
- Datenzugriffe über den bestehenden Adapter (`base44.entities.<Name>`) oder direkt über `supabase`. Keinen zweiten Client anlegen.
- Neue Tabellen in `supabase/01-schema.sql` ergänzen. Tabellennamen sind `snake_case` des Entity-Namens.
- Geheimnisse (SMTP, API-Schlüssel, `service_role`) gehören in Supabase-Secrets bzw. Edge Functions, nie in `VITE_`-Variablen oder in den Frontend-Code.
- Fehler aus dem Backend werden geworfen und in der UI mit `safeCall()` abgefangen. Dieses Muster beibehalten.
- Vor Abschluss von Codeänderungen `npm run lint` und `npm run build` ausführen.
