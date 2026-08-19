import React from "react";
import { ScrollText, Printer, HardHat, Box, FileCheck, Package, Map, ShieldCheck, Calculator, Mail } from "lucide-react";

const innovations = [
  {
    icon: Box,
    title: "3D-Gerüstvisualisierung mit dynamischer Materialberechnung",
    reference: "Modul: Gerüst3D / 3D-Viewer",
    description: "Interaktive dreidimensionale Darstellung von Gerüstkonstruktionen im Browser mittels WebGL (Three.js), bei der Benutzer über kontinuierliche Parameterregler Fassadenlänge, Gerüsthöhe und Feldlänge anpassen. Das System berechnet in Echtzeit den vollständigen Materialbedarf (Gerüstrahmen, Beläge, Diagonalen, Kupplungen, Fußstützen) und visualisiert gleichzeitig das 3D-Modell, das sich synchron zu den Parameteränderungen aktualisiert.",
    novelty: "Die Verknüpfung einer interaktiven 3D-Visualisierung mit einer kontinuierlichen, parametrisierten Materialbedarfsberechnung in Echtzeit für Gerüstbaukonstruktionen.",
    technical: [
      "WebGL-Rendering-Engine (Three.js) für browserbasierte 3D-Darstellung ohne Plugin",
      "Echtzeit-Aktualisierung des 3D-Modells bei Parameteränderung (Länge, Höhe, Feldlänge)",
      "Synchronisierte, parametrische Materialbedarfsberechnung basierend auf Geometrie",
      "Modulare Gerüstkomponenten-Definition (Rahmen, Beläge, Diagonalen, Kupplungen) mit Stückzahl-Ableitung aus räumlichen Dimensionen",
    ],
  },
  {
    icon: FileCheck,
    title: "Digitalisiertes Gerüstfreigabeprotokoll nach DGUV Vorschrift 38",
    reference: "Modul: Geruestfreigaben",
    description: "Vollständige Digitalisierung des Gerüstfreigabeprozesses gemäß DGUV Vorschrift 38 / TRBS 2121. Das System führt den Prüfer durch eine strukturierte Checkliste mit Prüfpunkten, ermöglicht die digitale Dokumentation des Prüfergebnisses (Freigegeben / Freigegeben mit Auflagen / Nicht freigegeben) und generiert ein druckfertiges Protokoll mit Unterschriftsfeldern.",
    novelty: "Digitale, strukturisierte Erfassung und automatische Protokollgenerierung für gesetzlich vorgeschriebene Gerüstfreigaben mit integrierter Prüfpunkt-Checkliste.",
    technical: [
      "Strukturierte Prüfpunkt-Checkliste mit Status-Tracking (bestätigt/offen/entfällt)",
      "Dynamische Protokollgenerierung mit Firmenbranding und formalen Feldern",
      "Digitale Erfassung von Lastklasse, Prüfart (Erst-/Wiederholungs-/Außerordentliche Prüfung)",
      "Print-optimierte Ausgabe mit Unterschriftsfeldern für Prüfer und Unternehmen",
      "Status-Workflow: Entwurf → Freigegeben / Abgelehnt",
    ],
  },
  {
    icon: Package,
    title: "Automatisierte Lagerbestandsüberwachung mit Schwellwert-Warnung",
    reference: "Modul: Materials / MaterialMovement",
    description: "Bei jeder Lagerbuchung (Zugang, Abgang, Ausgabe, Rückgabe) prüft das System automatisch, ob der Bestand eines Materials unter den individuell definierten Mindestbestand fällt. Beim erstmaligen Unterschreiten des Schwellwerts wird automatisch eine E-Mail-Warnung an den verantwortlichen Benutzer gesendet, die Materialname, aktuellen Bestand, Mindestbestand und Lagerort enthält.",
    novelty: "Automatisierte, ereignisgesteuerte Schwellwert-Warnung bei Lagerbestandsunterschreitung mit individueller Mindestbestandskonfiguration pro Material und E-Mail-Benachrichtigung des verantwortlichen Benutzers.",
    technical: [
      "Ereignisgesteuerte Prüfung bei jeder Lagerbuchung (Create/Update Operation)",
      "Schwellwert-Logik: Warnung nur beim erstmaligen Unterschreiten (oldStock > minStock → newStock ≤ minStock)",
      "Individueller Mindestbestand pro Material",
      "Automatische E-Mail-Generierung via SendEmail-Integration mit Materialdetails",
      "Vier Bewegungsarten: Zugang, Abgang, Ausgabe, Rückgabe mit richtungsabhängiger Bestandsberechnung",
      "Validierung gegen negative Bestände",
    ],
  },
  {
    icon: Map,
    title: "Geocodierte Baustellenkarte zur räumlichen Projektübersicht",
    reference: "Modul: ProjektKarte",
    description: "Interaktive Kartenansicht (Leaflet/OpenStreetMap), die alle Baustellen basierend auf ihren Adressen geocodiert und mit statusabhängiger Farbcodierung der Marker darstellt. Ermöglicht räumliche Logistikplanung und visuelle Priorisierung aktiver Baustellen.",
    novelty: "Integration einer interaktiven Karte mit statusbasierter Marker-Codierung für die räumliche Baustellenverwaltung im Gerüstbaukontext.",
    technical: [
      "React-Leaflet Integration mit OpenStreetMap-Tiles",
      "Geocodierte Adressdaten (Breitengrad/Längengrad) pro Projekt",
      "Statusabhängige Farbcodierung der Marker (Anfrage → Abgeschlossen)",
      "Klickbare Marker mit Projektverlinkung",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Digitale Sicherheitsunterweisung mit Unterschriftsfunktion",
    reference: "Modul: Sicherheitsunterweisungen",
    description: "Digitale Erfassung von Sicherheitsunterweisungen mit Teilnehmerliste und digitaler Unterschriftsfunktion. Jeder Teilnehmer kann per digitaler Unterschrift (mit Zeitstempel) bestätigen. Das System markiert die Unterweisung automatisch als 'Durchgeführt', wenn alle Teilnehmer unterschrieben haben.",
    novelty: "Digitale Sicherheitsunterweisungs-Dokumentation mit automatischer Status-Aktualisierung basierend auf vollständiger digitaler Unterschrift aller Teilnehmer.",
    technical: [
      "Teilnehmer-Array mit Name, Unterschriftsstatus und Zeitstempel",
      "Digital sign per Klick mit ISO-8601 Zeitstempel",
      "Automatischer Statuswechsel: Geplant → Durchgeführt bei vollständiger Unterschrift",
      "Integration der Mitarbeiterdatenbank für Teilnehmerauswahl",
      "Dokumentation von Thema, Ort, Unterweiser und Datum",
    ],
  },
  {
    icon: Calculator,
    title: "Multi-Typ Gerüstrechner mit gewichtsbasierter Materialkalkulation",
    reference: "Modul: Geruestrechner / GeruestrechnerCalc",
    description: "Parametrischer Gerüstrechner für sechs Gerüsttypen (Fassadengerüst, Gerüsttreppe, Bautreppenturm, Alutreppenturm, Gerüstschutz, Super RS), der basierend auf Benutzerparametern (Länge, Höhe, Breite, Felder, Geschosse) den vollständigen Materialbedarf und das Gesamtgewicht berechnet.",
    novelty: "Einheitliche, parametrische Berechnungsengine für multiple Gerüsttypen mit typspezifischer Parameterkonfiguration und Materialbedarfsableitung inklusive Gewichtsbestimmung.",
    technical: [
      "Sechs Gerüsttyp-spezifische Konfigurationsprofile",
      "Typspezifische Eingabeparameter (Länge, Höhe, Breite, Felder, Geschosse, Winkel)",
      "Materialbedarfsberechnung mit Stückzahlableitung aus räumlichen Parametern",
      "Gewichtskalkulation basierend auf Materialstückzahlen und Typgewichten",
      "Speicherung und Historisierung von Berechnungsergebnissen",
    ],
  },
];

const dataModels = [
  { name: "Project", fields: "Projektbezeichnung, Kunde, Adresse, Stadt, Status (6-stufiger Workflow), Start-/Enddatum, Gerüstart, Fläche, Höhe, GPS-Koordinaten, Beschreibung", purpose: "Zentrale Projekteinheit mit räumlichen und zeitlichen Daten" },
  { name: "Customer", fields: "Name, Firma, E-Mail, Telefon, Adresse, PLZ, Stadt, Notizen, Status", purpose: "Kundenstammdaten mit Kontaktinformationen" },
  { name: "Material", fields: "Bezeichnung, Kategorie, Einheit, Bestand, Mindestbestand, Lagerort, Einkaufspreis", purpose: "Materialstammdaten mit Bestands- und Schwellwertverwaltung" },
  { name: "MaterialMovement", fields: "Material, Projekt, Bewegungsart (4 Typen), Menge, Datum, Notizen", purpose: "Lagerbuchungen mit Bestandsauswirkung" },
  { name: "Materialbestellung", fields: "Material, Menge, Lieferant, Bestelldatum, Lieferdatum, Status (5-stufig), Kosten", purpose: "Nachbestellungsverwaltung mit Liefertracking" },
  { name: "Geruestfreigabe", fields: "Projekt, Kunde, Baustellenadresse, Gerüstart, -höhe, -fläche, Lastklasse, Prüfart, Prüfer, Prüfdatum, Ergebnis, Prüfpunkte-Array, Auflagen", purpose: "Freigabeprotokoll nach DGUV V38" },
  { name: "AbnahmeCheckliste", fields: "Projekt, Abnahmedatum, Prüfer, Kundenvertreter, Prüfpunkte-Array, Gesamtergebnis, Auflagen", purpose: "Bauabnahme-Dokumentation" },
  { name: "Sicherheitsunterweisung", fields: "Titel, Thema, Datum, Ort, Unterweiser, Teilnehmer-Array (Name, unterschrieben, Zeitstempel), Status", purpose: "Sicherheitsunterweisung mit digitaler Unterschrift" },
  { name: "Subunternehmer", fields: "Firma, Ansprechpartner, E-Mail, Telefon, Adresse, Gewerk, Stundensatz, Status", purpose: "Subunternehmer-Stammdaten" },
  { name: "SubunternehmerEinsatz", fields: "Subunternehmer, Projekt, Datum, Leistung, Stunden, Kosten, Status", purpose: "Subunternehmer-Einsatzplanung und -Abrechnung" },
  { name: "Dokument", fields: "Titel, Dokumenttyp, Projekt, Datei-URL, Notizen", purpose: "Zentrales Dokumentenarchiv mit PDF-Ablage" },
  { name: "BaustellenFoto", fields: "Projekt, Titel, Foto-URL, GPS-Koordinaten, Aufnahmedatum, Notizen", purpose: "Baustellen-Dokumentation mit Geo-Referenzierung" },
  { name: "Standortbestand", fields: "Material, Menge, Einheit, Standort, Projekt, Barcode, Scan-Datum, GPS-Koordinaten", purpose: "Dezentraler Materialbestand mit Barcode-Tracking" },
  { name: "Offer", fields: "Angebotsnummer, Projekt, Kunde, Datum, Gültigkeit, Status, Positionen-Array, Zwischensumme, Steuersatz, Gesamtbetrag", purpose: "Angebotsverwaltung mit dynamischer Preiskalkulation" },
  { name: "Assignment", fields: "Projekt, Mitarbeiter, Datum, Start-/Endzeit, Stunden, Tätigkeit, Status", purpose: "Mitarbeiter-Einsatzplanung" },
  { name: "GeruestrechnerResult", fields: "Gerüstart, Bezeichnung, Parameter, Materialbedarf-Array, Gesamtteile, Notizen", purpose: "Persistierte Berechnungsergebnisse" },
  { name: "Hilfeartikel", fields: "Titel, Kategorie, Zusammenfassung, Inhalt, Sortierung", purpose: "Integriertes Hilfesystem" },
  { name: "CompanySetting", fields: "Firmenname, Adresse, PLZ, Stadt, Telefon, E-Mail, Website, USt-IdNr., Steuernummer, Logo, Bankverbindung, Geschäftsführer, Handelsregister", purpose: "Zentrale Firmenstammdaten" },
];

const workflows = [
  {
    name: "Projektlebenszyklus",
    steps: ["Anfrage", "Angebot", "Beauftragt", "In Arbeit", "Abgeschlossen", "(Storniert)"],
    description: "Linearer Projekt-Status-Workflow mit Validierung (Enddatum ≥ Startdatum) und Archivierung.",
  },
  {
    name: "Lagerbewegung mit Warnung",
    steps: ["Buchung erfassen", "Bestand aktualisieren", "Schwellwert prüfen", "E-Mail senden (bei Unterschreitung)", "Dashboard-Warnung"],
    description: "Ereignisgesteuerter Prozess mit automatischer Benachrichtigung bei Mindestbestandsunterschreitung.",
  },
  {
    name: "Gerüstfreigabe",
    steps: ["Protokoll erstellen", "Prüfpunkte abarbeiten", "Ergebnis festlegen", "Drucken/Speichern", "Status: Entwurf → Freigegeben"],
    description: "DGUV V38-konformer Freigabeprozess mit digitaler Dokumentation.",
  },
  {
    name: "Sicherheitsunterweisung",
    steps: ["Unterweisung planen", "Teilnehmer hinzufügen", "Durchführung", "Digitale Unterschriften", "Auto-Status: Durchgeführt"],
    description: "Vollständige digitale Unterschriftsworkflow mit automatischem Abschluss.",
  },
];

export default function TechnischeDokumentation() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 print:hidden">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900">Technische Funktionsdokumentation</h1>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Printer className="w-4 h-4" /> Drucken / PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6 print:p-0">
        {/* Title Page */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 print:shadow-none print:border-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <HardHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GerüstMeister</h1>
              <p className="text-sm text-gray-500">Plattform zur digitalen Gerüstbauprojektverwaltung</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Technische Funktionsdokumentation</h2>
            <p className="text-sm text-gray-600">
              Diese Dokumentation beschreibt die technischen Funktionen und innovativen Verfahren der GerüstMeister-Plattform.
              Sie dient als Grundlage für die Beurteilung der Patentfähigkeit durch einen Patentanwalt.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-400 uppercase">Erstellt am</div>
                <div className="font-medium text-gray-900">{new Date().toLocaleDateString("de-DE")}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase">Version</div>
                <div className="font-medium text-gray-900">1.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Systemübersicht */}
        <Section number="1" title="Systemübersicht">
          <p className="text-sm text-gray-700 leading-relaxed">
            GerüstMeister ist eine Cloud-basierte Plattform zur ganzheitlichen Verwaltung von Gerüstbauprojekten.
            Das System deckt den kompletten Projektlebenszyklus ab: von der Kundenerfassung und Anfrage über
            Angebotserstellung, Gerüstplanung mit 3D-Visualisierung, Material- und Lagerverwaltung, Einsatzplanung,
            gerüstbauspezifische Freigabeprotokolle (DGUV Vorschrift 38) bis hin zur Bauabnahme und Dokumentenarchivierung.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mt-2">
            Die Plattform umfasst 18 Datenmodelle (Entitäten) und über 30 funktional relevante Module.
            Sie implementiert ein rollenbasiertes Zugriffssystem (Administrator / Mitarbeiter) und ist
            als responsive Web-Anwendung für Desktop- und Mobile-Nutzung (inkl. Baustelleneinsatz) konzipiert.
          </p>
        </Section>

        {/* 2. Technische Architektur */}
        <Section number="2" title="Technische Architektur">
          <ul className="text-sm text-gray-700 space-y-2">
            <li><strong>Frontend:</strong> React (Single Page Application) mit Tailwind CSS</li>
            <li><strong>Backend:</strong> Cloud-basiertes Backend-as-a-Service mit REST-API</li>
            <li><strong>Datenbank:</strong> Schemabasierte Dokumentendatenbank (JSON-Schema-Validierung)</li>
            <li><strong>Authentifizierung:</strong> Token-basiertes Auth-System mit OAuth (Google) und E-Mail/Passwort</li>
            <li><strong>3D-Rendering:</strong> Three.js / WebGL für browserbasierte 3D-Visualisierung</li>
            <li><strong>Kartenintegration:</strong> React-Leaflet mit OpenStreetMap</li>
            <li><strong>E-Mail-Integration:</strong> Serverseitige E-Mail-Versand-API für automatisierte Benachrichtigungen</li>
            <li><strong>Dateiverwaltung:</strong> Cloud-Storage mit Upload-API für PDFs und Bilder</li>
            <li><strong>Echtzeit:</strong> Subscription-basiertes Echtzeit-Update für Datenänderungen</li>
          </ul>
        </Section>

        {/* 3. Innovative Kernfunktionen */}
        <Section number="3" title="Innovative Kernfunktionen">
          <div className="space-y-6">
            {innovations.map((inn, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-5 print:break-inside-avoid">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <inn.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{inn.title}</h3>
                    <p className="text-xs text-gray-400">{inn.reference}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{inn.description}</p>
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3">
                  <div className="text-xs font-semibold text-orange-700 mb-1">Beschreibung der Neuartigkeit</div>
                  <p className="text-xs text-gray-700 leading-relaxed">{inn.novelty}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1.5">Technische Merkmale:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {inn.technical.map((t, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-orange-500 flex-shrink-0">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Prozessabläufe */}
        <Section number="4" title="Automatisierte Prozessabläufe">
          <div className="space-y-4">
            {workflows.map((wf, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-4 print:break-inside-avoid">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{wf.name}</h3>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {wf.steps.map((step, i) => (
                    <React.Fragment key={i}>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{step}</span>
                      {i < wf.steps.length - 1 && <span className="text-gray-300 text-xs">→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-xs text-gray-500">{wf.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 5. Datenmodelle */}
        <Section number="5" title="Datenmodelle (Entitäten)">
          <p className="text-sm text-gray-600 mb-4">
            Das System umfasst 18 strukturierte Datenmodelle mit JSON-Schema-Validierung.
            Jedes Modell enthält eingebaute Felder (ID, Erstellungs-/Aktualisierungsdatum, Benutzerreferenz)
            sowie modellspezifische Felder:
          </p>
          <div className="space-y-3">
            {dataModels.map((dm, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 print:break-inside-avoid">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono bg-gray-100 text-orange-600 px-2 py-0.5 rounded font-medium">{dm.name}</code>
                </div>
                <p className="text-xs text-gray-600 mb-1"><strong>Felder:</strong> {dm.fields}</p>
                <p className="text-xs text-gray-500"><strong>Zweck:</strong> {dm.purpose}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. Integrationen */}
        <Section number="6" title="Schnittstellen und Integrationen">
          <ul className="text-sm text-gray-700 space-y-2">
            <li><strong>LLM-Integration:</strong> KI-gestützte Datenabfrage und -verarbeitung (InvokeLLM)</li>
            <li><strong>E-Mail-Versand:</strong> Automatisierter E-Mail-Versand für Warnungen und Benachrichtigungen</li>
            <li><strong>Datei-Upload:</strong> Cloud-Storage für Dokumente, Fotos und private Dateien</li>
            <li><strong>Bildgenerierung:</strong> KI-gestützte Bildgenerierung</li>
            <li><strong>Videogenerierung:</strong> KI-gestützte Videogenerierung (Veo)</li>
            <li><strong>Spracherkennung:</strong> Audio-Transkription (Whisper)</li>
            <li><strong>Datenextraktion:</strong> Strukturierte Datenextraktion aus PDFs, Excel, CSV</li>
            <li><strong>Sprachausgabe:</strong> Text-to-Speech-Integration</li>
            <li><strong>Echtzeit-Subscriptions:</strong> Push-basierte Datenaktualisierung bei Änderungen</li>
          </ul>
        </Section>

        {/* 7. Zusammenfassung */}
        <Section number="7" title="Zusammenfassung zur Patentfähigkeit">
          <div className="bg-gray-50 rounded-xl p-5 print:break-inside-avoid">
            <p className="text-sm text-gray-700 leading-relaxed">
              Die GerüstMeister-Plattform implementiert mehrere technische Verfahren, die für eine Patentprüfung
              hinsichtlich <strong>Neuheit</strong>, <strong>erfinderischer Tätigkeit</strong> und
              <strong> gewerblicher Anwendbarkeit</strong> evaluiert werden können:
            </p>
            <ol className="text-sm text-gray-700 space-y-2 mt-3 list-decimal pl-5">
              <li>Die <strong>Verknüpfung von 3D-Gerüstvisualisierung mit parametrischer Materialberechnung in Echtzeit</strong> stellt ein technisches Verfahren dar, das im Gerüstbaukontext neuartig sein kann.</li>
              <li>Die <strong>automatisierte, ereignisgesteuerte Schwellwert-Warnung</strong> bei Lagerbestandsunterschreitung mit individueller Konfiguration und E-Mail-Benachrichtigung verkörpert ein technisches Überwachungsverfahren.</li>
              <li>Die <strong>digitale Sicherheitsunterweisung mit automatischem Statusabschluss</strong> bei vollständiger Unterschrift aller Teilnehmer stellt ein automatisiertes Dokumentationsverfahren dar.</li>
              <li>Die <strong>digitalisierte Gerüstfreigabeprotokoll-Generierung nach DGUV V38</strong> mit strukturiertem Prüfpunkt-Workflow ist ein domänenspezifisches Verfahren.</li>
            </ol>
            <p className="text-sm text-gray-700 leading-relaxed mt-4">
              Diese Dokumentation dient als technische Grundlage. Die endgültige Beurteilung der Patentfähigkeit
              sollte durch einen qualifizierten Patentanwalt für Softwarepatente erfolgen, der eine Recherche
              nach entgegenstehenden Stand der Technik durchführt.
            </p>
          </div>
        </Section>

        <div className="text-center text-xs text-gray-400 py-6 print:py-3">
          GerüstMeister – Technische Funktionsdokumentation v1.0 · Erstellt am {new Date().toLocaleDateString("de-DE")}
        </div>
      </div>
    </div>
  );
}

function Section({ number, title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 print:shadow-none print:border-0 print:break-inside-avoid">
      <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">{number}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}