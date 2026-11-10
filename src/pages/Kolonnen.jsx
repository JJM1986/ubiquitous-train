import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Users, X, Search } from "lucide-react";

const emptyForm = { name: "", leader_id: "", member_ids: [], status: "aktiv", notes: "" };

export default function Kolonnen() {
  const [kolonnen, setKolonnen] = useState([]);
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
    const [ks, emps] = await Promise.all([
      base44.entities.Kolonne.list("-created_date"),
      base44.entities.Employee.list(),
    ]);
    setKolonnen(ks);
    setEmployees(emps);
    setLoading(false);
  }

  function openNew() { setForm(emptyForm); setEditing(null); setShowForm(true); }
  function openEdit(k) { setForm({ ...k, member_ids: k.member_ids || [] }); setEditing(k.id); setShowForm(true); }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    const leader = employees.find(e => e.id === form.leader_id);
    const data = {
      ...form,
      leader_name: leader ? `${leader.first_name} ${leader.last_name}` : "",
      member_count: form.member_ids.length,
    };
    if (editing) await safeCall(() => base44.entities.Kolonne.update(editing, data), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    else await safeCall(() => base44.entities.Kolonne.create(data), { fallback: null, message: "Speichern fehlgeschlagen." });
    await load();
    setShowForm(false);
    setForm(emptyForm);
    setEditing(null);
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Kolonne wirklich löschen?")) return;
    await safeCall(() => base44.entities.Kolonne.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setKolonnen(prev => prev.filter(k => k.id !== id));
  }

  function toggleMember(empId) {
    setForm(f => ({
      ...f,
      member_ids: f.member_ids.includes(empId)
        ? f.member_ids.filter(id => id !== empId)
        : [...f.member_ids, empId],
    }));
  }

  const empMap = Object.fromEntries(employees.map(e => [e.id, e]));
  const filtered = kolonnen.filter(k => k.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kolonnen</h1>
            <p className="text-sm text-gray-500">Arbeitsgruppen verwalten</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" /> Neue Kolonne
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
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Noch keine Kolonnen vorhanden</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(k => (
              <div key={k.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{k.name}</h3>
                      <p className="text-xs text-gray-500">{k.member_count || 0} Mitglieder</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${k.status === "aktiv" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {k.status === "aktiv" ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>
                {k.leader_name && (
                  <div className="text-sm text-gray-600 mt-2">
                    <span className="text-gray-400">Führer:</span> {k.leader_name}
                  </div>
                )}
                {(k.member_ids || []).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {k.member_ids.slice(0, 4).map(id => {
                      const emp = empMap[id];
                      return emp ? <div key={id} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">{emp.first_name} {emp.last_name}</div> : null;
                    })}
                    {k.member_ids.length > 4 && <div className="text-xs text-gray-400">+{k.member_ids.length - 4} weitere</div>}
                  </div>
                )}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(k)} className="flex-1 text-sm text-gray-600 hover:text-orange-600 py-1.5 rounded-lg hover:bg-orange-50">Bearbeiten</button>
                  <button onClick={() => remove(k.id)} className="text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">{editing ? "Kolonne bearbeiten" : "Neue Kolonne"}</h2>
              <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kolonnenname *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Kolonne Nord" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kolonnenführer</label>
                <select value={form.leader_id} onChange={e => setForm(f => ({ ...f, leader_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="">Wählen...</option>
                  {employees.filter(e => e.status === "aktiv").map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mitglieder</label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                  {employees.filter(e => e.status === "aktiv").map(e => (
                    <label key={e.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={form.member_ids.includes(e.id)} onChange={() => toggleMember(e.id)} className="w-4 h-4 rounded text-orange-500" />
                      <span className="text-sm text-gray-700">{e.first_name} {e.last_name}</span>
                      {e.role && <span className="text-xs text-gray-400">· {e.role}</span>}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{form.member_ids.length} ausgewählt</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="aktiv">Aktiv</option>
                  <option value="inaktiv">Inaktiv</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={save} disabled={saving || !form.name.trim()} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}