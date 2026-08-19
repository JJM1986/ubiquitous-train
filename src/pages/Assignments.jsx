import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Calendar, Clock, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const statusColors = {
  "Geplant": "bg-blue-100 text-blue-700",
  "In Arbeit": "bg-orange-100 text-orange-700",
  "Abgeschlossen": "bg-green-100 text-green-700",
};

const emptyForm = { project_id: "", employee_id: "", date: "", start_time: "", end_time: "", hours: "", task: "", status: "Geplant", notes: "" };

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [a, p, e] = await Promise.all([
      base44.entities.Assignment.list("-date"),
      base44.entities.Project.list(),
      base44.entities.Employee.list(),
    ]);
    setAssignments(a);
    setProjects(p);
    setEmployees(e);
    setLoading(false);
  }

  function openNew() { setForm({ ...emptyForm, date: new Date().toISOString().split("T")[0] }); setEditing(null); setShowForm(true); }
  function openEdit(a) { setForm({ ...a }); setEditing(a.id); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditing(null); setForm(emptyForm); }

  async function save() {
    if (!form.project_id || !form.employee_id || !form.date) return;
    setSaving(true);
    if (editing) await safeCall(() => base44.entities.Assignment.update(editing, form), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    else await safeCall(() => base44.entities.Assignment.create(form), { fallback: null, message: "Speichern fehlgeschlagen." });
    await loadAll();
    closeForm();
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Einsatz wirklich löschen?")) return;
    await safeCall(() => base44.entities.Assignment.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setAssignments(prev => prev.filter(a => a.id !== id));
  }

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));
  const employeeMap = Object.fromEntries(employees.map(e => [e.id, e]));

  const filtered = assignments.filter(a => {
    const proj = projectMap[a.project_id];
    const emp = employeeMap[a.employee_id];
    const matchSearch = !search ||
      proj?.title?.toLowerCase().includes(search.toLowerCase()) ||
      `${emp?.first_name} ${emp?.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      a.task?.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchSearch && matchDate;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Einsätze</h1>
          <button onClick={openNew} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Neuer Einsatz
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-3 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Einsätze gefunden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => {
              const proj = projectMap[a.project_id];
              const emp = employeeMap[a.employee_id];
              return (
                <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{proj?.title || "Unbekanntes Projekt"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[a.status] || "bg-gray-100"}`}>{a.status}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        {emp && <span className="font-medium text-gray-700">{emp.first_name} {emp.last_name}</span>}
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{a.date}</span>
                        {a.hours && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.hours}h</span>}
                        {a.task && <span className="text-gray-600">{a.task}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors text-xs">Bearbeiten</button>
                      <button onClick={() => remove(a.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-xs">Löschen</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? "Einsatz bearbeiten" : "Neuer Einsatz"}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projekt *</label>
                <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="">Projekt wählen...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter *</label>
                <select value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="">Mitarbeiter wählen...</option>
                  {employees.filter(e => e.status === "aktiv").map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} – {e.role}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beginn</label>
                  <input type="time" value={form.start_time || ""} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ende</label>
                  <input type="time" value={form.end_time || ""} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stunden</label>
                  <input type="number" step="0.5" value={form.hours || ""} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tätigkeit</label>
                <input value={form.task || ""} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} placeholder="z.B. Aufbau Fassadengerüst" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  {["Geplant","In Arbeit","Abgeschlossen"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={closeForm} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={save} disabled={saving || !form.project_id || !form.employee_id || !form.date} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}