import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { downloadCSV, dateStr } from "@/lib/csvExport";
import { totalWeightForMaterials } from "@/lib/geruestrechnerSession";
import { History, Trash2, Download, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export default function Berechnungshistorie() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await safeCall(() => base44.entities.GeruestrechnerResult.list("-created_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
    setItems(data);
    setLoading(false);
  }

  async function remove(id) {
    if (!confirm("Berechnung wirklich löschen?")) return;
    await safeCall(() => base44.entities.GeruestrechnerResult.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function exportCSV() {
    const rows = [];
    items.forEach((r) => {
      const mats = r.materials?.length ? r.materials : [{ name: "", qty: "", unit: "" }];
      mats.forEach((m) => {
        rows.push([r.title, r.scaffold_type, r.parameters, m.name, m.qty, m.unit, r.total_items]);
      });
    });
    downloadCSV(`Berechnungshistorie_${dateStr()}.csv`,
      ["Bezeichnung", "Geruestart", "Parameter", "Material", "Menge", "Einheit", "Gesamtteile"], rows);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">Berechnungshistorie</h1>
          </div>
          {items.length > 0 && (
            <button onClick={exportCSV} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> CSV Export
            </button>
          )}
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Noch keine Berechnungen gespeichert</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 flex items-start justify-between">
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="flex-1 text-left min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{r.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.scaffold_type}</div>
                    {r.parameters && <div className="text-xs text-gray-400 mt-1 truncate">{r.parameters}</div>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-orange-500 font-medium">{r.total_items || 0} Teile</span>
                      <span className="text-xs text-gray-400">{totalWeightForMaterials(r.materials).toFixed(0)} kg</span>
                      {r.materials?.length > 0 && (
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <ChevronDown className={`w-3 h-3 transition-transform ${expanded === r.id ? "rotate-180" : ""}`} />
                          {r.materials.length} Positionen
                        </span>
                      )}
                    </div>
                  </button>
                  <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {expanded === r.id && r.materials?.length > 0 && (
                  <div className="px-4 pb-3">
                    <table className="w-full text-xs">
                      <tbody>
                        {r.materials.map((m, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                            <td className="px-3 py-1.5 text-gray-900">{m.name}</td>
                            <td className="px-3 py-1.5 text-right font-semibold text-orange-600">{m.qty}</td>
                            <td className="px-2 py-1.5 text-gray-400 w-12">{m.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}