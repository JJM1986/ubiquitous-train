import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { downloadCSV, dateStr } from "@/lib/csvExport";
import { ArrowLeftRight, Search, Download } from "lucide-react";

const typeColors = {
  "Zugang": "bg-green-100 text-green-700",
  "Abgang": "bg-red-100 text-red-700",
  "Ausgabe": "bg-yellow-100 text-yellow-700",
  "Rückgabe": "bg-blue-100 text-blue-700",
};

const typeSign = {
  "Zugang": "+",
  "Abgang": "−",
  "Ausgabe": "−",
  "Rückgabe": "+",
};

export default function Lagerbewegungen() {
  const [movements, setMovements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("alle");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [m, mats, projs] = await Promise.all([
      base44.entities.MaterialMovement.list("-created_date", 500),
      base44.entities.Material.list(),
      base44.entities.Project.list(),
    ]);
    setMovements(m);
    setMaterials(mats);
    setProjects(projs);
    setLoading(false);
  }

  const matMap = Object.fromEntries(materials.map((m) => [m.id, m]));
  const projMap = Object.fromEntries(projects.map((p) => [p.id, p.title]));

  const filtered = movements.filter((mv) => {
    const matName = matMap[mv.material_id]?.name || "";
    const projName = projMap[mv.project_id] || "";
    const matchSearch = matName.toLowerCase().includes(search.toLowerCase()) || projName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "alle" || mv.type === typeFilter;
    return matchSearch && matchType;
  });

  function exportCSV() {
    downloadCSV(`Lagerbewegungen_${dateStr()}.csv`,
      ["Datum", "Material", "Bewegungsart", "Menge", "Einheit", "Projekt", "Notizen"],
      filtered.map((mv) => [
        mv.date, matMap[mv.material_id]?.name || "", mv.type, mv.quantity,
        matMap[mv.material_id]?.unit || "", projMap[mv.project_id] || "", mv.notes,
      ])
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">Lagerbewegungen</h1>
          </div>
          {filtered.length > 0 && (
            <button onClick={exportCSV} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> CSV Export
            </button>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen nach Material oder Projekt..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none">
            <option value="alle">Alle Arten</option>
            {["Zugang", "Abgang", "Ausgabe", "Rückgabe"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Lagerbewegungen gefunden</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-2 font-medium">Datum</th>
                  <th className="text-left px-3 py-2 font-medium">Material</th>
                  <th className="text-left px-3 py-2 font-medium">Art</th>
                  <th className="text-right px-3 py-2 font-medium">Menge</th>
                  <th className="text-left px-3 py-2 font-medium">Projekt</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((mv) => {
                  const mat = matMap[mv.material_id];
                  return (
                    <tr key={mv.id} className="border-t border-gray-50">
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{mv.date}</td>
                      <td className="px-3 py-2.5 text-gray-900 font-medium">{mat?.name || "—"}</td>
                      <td className="px-3 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[mv.type] || "bg-gray-100 text-gray-600"}`}>{mv.type}</span></td>
                      <td className="px-3 py-2.5 text-right font-semibold text-gray-700">
                        {typeSign[mv.type] || ""}{mv.quantity} {mat?.unit || ""}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{projMap[mv.project_id] || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}