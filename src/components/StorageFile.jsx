import React from "react";
import { useFileUrl } from "@/hooks/use-file-url";
import { resolveFileUrl } from "@/lib/storageUrl";

/**
 * Anzeige von Dateien aus dem privaten Bucket "uploads".
 * Nehmen die gespeicherte URL entgegen und setzen intern einen signierten Link ein.
 */

export function StorageImage({ src, alt = "", className, ...props }) {
  const url = useFileUrl(src);
  if (!url) return <div className={`${className || ""} bg-gray-100 animate-pulse`} />;
  return <img src={url} alt={alt} className={className} {...props} />;
}

export function StorageFrame({ src, ...props }) {
  const url = useFileUrl(src);
  if (!url) return null;
  return <iframe src={url} {...props} />;
}

/** Link, der den signierten Link erst beim Klick erzeugt (bleibt so immer gueltig) */
export function StorageLink({ href, children, ...props }) {
  async function open(e) {
    e.preventDefault();
    // Fenster sofort oeffnen, damit Popup-Blocker nicht eingreifen
    // ("noopener" geht hier nicht, dann liefert window.open null zurueck)
    const win = window.open("", "_blank");
    if (win) win.opener = null;
    try {
      const url = await resolveFileUrl(href);
      if (win) win.location.href = url;
      else window.location.href = url;
    } catch (err) {
      console.error("[Storage]", err);
      win?.close();
    }
  }
  return <a href={href} onClick={open} {...props}>{children}</a>;
}
