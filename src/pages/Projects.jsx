import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Search, MapPin, Calendar, ChevronRight, Briefcase } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import PullToRefresh from "@/components/PullToRefresh";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { toast } from "sonner";

const statusColors = {
  "Anfrage": "bg-gray-100 text-gray-700",
  "Angebot": "bg-blue-100 text-blue-700",
  "Beauftragt": "bg-yellow-100 text-yellow-700",
  "In Arbeit": "bg-orange-100 text-orange-700",
  "Abgeschlossen": "bg-green-100 text-green-700",
  "Storniert": "bg-red-100 text-red-700",
};

const emptyForm = {
  title: "", customer_id: "", address: "", city: "", status: "Anfrage",
  start_date: "", end_date: "", assembly_date: "", disassembly_date: "", kolonne_id: "",
  scaffold_type: "", scaffold_area: "", scaffold_height: "", description: "", notes: ""
};

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [kolonnen, setKolonnen] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("alle");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [p, c, k] = await Promise.all([
      base44.entities.Project.list("-created_date"),
      base44.entities.Customer.list(),
      base44.entities.Kolonne.list().catch(() => [])
    ]);
    setProjects(p);
    setCustomers(c);
    setKolonnen(k);
    setLoading(false);
  }

  async function save() {
    if (!form.title.trim() || !form.customer_id) return;
    if (form.start_date && form.end_date && form.end_date < form.start_date) { alert("Das Enddatum muss nach dem Startdatum liegen."); return; }
    if (form.assembly_date && form.disassembly_date && form.disassembly_date < form.assembly_date) { alert("Das Abbaudatum muss nach dem Aufbaudatum liegen."); return; }
    setSaving(true);
    const created = await safeCall(() => base44.entities.Project.create(form), { fallback: null, message: "Speichern fehlgeschlagen." });
    await safeCall(() => base44.entities.ProjektHistorie.create({
      project_id: created.id,
      project_name: form.title,
      action_type: "Erstellt",
      field_changed: "status",
      old_value: "",
      new_value: form.status,
      user_name: user?.full_name || user?.email || "Unbekannt",
      timestamp: new Date().toISOString(),
    }), { fallback: null, message: "Speichern fehlgeschlagen." });
    await loadData();
    setShowForm(false);
    setForm(emptyForm);
    setSaving(false);
  }

  const customerMap = Object.fromEntries(customers.map(c => [c.id, c]));

  const filtered = projects.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      customerMap[p.customer_id]?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "alle" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Projekte</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Neues Projekt
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="w-36">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300">
              <option value="alle">Alle</option>
              {["Anfrage", "Angebot", "Beauftragt", "In Arbeit", "Abgeschlossen", "Storniert"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <PullToRefresh onRefresh={loadData}>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Projekte gefunden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <Link to={`/projects/${p.id}`} key={p.id} className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-orange-200 transition-all">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[p.status] || "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {customerMap[p.customer_id] && <span>{customerMap[p.customer_id].name}</span>}
                    {p.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city}</span>}
                    {p.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.start_date}</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
      </PullToRefresh>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Neues Projekt</h2>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="p-1.5 rounded-lg hover:bg-gray-100">✕</button>
            </div>
            <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
              <div>
                <label htmlFor="project-title" className="block text-sm font-medium text-gray-700 mb-1">Projektbezeichnung *</label>
                <input name="title" id="project-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="z.B. Fassadengerüst Hauptstraße 5" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kunde *</label>
                <BottomSheetSelect
                  value={form.customer_id}
                  onChange={(v) => setForm(f => ({ ...f, customer_id: v }))}
                  placeholder="Kunde wählen..."
                  label="Kunde wählen"
                  triggerClassName="bg-white border border-gray-200"
                  options={customers.map(c => ({ value: c.id, label: `${c.name}${c.company ? ` (${c.company})` : ""}` }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="project-address" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input name="address" id="project-address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Straße Nr." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label htmlFor="project-city" className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
                  <input name="city" id="project-city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Berlin" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="project-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <BottomSheetSelect
                    value={form.status}
                    onChange={(v) => setForm(f => ({ ...f, status: v }))}
                    label="Status"
                    triggerClassName="bg-white border border-gray-200"
                    options={["Anfrage","Angebot","Beauftragt","In Arbeit","Abgeschlossen","Storniert"].map(s => ({ value: s, label: s }))}
                  />
                </div>
                <div>
                  <label htmlFor="project-kolonne" className="block text-sm font-medium text-gray-700 mb-1">Kolonne</label>
                  <BottomSheetSelect
                    value={form.kolonne_id}
                    onChange={(v) => setForm(f => ({ ...f, kolonne_id: v }))}
                    placeholder="Keine Kolonne"
                    label="Kolonne wählen"
                    triggerClassName="bg-white border border-gray-200"
                    options={[{ value: "", label: "Keine Kolonne" }, ...kolonnen.map(k => ({ value: k.id, label: k.name }))]}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="project-start-date" className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                  <input type="date" name="start_date" id="project-start-date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label htmlFor="project-end-date" className="block text-sm font-medium text-gray-700 mb-1">Enddatum</label>
                  <input type="date" name="end_date" id="project-end-date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="project-assembly-date" className="block text-sm font-medium text-gray-700 mb-1">Aufbaudatum</label>
                  <input type="date" name="assembly_date" id="project-assembly-date" value={form.assembly_date} onChange={e => setForm(f => ({ ...f, assembly_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label htmlFor="project-disassembly-date" className="block text-sm font-medium text-gray-700 mb-1">Abbaudatum</label>
                  <input type="date" name="disassembly_date" id="project-disassembly-date" value={form.disassembly_date} onChange={e => setForm(f => ({ ...f, disassembly_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>

            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button type="button" onClick={save} disabled={saving || !form.title.trim() || !form.customer_id} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}