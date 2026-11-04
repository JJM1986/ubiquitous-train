import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Archive, Search, RotateCcw, MapPin, Calendar } from "lucide-react";

const statusColors = {
  "Abgeschlossen": "bg-green-100 text-green-700",
  "Storniert": "bg-red-100 text-red-700",
};

export default function Projektarchiv() {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [p, c] = await Promise.all([
      base44.entities.Project.list("-created_date"),
      base44.entities.Customer.list(),
    ]);
    setProjects(p.filter((proj) => proj.status === "Abgeschlossen" || proj.status === "Storniert"));
    setCustomers(c);
    setLoading(false);
  }

  async function unarchive(p) {
    if (!confirm("Projekt wiederherstellen und auf 'In Arbeit' setzen?")) return;
    await safeCall(() => base44.entities.Project.update(p.id, { status: "In Arbeit" }), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    setProjects((prev) => prev.filter((x) => x.id !== p.id));
  }

  const cmap = Object.fromEntries(customers.map((c) => [c.id, c.name]));
  const filtered = projects.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      cmap[p.customer_id]?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Archive className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900">Projektarchiv</h1>
        </div>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Archive className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine archivierten Projekte</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Archive className="w-5 h-5 text-gray-400" />
                </div>
                <Link to={`/projects/${p.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {cmap[p.customer_id] && <span>{cmap[p.customer_id]}</span>}
                    {p.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city}</span>}
                    {p.end_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.end_date}</span>}
                  </div>
                </Link>
                <button onClick={() => unarchive(p)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap">
                  <RotateCcw className="w-3.5 h-3.5" /> Wiederherstellen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}