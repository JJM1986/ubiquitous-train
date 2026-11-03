import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Map as MapIcon, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

const statusColors = {
  "Anfrage": "#9ca3af",
  "Angebot": "#3b82f6",
  "Beauftragt": "#eab308",
  "In Arbeit": "#f97316",
  "Abgeschlossen": "#22c55e",
  "Storniert": "#ef4444",
};

const statuses = ["all", "Anfrage", "Angebot", "Beauftragt", "In Arbeit", "Abgeschlossen", "Storniert"];

export default function ProjektKarte() {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [projs, custs] = await Promise.all([
      base44.entities.Project.list(),
      base44.entities.Customer.list(),
    ]);
    setProjects(projs);
    setCustomers(custs);
    setLoading(false);
    geocodeMissing(projs);
  }

  async function geocodeMissing(projs) {
    const needGeo = projs.filter((p) => p.address && (!p.latitude || !p.longitude));
    if (needGeo.length === 0) return;

    setGeocoding(true);
    setProgress({ done: 0, total: needGeo.length });

    for (let i = 0; i < needGeo.length; i++) {
      const p = needGeo[i];
      const query = [p.address, p.city, "Deutschland"].filter(Boolean).join(", ");
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          await safeCall(() => base44.entities.Project.update(p.id, { latitude: lat, longitude: lon }), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
          setProjects((prev) => prev.map((pr) => (pr.id === p.id ? { ...pr, latitude: lat, longitude: lon } : pr)));
        }
      } catch (e) {
        console.error("Geocoding failed for", p.title, e);
      }
      setProgress({ done: i + 1, total: needGeo.length });
      if (i < needGeo.length - 1) await new Promise((r) => setTimeout(r, 1100));
    }
    setGeocoding(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredProjects = statusFilter === "all"
    ? projects
    : projects.filter((p) => p.status === statusFilter);
  const mappableProjects = filteredProjects.filter((p) => p.latitude && p.longitude);
  const customerName = (id) => customers.find((c) => c.id === id)?.name || "—";

  const center = mappableProjects.length > 0
    ? [mappableProjects[0].latitude, mappableProjects[0].longitude]
    : [51.1657, 10.4515];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-orange-500" />
          <h1 className="text-lg font-bold text-gray-900">Baustellenkarte</h1>
          {geocoding && (
            <span className="text-xs text-gray-400 flex items-center gap-1 ml-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Geokodiere {progress.done}/{progress.total}…
            </span>
          )}
          {!geocoding && mappableProjects.length > 0 && (
            <span className="text-xs text-gray-400 ml-2">{mappableProjects.length} Baustellen</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "Alle" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <MapContainer center={center} zoom={6} className="w-full h-full" style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          {mappableProjects.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.latitude, p.longitude]}
              radius={10}
              pathOptions={{
                color: "white",
                weight: 2,
                fillColor: statusColors[p.status] || "#888",
                fillOpacity: 0.85,
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-semibold text-gray-900 mb-1">{p.title}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    {[p.address, p.city].filter(Boolean).join(", ") || "Keine Adresse"}
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div><span className="text-gray-400">Kunde:</span> {customerName(p.customer_id)}</div>
                    <div>
                      <span className="text-gray-400">Status:</span>{" "}
                      <span style={{ color: statusColors[p.status] }} className="font-medium">{p.status}</span>
                    </div>
                    {p.start_date && <div><span className="text-gray-400">Start:</span> {p.start_date}</div>}
                    {p.end_date && <div><span className="text-gray-400">Ende:</span> {p.end_date}</div>}
                  </div>
                  <Link
                    to={`/projects/${p.id}`}
                    className="mt-2 inline-block text-xs text-orange-500 font-medium hover:underline"
                  >
                    Projektdetails →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-[1000]">
          <div className="text-xs font-semibold text-gray-900 mb-2">Status</div>
          <div className="space-y-1.5">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-xs text-gray-600">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {mappableProjects.length === 0 && !geocoding && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center z-[1000]">
            <MapIcon className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">Keine Projekte mit gültiger Adresse gefunden.</p>
          </div>
        )}
      </div>
    </div>
  );
}