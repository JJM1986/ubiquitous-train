import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ScanLine, Camera, X, Plus, Minus, MapPin, Check, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export default function BaustellenScan() {
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scanner state
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [barcode, setBarcode] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectRef = useRef(null);

  // Form state
  const [materialName, setMaterialName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [locationType, setLocationType] = useState("custom");
  const [projectId, setProjectId] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [gps, setGps] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Session list
  const [sessionItems, setSessionItems] = useState([]);

  const hasBarcodeDetector = typeof window !== "undefined" && "BarcodeDetector" in window;

  useEffect(() => { load(); }, []);

  async function load() {
    const [m, p, s] = await Promise.all([
      base44.entities.Material.list(),
      base44.entities.Project.list(),
      base44.entities.Standortbestand.list("-created_date", 50),
    ]);
    setMaterials(m);
    setProjects(p);
    setSessionItems(s);
    setLoading(false);
  }

  const stopScan = useCallback(() => {
    setScanning(false);
    if (detectRef.current) cancelAnimationFrame(detectRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const detectLoop = useCallback(async () => {
    if (!videoRef.current || !window.BarcodeDetector) return;
    try {
      const detector = new window.BarcodeDetector({
        formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8", "upc_a"],
      });
      const codes = await detector.detect(videoRef.current);
      if (codes.length > 0) {
        setBarcode(codes[0].rawValue);
        stopScan();
        return;
      }
    } catch (e) {
      // ignore frame errors
    }
    detectRef.current = requestAnimationFrame(detectLoop);
  }, [stopScan]);

  async function startScan() {
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      if (hasBarcodeDetector) detectLoop();
    } catch (err) {
      setScanError("Kamerazugriff nicht möglich. Bitte manuell eingeben.");
      setScanning(false);
    }
  }

  useEffect(() => () => stopScan(), [stopScan]);

  function captureGps() {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function save() {
    const loc = locationType === "project"
      ? projects.find((p) => p.id === projectId)?.title || ""
      : customLocation;
    if (!materialName || !loc || quantity < 1) return;
    setSaving(true);
    const record = {
      material_name: materialName,
      material_id: materials.find((m) => m.name === materialName)?.id || "",
      quantity,
      unit: materials.find((m) => m.name === materialName)?.unit || "Stk",
      location: loc,
      project_id: locationType === "project" ? projectId : "",
      barcode,
      scan_date: new Date().toISOString(),
      latitude: gps?.lat || null,
      longitude: gps?.lng || null,
    };
    await safeCall(() => base44.entities.Standortbestand.create(record), { fallback: null, message: "Speichern fehlgeschlagen." });
    const fresh = await safeCall(() => base44.entities.Standortbestand.list("-created_date", 50), { fallback: [], message: "Daten konnten nicht geladen werden." });
    setSessionItems(fresh);
    // Reset form, keep location for fast repeat
    setMaterialName("");
    setBarcode("");
    setQuantity(1);
    setSaving(false);
  }

  async function deleteItem(id) {
    await safeCall(() => base44.entities.Standortbestand.delete(id), { fallback: null, message: "Löschen fehlgeschlagen." });
    setSessionItems((prev) => prev.filter((s) => s.id !== id));
  }

  const locationValue = locationType === "project"
    ? projects.find((p) => p.id === projectId)?.title
    : customLocation;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <ScanLine className="w-5 h-5 text-orange-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Baustellen-Scan</h1>
            <p className="text-sm text-gray-400">Materialbestände vor Ort erfassen — mit Barcode, GPS &amp; Standort</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
        {/* Scanner */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-orange-500" /> Barcode scannen
          </h2>

          {scanning ? (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-1/2 border-2 border-orange-400 rounded-xl" />
              </div>
              <button onClick={stopScan} className="absolute top-3 right-3 p-2 bg-black/60 rounded-lg text-white">
                <X className="w-5 h-5" />
              </button>
              {!hasBarcodeDetector && (
                <div className="absolute bottom-3 left-3 right-3 bg-black/70 text-white text-xs px-3 py-2 rounded-lg">
                  automatische Erkennung nicht verfügbar — Foto aufnehmen &amp; Code abtippen
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={startScan}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                <Camera className="w-5 h-5" /> Kamera-Scanner starten
              </button>
              {scanError && <p className="text-xs text-red-500">{scanError}</p>}
              <div className="flex gap-2">
                <input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                  placeholder="Barcode manuell eingeben oder scannen…"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <p className="text-xs text-gray-400">Tipp: Externe Barcode-Scanner werden als Tastatur erkannt — einfach ins Feld scannen.</p>
            </div>
          )}
        </div>

        {/* Material & Menge */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Material</label>
            <input
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              list="material-list"
              placeholder="Material auswählen oder eingeben…"
              className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
            />
            <datalist id="material-list">
              {materials.map((m) => <option key={m.id} value={m.name} />)}
            </datalist>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Menge (abgestapelt)</label>
            <div className="flex items-center gap-3 mt-1">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center px-3 py-2.5 border border-gray-200 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button onClick={() => setQuantity((q) => q + 1)} className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Standort */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm">Standort</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setLocationType("project")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${locationType === "project" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Projekt
            </button>
            <button
              onClick={() => setLocationType("custom")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${locationType === "custom" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Freier Standort
            </button>
          </div>
          {locationType === "project" ? (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">Projekt wählen…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          ) : (
            <input
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="z. B. Lagerhof Nord, Baustelle Müller…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
            />
          )}

          <button onClick={captureGps} className="flex items-center gap-2 text-sm text-orange-500 font-medium hover:text-orange-600">
            <MapPin className="w-4 h-4" />
            {gpsLoading ? "GPS wird ermittelt…" : gps ? `GPS erfasst: ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : "GPS-Standort erfassen"}
          </button>
        </div>

        {/* Save */}
        <button
          onClick={save}
          disabled={saving || !materialName || !locationValue || quantity < 1}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl text-sm font-medium disabled:opacity-40 transition-colors"
        >
          <Check className="w-5 h-5" /> {saving ? "Speichern…" : "Bestand speichern"}
        </button>

        {/* Session list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" /> Zuletzt erfasste Bestände
            </h2>
            <span className="text-xs text-gray-400">{sessionItems.length}</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-6"><div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
          ) : sessionItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Noch keine Bestände erfasst</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sessionItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5 px-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.material_name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.location}
                      {item.barcode && <span className="ml-1">· {item.barcode}</span>}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-orange-600 whitespace-nowrap">{item.quantity} {item.unit || "Stk"}</span>
                  <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}