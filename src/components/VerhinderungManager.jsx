import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, X, Wrench, Clock, CheckCircle, Plus, Send } from "lucide-react";

const trades = ["Malerarbeiten","Maurerarbeiten","Dachdecker","Elektro","Sanitär/Heizung","Erdarbeiten","Kran/Hebezeug","Witterung","Materiallieferung","Behörde/Genehmigung","Sonstiges Fremdgewerk"];

export default function VerhinderungManager({ projectId, projectName, currentUser, onHistoryRefresh }) {
  const [verhinderungen, setVerhinderungen] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reason: "", trade: "Malerarbeiten", start_date: "", expected_end_date: "", description: "", impact_hours: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projectId) loadVerhinderungen();
  }, [projectId]);

  async function loadVerhinderungen() {
    try {
      const records = await safeCall(() => base44.entities.Verhinderung.filter({ project_id: projectId }, "-reported_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
      setVerhinderungen(records);
    } catch {
      setVerhinderungen([]);
    }
  }

  async function save() {
    if (!form.reason.trim() || !form.start_date) return;
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    try {
      await safeCall(() => base44.entities.Verhinderung.create({
        project_id: projectId,
        project_name: projectName,
        reason: form.reason,
        trade: form.trade,
        reported_by: currentUser?.full_name || currentUser?.email || "Unbekannt",
        reported_date: today,
        start_date: form.start_date,
        expected_end_date: form.expected_end_date,
        description: form.description,
        impact_hours: form.impact_hours ? parseFloat(form.impact_hours) : null,
        status: "Offen",
        admin_seen: false,
        auto_suggested: false,
      }), { fallback: null, message: "Speichern fehlgeschlagen." });

      // Historien-Eintrag erstellen
      await safeCall(() => base44.entities.ProjektHistorie.create({
        project_id: projectId,
        project_name: projectName,
        action_type: "Verhinderung gemeldet",
        field_changed: "Verhinderung",
        new_value: `${form.trade}: ${form.reason}`,
        user_name: currentUser?.full_name || currentUser?.email || "Unbekannt",
        timestamp: new Date().toISOString(),
        notes: form.description || "",
      }), { fallback: null, message: "Speichern fehlgeschlagen." });

      if (onHistoryRefresh) onHistoryRefresh();
      setShowForm(false);
      setForm({ reason: "", trade: "Malerarbeiten", start_date: "", expected_end_date: "", description: "", impact_hours: "" });
      await loadVerhinderungen();
    } finally {
      setSaving(false);
    }
  }

  async function resolveVerhinderung(v) {
    if (!confirm("Verhinderung als behoben markieren?")) return;
    await safeCall(() => base44.entities.Verhinderung.update(v.id, { status: "Behoben", resolved_date: new Date().toISOString().split("T")[0] }), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    await safeCall(() => base44.entities.ProjektHistorie.create({
      project_id: projectId,
      project_name: projectName,
      action_type: "Verhinderung behoben",
      field_changed: "Verhinderung",
      old_value: v.reason,
      new_value: "Behoben",
      user_name: currentUser?.full_name || currentUser?.email || "Unbekannt",
      timestamp: new Date().toISOString(),
    }), { fallback: null, message: "Speichern fehlgeschlagen." });
    if (onHistoryRefresh) onHistoryRefresh();
    await loadVerhinderungen();
  }

  const statusColors = {
    "Offen": "bg-orange-100 text-orange-700",
    "Bestätigt": "bg-yellow-100 text-yellow-700",
    "Behoben": "bg-green-100 text-green-700",
    "Abgewiesen": "bg-red-100 text-red-700",
  };

  const activeVerhinderungen = verhinderungen.filter(v => v.status === "Offen" || v.status === "Bestätigt");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Verhinderungen</h2>
          {activeVerhinderungen.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">{activeVerhinderungen.length} aktiv</span>
          )}
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium">
          <Plus className="w-4 h-4" /> Melden
        </button>
      </div>

      {activeVerhinderungen.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Keine aktiven Verhinderungen
        </div>
      ) : (
        <div className="space-y-2">
          {verhinderungen.map(v => (
            <div key={v.id} className="border border-gray-100 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-gray-900">{v.reason}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[v.status]}`}>{v.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Wrench className="w-3 h-3" /> {v.trade}</span>
                    {v.start_date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {v.start_date}</span>}
                    {v.expected_end_date && <span className="text-gray-400">→ {v.expected_end_date}</span>}
                  </div>
                  {v.description && <p className="text-xs text-gray-500 mt-1">{v.description}</p>}
                </div>
                {(v.status === "Offen" || v.status === "Bestätigt") && (
                  <button onClick={() => resolveVerhinderung(v)} className="flex-shrink-0 text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded-lg hover:bg-green-50">
                    Behoben
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" /> Verhinderung melden
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verursachendes Gewerk *</label>
                <select value={form.trade} onChange={e => setForm(f => ({ ...f, trade: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  {trades.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grund der Verhinderung *</label>
                <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="z. B. Gerüst blockiert durch Malergerüst" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beginn *</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vorauss. Ende</label>
                  <input type="date" value={form.expected_end_date} onChange={e => setForm(f => ({ ...f, expected_end_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auswirkung (Stunden)</label>
                <input type="number" value={form.impact_hours} onChange={e => setForm(f => ({ ...f, impact_hours: e.target.value }))} placeholder="z. B. 8" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Details zur Verhinderung..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={save} disabled={saving || !form.reason.trim() || !form.start_date} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1">
                {saving ? "Speichere..." : <><Send className="w-4 h-4" /> Melden</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}