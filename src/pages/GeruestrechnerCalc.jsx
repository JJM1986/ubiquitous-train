import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronsRight, Package, Ruler, Plus, Layers } from "lucide-react";
import { addToSession } from "@/lib/geruestrechnerSession";
import NumericInput from "@/components/NumericInput";
import { SCAFFOLD_TYPES } from "./Geruestrechner";
import { HERSTELLER_SYSTEME, resolvePart } from "@/lib/herstellerSysteme";

// Berechnungen geben jetzt Rollen (roleKey) aus, die über das gewählte Herstellersystem aufgelöst werden.
const CONFIGS = {
  fassadengeruest: {
    title: "Fassadengerüst",
    inputs: [
      { key: "length", label: "Fassadenlänge", unit: "m", default: 12, step: 0.5 },
      { key: "height", label: "Gerüsthöhe", unit: "m", default: 8, step: 0.5 },
      { key: "platforms", label: "Belagebenen", unit: "", default: 2, step: 1 },
      { key: "bayLength", label: "Feldlänge", unit: "m", default: 3, step: 0.5, advanced: true },
    ],
    calculate: ({ length, height, platforms, bayLength }) => {
      const bays = Math.max(1, Math.ceil(length / bayLength));
      const levels = Math.max(1, Math.ceil(height / 2));
      const fp = bays + 1;
      return [
        { role: "rahmen_200", qty: fp * levels },
        { role: "verband", qty: bays * levels },
        { role: "belag", qty: bays * platforms },
        { role: "spindel", qty: fp },
        { role: "unterlegplatte", qty: fp },
        { role: "gelaender", qty: fp * platforms },
        { role: "fanggitter", qty: bays * levels },
      ];
    },
  },
  geruesttreppe: {
    title: "Gerüsttreppe",
    inputs: [
      { key: "height", label: "Gerüsthöhe", unit: "m", default: 6, step: 0.5 },
      { key: "runs", label: "Treppenläufe", unit: "", default: 2, step: 1 },
      { key: "bayLength", label: "Feldlänge", unit: "m", default: 3, step: 0.5, advanced: true },
    ],
    calculate: ({ height, runs, bayLength }) => {
      const levels = Math.max(1, Math.ceil(height / 2));
      const steps = runs * 10;
      return [
        { role: "rahmen_200", qty: 4 * levels },
        { role: "treppe_wange", qty: runs * 2 },
        { role: "treppe_stufe", qty: steps },
        { role: "podest", qty: runs },
        { role: "gelaender", qty: levels * 2 },
        { role: "verband", qty: levels * 2 },
      ];
    },
  },
  bautreppenturm: {
    title: "Bautreppenturm",
    inputs: [
      { key: "height", label: "Turmhöhe", unit: "m", default: 6, step: 0.5 },
      { key: "width", label: "Turmbreite", unit: "m", default: 1.5, step: 0.25 },
    ],
    calculate: ({ height, width }) => {
      const levels = Math.max(1, Math.ceil(height / 2));
      return [
        { role: "rahmen_turm", qty: 4 * levels },
        { role: "podest", qty: levels },
        { role: "treppe_lauf", qty: levels },
        { role: "treppe_stufe", qty: levels * 10 },
        { role: "gelaender", qty: levels * 4 },
        { role: "verband", qty: levels * 2 },
        { role: "spindel", qty: 4 },
      ];
    },
  },
  alutreppenturm: {
    title: "Alutreppenturm",
    inputs: [
      { key: "height", label: "Turmhöhe", unit: "m", default: 4, step: 0.5 },
      { key: "width", label: "Turmbreite", unit: "m", default: 1.4, step: 0.1 },
    ],
    calculate: ({ height, width }) => {
      const levels = Math.max(1, Math.ceil(height / 2));
      return [
        { role: "rahmen_alu", qty: 4 * levels },
        { role: "podest_alu", qty: levels },
        { role: "treppe_lauf_alu", qty: levels },
        { role: "treppe_stufe", qty: levels * 10 },
        { role: "gelaender_alu", qty: levels * 4 },
        { role: "verband_alu", qty: levels * 2 },
        { role: "spindel", qty: 4 },
      ];
    },
  },
  geruestschutz: {
    title: "Gerüstschutz",
    inputs: [
      { key: "length", label: "Gerüstlänge", unit: "m", default: 15, step: 0.5 },
      { key: "height", label: "Gerüsthöhe", unit: "m", default: 10, step: 0.5 },
    ],
    calculate: ({ length, height }) => {
      const bays = Math.max(1, Math.ceil(length / 3));
      const levels = Math.max(1, Math.ceil(height / 2));
      return [
        { role: "schutznetz", qty: Math.ceil(length * height) },
        { role: "fanggitter", qty: bays * levels },
        { role: "konsolhalter", qty: bays },
        { role: "spanngurt", qty: Math.ceil(length / 3) },
        { role: "kabelbinder", qty: bays * levels * 4 },
      ];
    },
  },
  super_rs: {
    title: "Super RS",
    inputs: [
      { key: "area", label: "Fläche", unit: "m²", default: 100, step: 5 },
      { key: "height", label: "Gerüsthöhe", unit: "m", default: 6, step: 0.5 },
      { key: "loadClass", label: "Lastklasse", unit: "", default: 3, step: 1, advanced: true },
    ],
    calculate: ({ area, height, loadClass }) => {
      const levels = Math.max(1, Math.ceil(height / 2));
      const bays = Math.max(1, Math.ceil(area / (3 * 3)));
      const fp = bays + 1;
      return [
        { role: "rahmen_rs", qty: fp * levels },
        { role: "laengsverbund", qty: fp * levels * 2 },
        { role: "querriegel", qty: bays * levels },
        { role: "belag_m2", qty: Math.ceil(area) },
        { role: "spindel", qty: fp },
        { role: "unterlegplatte", qty: fp },
      ];
    },
  },
};

