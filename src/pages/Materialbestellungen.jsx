import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShoppingCart, Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { markMaterialOrderDelivered } from "@/lib/materialDelivery";

const statusColors = {
  "Offen": "bg-gray-100 text-gray-700",
  "Bestellt": "bg-blue-100 text-blue-700",
  "Unterwegs": "bg-orange-100 text-orange-700",
  "Teilgeliefert": "bg-yellow-100 text-yellow-700",
  "Geliefert": "bg-green-100 text-green-700",
  "Storniert": "bg-red-100 text-red-700",
};

const statuses = ["Offen", "Bestellt", "Unterwegs", "Teilgeliefert", "Geliefert", "Storniert"];
const today = new Date().toISOString().split("T")[0];

export default function Materialbestellungen() {
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ material_name: "", material_id: "", quantity: 1, unit: "Stk", supplier: "", order_date: today, expected_delivery: "", status: "Offen", cost: "", notes: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const ords = await safeCall(() => base44.entities.Materialbestellung.list("-order_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
      const mats = await base44.entities.Material.list().catch(() => []);
      setOrders(ords);
      setMaterials(mats);
    } catch (e) {
      setError(e.message || "Daten konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    if (!form.material_name.trim() || !form.order_date || Number(form.quantity) <= 0) {
      toast.error("Bitte Material, Bestelldatum und eine Menge größer als 0 angeben.");
      return;
    }
    try {
      await safeCall(() => base44.entities.Materialbestellung.create(form), { fallback: null, message: "Speichern fehlgeschlagen." });
      setShowForm(false);
      setForm({ material_name: "", material_id: "", quantity: 1, unit: "Stk", supplier: "", order_date: today, expected_delivery: "", status: "Offen", cost: "", notes: "" });
      load();
    } catch (e) {
      alert("Bestellung konnte nicht angelegt werden: " + (e.message || "Unbekannter Fehler"));
    }
  }

  function updateMaterialSelection(materialName) {
    const selected = materials.find((m) => m.name === materialName);
    setForm((current) => ({
      ...current,
      material_name: materialName,
      material_id: selected?.id || "",
      unit: selected?.unit || current.unit || "Stk",
    }));
  }

  async function updateStatus(order, status) {
    try {
      if (status === "Geliefert") {
        // Bucht zusaetzlich den Wareneingang ins Lager und protokolliert die Bewegung.
        await markMaterialOrderDelivered(order);
        toast.success("Lieferung gebucht und Lagerbestand aktualisiert.");
      } else {
        await base44.entities.Materialbestellung.update(order.id, { status });
      }
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status } : o));
    } catch (e) {
      toast.error("Status konnte nicht aktualisiert werden: " + (e.message || "Unbekannter Fehler"));
    }
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const pending = orders.filter(o => o.status !== "Geliefert" && o.status !== "Storniert").length;

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-gray-500 mb-3">{error}</p>
      <button onClick={load} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600">Erneut versuchen</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900">Materialbestellungen</h1>
          {pending > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">{pending} offen</span>}
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600">
          <Plus className="w-4 h-4" /> Neue Bestellung
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex gap-1.5 mb-4 flex-wrap">
          <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === "all" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}>Alle</button>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === s ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}>{s}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Keine Bestellungen vorhanden.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => (
              <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{o.material_name}</div>
                    <div className="text-sm text-gray-500">{o.quantity} {o.unit}{o.supplier && ` · ${o.supplier}`}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex gap-4">
                    <span>Bestellt: {o.order_date || "—"}</span>
                    <span>Lieferung: {o.expected_delivery || "—"}</span>
                    {o.cost ? <span>Kosten: {o.cost} €</span> : null}
                  </div>
                  {o.status !== "Geliefert" && o.status !== "Storniert" && (
                    <div className="flex gap-1">
                      {o.status === "Offen" && (
                        <button onClick={() => updateStatus(o, "Bestellt")} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Als bestellt</button>
                      )}
                      <button onClick={() => updateStatus(o, "Geliefert")} className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                        <Check className="w-3 h-3" /> Geliefert
                      </button>
                    </div>
                  )}
                </div>
                {o.notes && <p className="text-xs text-gray-400 mt-2">{o.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Neue Bestellung</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Material</label>
                <input list="mats-list" value={form.material_name} onChange={e => updateMaterialSelection(e.target.value)} placeholder="Material auswählen oder eingeben" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                <datalist id="mats-list">{materials.map(m => <option key={m.id} value={m.name} />)}</datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Menge</label>
                  <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Einheit</label>
                  <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Lieferant</label>
                <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Bestelldatum</label>
                  <input type="date" value={form.order_date} onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Lieferung erwartet</label>
                  <input type="date" value={form.expected_delivery} onChange={e => setForm(f => ({ ...f, expected_delivery: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Kosten (€)</label>
                <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: parseFloat(e.target.value) || 0 }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Notizen</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <button onClick={create} className="w-full mt-4 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600">Bestellung anlegen</button>
          </div>
        </div>
      )}
    </div>
  );
}