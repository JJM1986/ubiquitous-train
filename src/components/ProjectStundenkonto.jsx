import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, TrendingUp, TrendingDown, Edit, Save, X, Calendar } from "lucide-react";

export default function ProjectStundenkonto({ projectId, projectName }) {
  const [konto, setKonto] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ planned_hours: 0, actual_hours_override: "", period: "Gesamt", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [projectId]);

  async function load() {
    setLoading(true);
    try {
      const [kontoList, assignList] = await Promise.all([
        base44.entities.Stundenkonto.list(),
        base44.entities.Assignment.list(),
      ]);
      const k = kontoList.find((k) => k.project_id === projectId);
      setKonto(k || null);
      setAssignments(assignList.filter((a) => a.project_id === projectId));
      if (k) setForm({ planned_hours: k.planned_hours || 0, actual_hours_override: k.actual_hours_override || "", period: k.period || "Gesamt", notes: k.notes || "" });
    } catch { setKonto(null); setAssignments([]); }
    setLoading(false);
  }

  // Ist-Stunden aus Einsätzen (abgeschlossen + in Arbeit)
  const assignmentHours = assignments
    .filter((a) => a.status === "Abgeschlossen" || a.status === "In Arbeit")
    .reduce((s, a) => s + (a.hours || 0), 0);

  const manualActual = konto?.actual_hours_override;
  const actualHours = manualActual != null && manualActual !== "" ? Number(manualActual) : assignmentHours;
  const planned = konto?.planned_hours || 0;
  const missingHours = planned - actualHours;
  const progress = planned > 0 ? Math.min(100, Math.round((actualHours / planned) * 100)) : 0;

  async function save() {
    setSaving(true);
    try {
      const payload = {
        project_id: projectId,
        project_name: projectName,
        planned_hours: Number(form.planned_hours) || 0,
        actual_hours_override: form.actual_hours_override === "" ? null : Number(form.actual_hours_override),
        period: form.period || "Gesamt",
        notes: form.notes,
      };
      if (konto) {
        await safeCall(() => base44.entities.Stundenkonto.update(konto.id, payload), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
      } else {
        const created = await safeCall(() => base44.entities.Stundenkonto.create(payload), { fallback: null, message: "Speichern fehlgeschlagen." });
        setKonto(created);
      }
      await load();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-center py-6"><div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Stundenkonto</h2>
          <span className="text-xs text-gray-400">{konto?.period || "Gesamt"}</span>
        </div>
        {!editing ? (
          <button onClick={() => { setForm({ planned_hours: planned, actual_hours_override: manualActual != null && manualActual !== "" ? manualActual : "", period: konto?.period || "Gesamt", notes: konto?.notes || "" }); setEditing(true); }} className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium">
            <Edit className="w-4 h-4" /> {konto ? "Bearbeiten" : "Festlegen"}
          </button>
        ) : (
          <div className="flex gap-1">
            <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            <button onClick={save} disabled={saving} className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium px-2 py-1.5 rounded-lg hover:bg-orange-50"><Save className="w-4 h-4" /> {saving ? "..." : "Speichern"}</button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Geplante Stunden</label>
              <input type="number" value={form.planned_hours} onChange={(e) => setForm((f) => ({ ...f, planned_hours: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ist-Stunden (manuell, leer = aus Einsätzen)</label>
              <input type="number" value={form.actual_hours_override} onChange={(e) => setForm((f) => ({ ...f, actual_hours_override: e.target.value }))} placeholder={String(assignmentHours)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Zeitraum</label>
            <input value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} placeholder="Gesamt / KW 28 ..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notizen</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
          </div>
          <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
            Aus Einsätzen automatisch ermittelt: <span className="font-medium text-gray-600">{assignmentHours.toFixed(1)} Std</span> ({assignments.length} Einsätze)
          </div>
        </div>
      ) : (
        <>
          {/* Hauptanzeige */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400">Geplant</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">{planned}<span className="text-xs font-normal text-gray-400"> Std</span></div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="text-xs text-blue-400">Erbracht</div>
              <div className="text-lg font-bold text-blue-700 mt-0.5">{actualHours.toFixed(1)}<span className="text-xs font-normal text-blue-400"> Std</span></div>
            </div>
            <div className={`rounded-xl p-3 ${missingHours > 0 ? "bg-red-50" : "bg-green-50"}`}>
              <div className={`text-xs ${missingHours > 0 ? "text-red-400" : "text-green-400"}`}>{missingHours > 0 ? "Fehlend" : "Überschritten"}</div>
              <div className={`text-lg font-bold mt-0.5 ${missingHours > 0 ? "text-red-600" : "text-green-600"}`}>
                {Math.abs(missingHours).toFixed(1)}<span className="text-xs font-normal"> Std</span>
              </div>
            </div>
          </div>

          {/* Fortschrittsbalken */}
          {planned > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Fortschritt</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-green-500" : progress >= 75 ? "bg-orange-500" : "bg-blue-500"}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Detail-Zeile */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-50">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {assignments.length} Einsätze</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {assignmentHours.toFixed(1)} aus Einsätzen</span>
            {manualActual != null && manualActual !== "" && (
              <span className="flex items-center gap-1 text-orange-500"><TrendingDown className="w-3.5 h-3.5" /> manuell überschrieben</span>
            )}
          </div>

          {konto?.notes && <div className="mt-2 text-xs text-gray-400 italic">{konto.notes}</div>}
        </>
      )}
    </div>
  );
}