import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Trash2, MapPin, Clock, Plus, X } from "lucide-react";
import { toast } from "sonner";

function fmtDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE") + " · " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export default function ProjectPhotoGallery({ projectId, projectName }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [geo, setGeo] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { loadPhotos(); }, [projectId]);

  async function loadPhotos() {
    setLoading(true);
    const data = await safeCall(() => base44.entities.BaustellenFoto.filter({ project_id: projectId }, "-created_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
    setPhotos(data);
    setLoading(false);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview({ file, url: URL.createObjectURL(file) });
    setGeo(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setGeo(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }

  async function uploadPhoto() {
    if (!preview) return;
    setUploading(true);
    const { file_url } = await safeCall(() => base44.integrations.Core.UploadFile({ file: preview.file }), { fallback: null, message: "Aktion fehlgeschlagen." });
    const now = new Date().toISOString();
    await safeCall(() => base44.entities.BaustellenFoto.create({
      project_id: projectId,
      project_name: projectName,
      title: title || `Foto ${new Date().toLocaleDateString("de-DE")}`,
      photo_url: file_url,
      latitude: geo?.lat ?? null,
      longitude: geo?.lng ?? null,
      taken_at: now,
      notes: notes,
    }), { fallback: null, message: "Speichern fehlgeschlagen." });
    setUploading(false);
    cancelUpload();
    await loadPhotos();
  }

  function cancelUpload() {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setTitle("");
    setNotes("");
    setGeo(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function deletePhoto(id) {
    if (!confirm("Foto wirklich löschen?")) return;
    await safeCall(() => base44.entities.BaustellenFoto.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Baustellen-Fotos</h2>
          {photos.length > 0 && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{photos.length}</span>}
        </div>
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Foto
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
      ) : photos.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          <Camera className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Noch keine Fotos vorhanden</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gray-100">
              <img src={photo.photo_url} alt={photo.title} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2">
                <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <Clock className="w-3 h-3 flex-shrink-0" /> {fmtDateTime(photo.taken_at)}
                </div>
                {photo.latitude != null && photo.longitude != null && (
                  <div className="flex items-center gap-1 text-white/80 text-xs">
                    <MapPin className="w-3 h-3 flex-shrink-0" /> {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                  </div>
                )}
              </div>
              <button onClick={() => deletePhoto(photo.id)} className="absolute top-2 right-2 p-1.5 bg-red-500/90 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Foto hochladen</h3>
              <button onClick={cancelUpload} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <img src={preview.url} alt="Vorschau" className="w-full rounded-xl max-h-64 object-cover" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Fassade Nordseite" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anmerkungen..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock className="w-3 h-3" /> {fmtDateTime(new Date().toISOString())}
                </div>
                {geo ? (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <MapPin className="w-3 h-3" /> Standort erfasst: {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <MapPin className="w-3 h-3" /> Standort wird erfasst…
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={cancelUpload} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Abbrechen</button>
              <button onClick={uploadPhoto} disabled={uploading} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                {uploading ? "Lädt…" : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}