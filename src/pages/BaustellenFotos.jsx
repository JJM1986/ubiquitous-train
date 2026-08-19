import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, MapPin, Clock, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export default function BaustellenFotos() {
  const [fotos, setFotos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project_id: "", title: "", notes: "" });
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [gps, setGps] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("");
  const fileRef = useRef(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [f, p] = await Promise.all([
      base44.entities.BaustellenFoto.list("-created_date"),
      base44.entities.Project.list(),
    ]);
    setFotos(f);
    setProjects(p);
    setLoading(false);
  }

  function onSelectFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowForm(true);
    setGps(null);
    setGpsStatus("Standort wird ermittelt...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsStatus("Standort erfasst");
        },
        () => setGpsStatus("Standort nicht verfügbar"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsStatus("GPS nicht unterstützt");
    }
  }

  async function saveFoto() {
    if (!pendingPhoto) return;
    setUploading(true);
    const { file_url } = await safeCall(() => base44.integrations.Core.UploadFile({ file: pendingPhoto }), { fallback: null, message: "Aktion fehlgeschlagen." });
    const project = projects.find((p) => p.id === form.project_id);
    const now = new Date();
    await safeCall(() => base44.entities.BaustellenFoto.create({
      project_id: form.project_id || null,
      project_name: project?.title || "",
      title: form.title || `Foto ${now.toLocaleDateString("de-DE")}`,
      photo_url: file_url,
      latitude: gps?.lat ?? null,
      longitude: gps?.lng ?? null,
      taken_at: now.toISOString(),
      notes: form.notes,
    }), { fallback: null, message: "Speichern fehlgeschlagen." });
    setUploading(false);
    cancelForm();
    await load();
  }

  function cancelForm() {
    setShowForm(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingPhoto(null);
    setPreviewUrl(null);
    setForm({ project_id: "", title: "", notes: "" });
    setGps(null);
    setGpsStatus("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function remove(id) {
    if (!confirm("Foto wirklich löschen?")) return;
    await safeCall(() => base44.entities.BaustellenFoto.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setFotos((prev) => prev.filter((f) => f.id !== id));
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return (
      d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " " +
      d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Baustellen-Fotos</h1>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Camera className="w-4 h-4" /> Foto aufnehmen
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-1">Fotos mit GPS, Datum und Uhrzeit</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onSelectFile}
        className="hidden"
      />

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : fotos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Noch keine Fotos vorhanden</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
              >
                <div className="relative aspect-square bg-gray-100">
                  <img src={f.photo_url} alt={f.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => remove(f.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{f.title}</h3>
                  {f.project_name && (
                    <p className="text-xs text-gray-400 truncate">{f.project_name}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" /> {formatDate(f.taken_at)}
                  </div>
                  {f.latitude != null && (
                    <a
                      href={`https://www.google.com/maps?q=${f.latitude},${f.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 mt-0.5 hover:underline"
                    >
                      <MapPin className="w-3 h-3" />
                      {f.latitude.toFixed(5)}, {f.longitude.toFixed(5)}
                    </a>
                  )}
                  {f.notes && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{f.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Foto speichern</h2>
              <button onClick={cancelForm} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {previewUrl && (
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  <img src={previewUrl} alt="Vorschau" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${
                    gps ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : gpsStatus}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projekt (optional)
                </label>
                <select
                  value={form.project_id}
                  onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="">Kein Projekt</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="z. B. Fassade Nord"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="z. B. Zustand vor Aufstellung"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={cancelForm}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={saveFoto}
                disabled={uploading}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {uploading ? "Wird gespeichert..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}