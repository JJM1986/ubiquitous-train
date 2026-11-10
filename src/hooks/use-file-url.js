import * as React from "react"
import { resolveFileUrl, storagePath } from "@/lib/storageUrl"

/**
 * Gespeicherte Datei-URL -> { url, error }.
 * url ist null, solange der signierte Link laedt oder das Signieren
 * fehlgeschlagen ist; im Fehlerfall ist error gesetzt.
 */
export function useFileUrl(url) {
  const [state, setState] = React.useState(() => ({ url: storagePath(url) ? null : url, error: null }))

  React.useEffect(() => {
    if (!storagePath(url)) {
      setState({ url, error: null })
      return
    }
    let active = true
    setState({ url: null, error: null })
    resolveFileUrl(url)
      .then((signed) => { if (active) setState({ url: signed, error: null }) })
      .catch((err) => {
        console.error("[Storage]", err)
        if (active) setState({ url: null, error: err })
      })
    return () => { active = false }
  }, [url])

  return state
}
