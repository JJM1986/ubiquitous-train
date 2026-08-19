import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, Edit, Save, X, Trash2, Download } from "lucide-react";
import { exportProjectPDF } from "@/lib/exportUtils";
import ProjectPhotoGallery from "@/components/ProjectPhotoGallery";
import ProjectAbnahmeCheckliste from "@/components/ProjectAbnahmeCheckliste";
import ProjectHistory from "@/components/ProjectHistory";
import VerhinderungManager from "@/components/VerhinderungManager";
import ProjectAufbauplaene from "@/components/ProjectAufbauplaene";
import ProjectRestmaterial from "@/components/ProjectRestmaterial";
import ProjectStundenkonto from "@/components/ProjectStundenkonto";
import { useAuth } from "@/lib/AuthContext";
import BackButton from "@/components/BackButton";
import { toast } from "sonner";

const statusColors = {
  "Anfrage": "bg-gray-100 text-gray-700",
  "Angebot": "bg-blue-100 text-blue-700",
  "Beauftragt": "bg-yellow-100 text-yellow-700",
  "In Arbeit": "bg-orange-100 text-orange-700",
  "Abgeschlossen": "bg-green-100 text-green-700",
  "Storniert": "bg-red-100 text-red-700",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  async function loadData() {
    setLoading(true);
    const [p, cs] = await Promise.all([
      base44.entities.Project.get(id),
      base44.entities.Customer.list()
    ]);
    setProject(p);
    setForm(p);
    setCustomers(cs);
    if (p?.customer_id) setCustomer(cs.find(c => c.id === p.customer_id));
    setLoading(false);
  }

  function refreshHistory() {
    setHistoryRefresh(r => r + 1);
  }

  async function save() {
    if (form.start_date && form.end_date && form.end_date < form.start_date) { alert("Das Enddatum muss nach dem Startdatum liegen."); return; }
    setSaving(true);
    await safeCall(() => base44.entities.Project.update(id, form), { fallback: null, message: "Aktualisieren fehlgeschlagen." });

    // Statuswechsel protokollieren
    if (project && form.status !== project.status) {
      const userName = user?.full_name || user?.email || "Unbekannt";
      await safeCall(() => base44.entities.ProjektHistorie.create({
        project_id: id,
        project_name: form.title || project.title,
        action_type: "Statuswechsel",
        field_changed: "status",
        old_value: project.status,
        new_value: form.status,
        user_name: userName,
        timestamp: new Date().toISOString(),
      }), { fallback: null, message: "Speichern fehlgeschlagen." });
      refreshHistory();
    }

    setProject(form);
    setCustomer(customers.find(c => c.id === form.customer_id));
    setEditing(false);
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>;
  if (!project) return <div className="p-6 text-gray-500">Projekt nicht gefunden.</div>;

  const displayData = editing ? form : project;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <BackButton to="/projects" />
          <div className="flex-1">
            {editing ? (
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="text-xl font-bold text-gray-900 border-b-2 border-orange-400 bg-transparent outline-none w-full" />
            ) : (
              <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
            )}
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
                <button onClick={save} disabled={saving} className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50"><Save className="w-4 h-4" /> Speichern</button>
              </>
            ) : (
              <>
                <button onClick={() => exportProjectPDF(project, customer)} className="flex items-center gap-1 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 touch-manipulation"><Download className="w-4 h-4" /> <span className="hidden sm:inline">PDF-Export</span></button>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50"><Edit className="w-4 h-4" /> Bearbeiten</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-4">
        {/* Status & Kunde */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Projektdetails</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
              {editing ? (
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  {["Anfrage","Angebot","Beauftragt","In Arbeit","Abgeschlossen","Storniert"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <div className="mt-1"><span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[project.status] || "bg-gray-100 text-gray-600"}`}>{project.status}</span></div>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Kunde</label>
              {editing ? (
                <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="">Wählen...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{customer?.name || "—"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Adresse</label>
              {editing ? (
                <input value={form.address || ""} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{[project.address, project.city].filter(Boolean).join(", ") || "—"}</p>
              )}
            </div>
            {editing && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Stadt</label>
                <input value={form.city || ""} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Startdatum</label>
              {editing ? (
                <input type="date" value={form.start_date || ""} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{project.start_date || "—"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Enddatum</label>
              {editing ? (
                <input type="date" value={form.end_date || ""} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{project.end_date || "—"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Gerüstdaten */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Gerüstdaten</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: "scaffold_type", label: "Gerüstart", type: "text", placeholder: "Fassade" },
              { key: "scaffold_area", label: "Fläche (m²)", type: "number", placeholder: "200" },
              { key: "scaffold_height", label: "Höhe (m)", type: "number", placeholder: "12" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 uppercase tracking-wide">{label}</label>
                {editing ? (
                  <input type={type} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                ) : (
                  <p className="mt-1 text-sm text-gray-900 font-medium">{project[key] || "—"}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Beschreibung */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Beschreibung & Notizen</h2>
          <div className="space-y-3">
            {editing ? (
              <>
                <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Beschreibung..." rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
                <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notizen..." rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </>
            ) : (
              <>
                {project.description && <p className="text-sm text-gray-700">{project.description}</p>}
                {project.notes && <p className="text-sm text-gray-500 italic">{project.notes}</p>}
                {!project.description && !project.notes && <p className="text-sm text-gray-400">Keine Beschreibung vorhanden.</p>}
              </>
            )}
          </div>
        </div>

        {/* Fotogalerie */}
        <ProjectPhotoGallery projectId={project.id} projectName={project.title} />

        {/* Bauabnahme-Checkliste */}
        <ProjectAbnahmeCheckliste projectId={project.id} projectName={project.title} customerName={customer?.name} />

        {/* Verhinderungen */}
        <VerhinderungManager projectId={project.id} projectName={project.title} currentUser={user} onHistoryRefresh={refreshHistory} />

        {/* Stundenkonto */}
        <ProjectStundenkonto projectId={project.id} projectName={project.title} />

        {/* Aufbaupläne & Skizzen */}
        <ProjectAufbauplaene projectId={project.id} projectName={project.title} />

        {/* Restmaterial */}
        <ProjectRestmaterial projectId={project.id} projectName={project.title} />

        {/* Historie */}
        <ProjectHistory key={historyRefresh} projectId={project.id} projectName={project.title} />
      </div>
    </div>
  );
}