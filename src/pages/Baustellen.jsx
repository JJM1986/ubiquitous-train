import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, HardHat, ArrowUp, ArrowDown, Users, Edit, X } from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
  "geplant": { label: "Geplant", color: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
  "läuft": { label: "Läuft", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  "fertig": { label: "Fertig", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
};

export default function Baustellen() {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [kolonnen, setKolonnen] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("alle");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [ps, cs, ks] = await Promise.all([
      base44.entities.Project.list("-created_date"),
      base44.entities.Customer.list(),
      base44.entities.Kolonne.list(),
    ]);
    const baustellen = ps.filter(p => ["Beauftragt", "In Arbeit", "Abgeschlossen"].includes(p.status));
    setProjects(baustellen);
    setCustomers(cs);
    setKolonnen(ks);
    setLoading(false);
  }

  function openEdit(p) {
    setForm({
      ...p,
      assembly_date: p.assembly_date || "",
      disassembly_date: p.disassembly_date || "",
      kolonne_id: p.kolonne_id || "",
      baustelle_status: p.baustelle_status || "geplant",
    });
    setEditing(p.id);
  }

  async function save() {
    setSaving(true);
    await safeCall(() => base44.entities.Project.update(editing, {
      assembly_date: form.assembly_date,
      disassembly_date: form.disassembly_date,
      kolonne_id: form.kolonne_id,
      baustelle_status: form.baustelle_status,
    }), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    await load();
    setEditing(null);
    setSaving(false);
  }

  const customerMap = Object.fromEntries(customers.map(c => [c.id, c]));
  const kolonneMap = Object.fromEntries(kolonnen.map(k => [k.id, k]));

  const filtered = projects.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "alle" || (p.baustelle_status || "geplant") === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    geplant: projects.filter(p => (p.baustelle_status || "geplant") === "geplant").length,
    läuft: projects.filter(p => p.baustelle_status === "läuft").length,
    fertig: projects.filter(p => p.baustelle_status === "fertig").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Baustellen</h1>
            <p className="text-sm text-gray-500">Auf-/Abbautermine, Kolonnen & Status</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Baustelle suchen..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300">
            <option value="alle">Alle Status</option>
            <option value="geplant">Geplant</option>
            <option value="läuft">Läuft</option>
            <option value="fertig">Fertig</option>
          </select>
        </div>
      </div>

      <div className="px-6 pt-4">
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.geplant}</div>
            <div className="text-xs text-gray-500">Geplant</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.läuft}</div>
            <div className="text-xs text-gray-500">Läuft</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.fertig}</div>
            <div className="text-xs text-gray-500">Fertig</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <HardHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Baustellen gefunden</p>
            <p className="text-xs mt-1">Projekte mit Status „Beauftragt" oder „In Arbeit" erscheinen hier</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => {
              const st = p.baustelle_status || "geplant";
              const cfg = statusConfig[st] || statusConfig.geplant;
              const kolonne = kolonneMap[p.kolonne_id];
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{p.title}</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {customerMap[p.customer_id]?.name || "—"} · {p.city || p.address || "—"}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <ArrowUp className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-500">Aufbau:</span>
                          <span className="font-medium text-gray-900">{p.assembly_date || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ArrowDown className="w-4 h-4 text-red-500" />
                          <span className="text-gray-500">Abbau:</span>
                          <span className="font-medium text-gray-900">{p.disassembly_date || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-500">Kolonne:</span>
                          <span className="font-medium text-gray-900">{kolonne?.name || "—"}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => openEdit(p)} className="flex items-center gap-1 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 flex-shrink-0">
                      <Edit className="w-4 h-4" /> Bearbeiten
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Baustelle bearbeiten</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{form.title}</h3>
                <p className="text-sm text-gray-500">{customerMap[form.customer_id]?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baustellen-Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, baustelle_status: key }))}
                      className={`py-2 rounded-xl text-sm font-medium border transition-colors ${form.baustelle_status === key ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aufbaudatum</label>
                  <input type="date" value={form.assembly_date} onChange={e => setForm(f => ({ ...f, assembly_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abbaudatum</label>
                  <input type="date" value={form.disassembly_date} onChange={e => setForm(f => ({ ...f, disassembly_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kolonne zuweisen</label>
                <select value={form.kolonne_id} onChange={e => setForm(f => ({ ...f, kolonne_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="">Keine Kolonne</option>
                  {kolonnen.map(k => <option key={k.id} value={k.id}>{k.name}{k.leader_name ? ` (${k.leader_name})` : ""}</option>)}
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}