import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import {
  Plus, Search, Truck, Car, Wrench, Calendar, User, MapPin, Edit, Trash2, X, Save, Clock, Package,
} from "lucide-react";

const typeColors = {
  Transporter: "bg-blue-100 text-blue-700",
  LKW: "bg-orange-100 text-orange-700",
  PKW: "bg-gray-100 text-gray-700",
  Anhänger: "bg-purple-100 text-purple-700",
  Kran: "bg-yellow-100 text-yellow-700",
  Sonstiges: "bg-gray-100 text-gray-600",
};

const statusColors = {
  aktiv: "bg-green-100 text-green-700",
  werkstatt: "bg-orange-100 text-orange-700",
  ausgemustert: "bg-gray-100 text-gray-500",
};

const typeIcons = {
  Transporter: Truck,
  LKW: Truck,
  PKW: Car,
  Anhänger: Truck,
  Kran: Wrench,
  Sonstiges: Truck,
};

const emptyForm = {
  bezeichnung: "", kennzeichen: "", typ: "Transporter", marke: "", modell: "",
  baujahr: "", kilometerstand: "", zul_gesamtmasse: "", leergewicht: "", tuv: "", inspect_date: "", status: "aktiv",
  fahrer_id: "", fahrer_name: "", kolonne_id: "", einsatz_project_id: "", einsatz_project_name: "",
  location: "", photo_url: "", notes: "",
};

