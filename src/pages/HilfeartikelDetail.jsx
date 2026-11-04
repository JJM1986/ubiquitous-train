import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import BackButton from "@/components/BackButton";

export default function HilfeartikelDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    const data = await safeCall(() => base44.entities.Hilfeartikel.get(id), { fallback: null, message: "Daten konnten nicht geladen werden." });
    setArticle(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Artikel nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <BackButton to="/hilfezentrum" />
      </div>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {article.category && (
            <span className="text-xs text-orange-500 font-medium uppercase tracking-wide">{article.category}</span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-4">{article.title}</h1>
          {article.summary && <p className="text-gray-500 mb-6 leading-relaxed">{article.summary}</p>}
          <ReactMarkdown className="prose prose-sm max-w-none text-gray-700">{article.content || ""}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}