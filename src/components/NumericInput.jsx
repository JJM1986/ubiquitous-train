import React from "react";

// Textbasierbares Zahlen-Eingabefeld: "Alles auswählen" beim Fokus funktioniert
// zuverlässig (im Gegensatz zu type="number"), Eingaben werden beim Verlassen
// normalisiert, sodass Zwischeneingaben das Ergebnis nicht verfälschen.
export default function NumericInput({ value, onChange, className }) {
  function handleChange(e) {
    // Nur Ziffern, Punkt, Komma, Minus zulassen; Komma -> Punkt
    const cleaned = e.target.value
      .replace(/[^0-9.,-]/g, "")
      .replace(/,/g, ".")
      // Maximal ein Punkt / Minus
      .replace(/(\..*)\./g, "$1")
      .replace(/(-.*)-/g, "$1");
    onChange(cleaned);
  }

  function handleBlur() {
    const parsed = parseFloat(value);
    onChange(isNaN(parsed) || parsed < 0 ? "0" : String(parsed));
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={value ?? ""}
      onFocus={(e) => e.target.select()}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
}