export default function Fuhrpark() {
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [kolonnen, setKolonnen] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("alle");
  const [statusFilter, setStatusFilter] = useState("alle");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [v, e, k, p] = await Promise.all([
      base44.entities.Fahrzeug.list("-created_date"),
      base44.entities.Employee.list(),
      base44.entities.Kolonne.list(),
      base44.entities.Project.list(),
    ]);
    setVehicles(v);
    setEmployees(e);
    setKolonnen(k);
    setProjects(p);
    setLoading(false);
  }

  function openNew() {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(v) {
    setForm({ ...emptyForm, ...v });
    setEditId(v.id);
    setShowForm(true);
  }

  async function save() {
    if (!form.bezeichnung.trim()) return;
    setSaving(true);
    const fahrer = employees.find((e) => e.id === form.fahrer_id);
    const projekt = projects.find((p) => p.id === form.einsatz_project_id);
    const payload = {
      ...form,
      fahrer_name: fahrer ? `${fahrer.first_name} ${fahrer.last_name}` : form.fahrer_name || "",
      einsatz_project_name: projekt ? projekt.title : form.einsatz_project_name || "",
    };
    if (editId) {
      await safeCall(() => base44.entities.Fahrzeug.update(editId, payload), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    } else {
      await safeCall(() => base44.entities.Fahrzeug.create(payload), { fallback: null, message: "Speichern fehlgeschlagen." });
    }
    await loadData();
    setShowForm(false);
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Fahrzeug wirklich löschen?")) return;
    await safeCall(() => base44.entities.Fahrzeug.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      v.bezeichnung?.toLowerCase().includes(search.toLowerCase()) ||
      v.kennzeichen?.toLowerCase().includes(search.toLowerCase()) ||
      v.marke?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "alle" || v.typ === typeFilter;
    const matchStatus = statusFilter === "alle" || v.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: vehicles.length,
    aktiv: vehicles.filter((v) => v.status === "aktiv").length,
    werkstatt: vehicles.filter((v) => v.status === "werkstatt").length,
    tusoon: vehicles.filter((v) => {
      if (!v.tuv) return false;
      const days = (new Date(v.tuv) - new Date()) / 86400000;
      return days <= 30 && days >= 0;
    }).length,
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
              <Truck className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fuhrpark</h1>
              <p className="text-xs text-gray-400">Fahrzeuge & Personen-Zuordnung</p>
            </div>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Neues Fahrzeug
          </button>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-400">Fahrzeuge gesamt</div>
            <div className="text-xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-400">Aktiv</div>
            <div className="text-xl font-bold text-green-600 mt-1">{stats.aktiv}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-400">In Werkstatt</div>
            <div className="text-xl font-bold text-orange-600 mt-1">{stats.werkstatt}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-400">TÜV fällig (30 T.)</div>
            <div className={`text-xl font-bold mt-1 ${stats.tusoon > 0 ? "text-red-600" : "text-gray-900"}`}>{stats.tusoon}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suche Bezeichnung, Kennzeichen, Marke..." className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 bg-white rounded-xl text-sm border border-gray-200 outline-none">
            <option value="alle">Alle Typen</option>
            {Object.keys(typeColors).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white rounded-xl text-sm border border-gray-200 outline-none">
            <option value="alle">Alle Status</option>
            <option value="aktiv">Aktiv</option>
            <option value="werkstatt">Werkstatt</option>
            <option value="ausgemustert">Ausgemustert</option>
          </select>
        </div>

        {/* Vehicle Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Fahrzeuge gefunden</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((v) => {
              const Icon = typeIcons[v.typ] || Truck;
              const tusoon = v.tuv && (new Date(v.tuv) - new Date()) / 86400000 <= 30 && (new Date(v.tuv) - new Date()) / 86400000 >= 0;
              return (
                <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {v.photo_url
                        ? <img src={v.photo_url} alt={v.bezeichnung} className="w-full h-full object-cover" />
                        : <Icon className="w-6 h-6 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{v.bezeichnung}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[v.typ] || "bg-gray-100 text-gray-600"}`}>{v.typ}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[v.status] || statusColors.aktiv}`}>{v.status}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{v.kennzeichen || "—"} · {[v.marke, v.modell].filter(Boolean).join(" ") || "—"}</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => remove(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-50 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <User className="w-3.5 h-3.5" />
                      <span className="truncate">{v.fahrer_name || "Kein Fahrer"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Package className="w-3.5 h-3.5" />
                      <span className="truncate">{v.einsatz_project_name || "Keine Baustelle"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{v.location || "—"}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${tusoon ? "text-red-600 font-medium" : "text-gray-500"}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>TÜV: {v.tuv || "—"}</span>
                    </div>
                    {v.kilometerstand != null && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{v.kilometerstand.toLocaleString("de-DE")} km</span>
                      </div>
                    )}
                    {v.zul_gesamtmasse != null && v.zul_gesamtmasse !== "" && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>zGM: {v.zul_gesamtmasse} t</span>
                      </div>
                    )}
                    {v.inspect_date && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Inspektion: {v.inspect_date}</span>
                      </div>
                    )}
                  </div>

                  {v.notes && (
                    <div className="mt-2 text-xs text-gray-400 italic truncate">{v.notes}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">{editId ? "Fahrzeug bearbeiten" : "Neues Fahrzeug"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bezeichnung *</label>
                  <input value={form.bezeichnung} onChange={(e) => setForm((f) => ({ ...f, bezeichnung: e.target.value }))} placeholder="Transporter 1" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kennzeichen</label>
                  <input value={form.kennzeichen} onChange={(e) => setForm((f) => ({ ...f, kennzeichen: e.target.value }))} placeholder="M-AB 1234" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 uppercase" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                  <select value={form.typ} onChange={(e) => setForm((f) => ({ ...f, typ: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                    {Object.keys(typeColors).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marke</label>
                  <input value={form.marke} onChange={(e) => setForm((f) => ({ ...f, marke: e.target.value }))} placeholder="Mercedes" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modell</label>
                  <input value={form.modell} onChange={(e) => setForm((f) => ({ ...f, modell: e.target.value }))} placeholder="Sprinter" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Baujahr</label>
                  <input type="number" value={form.baujahr} onChange={(e) => setForm((f) => ({ ...f, baujahr: e.target.value }))} placeholder="2018" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kilometerstand</label>
                  <input type="number" value={form.kilometerstand} onChange={(e) => setForm((f) => ({ ...f, kilometerstand: e.target.value }))} placeholder="45000" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="aktiv">Aktiv</option>
                    <option value="werkstatt">Werkstatt</option>
                    <option value="ausgemustert">Ausgemustert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zul. Gesamtmasse (t)</label>
                  <input type="number" step="0.1" value={form.zul_gesamtmasse} onChange={(e) => setForm((f) => ({ ...f, zul_gesamtmasse: e.target.value }))} placeholder="18" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leergewicht (t)</label>
                  <input type="number" step="0.1" value={form.leergewicht} onChange={(e) => setForm((f) => ({ ...f, leergewicht: e.target.value }))} placeholder="7" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TÜV / SP</label>
                  <input type="date" value={form.tuv || ""} onChange={(e) => setForm((f) => ({ ...f, tuv: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nächste Inspektion</label>
                  <input type="date" value={form.inspect_date || ""} onChange={(e) => setForm((f) => ({ ...f, inspect_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fahrer / Zuständiger</label>
                <select value={form.fahrer_id} onChange={(e) => setForm((f) => ({ ...f, fahrer_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="">Keine Zuordnung</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.role})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aktuelle Baustelle</label>
                <select value={form.einsatz_project_id} onChange={(e) => setForm((f) => ({ ...f, einsatz_project_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="">Keine Baustelle</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kolonne</label>
                <select value={form.kolonne_id} onChange={(e) => setForm((f) => ({ ...f, kolonne_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="">Keine Kolonne</option>
                  {kolonnen.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
                <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Lager Hof 1" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto URL</label>
                <input value={form.photo_url} onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={save} disabled={saving || !form.bezeichnung.trim()} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                <Save className="w-4 h-4" /> {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}