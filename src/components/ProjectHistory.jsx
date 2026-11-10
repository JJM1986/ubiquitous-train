import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { History, User, Calendar, ArrowRight, AlertCircle, CheckCircle, Plus } from "lucide-react";

export default function ProjectHistory({ projectId, projectName }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) loadHistory();
  }, [projectId]);

  async function loadHistory() {
    setLoading(true);
    try {
      const records = await safeCall(() => base44.entities.ProjektHistorie.filter({ project_id: projectId }, "-timestamp"), { fallback: [], message: "Daten konnten nicht geladen werden." });
      setHistory(records);
    } catch {
      setHistory([]);
    }
    setLoading(false);
  }

  const actionIcons = {
    "Statuswechsel": ArrowRight,
    "Erstellt": Plus,
    "Bearbeitet": History,
    "Verhinderung gemeldet": AlertCircle,
    "Verhinderung behoben": CheckCircle,
  };

  const actionColors = {
    "Statuswechsel": "bg-blue-50 text-blue-600",
    "Erstellt": "bg-green-50 text-green-600",
    "Bearbeitet": "bg-gray-100 text-gray-600",
    "Verhinderung gemeldet": "bg-orange-50 text-orange-600",
    "Verhinderung behoben": "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-orange-500" />
        <h2 className="font-semibold text-gray-900">Projekt-Historie</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Noch keine Änderungen protokolliert
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100" />
          <div className="space-y-3">
            {history.map((h) => {
              const Icon = actionIcons[h.action_type] || History;
              return (
                <div key={h.id} className="relative flex gap-3 items-start pl-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-white ${actionColors[h.action_type] || "bg-gray-100"}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 pt-1 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{h.action_type}</span>
                      {h.action_type === "Statuswechsel" && h.old_value && h.new_value && (
                        <span className="text-xs text-gray-500">
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded">{h.old_value}</span>
                          <ArrowRight className="w-3 h-3 inline mx-1" />
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-medium">{h.new_value}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {h.user_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {h.user_name}
                        </span>
                      )}
                      {h.timestamp && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(h.timestamp).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      )}
                    </div>
                    {h.notes && <p className="text-sm text-gray-500 mt-1">{h.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}