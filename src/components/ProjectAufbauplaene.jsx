import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ScanLine, FileImage, Printer, Trash2, X, Loader2, FileText, CheckCircle2, AlertTriangle, Circle } from "lucide-react";

const typeColors = {
  Aufbauplan: "bg-blue-100 text-blue-700",
  Skizze: "bg-orange-100 text-orange-700",
  Montageplan: "bg-purple-100 text-purple-700",
  Abnahmeskizze: "bg-green-100 text-green-700",
  Sonstiges: "bg-gray-100 text-gray-600",
};

export default function ProjectAufbauplaene({ projectId, projectName }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewer, setViewer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: "", document_type: "Aufbauplan", file_url: "", notes: "", has_deviation: false, deviation_note: "" });
  const fileRef = useRef(null);

  useEffect(() => { load(); }, [projectId]);

  const REQUIRED_TYPES = ["Aufbauplan", "Skizze", "Montageplan", "Abnahmeskizze"];
  const missingTypes = REQUIRED_TYPES.filter((t) => !plans.some((p) => p.document_type === t));
  const deviationCount = plans.filter((p) => p.has_deviation).length;

  async function load() {
    setLoading(true);
    try {
      const data = await safeCall(() => base44.entities.Aufbauplan.list("-created_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
      setPlans(data.filter((p) => p.project_id === projectId));
    } catch { setPlans([]); }
    setLoading(false);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await safeCall(() => base44.integrations.Core.UploadFile({ file }), { fallback: null, message: "Aktion fehlgeschlagen." });
      setDraft((d) => ({ ...d, file_url: res.file_url, title: d.title || file.name.replace(/\.[^/.]+$/, "") }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save() {
    if (!draft.title.trim() || !draft.file_url) return;
    await safeCall(() => base44.entities.Aufbauplan.create({ ...draft, project_id: projectId, project_name: projectName }), { fallback: null, message: "Speichern fehlgeschlagen." });
    setDraft({ title: "", document_type: "Aufbauplan", file_url: "", notes: "", has_deviation: false, deviation_note: "" });
    setShowForm(false);
    await load();
  }

  async function remove(id) {
    if (!confirm("Plan wirklich löschen?")) return;
    await safeCall(() => base44.entities.Aufbauplan.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  function printPlan(plan) {
    const isImg = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(plan.file_url);
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    const content = isImg
      ? `<img src="${plan.file_url}" style="max-width:100%;max-height:90vh;object-fit:contain" onload="window.print()"/>`
      : `<iframe src="${plan.file_url}" style="width:100%;height:90vh;border:0" onload="window.print()"></iframe>`;
    win.document.write(`<html><head><title>${plan.title}</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;font-family:sans-serif}</style></head><body>${content}<div style="position:fixed;top:8px;right:8px;font-size:12px;color:#999">${plan.title} — ${planName(projectName)}</div></body></html>`);
    win.document.close();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileImage className="w-4 h-4 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Aufbaupläne & Skizzen</h2>
          {plans.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">{plans.length}</span>}
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium">
          <ScanLine className="w-4 h-4" /> Scannen / Hinzufügen
        </button>
      </div>

      {/* Vollständigkeits- & Abweichungs-Check */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {REQUIRED_TYPES.map((t) => {
          const present = plans.some((p) => p.document_type === t);
          return (
            <span key={t} className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${present ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
              {present ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
              {t}
            </span>
          );
        })}
        {deviationCount > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-100 text-red-700 flex items-center gap-1 ml-auto">
            <AlertTriangle className="w-3 h-3" /> {deviationCount} Abweichung{deviationCount > 1 ? "en" : ""}
          </span>
        )}
      </div>
      {plans.length > 0 && missingTypes.length > 0 && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Fehlende Dokumente: <strong>{missingTypes.join(", ")}</strong></span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6"><div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          <FileImage className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Noch keine Pläne oder Skizzen.<br />Foto einscannen oder Datei hochladen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {plans.map((p) => {
            const isImg = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(p.file_url);
            return (
              <div key={p.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-square bg-gray-50 relative cursor-pointer" onClick={() => setViewer(p)}>
                  {isImg
                    ? <img src={p.file_url} alt={p.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><FileText className="w-8 h-8 mb-1" /><span className="text-xs">PDF/Datei</span></div>}
                  <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[p.document_type] || typeColors.Sonstiges}`}>{p.document_type}</span>
                  {p.has_deviation && <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-500 text-white flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" /> Abweichung</span>}
                </div>
                <div className="p-2">
                  <div className="text-sm font-medium text-gray-900 truncate">{p.title}</div>
                  {p.has_deviation && p.deviation_note ? (
                    <div className="text-xs text-red-600 truncate" title={p.deviation_note}>⚠ {p.deviation_note}</div>
                  ) : p.notes ? (
                    <div className="text-xs text-gray-400 truncate">{p.notes}</div>
                  ) : null}
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => setViewer(p)} className="flex-1 text-xs py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium">Ansehen</button>
                    <button onClick={() => printPlan(p)} className="p-1.5 rounded-lg bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-orange-600"><Printer className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload-Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Plan / Skizze hinzufügen</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Datei / Foto einscannen</label>
                <input ref={fileRef} type="file" accept="image/*,application/pdf" capture="environment" onChange={handleFile} className="hidden" id="aufbauplan-file" />
                <label htmlFor="aufbauplan-file" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-8 cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                  {uploading ? (
                    <><Loader2 className="w-6 h-6 text-orange-500 animate-spin mb-2" /><span className="text-sm text-gray-500">Wird hochgeladen...</span></>
                  ) : draft.file_url ? (
                    <><ScanLine className="w-6 h-6 text-green-500 mb-2" /><span className="text-sm text-green-600 font-medium">Datei ausgewählt ✓</span><span className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{draft.file_url}</span></>
                  ) : (
                    <><ScanLine className="w-6 h-6 text-gray-400 mb-2" /><span className="text-sm text-gray-500">Kamera öffnen oder Datei wählen</span></>
                  )}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="z.B. Aufbauplan Nordfassade" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                <select value={draft.document_type} onChange={(e) => setDraft((d) => ({ ...d, document_type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  {Object.keys(typeColors).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="has_deviation" checked={draft.has_deviation} onChange={(e) => setDraft((d) => ({ ...d, has_deviation: e.target.checked }))} className="w-4 h-4 rounded text-red-500 focus:ring-red-300" />
                <label htmlFor="has_deviation" className="text-sm font-medium text-gray-700">Abweichung zur Planung vorhanden</label>
              </div>
              {draft.has_deviation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abweichung beschreiben</label>
                  <textarea value={draft.deviation_note} onChange={(e) => setDraft((d) => ({ ...d, deviation_note: e.target.value }))} rows={2} placeholder="z.B. Maßabweichung Fassade Nord, Höhe +0,5 m..." className="w-full px-3 py-2 border border-red-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-300 resize-none" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={save} disabled={!draft.title.trim() || !draft.file_url || uploading} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Viewer */}
      {viewer && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setViewer(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"><X className="w-5 h-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); printPlan(viewer); }} className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium"><Printer className="w-4 h-4" /> Drucken</button>
          {/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(viewer.file_url)
            ? <img src={viewer.file_url} alt={viewer.title} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
            : <iframe src={viewer.file_url} className="w-full h-full max-w-4xl max-h-[90vh] bg-white rounded-xl" onClick={(e) => e.stopPropagation()} />}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-xl">{viewer.title}</div>
        </div>
      )}
    </div>
  );
}

function planName(name) { return name || ""; }