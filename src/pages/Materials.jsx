import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Package, AlertTriangle, X, RefreshCw, Download, FileText } from "lucide-react";
import { exportMaterialsPDF, exportMaterialsCSV } from "@/lib/exportUtils";

const categoryColors = {
  "Gerüstrahmen": "bg-orange-100 text-orange-700",
  "Beläge": "bg-blue-100 text-blue-700",
  "Kupplungen": "bg-purple-100 text-purple-700",
  "Rohre": "bg-gray-100 text-gray-700",
  "Sicherheit": "bg-red-100 text-red-700",
  "Zubehör": "bg-green-100 text-green-700",
  "Sonstiges": "bg-yellow-100 text-yellow-700",
};

const emptyForm = { name: "", category: "Gerüstrahmen", unit: "Stück", stock: 0, min_stock: 0, location: "", purchase_price: "", notes: "" };
const emptyMovement = { material_id: "", type: "Zugang", quantity: "", date: new Date().toISOString().split("T")[0], notes: "" };

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("alle");
  const [showForm, setShowForm] = useState(false);
  const [showMovement, setShowMovement] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [movement, setMovement] = useState(emptyMovement);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await safeCall(() => base44.entities.Material.list("-created_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
    setMaterials(data);
    setLoading(false);
  }

  function openNew() { setForm(emptyForm); setEditing(null); setShowForm(true); }
  function openEdit(m) { setForm({ ...m }); setEditing(m.id); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditing(null); setForm(emptyForm); }
  function openMovement(m) { setMovement({ ...emptyMovement, material_id: m.id }); setShowMovement(m); }

  async function save() {
    if (!form.name.trim()) return;
    if (form.stock < 0 || form.min_stock < 0) { alert("Bestand und Mindestbestand dürfen nicht negativ sein."); return; }
    setSaving(true);
    if (editing) {
      const oldMaterial = materials.find(m => m.id === editing);
      const updatedMaterial = { ...oldMaterial, ...form };
      setMaterials(prev => prev.map(m => m.id === editing ? updatedMaterial : m));
      closeForm();
      try {
        await safeCall(() => base44.entities.Material.update(editing, form), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
      } catch (e) {
        setMaterials(prev => prev.map(m => m.id === editing ? oldMaterial : m));
        alert("Material konnte nicht aktualisiert werden.");
      } finally {
        setSaving(false);
      }
    } else {
      const tempId = "temp-" + Date.now();
      const optimisticRecord = { ...form, id: tempId, created_date: new Date().toISOString() };
      setMaterials(prev => [optimisticRecord, ...prev]);
      closeForm();
      try {
        const created = await safeCall(() => base44.entities.Material.create(form), { fallback: null, message: "Speichern fehlgeschlagen." });
        setMaterials(prev => prev.map(m => m.id === tempId ? created : m));
      } catch (e) {
        setMaterials(prev => prev.filter(m => m.id !== tempId));
        alert("Material konnte nicht erstellt werden.");
      } finally {
        setSaving(false);
      }
    }
  }

  async function saveMovement() {
    if (!movement.quantity || !movement.date) return;
    const qty = parseFloat(movement.quantity);
    if (qty <= 0) { alert("Die Menge muss größer als 0 sein."); return; }
    const delta = movement.type === "Zugang" || movement.type === "Rückgabe" ? qty : -qty;
    const newStock = (showMovement.stock || 0) + delta;
    if (newStock < 0) { alert("Bestand kann nicht negativ werden. Aktueller Bestand: " + (showMovement.stock || 0) + " " + showMovement.unit); return; }
    const oldMaterial = materials.find(m => m.id === showMovement.id);
    setMaterials(prev => prev.map(m => m.id === showMovement.id ? { ...m, stock: newStock } : m));
    setShowMovement(null);
    setSaving(true);
    try {
      await safeCall(() => base44.entities.MaterialMovement.create(movement), { fallback: null, message: "Speichern fehlgeschlagen." });
      await safeCall(() => base44.entities.Material.update(showMovement.id, { stock: newStock }), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
      const oldStock = showMovement.stock || 0;
      const minStock = showMovement.min_stock || 0;
      if (minStock > 0 && oldStock > minStock && newStock <= minStock) {
        try {
          const me = await safeCall(() => base44.auth.me(), { fallback: null, message: "Aktion fehlgeschlagen." });
          if (me?.email) {
            await safeCall(() => base44.integrations.Core.SendEmail({
              to: me.email,
              subject: `⚠️ Mindestbestand unterschritten: ${showMovement.name}`,
              body: `Hallo ${me.full_name || ""},\n\nder Bestand des Materials "${showMovement.name}" ist unter den Mindestbestand gefallen.\n\nMaterial: ${showMovement.name}\nAktueller Bestand: ${newStock} ${showMovement.unit}\nMindestbestand: ${minStock} ${showMovement.unit}\nLagerort: ${showMovement.location || "nicht angegeben"}\n\nBitte prüfen Sie, ob eine Nachbestellung erforderlich ist.\n\n— GerüstMeister`,
            }), { fallback: null, message: "Aktion fehlgeschlagen." });
          }
        } catch (e) { /* Email failure should not block the operation */ }
      }
    } catch (e) {
      setMaterials(prev => prev.map(m => m.id === showMovement.id ? oldMaterial : m));
      alert("Lagerbuchung fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Material wirklich löschen?")) return;
    await safeCall(() => base44.entities.Material.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setMaterials(prev => prev.filter(m => m.id !== id));
  }

  const filtered = materials.filter(m => {
    const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) || m.location?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "alle" || m.category === catFilter;
    return matchSearch && matchCat;
  });

  const lowStock = materials.filter(m => m.min_stock > 0 && m.stock <= m.min_stock);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Material & Lager</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => exportMaterialsPDF(materials)} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 touch-manipulation" title="Als PDF exportieren">
              <FileText className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={() => exportMaterialsCSV(materials)} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 touch-manipulation" title="Als Excel exportieren">
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Excel</span>
            </button>
            <button onClick={openNew} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors touch-manipulation">
              <Plus className="w-4 h-4" /> Neues Material
            </button>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-3 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300">
            <option value="alle">Alle</option>
            {["Gerüstrahmen","Beläge","Kupplungen","Rohre","Sicherheit","Zubehör","Sonstiges"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span><strong>{lowStock.length} Artikel</strong> unter Mindestbestand: {lowStock.map(m => m.name).join(", ")}</span>
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Noch keine Materialien vorhanden</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(m => {
              const isLow = m.min_stock > 0 && m.stock <= m.min_stock;
              return (
                <div key={m.id} className={`bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-shadow ${isLow ? "border-red-200" : "border-gray-100"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{m.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[m.category] || "bg-gray-100 text-gray-600"}`}>{m.category}</span>
                    </div>
                    {isLow && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 ml-2" />}
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className={`text-3xl font-bold ${isLow ? "text-red-600" : "text-gray-900"}`}>{m.stock}</div>
                      <div className="text-xs text-gray-400">{m.unit} · Min: {m.min_stock}</div>
                    </div>
                    {m.location && <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">{m.location}</div>}
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button onClick={() => openMovement(m)} className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-orange-600 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> Buchung
                    </button>
                    <button onClick={() => openEdit(m)} className="flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">Bearbeiten</button>
                    <button onClick={() => remove(m.id)} className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Material Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? "Material bearbeiten" : "Neues Material"}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bezeichnung *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Alu-Rahmen 2m" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                    {["Gerüstrahmen","Beläge","Kupplungen","Rohre","Sicherheit","Zubehör","Sonstiges"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Einheit</label>
                  <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="Stück" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bestand</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mindestbestand</label>
                  <input type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Einkaufspreis</label>
                  <input type="number" value={form.purchase_price || ""} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))} placeholder="0.00" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lagerort</label>
                <input value={form.location || ""} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="z.B. Regal A3" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
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

      {/* Movement Modal */}
      {showMovement && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Lagerbuchung: {showMovement.name}</h2>
              <button onClick={() => setShowMovement(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold text-gray-900">{showMovement.stock}</div>
                <div className="text-sm text-gray-500">{showMovement.unit} aktuell</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bewegungsart</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Zugang","Abgang","Ausgabe","Rückgabe"].map(type => (
                    <button key={type} onClick={() => setMovement(m => ({ ...m, type }))}
                      className={`py-2 rounded-xl text-sm font-medium border transition-colors ${movement.type === type ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Menge *</label>
                  <input type="number" value={movement.quantity} onChange={e => setMovement(m => ({ ...m, quantity: e.target.value }))} placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
                  <input type="date" value={movement.date} onChange={e => setMovement(m => ({ ...m, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notiz</label>
                <input value={movement.notes || ""} onChange={e => setMovement(m => ({ ...m, notes: e.target.value }))} placeholder="Optional..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowMovement(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={saveMovement} disabled={saving || !movement.quantity} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                {saving ? "Buchen..." : "Buchen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}