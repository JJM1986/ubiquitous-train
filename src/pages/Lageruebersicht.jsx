import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { PackageSearch, AlertTriangle, Search } from "lucide-react";
import LieferstatusTracker from "@/components/LieferstatusTracker";

const categoryColors = {
  "Gerüstrahmen": "bg-blue-100 text-blue-700",
  "Beläge": "bg-green-100 text-green-700",
  "Kupplungen": "bg-purple-100 text-purple-700",
  "Rohre": "bg-gray-100 text-gray-700",
  "Sicherheit": "bg-red-100 text-red-700",
  "Zubehör": "bg-yellow-100 text-yellow-700",
  "Sonstiges": "bg-gray-100 text-gray-600",
};

function StatCard({ label, value, alert }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-4 ${alert ? "border-red-200" : "border-gray-100"}`}>
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-xl font-bold mt-1 ${alert ? "text-red-600" : "text-gray-900"}`}>{value}</div>
    </div>
  );
}

export default function Lageruebersicht() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("alle");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await safeCall(() => base44.entities.Material.list(), { fallback: [], message: "Daten konnten nicht geladen werden." });
    setMaterials(data);
    setLoading(false);
  }

  // Die eigentliche Lieferbuchung erfolgt zentral in materialDelivery.js.
  // Hier wird nach erfolgreicher Buchung nur der Lagerbestand neu geladen.
  async function handleDelivered() {
    await load();
  }

  const lowStock = materials.filter((m) => (m.stock ?? 0) <= (m.min_stock ?? 0));
  const totalValue = materials.reduce((s, m) => s + (m.stock || 0) * (m.purchase_price || 0), 0);

  const filtered = materials.filter((m) => {
    const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) || m.category?.toLowerCase().includes(search.toLowerCase());
    const isLow = (m.stock ?? 0) <= (m.min_stock ?? 0);
    const matchFilter = filter === "alle" || (filter === "kritisch" && isLow) || (filter === "ok" && !isLow);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <PackageSearch className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900">Lagerübersicht</h1>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Materialien gesamt" value={materials.length} />
          <StatCard label="Mindestbestand unterschritten" value={lowStock.length} alert={lowStock.length > 0} />
          <StatCard label="Lagerwert" value={`${totalValue.toFixed(0)} €`} />
        </div>

        {lowStock.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-red-700 text-sm">Mindestbestand unterschritten</h3>
            </div>
            <div className="space-y-1">
              {lowStock.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-red-600">{m.name}</span>
                  <span className="text-red-500 font-medium">Bestand: {m.stock} / Min: {m.min_stock}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <LieferstatusTracker onDelivered={handleDelivered} />
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none">
            <option value="alle">Alle</option>
            <option value="kritisch">Kritisch</option>
            <option value="ok">OK</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium">Material</th>
                <th className="text-left px-3 py-2 font-medium">Kategorie</th>
                <th className="text-right px-3 py-2 font-medium">Bestand</th>
                <th className="text-right px-3 py-2 font-medium">Min.</th>
                <th className="text-left px-3 py-2 font-medium">Lagerort</th>
                <th className="text-center px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const isLow = (m.stock ?? 0) <= (m.min_stock ?? 0);
                return (
                  <tr key={m.id} className={isLow ? "bg-red-50/50" : "bg-white"}>
                    <td className="px-4 py-2.5 text-gray-900 font-medium">{m.name}</td>
                    <td className="px-3 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[m.category] || "bg-gray-100 text-gray-600"}`}>{m.category}</span></td>
                    <td className="px-3 py-2.5 text-right font-semibold">{m.stock} {m.unit}</td>
                    <td className="px-3 py-2.5 text-right text-gray-400">{m.min_stock}</td>
                    <td className="px-3 py-2.5 text-gray-500">{m.location || "—"}</td>
                    <td className="px-3 py-2.5 text-center">
                      {isLow
                        ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">⚠ Nachbestellen</span>
                        : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}