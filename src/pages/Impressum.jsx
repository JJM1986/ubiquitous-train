import React from "react";
import { Link } from "react-router-dom";
import { HardHat, ArrowLeft } from "lucide-react";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/preise" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Zurück
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">GerüstMeister</span>
          </div>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Impressum</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Angaben gemäß § 5 DDG (digitale Dienste-Gesetz)</p>
            <p className="text-gray-500 text-xs mt-2">Bitte ersetzen Sie diese Platzhalter durch Ihre tatsächlichen Firmendaten (unter Verwaltung → Firmeneinstellungen).</p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">Unternehmen</h2>
            <p>[Firmenname]<br/>[Straße Hausnummer]<br/>[PLZ Ort]</p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">Kontakt</h2>
            <p>Telefon: [Telefonnummer]<br/>E-Mail: [E-Mail-Adresse]<br/>Web: [Website]</p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">Vertretungsberechtigt</h2>
            <p>[Geschäftsführer]</p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">Registereintrag</h2>
            <p>Registergericht: [Registergericht]<br/>Registernummer: [Registernummer]</p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">Umsatzsteuer-ID</h2>
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [USt-IdNr.]</p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">Berufsbezeichnung</h2>
            <p>Gerüstbauer (anerkannter Ausbildungsberuf)<br/>Zuständige Kammer: [Handwerkskammer]</p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">Verbraucherstreitbeilegung</h2>
            <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}