import { supabase } from "@/api/supabaseClient";

/**
 * Der Bucket "uploads" ist privat. In der Datenbank steht pro Datei weiterhin
 * die URL, die UploadFile() zurueckgibt (".../object/public/uploads/<pfad>").
 * Zum Anzeigen wird daraus ein signierter Link erzeugt, der nach einer Stunde
 * ablaeuft. Fremde URLs (z.B. von Hand eingetragene Fahrzeugfotos), blob:-
 * und data:-URLs werden unveraendert zurueckgegeben.
 */
export const STORAGE_BUCKET = "uploads";

const EXPIRES_IN = 60 * 60; // Sekunden
const CACHE_MS = (EXPIRES_IN - 5 * 60) * 1000; // 5 Minuten vor Ablauf erneuern
const STORAGE_PATH = new RegExp(`/storage/v1/object/(?:public|sign|authenticated)/${STORAGE_BUCKET}/([^?#]+)`);

const cache = new Map(); // url -> { promise, expires }

/** Pfad im Bucket aus einer gespeicherten URL, sonst null */
export function storagePath(url) {
  if (!url || typeof url !== "string") return null;
  const match = url.match(STORAGE_PATH);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Gespeicherte Datei-URL -> anzeigbare URL (signiert, falls im Bucket) */
export async function resolveFileUrl(url) {
  const path = storagePath(url);
  if (!path) return url;

  const hit = cache.get(url);
  if (hit && hit.expires > Date.now()) return hit.promise;

  const promise = supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, EXPIRES_IN)
    .then(({ data, error }) => {
      if (error) throw new Error(error.message);
      return data.signedUrl;
    });

  cache.set(url, { promise, expires: Date.now() + CACHE_MS });
  promise.catch(() => cache.delete(url));
  return promise;
}
