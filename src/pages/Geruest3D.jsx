import React, { useState } from "react";
import Geruest3DViewer from "@/components/Geruest3DViewer";
import { Ruler, Package, Box } from "lucide-react";

function Stat({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

export default function Geruest3D() {
  const [params, setParams] = useState({ length: 12, height: 6, bayLength: 3 });

  function update(key, value) {
    setParams((prev) => ({ ...prev, [key]: value }));
  }

  const bays = Math.max(1, Math.ceil(params.length / params.bayLength));
  const frames = bays + 1;
  const levels = Math.max(1, Math.ceil(params.height / 2));
  const posts = frames * 2;
  const platforms = bays * levels;
  const braces = bays * levels;
  const railingPosts = frames * 2;
  const horizontalBars = frames * levels;
  const totalParts = posts + platforms + braces + railingPosts + horizontalBars;

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-orange-500" />
          <h1 className="text-lg font-bold text-gray-900">3D-Gerüstvisualisierung</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* 3D Viewer */}
        <div className="flex-1 relative min-h-0 bg-gray-100">
          <Geruest3DViewer params={params} />
        </div>

        {/* Controls Panel */}
        <div className="lg:w-72 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 p-5 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="w-4 h-4 text-orange-500" />
            <h2 className="font-semibold text-gray-900 text-sm">Parameter</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 flex justify-between mb-1">
                <span>Fassadenlänge</span><span className="font-medium text-gray-900">{params.length} m</span>
              </label>
              <input type="range" min="3" max="30" step="0.5" value={params.length}
                onChange={(e) => update("length", parseFloat(e.target.value))}
                className="w-full accent-orange-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 flex justify-between mb-1">
                <span>Gerüsthöhe</span><span className="font-medium text-gray-900">{params.height} m</span>
              </label>
              <input type="range" min="2" max="20" step="0.5" value={params.height}
                onChange={(e) => update("height", parseFloat(e.target.value))}
                className="w-full accent-orange-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 flex justify-between mb-1">
                <span>Feldlänge</span><span className="font-medium text-gray-900">{params.bayLength} m</span>
              </label>
              <input type="range" min="1.5" max="4" step="0.25" value={params.bayLength}
                onChange={(e) => update("bayLength", parseFloat(e.target.value))}
                className="w-full accent-orange-500" />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Materialbedarf</h2>
            </div>
            <div className="space-y-2 text-sm">
              <Stat label="Gerüstrahmen" value={frames} />
              <Stat label="Belägebenen" value={levels} />
              <Stat label="Gerüstbeläge" value={platforms} />
              <Stat label="Kreuzverbände" value={braces} />
              <Stat label="Geländerpfosten" value={railingPosts} />
              <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between">
                <span className="text-gray-900 font-medium">Gesamt</span>
                <span className="text-orange-600 font-bold">{totalParts} Teile</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Ziehen zum Drehen, Scrollen zum Zoomen. Schätzwerte für die Visualisierung.
          </p>
        </div>
      </div>
    </div>
  );
}