import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Frueh und deutlich scheitern statt spaeter mit kryptischen Fehlern.
  console.error(
    "[Backend] VITE_SUPABASE_URL oder VITE_SUPABASE_ANON_KEY fehlt. " +
      "Bitte in der .env-Datei bzw. in den Umgebungsvariablen des Hosters eintragen."
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Name der Entity ("AbnahmeCheckliste") -> Tabellenname ("abnahme_checkliste") */
export function tableName(entity) {
  return entity.replace(/(?<!^)([A-Z])/g, "_$1").toLowerCase();
}

/** "-created_date" -> { column: "created_date", ascending: false } */
export function parseSort(sort) {
  if (!sort || typeof sort !== "string") return null;
  const descending = sort.startsWith("-");
  return { column: descending ? sort.slice(1) : sort, ascending: !descending };
}
