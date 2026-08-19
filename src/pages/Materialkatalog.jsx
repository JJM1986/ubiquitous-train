import React, { useState, useMemo } from "react";
import { WEIGHTS_PER_UNIT } from "@/lib/geruestrechnerSession";
import { HERSTELLER_SYSTEME, PART_ROLES, PART_MAPPINGS, resolvePart, catalogForSystem } from "@/lib/herstellerSysteme";
import { BookOpen, Search } from "lucide-react";

const categoryColors = {
  "Gerüstrahmen": "bg-blue-100 text-blue-700",
  "Verbände": "bg-purple-100 text-purple-700",
  "Beläge": "bg-green-100 text-green-700",
  "Treppen": "bg-orange-100 text-orange-700",
  "Gerüstschutz": "bg-red-100 text-red-700",
  "Fundament": "bg-gray-100 text-gray-700",
};

const materialLabel = {
  layher_allround: "Stahl (verzinkt)",
  layher_blitz: "Stahl (verzinkt)",
  mj_geruest: "Stahl (verzinkt)",
  plettac_assco: "Stahl (verzinkt)",
  wiederkehr: "Stahl (verzinkt)",
  doka_staxo: "Stahl (verzinkt)",
};

function systemHasAlu(id) {
  return true;
}

export default function Materialkatalog() {
  const [search, setSearch] = useState("");
  const [systemId, setSystemId] = useState("layher_allround");

  const items = useMemo(() => {
    const sysParts = catalogForSystem(systemId).map((p) => ({
      ...p,
      systemId,
      material: p.role.includes("alu") ? "Aluminium" : materialLabel[systemId],
      weight: p.weight,
    }));
    return sysParts;
  }, [systemId]);

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.kat.toLowerCase().includes(search.toLowerCase()) ||
      i.material.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.kat]) acc[item.kat] = [];
    acc[item.kat].push(item);
    return acc;
  }, {});

  const currentSystem = HERSTELLER_SYSTEME.find((s) => s.id === systemId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-orange-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Materialkatalog</h1>
            <p className="text-sm text-gray-400">Herstellerspezifische Bezeichnungen & Maße — Layher, MJ, Plettac, Wiederkehr, Doka</p>
          </div>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen nach Bauteil, Kategorie oder Material..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <select
            value={systemId}
            onChange={(e) => setSystemId(e.target.value)}
            className="px-3 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300"
          >
            {HERSTELLER_SYSTEME.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        {currentSystem && (
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{currentSystem.label}</span> · {currentSystem.typ} · {currentSystem.beschreibung}
          </div>
        )}
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">{cat}</h3>
              <span className="text-xs text-gray-400">{list.length} Bauteile</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-gray-50">
                  <th className="text-left px-5 py-2 font-medium">Bezeichnung ({currentSystem?.hersteller})</th>
                  <th className="text-left px-3 py-2 font-medium">Maß</th>
                  <th className="text-left px-3 py-2 font-medium">Rolle</th>
                  <th className="text-left px-3 py-2 font-medium">Material</th>
                  <th className="text-right px-3 py-2 font-medium">Gewicht</th>
                  <th className="text-left px-4 py-2 font-medium w-16">Einh.</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.role} className="border-t border-gray-50">
                    <td className="px-5 py-2.5 text-gray-900 font-medium">{item.name}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{item.dim}</td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{PART_ROLES[item.role]?.rolle || "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[cat] || "bg-gray-100 text-gray-600"}`}>{item.material}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-orange-600">{item.weight} kg</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Bauteile gefunden</p>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 pt-2">
          {HERSTELLER_SYSTEME.length} Herstellersysteme · {Object.keys(PART_ROLES).length} Bauteilrollen — systemübergreifend kombinierbar im Gerüstrechner
        </div>
      </div>
    </div>
  );
}