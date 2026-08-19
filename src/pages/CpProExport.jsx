import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { downloadCSV, dateStr } from "@/lib/csvExport";
import { Users, Briefcase, FileText, Package, Calculator, Download, FileBarChart } from "lucide-react";
import { toast } from "sonner";

export default function CpProExport() {
  const [exporting, setExporting] = useState(null);

  async function exportCustomers() {
    setExporting("customers");
    const data = await safeCall(() => base44.entities.Customer.list(), { fallback: [], message: "Daten konnten nicht geladen werden." });
    downloadCSV(`Kunden_${dateStr()}.csv`,
      ["Name", "Firma", "E-Mail", "Telefon", "Adresse", "PLZ", "Stadt", "Status"],
      data.map((c) => [c.name, c.company, c.email, c.phone, c.address, c.zip, c.city, c.status])
    );
    setExporting(null);
  }

  async function exportProjects() {
    setExporting("projects");
    const [projects, customers] = await Promise.all([
      base44.entities.Project.list(),
      base44.entities.Customer.list(),
    ]);
    const cmap = Object.fromEntries(customers.map((c) => [c.id, c.name]));
    downloadCSV(`Projekte_${dateStr()}.csv`,
      ["Projektbezeichnung", "Kunde", "Baustellenadresse", "Stadt", "Status", "Startdatum", "Enddatum", "Geruestart", "Flaeche_m2", "Hoehe_m", "Beschreibung"],
      projects.map((p) => [
        p.title, cmap[p.customer_id] || "", p.address, p.city, p.status,
        p.start_date, p.end_date, p.scaffold_type, p.scaffold_area, p.scaffold_height, p.description,
      ])
    );
    setExporting(null);
  }

  async function exportOffers() {
    setExporting("offers");
    const [offers, projects, customers] = await Promise.all([
      base44.entities.Offer.list(),
      base44.entities.Project.list(),
      base44.entities.Customer.list(),
    ]);
    const pmap = Object.fromEntries(projects.map((p) => [p.id, p.title]));
    const cmap = Object.fromEntries(customers.map((c) => [c.id, c.name]));
    const rows = [];
    offers.forEach((o) => {
      const positions = o.positions?.length
        ? o.positions
        : [{ description: "", quantity: "", unit: "", unit_price: "" }];
      positions.forEach((pos) => {
        rows.push([
          o.offer_number, pmap[o.project_id] || "", cmap[o.customer_id] || "",
          o.date, o.valid_until, o.status,
          pos.description, pos.quantity, pos.unit, pos.unit_price,
          (pos.quantity || 0) * (pos.unit_price || 0),
          o.subtotal, o.tax_rate, o.total,
        ]);
      });
    });
    downloadCSV(`Angebote_${dateStr()}.csv`,
      ["Angebotsnr", "Projekt", "Kunde", "Datum", "Gueltig_bis", "Status", "Position", "Menge", "Einheit", "Einzelpreis", "Positionspreis", "Nettobetrag", "MwSt_Prozent", "Gesamtbetrag"],
      rows
    );
    setExporting(null);
  }

  async function exportMaterials() {
    setExporting("materials");
    const data = await safeCall(() => base44.entities.Material.list(), { fallback: [], message: "Daten konnten nicht geladen werden." });
    downloadCSV(`Material_${dateStr()}.csv`,
      ["Bezeichnung", "Kategorie", "Einheit", "Bestand", "Mindestbestand", "Lagerort", "Einkaufspreis"],
      data.map((m) => [m.name, m.category, m.unit, m.stock, m.min_stock, m.location, m.purchase_price])
    );
    setExporting(null);
  }

  async function exportGeruestrechner() {
    setExporting("geruestrechner");
    const data = await safeCall(() => base44.entities.GeruestrechnerResult.list("-created_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
    const rows = [];
    data.forEach((r) => {
      const mats = r.materials?.length ? r.materials : [{ name: "", qty: "", unit: "" }];
      mats.forEach((m) => {
        rows.push([
          r.title, r.scaffold_type, r.parameters,
          m.name, m.qty, m.unit, r.total_items,
        ]);
      });
    });
    downloadCSV(`Geruestrechner_${dateStr()}.csv`,
      ["Bezeichnung", "Geruestart", "Parameter", "Material", "Menge", "Einheit", "Gesamtteile"],
      rows
    );
    setExporting(null);
  }

  const cards = [
    {
      key: "customers",
      title: "Kunden exportieren",
      desc: "Kundenstammdaten als CSV — importierbar in CP-Pro Faktura",
      icon: Users,
      onExport: exportCustomers,
    },
    {
      key: "projects",
      title: "Projekte exportieren",
      desc: "Projektdaten mit Kundenzuordnung — für CP-Pro Faktura & Dispo",
      icon: Briefcase,
      onExport: exportProjects,
    },
    {
      key: "offers",
      title: "Angebote exportieren",
      desc: "Angebote mit allen Positionen — für CP-Pro Faktura/Abrechnung",
      icon: FileText,
      onExport: exportOffers,
    },
    {
      key: "materials",
      title: "Material & Lager exportieren",
      desc: "Lagerbestand und Materialstammdaten — für CP-Pro Lager",
      icon: Package,
      onExport: exportMaterials,
    },
    {
      key: "geruestrechner",
      title: "Gerüstrechner-Ergebnisse exportieren",
      desc: "Berechnete Materiallisten — für CP-Pro Lager & Kalkulation",
      icon: Calculator,
      onExport: exportGeruestrechner,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CP-Pro Export</h1>
            <p className="text-sm text-gray-400">Daten als CSV exportieren — importierbar in CP-Pro Gerüstbau-Office</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
          <p className="font-medium mb-1">So funktioniert der Export:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
            <li>Gewünschten Bereich unten anklicken — CSV-Datei wird heruntergeladen</li>
            <li>In CP-Pro Gerüstbau-Office den Daten-Import öffnen</li>
            <li>CSV-Datei auswählen und Felder zuordnen</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            const isLoading = exporting === card.key;
            return (
              <div
                key={card.key}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{card.title}</h3>
                </div>
                <p className="text-xs text-gray-400 flex-1 mb-4">{card.desc}</p>
                <button
                  onClick={card.onExport}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {isLoading ? "Exportiere..." : "CSV herunterladen"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}