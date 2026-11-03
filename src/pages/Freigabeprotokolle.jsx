import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ClipboardCheck, Search, ChevronRight, Plus, Trash2 } from "lucide-react";
import { DEFAULT_CHECKPOINTS } from "./Geruestfreigaben";

const statusColors = {
  "Entwurf": "bg-gray-100 text-gray-600",
  "Freigegeben": "bg-green-100 text-green-700",
  "Abgelehnt": "bg-red-100 text-red-700",
};

const resultColors = {
  "Freigegeben": "bg-green-100 text-green-700",
  "Freigegeben mit Auflagen": "bg-yellow-100 text-yellow-700",
  "Nicht freigegeben": "bg-red-100 text-red-700",
};

export default function Freigabeprotokolle() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await safeCall(() => base44.entities.Geruestfreigabe.list("-created_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
    setItems(data);
    setLoading(false);
  }

  async function createNew() {
    setCreating(true);
    const today = new Date().toISOString().split("T")[0];
    const rec = await safeCall(() => base44.entities.Geruestfreigabe.create({
      project_name: "",
      inspector_name: "",
      inspection_date: today,
      status: "Entwurf",
      inspection_type: "Erstprüfung",
      result: "Freigegeben",
      scaffold_class: "Lastklasse 3",
      checkpoints: DEFAULT_CHECKPOINTS,
    }), { fallback: null, message: "Speichern fehlgeschlagen." });
    setCreating(false);
    window.location.href = `/geruestfreigaben/${rec.id}`;
  }

  async function remove(id) {
    if (!confirm("Protokoll wirklich löschen?")) return;
    await safeCall(() => base44.entities.Geruestfreigabe.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const filtered = items.filter(
    (i) =>
      i.project_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.inspector_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.site_address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">Freigabeprotokolle</h1>
          </div>
          <button onClick={createNew} disabled={creating} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
            <Plus className="w-4 h-4" /> {creating ? "..." : "Neues Protokoll"}
          </button>
        </div>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Noch keine Protokolle vorhanden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="w-5 h-5 text-orange-500" />
                </div>
                <Link to={`/geruestfreigaben/${item.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{item.project_name || "Ohne Bezeichnung"}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[item.status] || "bg-gray-100 text-gray-600"}`}>{item.status}</span>
                    {item.result && <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${resultColors[item.result] || ""}`}>{item.result}</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {item.inspector_name && <span>Prüfer: {item.inspector_name}</span>}
                    {item.inspection_date && <span>{item.inspection_date}</span>}
                    {item.scaffold_type && <span>{item.scaffold_type}</span>}
                  </div>
                </Link>
                <button onClick={() => remove(item.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link to={`/geruestfreigaben/${item.id}`} className="p-2 text-gray-300">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}