export default function GeruestrechnerCalc() {
  const { type } = useParams();
  const config = CONFIGS[type];
  const meta = SCAFFOLD_TYPES.find((t) => t.id === type);

  const [systemId, setSystemId] = useState("layher_allround");
  const [values, setValues] = useState(() => {
    if (!config) return {};
    const init = {};
    config.inputs.forEach((inp) => (init[inp.key] = inp.default));
    return init;
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!config) return [];
    const parsed = {};
    config.inputs.forEach((inp) => (parsed[inp.key] = Math.max(0, parseFloat(values[inp.key]) || 0)));
    const raw = config.calculate(parsed);
    return raw.map((r) => {
      const part = resolvePart(systemId, r.role);
      return { name: part.name, qty: r.qty, unit: part.unit, role: r.role, dim: part.dim, weight: part.weight };
    });
  }, [config, values, systemId]);

  const totalItems = results.reduce((sum, r) => sum + r.qty, 0);
  const totalWeight = results.reduce((sum, r) => sum + r.qty * r.weight, 0);

  function addToCalculation() {
    const sysLabel = HERSTELLER_SYSTEME.find((s) => s.id === systemId)?.label || systemId;
    const paramStr = config.inputs
      .map((inp) => `${inp.label}: ${values[inp.key]}${inp.unit ? " " + inp.unit : ""}`)
      .join(", ");
    addToSession({
      scaffold_type: `${config.title} · ${sysLabel}`,
      parameters: paramStr,
      system_id: systemId,
      system_label: sysLabel,
      materials: results,
      total_weight: totalWeight,
    });
    navigate("/geruestrechner");
  }

  if (!config) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Unbekannte Gerüstart.</p>
        <Link to="/geruestrechner" className="text-orange-500 font-medium">Zurück zum Gerüstrechner</Link>
      </div>
    );
  }

  const basicInputs = config.inputs.filter((i) => !i.advanced);
  const advInputs = config.inputs.filter((i) => i.advanced);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to="/geruestrechner" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex items-center gap-2">
            <ChevronsRight className="w-4 h-4 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-orange-500" />
            <h2 className="font-semibold text-gray-900">Hersteller-System</h2>
          </div>
          <select
            value={systemId}
            onChange={(e) => setSystemId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 mb-1"
          >
            {HERSTELLER_SYSTEME.map((s) => (
              <option key={s.id} value={s.id}>{s.label} — {s.typ}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mb-4">{HERSTELLER_SYSTEME.find((s) => s.id === systemId)?.beschreibung}</p>
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="w-4 h-4 text-orange-500" />
            <h2 className="font-semibold text-gray-900">Maße & Parameter</h2>
          </div>
          <div className="space-y-4">
            {basicInputs.map((inp) => (
              <div key={inp.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {inp.label}{inp.unit && ` (${inp.unit})`}
                </label>
                <NumericInput
                  value={values[inp.key]}
                  onChange={(val) => setValues((v) => ({ ...v, [inp.key]: val }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            ))}
            {advInputs.length > 0 && (
              <>
                <button
                  onClick={() => setShowAdvanced((s) => !s)}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  {showAdvanced ? "− Erweitert ausblenden" : "+ Erweiterte Parameter"}
                </button>
                {showAdvanced && (
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    {advInputs.map((inp) => (
                      <div key={inp.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {inp.label}{inp.unit && ` (${inp.unit})`}
                        </label>
                        <NumericInput
                          value={values[inp.key]}
                          onChange={(val) => setValues((v) => ({ ...v, [inp.key]: val }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900">Materialbedarf</h2>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{totalItems} Teile · {totalWeight.toFixed(0)} kg</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-2 font-medium">Bauteil</th>
                  <th className="text-left px-3 py-2 font-medium">Maß</th>
                  <th className="text-right px-4 py-2 font-medium">Menge</th>
                  <th className="text-left px-3 py-2 font-medium w-16">Einh.</th>
                  <th className="text-right px-4 py-2 font-medium">Gewicht</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-2.5 text-gray-900">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-[10px] text-gray-400">{HERSTELLER_SYSTEME.find((s) => s.id === systemId)?.hersteller}</div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{r.dim}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-orange-600">{r.qty}</td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{r.unit}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500 text-xs">{(r.qty * r.weight).toFixed(1)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            ⚠ Schätzwerte für die Grobplanung. Verbindliche Materiallisten sind projektspezifisch zu berechnen.
          </p>

          {/* Add to combined calculation */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={addToCalculation}
              className="w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Zur Berechnung hinzufügen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}