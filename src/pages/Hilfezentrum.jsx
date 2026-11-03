import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Search, ArrowUpRight, HelpCircle, BookOpen } from "lucide-react";

export default function Hilfezentrum() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await safeCall(() => base44.entities.Hilfeartikel.list("sort_order"), { fallback: [], message: "Daten konnten nicht geladen werden." });
    setArticles(data);
    setLoading(false);
  }

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.summary || "").toLowerCase().includes(search.toLowerCase())
  );

  const featured = filtered.slice(0, 4);
  const more = filtered.slice(4);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900">Hilfezentrum</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {featured.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Themen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featured.map((a) => (
                <Link
                  key={a.id}
                  to={`/hilfezentrum/${a.id}`}
                  className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{a.title}</div>
                    {a.summary && <div className="text-xs text-gray-500 truncate">{a.summary}</div>}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {more.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Weitere Artikel</h2>
            <div className="space-y-2">
              {more.map((a) => (
                <Link
                  key={a.id}
                  to={`/hilfezentrum/${a.id}`}
                  className="group flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <span className="text-sm text-gray-700">{a.title}</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">Keine Artikel gefunden.</p>
          </div>
        )}
      </div>
    </div>
  );
}