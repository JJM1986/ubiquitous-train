import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { AlertTriangle, X, Wrench, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function VerhinderungAlert() {
  const { user } = useAuth();
  const [verhinderungen, setVerhinderungen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "bauleiter") loadVerhinderungen();
    else setLoading(false);
  }, [user]);

  async function loadVerhinderungen() {
    try {
      const records = await safeCall(() => base44.entities.Verhinderung.filter({ admin_seen: false }, "-reported_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
      setVerhinderungen(records.filter(v => v.status === "Offen"));
    } catch {
      setVerhinderungen([]);
    }
    setLoading(false);
  }

  async function markSeen(v) {
    await safeCall(() => base44.entities.Verhinderung.update(v.id, { admin_seen: true }), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    setDismissed([...dismissed, v.id]);
  }

  async function markBehoben(v) {
    await safeCall(() => base44.entities.Verhinderung.update(v.id, { admin_seen: true, status: "Behoben", resolved_date: new Date().toISOString().split("T")[0] }), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    await safeCall(() => base44.entities.ProjektHistorie.create({
      project_id: v.project_id,
      project_name: v.project_name,
      action_type: "Verhinderung behoben",
      field_changed: "Verhinderung",
      old_value: v.reason,
      new_value: "Behoben (Admin)",
      user_name: user?.full_name || user?.email || "Admin",
      timestamp: new Date().toISOString(),
    }), { fallback: null, message: "Speichern fehlgeschlagen." });
    setDismissed([...dismissed, v.id]);
  }

  async function bestätigen(v) {
    await safeCall(() => base44.entities.Verhinderung.update(v.id, { admin_seen: true, status: "Bestätigt" }), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    setDismissed([...dismissed, v.id]);
  }

  const isAdmin = user?.role === "admin";
  const isBauleiter = user?.role === "bauleiter";
  if (!isAdmin && !isBauleiter) return null;
  if (loading) return null;

  const visible = verhinderungen.filter(v => !dismissed.includes(v.id));
  if (visible.length === 0) return null;

  return (
    <div className="mx-4 md:mx-6 mt-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {visible.length} neue Verhinderung{visible.length > 1 ? "en" : ""} gemeldet
            </h3>
            <span className="text-xs text-orange-600 font-medium">Automatisch vorgeschlagen</span>
          </div>
          <div className="space-y-2 mt-2">
            {visible.slice(0, 3).map(v => (
              <div key={v.id} className="bg-white/80 rounded-xl p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{v.project_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{v.trade}</span>
                  </div>
                  <p className="text-xs text-gray-600">{v.reason}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Wrench className="w-3 h-3" /> {v.reported_by}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {v.reported_date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link to={`/projects/${v.project_id}`} className="text-xs px-2 py-1.5 rounded-lg text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> Öffnen
                  </Link>
                  <button onClick={() => bestätigen(v)} className="text-xs px-2 py-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 font-medium">
                    Bestätigen
                  </button>
                  <button onClick={() => markBehoben(v)} className="text-xs px-2 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Behoben
                  </button>
                </div>
              </div>
            ))}
            {visible.length > 3 && (
              <div className="flex items-center justify-between mt-2">
                <Link to="/reklamationen" className="text-xs text-orange-600 font-medium hover:text-orange-700">
                  Alle {visible.length} anzeigen →
                </Link>
                <button onClick={() => visible.forEach(v => markSeen(v))} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <X className="w-3 h-3" /> Alle ausblenden
                </button>
              </div>
            )}
            {visible.length <= 3 && (
              <div className="flex justify-end mt-1">
                <button onClick={() => visible.forEach(v => markSeen(v))} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <X className="w-3 h-3" /> Ausblenden
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}