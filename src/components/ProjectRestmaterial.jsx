import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Package, Plus, Trash2, X } from "lucide-react";

export default function ProjectRestmaterial({ projectId, projectName }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ material_name: "", quantity: 1, unit: "Stk", location: "Baustelle", notes: "" });

  useEffect(() => { load(); }, [projectId]);

  async function load() {
    setLoading(true);
    try {
      const data = await safeCall(() => base44.entities.Standortbestand.list(), { fallback: [], message: "Daten konnten nicht geladen werden." });
      setItems(data.filter((i) => i.project_id === projectId));
    } catch { setItems([]); }
    setLoading(false);
  }

  async function save() {
    if (!form.material_name.trim() || form.quantity <= 0) return;
    await safeCall(() => base44.entities.Standortbestand.create({
      ...form,
      project_id: projectId,
      scan_date: new Date().toISOString(),
    }), { fallback: null, message: "Speichern fehlgeschlagen." });
    setForm({ material_name: "", quantity: 1, unit: "Stk", location: "Baustelle", notes: "" });
    setShowForm(false);
    await load();
  }

  async function remove(id) {
    if (!confirm("Eintrag entfernen?")) return;
    await safeCall(() => base44.entities.Standortbestand.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function adjust(id, delta) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, (item.quantity || 0) + delta);
    await safeCall(() => base44.entities.Standortbestand.update(id, { quantity: newQty }), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)));
  }

  const totalItems = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const distinctMaterials = items.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Restmaterial auf Baustelle</h2>
          {distinctMaterials > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">{distinctMaterials} Positionen</span>}
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium">
          <Plus className="w-4 h-4" /> Hinzufügen
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Noch kein Restmaterial erfasst.<br />Materialien vor Ort hier dokumentieren.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-3 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-50 rounded-lg font-medium">{totalItems} Teile gesamt</span>
            <span className="px-2 py-1 bg-gray-50 rounded-lg font-medium">{distinctMaterials} verschiedene Materialien</span>
          </div>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{i.material_name}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    {i.location && <span>{i.location}</span>}
                    {i.notes && <span>· {i.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => adjust(i.id, -1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 font-bold">−</button>
                  <span className="font-semibold text-gray-900 text-sm w-14 text-center">{i.quantity} {i.unit || "Stk"}</span>
                  <button onClick={() => adjust(i.id, 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 font-bold">+</button>
                  <button onClick={() => remove(i.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Restmaterial erfassen</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material *</label>
                <input value={form.material_name} onChange={(e) => setForm((f) => ({ ...f, material_name: e.target.value }))} placeholder="z.B. Gerüstrahmen 2,5m" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Menge *</label>
                  <input type="number" min="1" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Einheit</label>
                  <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="Stk" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
                <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Baustelle, Lagerplatz..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={save} disabled={!form.material_name.trim()} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}