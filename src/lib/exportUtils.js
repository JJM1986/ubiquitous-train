import jsPDF from "jspdf";
import { downloadCSV, dateStr } from "./csvExport";

export function exportCSV(filename, headers, rows) {
  downloadCSV(filename, headers, rows);
}

export function exportPDF(title, headers, rows, meta = {}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, y);
  y += 8;

  // Meta info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (meta.company) {
    doc.text(meta.company, 14, y);
    y += 5;
  }
  doc.text(`Erstellt am: ${dateStr()}`, 14, y);
  y += 10;

  // Table
  const colCount = headers.length;
  const colWidth = (pageWidth - 28) / colCount;

  // Header row
  doc.setFillColor(249, 115, 22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.rect(14, y - 4, pageWidth - 28, 7, "F");
  headers.forEach((h, i) => {
    doc.text(String(h), 14 + i * colWidth + 1, y);
  });
  y += 7;

  // Data rows
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  rows.forEach((row, idx) => {
    if (y > doc.internal.pageSize.getHeight() - 15) {
      doc.addPage();
      y = 20;
      doc.setFillColor(249, 115, 22);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.rect(14, y - 4, pageWidth - 28, 7, "F");
      headers.forEach((h, i) => doc.text(String(h), 14 + i * colWidth + 1, y));
      y += 7;
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
    }
    if (idx % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(14, y - 4, pageWidth - 28, 6, "F");
    }
    row.forEach((cell, i) => {
      const val = String(cell ?? "");
      const truncated = val.length > 30 ? val.substring(0, 28) + "…" : val;
      doc.text(truncated, 14 + i * colWidth + 1, y);
    });
    y += 6;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Erstellt mit GerüstMeister", 14, doc.internal.pageSize.getHeight() - 10);

  doc.save(`${title.replace(/\s+/g, "_")}_${dateStr()}.pdf`);
}

export function exportMaterialsPDF(materials) {
  const headers = ["Bezeichnung", "Kategorie", "Bestand", "Einheit", "Mindest", "Lagerort"];
  const rows = materials.map(m => [
    m.name || "",
    m.category || "",
    m.stock ?? 0,
    m.unit || "",
    m.min_stock ?? 0,
    m.location || "",
  ]);
  exportPDF("Materialliste", headers, rows);
}

export function exportMaterialsCSV(materials) {
  const headers = ["Bezeichnung", "Kategorie", "Bestand", "Einheit", "Mindestbestand", "Lagerort", "Einkaufspreis"];
  const rows = materials.map(m => [
    m.name || "",
    m.category || "",
    m.stock ?? 0,
    m.unit || "",
    m.min_stock ?? 0,
    m.location || "",
    m.purchase_price ?? "",
  ]);
  exportCSV("Materialliste.csv", headers, rows);
}

export function exportProjectPDF(project, customer) {
  const headers = ["Feld", "Wert"];
  const rows = [
    ["Projekt", project.title || ""],
    ["Kunde", customer?.name || ""],
    ["Adresse", [project.address, project.city].filter(Boolean).join(", ") || ""],
    ["Status", project.status || ""],
    ["Baustellen-Status", project.baustelle_status || ""],
    ["Startdatum", project.start_date || ""],
    ["Enddatum", project.end_date || ""],
    ["Aufbaudatum", project.assembly_date || ""],
    ["Abbaudatum", project.disassembly_date || ""],
    ["Gerüstart", project.scaffold_type || ""],
    ["Fläche (m²)", project.scaffold_area || ""],
    ["Höhe (m)", project.scaffold_height || ""],
    ["Beschreibung", project.description || ""],
    ["Notizen", project.notes || ""],
  ];
  exportPDF(`Projektbericht_${project.title || ""}`, headers, rows, { company: customer?.name });
}