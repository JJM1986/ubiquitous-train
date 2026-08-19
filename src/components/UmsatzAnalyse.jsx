import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LabelList,
} from "recharts";
import { Euro, TrendingUp } from "lucide-react";

const PHASES = [
  { key: "Anfrage", label: "Anfrage", color: "#9ca3af" },
  { key: "Angebot", label: "Angebot", color: "#60a5fa" },
  { key: "Beauftragt", label: "Beauftragt", color: "#facc15" },
  { key: "In Arbeit", label: "In Arbeit", color: "#fb923c" },
  { key: "Abgeschlossen", label: "Abgeschlossen", color: "#22c55e" },
];

const euro = (v) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v || 0);

export default function UmsatzAnalyse({ projects, offers }) {
  const data = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        key,
        label: d.toLocaleDateString("de-DE", { month: "short" }),
        revenue: 0,
        count: 0,
      });
    }
    const monthMap = Object.fromEntries(months.map((m) => [m.key, m]));

    // Summe der angenommenen Angebote je Projekt
    const acceptedByProject = {};
    (offers || []).forEach((o) => {
      if (o.status === "Angenommen" && o.project_id) {
        acceptedByProject[o.project_id] = (acceptedByProject[o.project_id] || 0) + (o.total || 0);
      }
    });

    (projects || []).forEach((p) => {
      if (p.status !== "Abgeschlossen") return;
      const rev = acceptedByProject[p.id];
      if (!rev) return;
      const dateStr = p.end_date || p.assembly_date || p.created_date;
      if (!dateStr) return;
      const d = new Date(dateStr);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap[key]) {
        monthMap[key].revenue += rev;
        monthMap[key].count += 1;
      }
    });

    return months;
  }, [projects, offers]);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const completedCount = (projects || []).filter((p) => p.status === "Abgeschlossen").length;
  const phaseCounts = PHASES.map((ph) => ({
    ...ph,
    count: (projects || []).filter((p) => p.status === ph.key).length,
  }));
  const hasData = totalRevenue > 0 || completedCount > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Euro className="w-4 h-4 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Monatlicher Umsatz & Projektphasen</h2>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-gray-900">{euro(totalRevenue)}</div>
          <div className="text-[10px] text-gray-400">Umsatz abgeschlossener Projekte (12 Monate)</div>
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          Noch keine Umsatzdaten aus abgeschlossenen Projekten
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              cursor={{ fill: "rgba(251,146,60,0.08)" }}
              contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
              formatter={(value, name) => name === "revenue" ? [euro(value), "Umsatz"] : [value, "Projekte"]}
              labelFormatter={(l) => `Monat: ${l}`}
            />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.revenue > 0 ? "#fb923c" : "#f3f4f6"} />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                style={{ fontSize: 10, fill: "#22c55e", fontWeight: 600 }}
                formatter={(v) => (v > 0 ? `${v}✓` : "")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Aktuelle Projektphasen */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-500">Aktuelle Projektphasen</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {phaseCounts.map((ph) => (
            <div key={ph.key} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ph.color }} />
              <span className="text-xs text-gray-600">{ph.label}</span>
              <span className="text-xs font-bold text-gray-900">{ph.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}