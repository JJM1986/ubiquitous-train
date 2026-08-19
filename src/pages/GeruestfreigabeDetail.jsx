import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Printer, Save, Check } from "lucide-react";
import BackButton from "@/components/BackButton";
import { toast } from "sonner";

function Field({ label, value, onChange, type = "text", full = false }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 print:border-gray-400 print:rounded-none"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 print:border-gray-400 print:rounded-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export default function GeruestfreigabeDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    const rec = await safeCall(() => base44.entities.Geruestfreigabe.get(id), { fallback: null, message: "Daten konnten nicht geladen werden." });
    setData(rec);
    setLoading(false);
  }

  function update(field, value) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function updateCheckpoint(idx, field, value) {
    setData((prev) => {
      const cps = [...(prev.checkpoints || [])];
      cps[idx] = { ...cps[idx], [field]: value };
      return { ...prev, checkpoints: cps };
    });
  }

  async function save() {
    setSaving(true);
    await safeCall(() => base44.entities.Geruestfreigabe.update(id, data), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function printDoc() {
    await save();
    setTimeout(() => window.print(), 200);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 print:hidden flex items-center justify-between sticky top-0 z-10">
        <BackButton to="/geruestfreigaben" />
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Gespeichert
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" /> {saving ? "..." : "Speichern"}
          </button>
          <button
            onClick={printDoc}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" /> Drucken
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-3xl mx-auto p-6 print:p-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-0 print:rounded-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-orange-500 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">GM</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">GerüstMeister</div>
                <div className="text-xs text-gray-400">Gerüstbauunternehmen</div>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-gray-900">Gerüstfreigabe</h1>
              <p className="text-xs text-gray-400">DGUV Vorschrift 38 / TRBS 2121</p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Field label="Projekt / Baustelle *" value={data.project_name} onChange={(v) => update("project_name", v)} />
            <Field label="Kunde" value={data.customer_name} onChange={(v) => update("customer_name", v)} />
            <Field label="Baustellenadresse" value={data.site_address} onChange={(v) => update("site_address", v)} full />
            <Field label="Gerüstart" value={data.scaffold_type} onChange={(v) => update("scaffold_type", v)} />
            <SelectField
              label="Lastklasse"
              value={data.scaffold_class}
              onChange={(v) => update("scaffold_class", v)}
              options={["Lastklasse 1", "Lastklasse 2", "Lastklasse 3", "Lastklasse 4", "Lastklasse 5", "Lastklasse 6"]}
            />
            <Field label="Gerüsthöhe (m)" type="number" value={data.scaffold_height} onChange={(v) => update("scaffold_height", v)} />
            <Field label="Gerüstfläche (m²)" type="number" value={data.scaffold_area} onChange={(v) => update("scaffold_area", v)} />
            <SelectField
              label="Prüfart"
              value={data.inspection_type}
              onChange={(v) => update("inspection_type", v)}
              options={["Erstprüfung", "Wiederholungsprüfung", "Außerordentliche Prüfung"]}
            />
            <Field label="Prüfer *" value={data.inspector_name} onChange={(v) => update("inspector_name", v)} />
            <Field label="Prüfdatum *" type="date" value={data.inspection_date} onChange={(v) => update("inspection_date", v)} />
          </div>

          {/* Checkpoints */}
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Prüfpunkte</h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden print:border-gray-400">
              {(data.checkpoints || []).map((cp, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"} print:bg-white`}
                >
                  <button
                    onClick={() => updateCheckpoint(idx, "passed", !cp.passed)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      cp.passed ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-orange-400"
                    }`}
                  >
                    {cp.passed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className="flex-1 text-sm text-gray-900">{cp.item}</span>
                  <input
                    value={cp.notes || ""}
                    onChange={(e) => updateCheckpoint(idx, "notes", e.target.value)}
                    placeholder="Anmerkung..."
                    className="w-32 print:w-44 text-xs px-2 py-1 border border-gray-200 rounded print:border-gray-400 outline-none focus:ring-1 focus:ring-orange-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Prüfergebnis</h2>
            <div className="flex gap-2">
              {["Freigegeben", "Freigegeben mit Auflagen", "Nicht freigegeben"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => update("result", opt)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                    data.result === opt
                      ? opt === "Freigegeben"
                        ? "bg-green-50 border-green-500 text-green-700"
                        : opt === "Freigegeben mit Auflagen"
                        ? "bg-yellow-50 border-yellow-500 text-yellow-700"
                        : "bg-red-50 border-red-500 text-red-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Auflagen / Bedingungen</label>
            <textarea
              value={data.conditions || ""}
              onChange={(e) => update("conditions", e.target.value)}
              rows={2}
              placeholder="z. B. Belagbereich 3 ist temporär gesperrt..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none print:border-gray-400 print:rounded-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
            <textarea
              value={data.notes || ""}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none print:border-gray-400 print:rounded-none"
            />
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200 print:border-gray-400">
            <div>
              <div className="border-b border-gray-400 h-12 mb-1"></div>
              <p className="text-xs text-gray-500">Prüfer (Name, Unterschrift)</p>
              <p className="text-sm text-gray-900 mt-1">{data.inspector_name}</p>
            </div>
            <div>
              <div className="border-b border-gray-400 h-12 mb-1"></div>
              <p className="text-xs text-gray-500">Gerüstbauunternehmen (Datum, Stempel)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}