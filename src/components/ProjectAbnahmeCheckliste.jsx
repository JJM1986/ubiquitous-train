import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ClipboardCheck, Save, Check, X, Minus, Plus } from "lucide-react";

const DEFAULT_CHECKPOINTS = [
  "Gerüst entspricht Aufstellplan und Statik",
  "Standsicherheit und Verankerung geprüft",
  "Beläge korrekt verlegt und gesichert",
  "Belastungsklasse eingehalten (Schild angebracht)",
  "Geländer und Knielehnen vollständig",
  "Schutzvorrichtungen (Fanggitter/Netz) installiert",
  "Zugänge und Treppen sicher begehbar",
  "Anschlüsse und Durchführungen korrekt ausgeführt",
  "Material vollständig verbaut, keine Fehlteile",
  "Baustelle ordnungsgemäß geräumt",
  "Freigabeprotokoll und Dokumentation übergeben",
  "Keine Mängel erkennbar",
];

const statusConfig = {
  offen: { label: "Offen", icon: Minus, color: "bg-gray-100 text-gray-600 hover:bg-gray-200", activeColor: "bg-gray-200 text-gray-900 ring-2 ring-gray-300" },
  bestaetigt: { label: "Bestätigt", icon: Check, color: "bg-green-100 text-green-600 hover:bg-green-200", activeColor: "bg-green-500 text-white ring-2 ring-green-300" },
  entfaellt: { label: "Entfällt", icon: X, color: "bg-gray-50 text-gray-400 hover:bg-gray-100", activeColor: "bg-gray-300 text-gray-600 ring-2 ring-gray-400" },
};

const overallColors = {
  "Freigegeben": "bg-green-100 text-green-700",
  "Freigegeben mit Auflagen": "bg-yellow-100 text-yellow-700",
  "Nicht freigegeben": "bg-red-100 text-red-700",
};

export default function ProjectAbnahmeCheckliste({ projectId, projectName, customerName }) {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [projectId]);

  async function load() {
    setLoading(true);
    const items = await safeCall(() => base44.entities.AbnahmeCheckliste.filter({ project_id: projectId }), { fallback: [], message: "Daten konnten nicht geladen werden." });
    if (items.length > 0) {
      setChecklist(items[0]);
    } else {
      setChecklist(null);
    }
    setLoading(false);
  }

  function createNew() {
    setChecklist({
      project_id: projectId,
      project_name: projectName,
      customer_name: customerName || "",
      inspection_date: new Date().toISOString().split("T")[0],
      inspector_name: "",
      client_representative: "",
      status: "Entwurf",
      checkpoints: DEFAULT_CHECKPOINTS.map((item) => ({ item, status: "offen", notes: "" })),
      overall_result: "",
      conditions: "",
      notes: "",
    });
  }

  async function save() {
    setSaving(true);
    const allDone = checklist.checkpoints.every((cp) => cp.status === "bestaetigt" || cp.status === "entfaellt");
    const finalData = { ...checklist, status: allDone ? "Abgeschlossen" : "Entwurf" };
    if (checklist.id) {
      const updated = await safeCall(() => base44.entities.AbnahmeCheckliste.update(checklist.id, finalData), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
      setChecklist(updated);
    } else {
      const created = await safeCall(() => base44.entities.AbnahmeCheckliste.create(finalData), { fallback: null, message: "Speichern fehlgeschlagen." });
      setChecklist(created);
    }
    setSaving(false);
  }

  function toggleCheckpoint(idx, status) {
    setChecklist((c) => ({
      ...c,
      checkpoints: c.checkpoints.map((cp, i) => (i === idx ? { ...cp, status } : cp)),
    }));
  }

  function updateCheckpointNotes(idx, notes) {
    setChecklist((c) => ({
      ...c,
      checkpoints: c.checkpoints.map((cp, i) => (i === idx ? { ...cp, notes } : cp)),
    }));
  }

  function updateField(field, value) {
    setChecklist((c) => ({ ...c, [field]: value }));
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="w-4 h-4 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Bauabnahme-Checkliste</h2>
        </div>
        <div className="text-center py-6">
          <ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400 mb-4">Noch keine Abnahme-Checkliste für dieses Projekt.</p>
          <button onClick={createNew} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Checkliste erstellen
          </button>
        </div>
      </div>
    );
  }

  const confirmedCount = checklist.checkpoints.filter((cp) => cp.status === "bestaetigt").length;
  const openCount = checklist.checkpoints.filter((cp) => cp.status === "offen").length;
  const naCount = checklist.checkpoints.filter((cp) => cp.status === "entfaellt").length;
  const allDone = checklist.checkpoints.every((cp) => cp.status === "bestaetigt" || cp.status === "entfaellt");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Bauabnahme-Checkliste</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{confirmedCount} bestätigt · {openCount} offen · {naCount} entfällt</span>
          {allDone && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Vollständig</span>}
        </div>
      </div>

      {/* Abnahme-Daten */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide">Abnahmedatum</label>
          <input type="date" value={checklist.inspection_date || ""} onChange={(e) => updateField("inspection_date", e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide">Prüfer (Gerüstbau)</label>
          <input value={checklist.inspector_name || ""} onChange={(e) => updateField("inspector_name", e.target.value)} placeholder="Name…" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide">Kundenvertreter</label>
          <input value={checklist.client_representative || ""} onChange={(e) => updateField("client_representative", e.target.value)} placeholder="Name…" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      </div>

      {/* Prüfpunkte */}
      <div className="space-y-2 mb-5">
        {checklist.checkpoints.map((cp, idx) => (
          <div key={idx} className="border border-gray-100 rounded-xl p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-900 flex-1">{idx + 1}. {cp.item}</span>
              <div className="flex gap-1 flex-shrink-0">
                {Object.entries(statusConfig).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const active = cp.status === key;
                  return (
                    <button
                      key={key}
                      onClick={() => toggleCheckpoint(idx, key)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${active ? cfg.activeColor : cfg.color}`}
                      title={cfg.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <input
              value={cp.notes || ""}
              onChange={(e) => updateCheckpointNotes(idx, e.target.value)}
              placeholder="Anmerkung…"
              className="w-full mt-2 px-2.5 py-1.5 bg-gray-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        ))}
      </div>

      {/* Gesamtergebnis */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Gesamtergebnis</label>
            <select value={checklist.overall_result || ""} onChange={(e) => updateField("overall_result", e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
              <option value="">— wählen —</option>
              <option value="Freigegeben">Freigegeben</option>
              <option value="Freigegeben mit Auflagen">Freigegeben mit Auflagen</option>
              <option value="Nicht freigegeben">Nicht freigegeben</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
            <div className="mt-1 py-2">
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${allDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {allDone ? "Abgeschlossen" : "Entwurf"}
              </span>
            </div>
          </div>
        </div>

        {checklist.overall_result === "Freigegeben mit Auflagen" && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Auflagen</label>
            <textarea value={checklist.conditions || ""} onChange={(e) => updateField("conditions", e.target.value)} placeholder="Auflagen beschreiben…" rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide">Notizen</label>
          <textarea value={checklist.notes || ""} onChange={(e) => updateField("notes", e.target.value)} placeholder="Weitere Notizen…" rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
        </div>

        {checklist.overall_result && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Ergebnis:</span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${overallColors[checklist.overall_result]}`}>{checklist.overall_result}</span>
          </div>
        )}

        <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" /> {saving ? "Speichern…" : "Checkliste speichern"}
        </button>
      </div>
    </div>
  );
}