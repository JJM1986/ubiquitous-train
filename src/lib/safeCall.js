import { toast } from "sonner";

/**
 * Zentrales Fehler-Handling fuer Backend-Aufrufe.
 * Loggt den Fehler und zeigt dem Nutzer eine verstaendliche Meldung.
 *
 * Beispiel:
 *   const data = await safeCall(
 *     () => base44.entities.Project.list("-created_date"),
 *     { fallback: [], message: "Projekte konnten nicht geladen werden." }
 *   );
 */
export async function safeCall(fn, { fallback = null, message = "Aktion fehlgeschlagen. Bitte erneut versuchen." } = {}) {
  try {
    return await fn();
  } catch (err) {
    console.error("[Backend]", err);
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    toast.error(offline ? "Keine Internetverbindung." : message);
    return fallback;
  }
}
