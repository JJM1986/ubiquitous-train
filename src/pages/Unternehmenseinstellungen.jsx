import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { StorageImage } from "@/components/StorageFile";
import { Settings, Save, Check, Upload, AlertTriangle, Trash2 } from "lucide-react";

const emptyForm = {
  company_name: "", address: "", zip: "", city: "",
  phone: "", email: "", website: "", vat_id: "",
  tax_number: "", logo_url: "", bank_name: "", iban: "", bic: "",
  ceo: "", trade_register: "",
};

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input value={value || ""} onFocus={(e) => e.target.select()} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
    </div>
  );
}

export default function Unternehmenseinstellungen() {
  const [data, setData] = useState(emptyForm);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const records = await safeCall(() => base44.entities.CompanySetting.list(), { fallback: [], message: "Daten konnten nicht geladen werden." });
    if (records.length > 0) {
      setData({ ...emptyForm, ...records[0] });
      setRecordId(records[0].id);
    }
    setLoading(false);
  }

  function update(field, value) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    setSaving(true);
    if (recordId) {
      await safeCall(() => base44.entities.CompanySetting.update(recordId, data), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    } else {
      const rec = await safeCall(() => base44.entities.CompanySetting.create(data), { fallback: null, message: "Speichern fehlgeschlagen." });
      setRecordId(rec.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function uploadLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await safeCall(() => base44.integrations.Core.UploadFile({ file }), { fallback: null, message: "Aktion fehlgeschlagen." });
    update("logo_url", file_url);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      const res = await safeCall(() => base44.functions.invoke("deleteAccount", {}), { fallback: null, message: "Aktion fehlgeschlagen." });
      if (res.data?.success) {
        await safeCall(() => base44.auth.logout("/"), { fallback: null, message: "Aktion fehlgeschlagen." });
      } else {
        alert(res.data?.error || "Kontolöschung fehlgeschlagen.");
        setDeleting(false);
      }
    } catch (err) {
      alert("Kontolöschung derzeit nicht verfügbar. Bitte wende dich an den Base44-Support.");
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900">Unternehmenseinstellungen</h1>
        </div>
        <p className="text-sm text-gray-400 mt-1">Logo und Adressdaten erscheinen automatisch auf Angeboten und Freigaben</p>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
              {data.logo_url
                ? <StorageImage src={data.logo_url} alt="Logo" className="w-full h-full object-contain" />
                : <span className="text-gray-300 text-xs">Kein Logo</span>}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                <Upload className="w-4 h-4" /> {uploading ? "Lädt..." : "Logo hochladen"}
              </button>
              <p className="text-xs text-gray-400 mt-1">Erscheint auf Angeboten und Freigaben</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadLogo} className="hidden" />
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <Field label="Firmenname *" value={data.company_name} onChange={(v) => update("company_name", v)} />
            <Field label="Adresse" value={data.address} onChange={(v) => update("address", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="PLZ" value={data.zip} onChange={(v) => update("zip", v)} />
              <Field label="Stadt" value={data.city} onChange={(v) => update("city", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Telefon" value={data.phone} onChange={(v) => update("phone", v)} />
              <Field label="E-Mail" value={data.email} onChange={(v) => update("email", v)} />
            </div>
            <Field label="Website" value={data.website} onChange={(v) => update("website", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="USt-IdNr." value={data.vat_id} onChange={(v) => update("vat_id", v)} />
              <Field label="Steuernummer" value={data.tax_number} onChange={(v) => update("tax_number", v)} />
            </div>
            <Field label="Geschäftsführer" value={data.ceo} onChange={(v) => update("ceo", v)} />
            <Field label="Handelsregister" value={data.trade_register} onChange={(v) => update("trade_register", v)} />
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Bankverbindung</h3>
            <Field label="Bank" value={data.bank_name} onChange={(v) => update("bank_name", v)} />
            <Field label="IBAN" value={data.iban} onChange={(v) => update("iban", v)} />
            <Field label="BIC" value={data.bic} onChange={(v) => update("bic", v)} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {saved && <span className="text-sm text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Gespeichert</span>}
            <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
              <Save className="w-4 h-4" /> {saving ? "Speichert..." : "Speichern"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 mt-6">
          <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4" /> Account löschen</h3>
          <p className="text-xs text-gray-500 mb-4">Löscht deinen Benutzer-Account unwiderruflich. Diese Aktion kann nicht rückgängig gemacht werden.</p>
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors touch-manipulation">
              <Trash2 className="w-4 h-4" /> Account löschen
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">Bist du sicher? Dein Account und alle zugehörigen Daten werden entfernt.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 touch-manipulation">Abbrechen</button>
                <button onClick={deleteAccount} disabled={deleting} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors touch-manipulation">{deleting ? "Löscht..." : "Endgültig löschen"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}