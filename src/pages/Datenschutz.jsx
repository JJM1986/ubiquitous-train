import React from "react";
import { Link } from "react-router-dom";
import { HardHat, ArrowLeft } from "lucide-react";

export default function Datenschutz() {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Datenschutzerklärung</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 text-sm text-gray-700">
          <p className="text-gray-500 text-xs">Die folgende Datenschutzerklärung ist eine Vorlage und sollte vor Veröffentlichung durch einen Rechtsanwalt auf Ihre spezifische Datenschulsituation angepasst werden.</p>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">1. Datenschutz auf einen Blick</h2>
            <p>Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir behandeln Ihre Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften (DSGVO) sowie dieser Datenschutzerklärung.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">2. Verantwortliche Stelle</h2>
            <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br/><br/>[Firmenname]<br/>[Straße Hausnummer]<br/>[PLZ Ort]<br/>E-Mail: [E-Mail-Adresse]</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">3. Erhebung und Speicherung personenbezogener Daten</h2>
            <p>Bei der Registrierung und Nutzung von GerüstMeister erheben wir folgende Daten:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Name und E-Mail-Adresse (bei Registrierung)</li>
              <li>Projektdaten, Kundendaten und Materialdaten (von Ihnen eingegeben)</li>
              <li>Baustellen-Fotos und Standortdaten (bei Verwendung der mobilen Funktionen)</li>
              <li>Nutzungsdaten (Zeitpunkt der Anmeldung, ausgeführte Aktionen)</li>
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">4. Verwendung der Daten</h2>
            <p>Die erhobenen Daten werden ausschließlich zur Bereitstellung und Verbesserung der GerüstMeister-Plattform verwendet. Eine Weitergabe an Dritte erfolgt nicht, soweit keine gesetzliche Verpflichtung besteht.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">5. Ihre Rechte</h2>
            <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten. Wenden Sie sich dafür an die oben genannte Kontaktadresse.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">6. Speicherdauer</h2>
            <p>Personenbezogene Daten werden gespeichert, solange der Zweck der Speicherung besteht oder gesetzliche Aufbewahrungsfristen dies erfordern.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">7. SSL-Verschlüsselung</h2>
            <p>Diese Website nutzt aus Sicherheitsgründen eine SSL-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an der Adresszeile des Browsers (https://).</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">8. Rechtsgrundlagen der Verarbeitung (Art. 6 DSGVO)</h2>
            <p>Die Verarbeitung personenbezogener Daten erfolgt auf folgenden Rechtsgrundlagen:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Art. 6 Abs. 1 lit. b DSGVO</strong> – Durchführung des Vertragsverhältnisses (Bereitstellung der SaaS-Plattform)</li>
              <li><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> – Berechtigte Interessen an der Sicherstellung und Verbesserung der Plattform</li>
              <li><strong>Art. 6 Abs. 1 lit. c DSGVO</strong> – Erfüllung rechtlicher Verpflichtungen (z. B. Aufbewahrungsfristen nach HGB/AO)</li>
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">9. Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO</h2>
            <p>GerüstMeister verarbeitet Kunden- und Projektdaten im Auftrag des nutzenden Unternehmens (Kunde). Der Kunde ist <strong>Verantwortlicher</strong> im Sinne der DSGVO, GerüstMeister handelt als <strong>Auftragsverarbeiter</strong>.</p>
            <p className="mt-2">Vor der erstmaligen Verarbeitung personenbezogener Daten wird ein Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 Abs. 3 DSGVO zwischen dem Kunden und GerüstMeister geschlossen. Dieser regelt:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Gegenstand, Dauer und Art der Datenverarbeitung</li>
              <li>Art der personenbezogenen Daten und betroffenen Personen (Kundendaten, Mitarbeiterdaten, Baustellendaten)</li>
              <li>Technische und organisatorische Maßnahmen (TOMs) gemäß Art. 32 DSGVO</li>
              <li>Weiterverarbeitung durch Unterauftragsverarbeiter (Subunternehmer)</li>
              <li>Löschungs- und Rückgabepflicht nach Beendigung des Auftrags</li>
            </ul>
            <p className="mt-2 text-orange-600 font-medium">Der AVV kann jederzeit unter den in § 2 genannten Kontaktdaten angefordert werden und ist vor der Dateneingabe verbindlich abzuschließen.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">10. Verarbeitung von Kunden- und Projektdaten</h2>
            <p>Das nutzende Unternehmen (Gerüstbauunternehmen) trägt die alleinige Verantwortung für die Richtigkeit, Rechtmäßigkeit und Erforderlichkeit der über GerüstMeister verarbeiteten Kundendaten und Projektdaten. GerüstMeister verarbeitet diese Daten ausschließlich nach den Weisungen des Kunden und im Rahmen der vertraglichen Vereinbarung.</p>
            <p className="mt-2">Sollen über GerüstMeister personenbezogene Daten von <strong>Dritten</strong> (z. B. Kunden-Mitarbeiter, Baustellenpersonal) verarbeitet werden, so stellt der Kunde sicher, dass eine gültige Rechtsgrundlage (z. B. Einwilligung, Vertragserfüllung) vorliegt und die betroffenen Personen gemäß Art. 13/14 DSGVO informiert wurden.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">11. Technische und organisatorische Maßnahmen (TOMs)</h2>
            <p>Zur Gewährleistung der Sicherheit der Datenverarbeitung werden folgende Maßnahmen gemäß Art. 32 DSGVO getroffen:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>SSL/TLS-Verschlüsselung der Datenübertragung</li>
              <li>Authentifizierung und rollenbasierte Zugriffskontrolle</li>
              <li>Regelmäßige Sicherheitsupdates und Systemüberwachung</li>
              <li>Datenschutzfreundliche Standardkonfiguration (Art. 25 DSGVO)</li>
              <li>Protokollierung von Zugriffen und Datenänderungen</li>
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">12. Subunternehmer (Unterauftragsverarbeiter)</h2>
            <p>GerüstMeister setzt für Hosting und Datenspeicherung Unterauftragsverarbeiter ein. Diese werden sorgfältig ausgewählt und vertraglich gemäß Art. 28 Abs. 2 und 4 DSGVO verpflichtet. Über wesentliche Änderungen der Unterauftragsverhältnisse wird der Kunde informiert.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">13. Datenübermittlung in Drittländer</h2>
            <p>Eine Übermittlung personenbezogener Daten in Länder außerhalb der EU/des EWR erfolgt nur bei Vorliegen eines Angemessenheitsbeschlusses, geeigneter Garantien (z. B. EU-Standardvertragsklauseln gemäß Art. 46 DSGVO) oder mit ausdrücklicher Einwilligung.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">14. Meldung von Datenschutzverletzungen</h2>
            <p>Im Falle einer Verletzung des Schutzes personenbezogener Daten informiert GerüstMeister den Verantwortlichen unverzüglich, damit dieser seiner Meldepflicht gemäß Art. 33 DSGVO nachkommen kann, soweit die Verletzung voraussichtlich ein Risiko für die Rechte und Freiheiten natürlicher Personen birgt.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">15. Beschwerderecht bei der Aufsichtsbehörde</h2>
            <p>Jede betroffene Person hat das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, wenn sie der Ansicht ist, dass die Verarbeitung ihrer Daten gegen die DSGVO verstößt. Zuständig ist die Aufsichtsbehörde am Sitz des Unternehmens oder der Wohnsitz des Betroffenen.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">16. Datenschutzbeauftragter</h2>
            <p>Soweit nach Art. 37 DSGVO erforderlich, wurde ein Datenschutzbeauftragter benannt. Kontaktdaten können über die in § 2 genannte Stelle erfragt werden.</p>
          </div>
        </div>
      </div>
    </div>
  );
}