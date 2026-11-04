import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Search, AlertCircle, X, Clock, ChevronDown, ChevronUp } from "lucide-react";

const statusConfig = {
  "Gemeldet": { color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  "In Bearbeitung": { color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  "Behoben": { color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  "Abgewiesen": { color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
};

const priorityConfig = {
  "Niedrig": "bg-gray-100 text-gray-600",
  "Mittel": "bg-yellow-100 text-yellow-700",
  "Hoch": "bg-orange-100 text-orange-700",
  "Dringend": "bg-red-100 text-red-700",
};

const emptyForm = {
  title: "", description: "", project_id: "", project_name: "", customer_name: "",
  priority: "Mittel", reported_by: "", reported_date: new Date().toISOString().split("T")[0],
};

export default function Reklamationen() {
  const [reklamationen, setReklamationen] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("alle");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const { user } = useAuth();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [rs, ps, cs] = await Promise.all([
      base44.entities.Reklamation.list("-created_date"),
      base44.entities.Project.list(),
      base44.entities.Customer.list(),
    ]);
    setReklamationen(rs);
    setProjects(ps);
    setCustomers(cs);
    setLoading(false);
  }

  async function save() {
    if (!form.title.trim() || !form.project_id) return;
    setSaving(true);
    const project = projects.find(p => p.id === form.project_id);
    const customer = customers.find(c => c.id === project?.customer_id);
    const data = {
      ...form,
      project_name: project?.title || "",
      customer_name: customer?.name || "",
      reported_by: user?.full_name || user?.email || "",
      verlauf: [{
        date: new Date().toISOString(),
        user: user?.full_name || "System",
        action: "Reklamation gemeldet",
        notes: form.description || "",
      }],
    };
    const tempId = "temp-" + Date.now();
    const optimisticRecord = { ...data, id: tempId, created_date: new Date().toISOString(), status: "Gemeldet" };
    setReklamationen(prev => [optimisticRecord, ...prev]);
    setShowForm(false);
    setForm(emptyForm);
    try {
      const created = await safeCall(() => base44.entities.Reklamation.create(data), { fallback: null, message: "Speichern fehlgeschlagen." });
      setReklamationen(prev => prev.map(r => r.id === tempId ? created : r));
    } catch (e) {
      setReklamationen(prev => prev.filter(r => r.id !== tempId));
      alert("Reklamation konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(r) {
    setEditForm({
      status: r.status || "Gemeldet",
      resolution: r.resolution || "",
      notes: "",
    });
    setEditing(r);
  }

  async function saveEdit() {
    setSaving(true);
    const oldRecord = editing;
    const verlauf = [...(editing.verlauf || [])];
    if (editForm.notes || editForm.status !== editing.status) {
      verlauf.push({
        date: new Date().toISOString(),
        user: user?.full_name || user?.email || "",
        action: editForm.status !== editing.status ? `Status → ${editForm.status}` : "Notiz hinzugefügt",
        notes: editForm.notes || "",
      });
    }
    const updateData = {
      status: editForm.status,
      resolution: editForm.resolution,
      handled_by: user?.full_name || user?.email || "",
      verlauf,
    };
    setReklamationen(prev => prev.map(r => r.id === editing.id ? { ...editing, ...updateData } : r));
    setEditing(null);
    try {
      await safeCall(() => base44.entities.Reklamation.update(oldRecord.id, updateData), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    } catch (e) {
      setReklamationen(prev => prev.map(r => r.id === oldRecord.id ? oldRecord : r));
      alert("Änderung konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  const filtered = reklamationen.filter(r => {
    const matchSearch = r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.project_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "alle" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reklamationen</h1>
              <p className="text-sm text-gray-500">Mängel erfassen & bearbeiten</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium touch-manipulation">
            <Plus className="w-4 h-4" /> Meldung
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300">
            <option value="alle">Alle</option>
            {["Gemeldet","In Bearbeitung","Behoben","Abgewiesen"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Reklamationen vorhanden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => {
              const stCfg = statusConfig[r.status] || statusConfig.Gemeldet;
              const isExpanded = expanded === r.id;
              return (
                <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-gray-900">{r.title}</h3>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${stCfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot}`} />
                            {r.status}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig[r.priority] || priorityConfig.Mittel}`}>{r.priority}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {r.project_name || "—"} · {r.customer_name || "—"}
                        </div>
                        {r.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.description}</p>}
                        <div className="text-xs text-gray-400 mt-2">Gemeldet am {r.reported_date || "—"} von {r.reported_by || "—"}</div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => openEdit(r)} className="flex items-center gap-1 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 touch-manipulation">
                          Bearbeiten
                        </button>
                        {(r.verlauf || []).length > 0 && (
                          <button onClick={() => setExpanded(isExpanded ? null : r.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 touch-manipulation">
                            <Clock className="w-3.5 h-3.5" /> Verlauf ({r.verlauf.length})
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded && (r.verlauf || []).length > 0 && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="mt-3 space-y-2">
                        {r.verlauf.map((v, i) => (
                          <div key={i} className="flex gap-3 text-sm">
                            <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                            <div>
                              <div className="text-gray-900 font-medium">{v.action}</div>
                              <div className="text-xs text-gray-500">{new Date(v.date).toLocaleString("de-DE")} · {v.user}</div>
                              {v.notes && <div className="text-gray-600 mt-0.5">{v.notes}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Neue Reklamation */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">Mangel melden</h2>
              <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mangel *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="z.B. Geländer lose" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projekt *</label>
                <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="">Projekt wählen...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
                <div className="grid grid-cols-4 gap-2">
                  {["Niedrig","Mittel","Hoch","Dringend"].map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} className={`py-2 rounded-xl text-sm font-medium border transition-colors touch-manipulation ${form.priority === p ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Mangel detailliert beschreiben..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 touch-manipulation">Abbrechen</button>
              <button onClick={save} disabled={saving || !form.title.trim() || !form.project_id} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 touch-manipulation">
                {saving ? "Speichern..." : "Meldung erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bearbeiten */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Reklamation bearbeiten</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{editing.title}</h3>
                <p className="text-sm text-gray-500">{editing.project_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Gemeldet","In Bearbeitung","Behoben","Abgewiesen"].map(s => (
                    <button key={s} onClick={() => setEditForm(f => ({ ...f, status: s }))} className={`py-2 rounded-xl text-sm font-medium border transition-colors touch-manipulation ${editForm.status === s ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lösung / Maßnahme</label>
                <textarea value={editForm.resolution} onChange={e => setEditForm(f => ({ ...f, resolution: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notiz / Kommentar</label>
                <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Wird dem Verlauf hinzugefügt..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 touch-manipulation">Abbrechen</button>
              <button onClick={saveEdit} disabled={saving} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 touch-manipulation">
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}