import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileArchive, Plus, X, FileText, Download, Folder } from "lucide-react";

const typeColors = {
  "Freigabeprotokoll": "bg-orange-100 text-orange-700",
  "Einsatzbericht": "bg-blue-100 text-blue-700",
  "Abnahmecheckliste": "bg-green-100 text-green-700",
  "Rechnung": "bg-purple-100 text-purple-700",
  "Sonstiges": "bg-gray-100 text-gray-700",
};

const docTypes = ["Freigabeprotokoll", "Einsatzbericht", "Abnahmecheckliste", "Rechnung", "Sonstiges"];

export default function Dokumentenarchiv() {
  const [docs, setDocs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterProject, setFilterProject] = useState("all");
  const [form, setForm] = useState({ title: "", document_type: "Freigabeprotokoll", project_id: "", project_name: "", file_url: "", notes: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [ds, ps] = await Promise.all([base44.entities.Dokument.list("-created_date"), base44.entities.Project.list()]);
    setDocs(ds);
    setProjects(ps);
    setLoading(false);
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await safeCall(() => base44.integrations.Core.UploadFile({ file }), { fallback: null, message: "Aktion fehlgeschlagen." });
      setForm(f => ({ ...f, file_url }));
    } finally {
      setUploading(false);
    }
  }

  async function create() {
    if (!form.file_url) return;
    const proj = projects.find(p => p.id === form.project_id);
    const data = { ...form, project_name: proj?.title || "" };
    await safeCall(() => base44.entities.Dokument.create(data), { fallback: null, message: "Speichern fehlgeschlagen." });
    setShowForm(false);
    setForm({ title: "", document_type: "Freigabeprotokoll", project_id: "", project_name: "", file_url: "", notes: "" });
    load();
  }

  const filtered = filterProject === "all" ? docs : docs.filter(d => d.project_id === filterProject);

  // Group by project
  const grouped = {};
  filtered.forEach(d => {
    const key = d.project_name || "Ohne Projekt";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileArchive className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900">Dokumentenarchiv</h1>
          <span className="text-xs text-gray-400">{docs.length} Dokumente</span>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600">
          <Plus className="w-4 h-4" /> Dokument hinzufügen
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Filter */}
        <div className="mb-4">
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 bg-white">
            <option value="all">Alle Projekte</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12">
            <FileArchive className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">Noch keine Dokumente archiviert.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([projectName, projectDocs]) => (
              <div key={projectName}>
                <div className="flex items-center gap-2 mb-3">
                  <Folder className="w-4 h-4 text-orange-500" />
                  <h2 className="font-semibold text-gray-900 text-sm">{projectName}</h2>
                  <span className="text-xs text-gray-400">({projectDocs.length})</span>
                </div>
                <div className="space-y-2">
                  {projectDocs.map(d => (
                    <div key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{d.title}</div>
                        <div className="text-xs text-gray-400">{new Date(d.created_date).toLocaleDateString("de-DE")}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[d.document_type] || typeColors.Sonstiges}`}>{d.document_type}</span>
                      {d.file_url && (
                        <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100">
                          <Download className="w-4 h-4 text-gray-500" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Dokument archivieren</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Titel *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="z. B. Freigabeprotokoll Müller GmbH" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Typ</label>
                  <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                    {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Projekt</label>
                  <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="">Ohne Projekt</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Datei (PDF) *</label>
                <input type="file" accept=".pdf" onChange={handleFile} className="w-full mt-1 text-sm" disabled={uploading} />
                {uploading && <p className="text-xs text-orange-500 mt-1">Wird hochgeladen…</p>}
                {form.file_url && !uploading && <p className="text-xs text-green-600 mt-1">✓ Datei hochgeladen</p>}
              </div>
              <div>
                <label className="text-xs text-gray-500">Notizen</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <button onClick={create} disabled={!form.file_url || !form.title} className="w-full mt-4 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50">Archivieren</button>
          </div>
        </div>
      )}
    </div>
  );
}