import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, ClipboardList, Truck, X, Save, Trash2, Edit, AlertTriangle, CheckCircle2, Weight } from "lucide-react";
import { HERSTELLER_SYSTEME, PART_MAPPINGS, resolvePart } from "@/lib/herstellerSysteme";
import { safeCall } from "@/lib/safeCall";
import { toast } from "sonner";

const statusColors = {
  Geplant: "bg-gray-100 text-gray-700",
  Beladen: "bg-blue-100 text-blue-700",
  Unterwegs: "bg-orange-100 text-orange-700",
  Entladen: "bg-green-100 text-green-700",
};

const emptyPosition = { material_name: "", quantity: 1, unit: "Stk", weight_per_unit: 0 };
const emptyForm = {
  title: "", project_id: "", project_name: "", fahrzeug_id: "", fahrzeug_name: "",
  date: "", materials: [{ ...emptyPosition }], status: "Geplant", notes: "",
};

export default function Ladelisten() {
  const [listen, setListen] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalogSystem, setCatalogSystem] = useState("layher_allround");
  const [catalogRole, setCatalogRole] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const result = await safeCall(
      () => Promise.all([
        base44.entities.Ladeliste.list("-created_date"),
        base44.entities.Fahrzeug.list(),
        base44.entities.Project.list(),
      ]),
      { fallback: null, message: "Ladelisten konnten nicht geladen werden." }
    );
    if (result) {
      const [l, v, p] = result;
      setListen(l);
      setVehicles(v.filter((x) => x.status === "aktiv"));
      setProjects(p);
    }
    setLoading(false);
  }

  function openNew() {
    setForm({ ...emptyForm, date: new Date().toISOString().split("T")[0], materials: [{ ...emptyPosition }] });
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(item) {
    setForm({ ...emptyForm, ...item, materials: item.materials?.length ? item.materials : [{ ...emptyPosition }] });
    setEditId(item.id);
    setShowForm(true);
  }

  // Berechne Gesamtgewicht aller Positionen in kg
  const totalWeightKg = (form.materials || []).reduce((s, m) => s + ((Number(m.quantity) || 0) * (Number(m.weight_per_unit) || 0)), 0);
  const totalWeightT = totalWeightKg / 1000;

  // Fahrzeug-Empfehlung: sortiert nach Kapazität, passend markiert
  const selectedVehicle = vehicles.find((v) => v.id === form.fahrzeug_id);
  const vehicleZGM = selectedVehicle?.zul_gesamtmasse;
  const overloaded = vehicleZGM != null && totalWeightT > vehicleZGM;

  // Empfehlung: kleinster LKW, der die Ladung trägt
  const recommended = vehicles
    .filter((v) => v.zul_gesamtmasse != null && v.zul_gesamtmasse >= totalWeightT)
    .sort((a, b) => a.zul_gesamtmasse - b.zul_gesamtmasse)[0];

  function updatePosition(idx, field, value) {
    setForm((f) => ({
      ...f,
      materials: f.materials.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    }));
  }

  function addPosition() {
    setForm((f) => ({ ...f, materials: [...f.materials, { ...emptyPosition }] }));
  }

  function addCatalogPosition() {
    if (!catalogRole) return;
    const part = resolvePart(catalogSystem, catalogRole);
    setForm((f) => ({
      ...f,
      materials: [...f.materials, { material_name: part.name, quantity: 1, unit: part.unit, weight_per_unit: part.weight }],
    }));
    setCatalogRole("");
  }

  function removePosition(idx) {
    setForm((f) => ({ ...f, materials: f.materials.filter((_, i) => i !== idx) }));
  }

  async function save() {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    const projekt = projects.find((p) => p.id === form.project_id);
    const fahrzeug = vehicles.find((v) => v.id === form.fahrzeug_id);
    const materials = form.materials
      .filter((m) => m.material_name.trim())
      .map((m) => ({ ...m, total_weight: (Number(m.quantity) || 0) * (Number(m.weight_per_unit) || 0) }));
    const payload = {
      ...form,
      materials,
      total_weight: materials.reduce((s, m) => s + (m.total_weight || 0), 0) / 1000,
      project_name: projekt?.title || form.project_name || "",
      fahrzeug_name: fahrzeug ? `${fahrzeug.bezeichnung} (${fahrzeug.kennzeichen || "—"})` : form.fahrzeug_name || "",
    };
    const ok = await safeCall(
      () => editId
        ? base44.entities.Ladeliste.update(editId, payload)
        : base44.entities.Ladeliste.create(payload),
      { fallback: null, message: "Ladeliste konnte nicht gespeichert werden." }
    );
    if (ok !== null) {
      toast.success(editId ? "Ladeliste aktualisiert." : "Ladeliste erstellt.");
      await loadData();
      setShowForm(false);
    }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Ladeliste löschen?")) return;
    const ok = await safeCall(
      () => base44.entities.Ladeliste.delete(id),
      { fallback: null, message: "Ladeliste konnte nicht gelöscht werden." }
    );
    if (ok !== null) {
      setListen((prev) => prev.filter((l) => l.id !== id));
      toast.success("Ladeliste gelöscht.");
    }
  }

  const filtered = listen.filter((l) =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.fahrzeug_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.project_name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: listen.length,
    unterwegs: listen.filter((l) => l.status === "Unterwegs").length,
    geplant: listen.filter((l) => l.status === "Geplant").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ladelisten</h1>
              <p className="text-xs text-gray-400">Material ↔ Fahrzeug nach zulässiger Gesamtmasse</p>
            </div>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Neue Ladeliste
          </button>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-400">Ladelisten</div>
            <div className="text-xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-400">Geplant</div>
            <div className="text-xl font-bold text-gray-700 mt-1">{stats.geplant}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-400">Unterwegs</div>
            <div className="text-xl font-bold text-orange-600 mt-1">{stats.unterwegs}</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suche Ladeliste, Fahrzeug, Projekt..." className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Noch keine Ladelisten vorhanden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((l) => {
              const fzg = vehicles.find((v) => v.id === l.fahrzeug_id);
              const zgm = fzg?.zul_gesamtmasse;
              const overloaded = zgm != null && (l.total_weight || 0) > zgm;
              return (
                <div key={l.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{l.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[l.status] || statusColors.Geplant}`}>{l.status}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {l.date} · {l.fahrzeug_name || "Kein Fahrzeug"}
                        {l.project_name && <span className="text-gray-400"> · {l.project_name}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`text-right ${overloaded ? "text-red-600" : "text-gray-700"}`}>
                        <div className="flex items-center gap-1 text-sm font-bold">
                          <Weight className="w-3.5 h-3.5" />
                          {(l.total_weight || 0).toFixed(1)} t
                        </div>
                        {zgm != null && (
                          <div className={`text-xs flex items-center gap-1 ${overloaded ? "text-red-500" : "text-green-600"}`}>
                            {overloaded ? <><AlertTriangle className="w-3 h-3" /> Überlast</> : <><CheckCircle2 className="w-3 h-3" /> max {zgm} t</>}
                          </div>
                        )}
                      </div>
                      <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => remove(l.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">{editId ? "Ladeliste bearbeiten" : "Neue Ladeliste"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bezeichnung *</label>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="z.B. Beladung Mo 14.07." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ladedatum *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projekt / Baustelle</label>
                <select value={form.project_id} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="">Keine Zuordnung</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              {/* Materialpositionen */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Materialpositionen</label>
                  <span className="text-xs text-gray-400">Gesamt: <span className={`font-bold ${totalWeightT > 0 && overloaded ? "text-red-600" : "text-gray-700"}`}>{totalWeightT.toFixed(2)} t</span></span>
                </div>

                {/* Layher-Katalog Schnellauswahl */}
                <div className="flex gap-2 mb-3 bg-orange-50/50 border border-orange-100 rounded-xl p-2">
                  <select value={catalogSystem} onChange={(e) => { setCatalogSystem(e.target.value); setCatalogRole(""); }} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-300">
                    {HERSTELLER_SYSTEME.filter((s) => s.hersteller === "Layher").map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <select value={catalogRole} onChange={(e) => setCatalogRole(e.target.value)} className="flex-[2] px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="">— Bauteil aus Katalog —</option>
                    {Object.keys(PART_MAPPINGS[catalogSystem] || {}).map((key) => {
                      const part = PART_MAPPINGS[catalogSystem][key];
                      return <option key={key} value={key}>{part.name} · {part.dim} · {part.weight} kg</option>;
                    })}
                  </select>
                  <button onClick={addCatalogPosition} disabled={!catalogRole} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 flex-shrink-0">+</button>
                </div>

                <div className="space-y-2">
                  {form.materials.map((m, idx) => {
                    const rowWeight = ((Number(m.quantity) || 0) * (Number(m.weight_per_unit) || 0)) / 1000;
                    return (
                      <div key={idx} className="grid grid-cols-12 gap-1.5 items-center">
                        <input value={m.material_name} onChange={(e) => updatePosition(idx, "material_name", e.target.value)} placeholder="Material" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-300" />
                        <input type="number" value={m.quantity} onChange={(e) => updatePosition(idx, "quantity", e.target.value)} placeholder="Menge" className="col-span-2 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-300" />
                        <input value={m.unit} onChange={(e) => updatePosition(idx, "unit", e.target.value)} placeholder="Stk" className="col-span-2 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-300" />
                        <input type="number" value={m.weight_per_unit} onChange={(e) => updatePosition(idx, "weight_per_unit", e.target.value)} placeholder="kg/Einheit" className="col-span-3 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-300" />
                        <div className="col-span-1 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 w-10 text-right">{rowWeight.toFixed(1)}t</span>
                          <button onClick={() => removePosition(idx)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={addPosition} className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Position hinzufügen</button>
              </div>

              {/* Fahrzeug-Zuordnung nach Gesamtmasse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fahrzeug (nach zul. Gesamtmasse)</label>
                {totalWeightT === 0 ? (
                  <p className="text-xs text-gray-400">Bitte erst Materialpositionen mit Gewichten erfassen.</p>
                ) : (
                  <>
                    {recommended && !selectedVehicle && (
                      <div className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Empfehlung: <strong>{recommended.bezeichnung}</strong> ({recommended.zul_gesamtmasse} t) trägt {totalWeightT.toFixed(1)} t
                      </div>
                    )}
                    <select
                      value={form.fahrzeug_id}
                      onChange={(e) => setForm((f) => ({ ...f, fahrzeug_id: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 ${overloaded ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                    >
                      <option value="">— Fahrzeug wählen —</option>
                      {vehicles
                        .slice()
                        .sort((a, b) => (a.zul_gesamtmasse || 999) - (b.zul_gesamtmasse || 999))
                        .map((v) => {
                          const zgm = v.zul_gesamtmasse;
                          const fits = zgm != null && zgm >= totalWeightT;
                          return (
                            <option key={v.id} value={v.id}>
                              {fits ? "✓ " : "✗ "}{v.bezeichnung} — {v.kennzeichen || "—"} ({zgm != null ? `${zgm} t` : "keine zGM"})
                            </option>
                          );
                        })}
                    </select>
                    {overloaded && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Überlastung! {totalWeightT.toFixed(1)} t überschreiten zul. Gesamtmasse ({vehicleZGM} t).</p>
                    )}
                    {selectedVehicle && !overloaded && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Passt: {totalWeightT.toFixed(1)} t ≤ {vehicleZGM} t zul. Gesamtmasse.</p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={save} disabled={saving || !form.title.trim() || !form.date} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"><Save className="w-4 h-4" /> {saving ? "..." : "Speichern"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}