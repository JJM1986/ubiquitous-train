import * as React from "react"
import { resolveFileUrl, storagePath } from "@/lib/storageUrl"

/** Gespeicherte Datei-URL -> anzeigbare URL; null, solange der signierte Link laedt */
export function useFileUrl(url) {
  const [resolved, setResolved] = React.useState(() => (storagePath(url) ? null : url))

  React.useEffect(() => {
    if (!storagePath(url)) {
      setResolved(url)
      return
    }
    let active = true
    setResolved(null)
    resolveFileUrl(url)
      .then((signed) => { if (active) setResolved(signed) })
      .catch((err) => console.error("[Storage]", err))
    return () => { active = false }
  }, [url])

  return resolved
}
