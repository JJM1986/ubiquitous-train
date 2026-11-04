import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  ChevronsRight, Calculator, Save, Trash2, Clock, ChevronDown, Plus, Package, X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  getSession, removeFromSession, clearSession, aggregateMaterials, totalWeightForMaterials, getWeight,
} from "@/lib/geruestrechnerSession";

export const SCAFFOLD_TYPES = [
  { id: "fassadengeruest", label: "Fassadengerüst", desc: "Fassaden- und Wandgerüst" },
  { id: "geruesttreppe", label: "Gerüsttreppe", desc: "Treppenlauf im Gerüst" },
  { id: "bautreppenturm", label: "Bautreppenturm", desc: "Standalone Treppenturm" },
  { id: "alutreppenturm", label: "Alutreppenturm", desc: "Leichter Aluminium-Turm" },
  { id: "geruestschutz", label: "Gerüstschutz", desc: "Schutznetz & Bekleidung" },
  { id: "super_rs", label: "Super RS", desc: "Schwerlastgerüst" },
];

export default function Geruestrechner() {
  const [sessionItems, setSessionItems] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSessionItems(getSession());
    loadSaved();
  }, []);

  async function loadSaved() {
    setLoadingSaved(true);
    const data = await safeCall(() => base44.entities.GeruestrechnerResult.list("-created_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
    setSaved(data);
    setLoadingSaved(false);
  }

  function removeSessionItem(id) {
    setSessionItems(removeFromSession(id));
  }

  function clearAll() {
    if (!confirm("Aktuelle Berechnung wirklich leeren?")) return;
    clearSession();
    setSessionItems([]);
  }

  async function saveCombined() {
    if (!saveName.trim() || sessionItems.length === 0) return;
    setSaving(true);
    const materials = aggregateMaterials(sessionItems);
    const total = materials.reduce((s, m) => s + m.qty, 0);
    const paramStr = sessionItems.map((i) => `${i.scaffold_type} (${i.parameters})`).join(" + ");
    const ok = await safeCall(() => base44.entities.GeruestrechnerResult.create({
      scaffold_type: sessionItems.map((i) => i.scaffold_type).join(" + "),
      title: saveName.trim(),
      parameters: paramStr,
      materials,
      total_items: total,
    }), { fallback: null, message: "Berechnung konnte nicht gespeichert werden." });
    setSaving(false);
    if (ok !== null) {
      toast.success("Berechnung gespeichert.");
      setSaveName("");
      clearSession();
      setSessionItems([]);
      await loadSaved();
    }
  }

  async function removeSaved(id) {
    if (!confirm("Berechnung wirklich löschen?")) return;
    await safeCall(() => base44.entities.GeruestrechnerResult.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setSaved((prev) => prev.filter((s) => s.id !== id));
  }

  const combinedMaterials = aggregateMaterials(sessionItems);
  const combinedTotal = combinedMaterials.reduce((s, m) => s + m.qty, 0);
  const combinedWeight = sessionItems.reduce((s, item) => s + totalWeightForMaterials(item.materials || []), 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* Menu */}
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-7 h-7 text-orange-500" />
          <h1 className="text-2xl font-bold text-slate-500">Gerüstrechner</h1>
        </div>
        <p className="text-sm text-gray-400 mb-8">Wählen Sie eine Gerüstart und fügen Sie diese zur Berechnung hinzu</p>

        <div className="border-t border-gray-100">
          {SCAFFOLD_TYPES.map((type) => (
            <Link
              to={`/geruestrechner/${type.id}`}
              key={type.id}
              className="flex items-center gap-3 py-4 border-b border-gray-100 hover:bg-orange-50 transition-colors group"
            >
              <ChevronsRight className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-gray-900 font-medium block">{type.label}</span>
                <span className="text-xs text-gray-400">{type.desc}</span>
              </div>
              <ChevronsRight className="w-4 h-4 text-gray-200 group-hover:text-orange-300" />
            </Link>
          ))}
        </div>

        {/* Current combined calculation */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900">Aktuelle Berechnung</h2>
              {sessionItems.length > 0 && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                  {sessionItems.length} Gerüste
                </span>
              )}
            </div>
            {sessionItems.length > 0 && (
              <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 font-medium">
                Leeren
              </button>
            )}
          </div>

          {sessionItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
              <Plus className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                Noch keine Positionen.<br />
                Wählen Sie oben eine Gerüstart und fügen Sie diese hinzu.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Session items */}
              {sessionItems.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900 text-sm">{item.scaffold_type}</span>
                      <div className="text-xs text-gray-400 mt-0.5">{item.parameters}</div>
                      <div className="text-xs text-orange-500 mt-0.5 font-medium">{totalWeightForMaterials(item.materials).toFixed(0)} kg</div>
                    </div>
                    <button
                      onClick={() => removeSessionItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.materials.map((m, i) => (
                      <span
                        key={i}
                        className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600 border border-gray-100"
                        title={m.dim ? `Maß: ${m.dim}` : ""}
                      >
                        {m.name}: <span className="font-medium text-orange-600">{m.qty}</span> {m.unit}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Combined materials table */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Kombinierter Materialbedarf — {combinedTotal} Teile · {combinedWeight.toFixed(0)} kg gesamt
                </h3>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500">
                        <th className="text-left px-3 py-2 font-medium">Material</th>
                        <th className="text-left px-2 py-2 font-medium">Maß</th>
                        <th className="text-right px-3 py-2 font-medium">Menge</th>
                        <th className="text-left px-2 py-2 font-medium w-12">Einh.</th>
                        <th className="text-right px-3 py-2 font-medium">Gewicht</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedMaterials.map((m, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="px-3 py-2 text-gray-900">{m.name}</td>
                          <td className="px-2 py-2 text-gray-400 text-xs">{m.dim || "—"}</td>
                          <td className="px-3 py-2 text-right font-semibold text-orange-600">{m.qty}</td>
                          <td className="px-2 py-2 text-gray-400">{m.unit}</td>
                          <td className="px-3 py-2 text-right text-gray-500">{(m.qty * (m.weight ?? getWeight(m.name))).toFixed(1)} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Save combined */}
                <div className="flex gap-2 mt-3">
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Bezeichnung (z. B. Projekt Müller)"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <button
                    onClick={saveCombined}
                    disabled={saving || !saveName.trim()}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    <Save className="w-4 h-4" /> {saving ? "..." : "Speichern"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Saved calculations from DB */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Save className="w-4 h-4 text-orange-500" />
            <h2 className="font-semibold text-gray-900">Gespeicherte Berechnungen</h2>
          </div>
          {loadingSaved ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          ) : saved.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Noch keine Berechnungen gespeichert</p>
            </div>
          ) : (
            <div className="space-y-2">
              {saved.map((s) => (
                <div key={s.id} className="bg-gray-50 rounded-xl overflow-hidden">
                  <div className="p-4 flex items-start justify-between">
                    <button
                      onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="font-medium text-gray-900 text-sm truncate">{s.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.scaffold_type}</div>
                      {s.parameters && (
                        <div className="text-xs text-gray-400 mt-1 truncate">{s.parameters}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-orange-500 font-medium">
                          {s.total_items || 0} Teile
                        </span>
                        {s.materials?.length > 0 && (
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${expanded === s.id ? "rotate-180" : ""}`}
                            />
                            {s.materials.length} Positionen
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => removeSaved(s.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {expanded === s.id && s.materials?.length > 0 && (
                    <div className="px-4 pb-3">
                      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                        <table className="w-full text-xs">
                          <tbody>
                            {s.materials.map((m, i) => (
                              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                                <td className="px-3 py-1.5 text-gray-900">{m.name}</td>
                                <td className="px-3 py-1.5 text-right font-semibold text-orange-600">
                                  {m.qty}
                                </td>
                                <td className="px-2 py-1.5 text-gray-400 w-12">{m.unit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}