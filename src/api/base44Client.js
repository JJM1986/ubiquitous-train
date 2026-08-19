/**
 * Kompatibilitaets-Schicht.
 *
 * Frueher wurde hier der Base44-Client erzeugt. Die App laeuft inzwischen
 * auf Supabase. Damit die rund 119 bestehenden Aufrufstellen unveraendert
 * bleiben koennen, wird hier weiterhin ein Objekt namens "base44"
 * exportiert - es zeigt jetzt aber auf den eigenen Adapter.
 */
import backend from "./backend";

export const base44 = backend;
export default backend;
