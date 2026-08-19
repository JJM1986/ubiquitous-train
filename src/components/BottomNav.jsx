import React from "react";
import { useTabStack } from "@/components/TabStackProvider";
import { LayoutDashboard, HardHat, Calculator, Calendar } from "lucide-react";

const ICONS = {
  home: LayoutDashboard,
  baustellen: HardHat,
  geruestrechner: Calculator,
  einsatzplanung: Calendar,
};

export default function BottomNav() {
  const { tabs, activeTab, goToTab } = useTabStack();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-stretch print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((t) => {
        const Icon = ICONS[t.key];
        const active = activeTab === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => goToTab(t.key)}
            aria-label={t.label}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] touch-manipulation transition-colors ${
              active ? "text-orange-500" : "text-gray-400"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}