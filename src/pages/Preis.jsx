import React from "react";
import { Link } from "react-router-dom";
import { HardHat, Check, ArrowRight, Calendar, Zap, Shield } from "lucide-react";

const plans = [
  {
    name: "Klein",
    target: "1–5 Mitarbeiter",
    price: "69",
    icon: Zap,
    features: [
      "Projektverwaltung",
      "Material & Lager mit Bestandswarnung",
      "Gerüstrechner (6 Typen)",
      "Mobile Baustellenansicht",
      "Baustellen-Fotos & Scan",
      "E-Mail Support",
    ],
    highlighted: false,
  },
  {
    name: "Mittel",
    target: "6–25 Mitarbeiter",
    price: "199",
    icon: Shield,
    features: [
      "Alles aus Klein",
      "3D-Gerüstvisualisierung",
      "Gerüstfreigaben (DGUV V38)",
      "Sicherheitsunterweisungen",
      "Baustellenkarte (Geo)",
      "Angebotsverwaltung",
      "Einsatzplaner",
      "Priorisierter Support",
    ],
    highlighted: true,
  },
  {
    name: "Pro",
    target: "26+ Mitarbeiter",
    price: "449",
    icon: HardHat,
    features: [
      "Alles aus Mittel",
      "Subunternehmer-Portal",
      "Einsatzberichte & Wochenauswertung",
      "Dokumentenarchiv",
      "CP-Pro Export",
      "Technische Dokumentation",
      "API-Zugriff",
      "Dedizierter Support",
    ],
    highlighted: false,
  },
];

export default function Preis() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">GerüstMeister</span>
          </div>
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Anmelden
          </Link>
        </div>
      </header>

      <section className="text-center py-12 px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Preismodell</h1>
        <p className="mt-3 text-gray-600 max-w-xl mx-auto">
          Die All-in-One-Plattform für Gerüstbauunternehmen. Wählen Sie das passende Paket.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
          <Calendar className="w-4 h-4" />
          30 Tage kostenlos testen · Keine Kreditkarte erforderlich
        </div>
      </section>

      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl border-2 p-6 flex flex-col ${
                plan.highlighted ? "border-orange-500 shadow-lg relative" : "border-gray-100 shadow-sm"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Beliebt
                </div>
              )}
              <div className="flex items-center gap-2 mb-1">
                <plan.icon className={`w-5 h-5 ${plan.highlighted ? "text-orange-500" : "text-gray-400"}`} />
                <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">{plan.target}</p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500"> € / Monat</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Testphase starten <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-3">Häufige Fragen</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-900">Wie läuft die Testphase ab?</p>
              <p className="text-gray-600">Nach der Registrierung haben Sie 30 Tage vollen Zugriff auf alle Funktionen. Keine Kreditkarte erforderlich.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Kann ich jederzeit wechseln?</p>
              <p className="text-gray-600">Ja, Sie können monatlich kündigen oder zwischen Paketen wechseln.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Sind alle Benutzer inklusive?</p>
              <p className="text-gray-600">Die Preise gelten pro Firma, unabhängig von der Anzahl der Benutzer innerhalb der Paketgröße.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-6 text-center">
        <div className="flex justify-center gap-4 text-sm text-gray-500 mb-2">
          <Link to="/impressum" className="hover:text-gray-900">Impressum</Link>
          <Link to="/datenschutz" className="hover:text-gray-900">Datenschutz</Link>
          <Link to="/agb" className="hover:text-gray-900">AGB</Link>
        </div>
        <div className="text-sm text-gray-400">© {new Date().getFullYear()} GerüstMeister · Gerüstbau-ERP</div>
      </footer>
    </div>
  );
}