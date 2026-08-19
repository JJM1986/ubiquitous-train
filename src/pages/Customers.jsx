import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Phone, Mail, Building2, Edit, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { name: "", company: "", email: "", phone: "", address: "", city: "", zip: "", notes: "", status: "aktiv" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCustomers(); }, []);

  async function loadCustomers() {
    setLoading(true);
    const data = await safeCall(() => base44.entities.Customer.list("-created_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
    setCustomers(data);
    setLoading(false);
  }

  function openNew() { setForm(emptyForm); setEditing(null); setShowForm(true); }
  function openEdit(c) { setForm({ ...c }); setEditing(c.id); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditing(null); setForm(emptyForm); }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editing) await safeCall(() => base44.entities.Customer.update(editing, form), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    else await safeCall(() => base44.entities.Customer.create(form), { fallback: null, message: "Speichern fehlgeschlagen." });
    await loadCustomers();
    closeForm();
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Kunden wirklich löschen?")) return;
    await safeCall(() => base44.entities.Customer.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setCustomers(prev => prev.filter(c => c.id !== id));
  }

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Kunden</h1>
          <button onClick={openNew} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Neuer Kunde
          </button>
        </div>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Noch keine Kunden vorhanden</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                    {c.company && <p className="text-sm text-gray-500">{c.company}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.status === "aktiv" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                </div>
                {c.phone && <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><Phone className="w-3.5 h-3.5 text-gray-400" />{c.phone}</div>}
                {c.email && <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><Mail className="w-3.5 h-3.5 text-gray-400" />{c.email}</div>}
                {(c.city || c.address) && <div className="text-sm text-gray-500 mt-1">{[c.address, c.zip, c.city].filter(Boolean).join(", ")}</div>}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-orange-600 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                    <Edit className="w-3.5 h-3.5" /> Bearbeiten
                  </button>
                  <button onClick={() => remove(c.id)} className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-red-500 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? "Kunde bearbeiten" : "Neuer Kunde"}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: "name", label: "Name *", placeholder: "Max Mustermann" },
                { key: "company", label: "Firma", placeholder: "Musterfirma GmbH" },
                { key: "phone", label: "Telefon", placeholder: "+49 123 456789" },
                { key: "email", label: "E-Mail", placeholder: "info@beispiel.de" },
                { key: "address", label: "Adresse", placeholder: "Musterstraße 1" },
                { key: "zip", label: "PLZ", placeholder: "12345" },
                { key: "city", label: "Stadt", placeholder: "Berlin" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    value={form[key] || ""}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="aktiv">Aktiv</option>
                  <option value="inaktiv">Inaktiv</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={closeForm} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={save} disabled={saving || !form.name.trim()} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}