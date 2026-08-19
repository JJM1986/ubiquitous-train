import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { BarChart3 } from "lucide-react";

// Projektphasen als Pipeline von der Anfrage bis zur Abnahme
const PHASES = [
  { key: "Anfrage", label: "Anfrage", color: "#9ca3af" },
  { key: "Angebot", label: "Angebot", color: "#60a5fa" },
  { key: "Beauftragt", label: "Beauftragt", color: "#facc15" },
  { key: "In Arbeit", label: "In Arbeit", color: "#fb923c" },
  { key: "Abgeschlossen", label: "Abnahme", color: "#22c55e" },
];

const COLOR_MAP = Object.fromEntries(PHASES.map((p) => [p.key, p.color]));

export default function ProjektPhasenChart({ projects }) {
  const data = useMemo(() => {
    return PHASES.map((phase) => ({
      name: phase.label,
      key: phase.key,
      value: projects.filter((p) => p.status === phase.key).length,
    }));
  }, [projects]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Projektphasen</h2>
        </div>
        <span className="text-xs text-gray-400">{total} Projekte gesamt</span>
      </div>

      {total === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          Noch keine Projekte in der Pipeline
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={PHASES.length * 52 + 20}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 40, bottom: 4, left: 4 }}
            barCategoryGap={8}
          >
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={COLOR_MAP[entry.key] || "#9ca3af"} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                style={{ fontSize: 12, fontWeight: 600, fill: "#374151" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Mini-Pipeline-Verlauf */}
      {total > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            {PHASES.map((phase, idx) => {
              const count = projects.filter((p) => p.status === phase.key).length;
              return (
                <React.Fragment key={phase.key}>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: count > 0 ? phase.color : "#e5e7eb" }}
                    >
                      {count}
                    </div>
                    <span className="text-[10px] text-gray-400 text-center leading-tight">{phase.label}</span>
                  </div>
                  {idx < PHASES.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-100 self-start mt-3" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}