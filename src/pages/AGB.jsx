import React from "react";
import { Link } from "react-router-dom";
import { HardHat, ArrowLeft } from "lucide-react";

export default function AGB() {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 text-sm text-gray-700">
          <p className="text-gray-500 text-xs">Diese AGB sind eine Vorlage und sollten vor Veröffentlichung rechtlich geprüft werden.</p>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">§ 1 Geltungsbereich</h2>
            <p>Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Software-as-a-Service-Plattform „GerüstMeister" durch gewerbliche Kunden (Gerüstbauunternehmen).</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">§ 2 Testphase</h2>
            <p>Neue Kunden können GerüstMeister 30 Tage kostenlos testen. Während der Testphase stehen alle Funktionen zur Verfügung. Eine Kreditkarte ist für die Testphase nicht erforderlich.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">§ 3 Abonnements und Preise</h2>
            <p>Nach Ablauf der Testphase ist ein kostenpflichtiges Abonnement erforderlich. Die Preise richten sich nach der gewählten Paketgröße. Die Abrechnung erfolgt monatlich. Das Abonnement ist monatlich kündbar.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">§ 4 Nutzungsrechte</h2>
            <p>Der Kunde erhält ein nicht-ausschließliches, zeitlich befristetes Nutzungsrecht an der Software für die Dauer des Abonnements. Eine Übertragung an Dritte ist nicht gestattet.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">§ 5 Pflichten des Kunden</h2>
            <p>Der Kunde ist für die Richtigkeit, Vollständigkeit und Aktualität der eingegebenen Daten (Projekte, Kunden, Material, Baustellen) selbst verantwortlich. Zugangsdaten sind vertraulich zu behandeln. Der Kunde stellt sicher, dass für die über die Plattform verarbeiteten personenbezogenen Daten Dritter (z. B. Kunden-Mitarbeiter, Baustellenpersonal) eine gültige Rechtsgrundlage vorliegt.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">§ 5a Auftragsverarbeitungsvertrag (AVV)</h2>
            <p>Da GerüstMeister als Auftragsverarbeiter im Sinne des Art. 28 DSGVO tätig wird, ist vor der Verarbeitung personenbezogener Daten ein Auftragsverarbeitungsvertrag zwischen dem Kunden und GerüstMeister abzuschließen. Dieser kann unter den in der Datenschutzerklärung genannten Kontaktdaten angefordert werden. Mit der Dateneingabe erklärt der Kunde, den AVV anzuerkennen, soweit er nicht ausdrücklich widerspricht.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">§ 6 Verfügbarkeit</h2>
            <p>Wir bemühen uns, eine Verfügbarkeit von 99 % zu gewährleisten. Wartungsarbeiten und Störungen können zeitweise zu Unterbrechungen führen.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">§ 7 Datenschutz</h2>
            <p>Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung, den geltenden gesetzlichen Vorschriften (insbesondere DSGVO und BDSG) und dem abgeschlossenen Auftragsverarbeitungsvertrag.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">§ 8 Haftung und Haftungsausschluss</h2>
            <p><strong>(1)</strong> Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit keine Verletzung von Leben, Körper, Gesundheit oder wesentlichen Vertragspflichten vorliegt.</p>
            <p className="mt-2"><strong>(2) Software-Haftung – Materialmengen:</strong> GerüstMeister berechnet Materialbedarfe, Gerüstkonfigurationen und Mengen automatisch auf Basis der vom Kunden eingegebenen Parameter. Diese Berechnungen sind <strong>Planungs- und Unterstützungswerkzeuge</strong> und ersetzen keine fachgerechte Planung durch qualifiziertes Personal. Für die Richtigkeit der berechneten Materialmengen, Abmessungen, Belastungswerte und sonstigen technischen Ausgaben wird <strong>keine Gewähr</strong> übernommen.</p>
            <p className="mt-2"><strong>(3)</strong> Der Kunde ist verpflichtet, alle von GerüstMeister erzeugten Ergebnisse (insbesondere Materiallisten, Gerüstpläne, Mengenberechnungen) vor Umsetzung auf Plausibilität und fachliche Richtigkeit zu prüfen. Die finale Freigabe und Bauausführung erfolgt durch den Kunden bzw. dessen qualifizierte Mitarbeiter.</p>
            <p className="mt-2"><strong>(4)</strong> GerüstMeister haftet <strong>nicht</strong> für Schäden, die aus fehlerhaften, unvollständigen oder missverständlich eingegebenen Daten resultieren, insbesondere nicht für Materialbestellungen, Bauverzögerungen, Fehlmengen oder Baumängel, die auf unkorrekte Software-Ausgaben zurückzuführen sind.</p>
            <p className="mt-2"><strong>(5)</strong> Die Software wird im Zustand einer funktionsfähigen Beta-Version bereitgestellt. Es kann zu Fehlern, unvorhersehbarem Verhalten oder Datenverlust kommen. Der Kunde wird regelmäßig angewiesen, Datensicherungen durchzuführen und wichtige Daten extern abzuspeichern.</p>
            <p className="mt-2"><strong>(6)</strong> Eine Haftung für mittelbare Schäden, insbesondere entgangenen Gewinn, Betriebsunterbrechung, Datenverlust oder Folgeschäden aus Bauverzögerungen, ist – soweit gesetzlich zulässig – ausgeschlossen.</p>
            <p className="mt-2"><strong>(7)</strong> Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">§ 8a DSGVO-Konformität und Dateneingabe durch Dritte</h2>
            <p>Der Kunde sichert zu, dass er die über GerüstMeister verarbeiteten Daten im Einklang mit der DSGVO und dem BDSG erhebt und verarbeitet. Er stellt GerüstMeister von sämtlichen Ansprüchen Dritter frei, die aus einer unrechtmäßigen Dateneingabe oder unzureichenden Information der Betroffenen resultieren.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-semibold text-gray-900 mb-1">§ 9 Schlussbestimmungen</h2>
            <p>Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist [Ort]. Sollten einzelne Bestimmungen unwirksam sein, bleibt der übrige Vertrag wirksam.</p>
          </div>
        </div>
      </div>
    </div>
  );
}