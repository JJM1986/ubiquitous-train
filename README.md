# GerüstMeister

Verwaltungs-App für Gerüstbaubetriebe: Baustellen, Projekte, Gerüstrechner, Einsatzplanung, Lager, Angebote, Gerüstfreigaben und Subunternehmer-Portal.

**Technik:** React 18, Vite, Tailwind CSS und shadcn/ui im Frontend, [Supabase](https://supabase.com) als Backend (Datenbank, Login, Dateispeicher, Edge Functions). Gehostet wird auf Vercel.

## Voraussetzungen

- Node.js 20 oder neuer
- Ein Supabase-Projekt
- Für die Edge Function: die [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)

## Lokal starten

```bash
npm install
cp .env.example .env.local   # danach die Werte eintragen
npm run dev
```

Vite gibt die lokale Adresse aus, meist `http://localhost:5173`.

### Umgebungsvariablen

In `.env.local` (wird nicht committet):

| Variable | Woher |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` / publishable key |

Alles mit `VITE_` landet im Browser. Hier gehören nur öffentliche Werte hin, niemals der `service_role`-Key, SMTP-Zugangsdaten oder API-Schlüssel.

## Supabase einrichten

1. **Datenbank:** Im Supabase SQL-Editor zuerst `supabase/01-schema.sql`, dann `supabase/02-storage.sql` ausführen. Das zweite Skript legt den Speicher-Bucket `uploads` für Fotos, Aufbaupläne und Dokumente an.
2. **E-Mail-Versand:** Die Edge Function `send-email` verschickt Mails per SMTP. Zugangsdaten als Secrets hinterlegen und die Function deployen:

   ```bash
   supabase secrets set SMTP_HOST=... SMTP_PORT=... SMTP_USER=... SMTP_PASS=... MAIL_FROM=...
   supabase functions deploy send-email
   ```

## Wie das Backend angebunden ist

Die App lief ursprünglich auf Base44 und wurde auf Supabase umgezogen. Damit die rund 119 Aufrufstellen nicht umgeschrieben werden mussten, gibt es eine Adapter-Schicht:

- `src/api/supabaseClient.js`: erzeugt den Supabase-Client.
- `src/api/backend.js`: bildet die alten Base44-Befehle auf Supabase ab:
  - `entities.<Name>.list / filter / get / create / update / delete` → Tabelle in `snake_case` (aus `AbnahmeCheckliste` wird `abnahme_checkliste`)
  - `auth.*` → Supabase Auth
  - `integrations.Core.UploadFile` → Storage-Bucket `uploads`
  - `integrations.Core.SendEmail` → Edge Function `send-email`
- `src/api/base44Client.js`: exportiert den Adapter weiterhin unter dem Namen `base44`, damit bestehende Imports funktionieren.

Neuer Code kann `base44` aus `@/api/base44Client` weiterverwenden oder direkt `supabase` aus `@/api/supabaseClient` nutzen.

Der Ordner `base44/` enthält nur noch die alten Base44-Definitionen (Entities, Agents) als Referenz. Er wird von der App nicht mehr verwendet.

## Befehle

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Produktions-Build nach `dist/` |
| `npm run preview` | Build lokal ansehen |
| `npm run lint` | ESLint prüfen |
| `npm run lint:fix` | ESLint-Fehler automatisch beheben |
| `npm run typecheck` | TypeScript-Prüfung über `jsconfig.json` |

## Deployment (Vercel)

1. Repository in Vercel importieren. Vite wird automatisch erkannt.
2. Unter Settings → Environment Variables `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` eintragen.
3. `vercel.json` leitet alle Pfade auf `index.html` um, damit das clientseitige Routing funktioniert.

Jeder Push auf `main` löst ein neues Deployment aus.
