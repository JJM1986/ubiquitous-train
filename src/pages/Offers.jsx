import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, FileText, Euro, X, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const statusColors = {
  "Entwurf": "bg-gray-100 text-gray-600",
  "Gesendet": "bg-blue-100 text-blue-700",
  "Angenommen": "bg-green-100 text-green-700",
  "Abgelehnt": "bg-red-100 text-red-700",
};

const emptyPosition = { description: "", quantity: 1, unit: "m²", unit_price: 0 };

const emptyForm = {
  offer_number: "", project_id: "", customer_id: "", date: new Date().toISOString().split("T")[0],
  valid_until: "", status: "Entwurf", positions: [{ ...emptyPosition }], tax_rate: 19, notes: ""
};

function calcTotals(positions, taxRate) {
  const subtotal = positions.reduce((sum, p) => sum + (parseFloat(p.quantity) || 0) * (parseFloat(p.unit_price) || 0), 0);
  const tax = subtotal * (parseFloat(taxRate) || 0) / 100;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [o, p, c] = await Promise.all([
      base44.entities.Offer.list("-created_date"),
      base44.entities.Project.list(),
      base44.entities.Customer.list(),
    ]);
    setOffers(o);
    setProjects(p);
    setCustomers(c);
    setLoading(false);
  }

  function openNew() {
    const num = `AN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setForm({ ...emptyForm, offer_number: num });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(o) { setForm({ ...o, positions: o.positions || [{ ...emptyPosition }] }); setEditing(o.id); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditing(null); setForm(emptyForm); }

  function updatePosition(idx, key, val) {
    setForm(f => {
      const positions = [...f.positions];
      positions[idx] = { ...positions[idx], [key]: val };
      return { ...f, positions };
    });
  }

  function addPosition() { setForm(f => ({ ...f, positions: [...f.positions, { ...emptyPosition }] })); }
  function removePosition(idx) { setForm(f => ({ ...f, positions: f.positions.filter((_, i) => i !== idx) })); }

  async function save() {
    if (!form.offer_number || !form.customer_id) return;
    setSaving(true);
    const { subtotal, total } = calcTotals(form.positions, form.tax_rate);
    const data = { ...form, subtotal, total };
    if (editing) await safeCall(() => base44.entities.Offer.update(editing, data), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    else await safeCall(() => base44.entities.Offer.create(data), { fallback: null, message: "Speichern fehlgeschlagen." });
    await loadAll();
    closeForm();
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Angebot wirklich löschen?")) return;
    await safeCall(() => base44.entities.Offer.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setOffers(prev => prev.filter(o => o.id !== id));
  }

  const customerMap = Object.fromEntries(customers.map(c => [c.id, c]));
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

  const filtered = offers.filter(o =>
    o.offer_number?.toLowerCase().includes(search.toLowerCase()) ||
    customerMap[o.customer_id]?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const { subtotal, tax, total } = calcTotals(form.positions || [], form.tax_rate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Angebote</h1>
          <button onClick={openNew} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Neues Angebot
          </button>
        </div>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Angebotsnr. oder Kunde suchen..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Noch keine Angebote vorhanden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => (
              <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-gray-900 text-sm">{o.offer_number}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[o.status] || "bg-gray-100"}`}>{o.status}</span>
                    </div>
                    <div className="text-sm text-gray-600">{customerMap[o.customer_id]?.name || "Unbekannter Kunde"}</div>
                    {o.project_id && <div className="text-xs text-gray-400 mt-0.5">{projectMap[o.project_id]?.title}</div>}
                    <div className="text-xs text-gray-400 mt-1">{o.date} {o.valid_until && `· Gültig bis ${o.valid_until}`}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-bold text-gray-900">{o.total?.toFixed(2)} €</div>
                    <div className="text-xs text-gray-400">inkl. MwSt.</div>
                    <div className="flex gap-1 mt-2">
                      <button onClick={() => openEdit(o)} className="text-xs text-gray-500 hover:text-orange-500 px-2 py-1 rounded-lg hover:bg-orange-50">Bearbeiten</button>
                      <button onClick={() => remove(o.id)} className="text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50">Löschen</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offer Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-semibold text-gray-900">{editing ? "Angebot bearbeiten" : "Neues Angebot"}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Angebotsnummer *</label>
                  <input value={form.offer_number} onChange={e => setForm(f => ({ ...f, offer_number: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                    {["Entwurf","Gesendet","Angenommen","Abgelehnt"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kunde *</label>
                  <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="">Wählen...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                  <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="">Kein Projekt</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gültig bis</label>
                  <input type="date" value={form.valid_until || ""} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>

              {/* Positions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Positionen</label>
                  <button onClick={addPosition} className="text-sm text-orange-500 hover:text-orange-600 font-medium">+ Position</button>
                </div>
                <div className="space-y-2">
                  {form.positions?.map((pos, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2">
                      <div className="flex gap-2">
                        <input value={pos.description} onChange={e => updatePosition(idx, "description", e.target.value)} placeholder="Beschreibung" className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                        <button onClick={() => removePosition(idx)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input type="number" value={pos.quantity} onChange={e => updatePosition(idx, "quantity", e.target.value)} placeholder="Menge" className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                        <input value={pos.unit} onChange={e => updatePosition(idx, "unit", e.target.value)} placeholder="Einheit" className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                        <input type="number" value={pos.unit_price} onChange={e => updatePosition(idx, "unit_price", e.target.value)} placeholder="€/Einheit" className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                      </div>
                      <div className="text-right text-sm font-medium text-gray-700">
                        {((parseFloat(pos.quantity) || 0) * (parseFloat(pos.unit_price) || 0)).toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-4 bg-orange-50 rounded-xl space-y-1">
                <div className="flex justify-between text-sm text-gray-600"><span>Netto</span><span>{subtotal.toFixed(2)} €</span></div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>MwSt.</span>
                    <input type="number" value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))} className="w-14 px-2 py-0.5 border border-gray-200 rounded-lg text-sm outline-none text-center" />
                    <span>%</span>
                  </div>
                  <span>{tax.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-orange-200 pt-1"><span>Gesamt</span><span>{total.toFixed(2)} €</span></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anmerkungen</label>
                <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={closeForm} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={save} disabled={saving || !form.offer_number || !form.customer_id} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}