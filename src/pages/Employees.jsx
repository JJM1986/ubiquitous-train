import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Phone, Mail, Edit, Trash2, X, UserCog } from "lucide-react";

const roleColors = {
  "Vorarbeiter": "bg-purple-100 text-purple-700",
  "Monteur": "bg-blue-100 text-blue-700",
  "Helfer": "bg-gray-100 text-gray-700",
  "Fahrer": "bg-yellow-100 text-yellow-700",
  "Bauleiter": "bg-orange-100 text-orange-700",
};

const statusColors = {
  "aktiv": "bg-green-100 text-green-700",
  "inaktiv": "bg-gray-100 text-gray-600",
  "krank": "bg-red-100 text-red-700",
  "urlaub": "bg-blue-100 text-blue-700",
};

const emptyForm = { first_name: "", last_name: "", role: "Monteur", phone: "", email: "", hourly_rate: "", status: "aktiv", hired_date: "", notes: "" };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await safeCall(() => base44.entities.Employee.list("-created_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
    setEmployees(data);
    setLoading(false);
  }

  function openNew() { setForm(emptyForm); setEditing(null); setShowForm(true); }
  function openEdit(e) { setForm({ ...e }); setEditing(e.id); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditing(null); setForm(emptyForm); }

  async function save() {
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    setSaving(true);
    if (editing) await safeCall(() => base44.entities.Employee.update(editing, form), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    else await safeCall(() => base44.entities.Employee.create(form), { fallback: null, message: "Speichern fehlgeschlagen." });
    await load();
    closeForm();
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Mitarbeiter wirklich löschen?")) return;
    await safeCall(() => base44.entities.Employee.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setEmployees(prev => prev.filter(e => e.id !== id));
  }

  const filtered = employees.filter(e =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Mitarbeiter</h1>
          <button onClick={openNew} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Neuer Mitarbeiter
          </button>
        </div>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <UserCog className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Noch keine Mitarbeiter vorhanden</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(e => (
              <div key={e.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                      {e.first_name?.[0]}{e.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{e.first_name} {e.last_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[e.role] || "bg-gray-100 text-gray-600"}`}>{e.role}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[e.status] || "bg-gray-100 text-gray-600"}`}>{e.status}</span>
                </div>
                {e.phone && <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><Phone className="w-3.5 h-3.5 text-gray-400" />{e.phone}</div>}
                {e.email && <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><Mail className="w-3.5 h-3.5 text-gray-400" />{e.email}</div>}
                {e.hourly_rate && <div className="text-sm text-gray-500 mt-1">{e.hourly_rate} €/Std.</div>}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(e)} className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-orange-600 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                    <Edit className="w-3.5 h-3.5" /> Bearbeiten
                  </button>
                  <button onClick={() => remove(e.id)} className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-red-500 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
                  <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
                  <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                    {["Vorarbeiter","Monteur","Helfer","Fahrer","Bauleiter"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                    {["aktiv","inaktiv","krank","urlaub"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                  <input value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stundenlohn (€)</label>
                  <input type="number" value={form.hourly_rate || ""} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Einstellungsdatum</label>
                  <input type="date" value={form.hired_date || ""} onChange={e => setForm(f => ({ ...f, hired_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={closeForm} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={save} disabled={saving || !form.first_name.trim() || !form.last_name.trim()} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}