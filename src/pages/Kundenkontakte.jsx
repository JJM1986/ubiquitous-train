import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Contact, Phone, Mail, MapPin, Search, Briefcase, ChevronDown, ChevronUp } from "lucide-react";

const statusColors = {
  "Anfrage": "bg-gray-100 text-gray-700",
  "Angebot": "bg-blue-100 text-blue-700",
  "Beauftragt": "bg-yellow-100 text-yellow-700",
  "In Arbeit": "bg-orange-100 text-orange-700",
  "Abgeschlossen": "bg-green-100 text-green-700",
  "Storniert": "bg-red-100 text-red-700",
};

export default function Kundenkontakte() {
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [cs, ps] = await Promise.all([base44.entities.Customer.list(), base44.entities.Project.list()]);
    setCustomers(cs);
    setProjects(ps);
    setLoading(false);
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Contact className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900">Kundenkontakte</h1>
          <span className="text-xs text-gray-400">{customers.length} Kunden</span>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche nach Name, Firma oder E-Mail…" className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Contact className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">Keine Kunden gefunden.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => {
              const customerProjects = projects.filter(p => p.customer_id === c.id);
              const activeProjects = customerProjects.filter(p => p.status === "In Arbeit" || p.status === "Beauftragt").length;
              const completedProjects = customerProjects.filter(p => p.status === "Abgeschlossen").length;
              const isExpanded = expanded === c.id;

              return (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900">{c.name}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "aktiv" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                        </div>
                        {c.company && <div className="text-sm text-gray-500 mt-0.5">{c.company}</div>}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                          {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                          {c.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[c.address, c.zip, c.city].filter(Boolean).join(", ")}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex gap-3 text-xs">
                          <div>
                            <div className="font-bold text-orange-600">{activeProjects}</div>
                            <div className="text-gray-400">aktiv</div>
                          </div>
                          <div>
                            <div className="font-bold text-green-600">{completedProjects}</div>
                            <div className="text-gray-400">abgeschlossen</div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-700">{customerProjects.length}</div>
                            <div className="text-gray-400">gesamt</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {customerProjects.length > 0 && (
                      <button onClick={() => setExpanded(isExpanded ? null : c.id)} className="flex items-center gap-1 text-xs text-orange-500 font-medium hover:underline mt-3">
                        <Briefcase className="w-3 h-3" /> Projekt Historie ({customerProjects.length})
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {isExpanded && customerProjects.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-3 space-y-1.5">
                      {customerProjects.map(p => (
                        <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center justify-between bg-white rounded-lg p-2.5 hover:shadow-sm transition-shadow">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{p.title}</div>
                            <div className="text-xs text-gray-400">{p.city || p.address || "—"} · {p.start_date || "—"}</div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[p.status] || "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}