import React from "react";
import { Link } from "react-router-dom";
import { Check, Settings, Users, Package, UserCog, Briefcase, Calculator, ArrowRight } from "lucide-react";

export default function OnboardingChecklist({ hasCompany, hasCustomers, hasMaterials, hasEmployees, hasProjects }) {
  const steps = [
    { key: "company", label: "Firmendaten hinterlegen", desc: "Name, Adresse & Logo festlegen", link: "/unternehmenseinstellungen", done: hasCompany, icon: Settings },
    { key: "customers", label: "Ersten Kunden anlegen", desc: "Kundendaten für Angebote erfassen", link: "/customers", done: hasCustomers, icon: Users },
    { key: "materials", label: "Material & Lager anlegen", desc: "Lagerbestand initial erfassen", link: "/materials", done: hasMaterials, icon: Package },
    { key: "employees", label: "Mitarbeiter anlegen", desc: "Team für Einsatzplanung", link: "/employees", done: hasEmployees, icon: UserCog },
    { key: "projects", label: "Erstes Projekt erstellen", desc: "Baustelle anlegen & planen", link: "/projects", done: hasProjects, icon: Briefcase },
    { key: "calc", label: "Gerüstrechner ausprobieren", desc: "Materialbedarf berechnen", link: "/geruestrechner", done: false, icon: Calculator },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const percent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-bold text-gray-900">Willkommen bei GerüstMeister! 👋</h2>
          <p className="text-sm text-gray-600 mt-0.5">{completedCount} von {steps.length} Schritten erledigt</p>
        </div>
        <div className="text-2xl font-bold text-orange-500">{percent}%</div>
      </div>
      <div className="w-full h-2 bg-orange-100 rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {steps.map(step => (
          <Link
            key={step.key}
            to={step.link}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${step.done ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-orange-300"}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${step.done ? "bg-green-500" : "bg-orange-100"}`}>
              {step.done ? <Check className="w-4 h-4 text-white" /> : <step.icon className="w-4 h-4 text-orange-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${step.done ? "text-gray-500 line-through" : "text-gray-900"}`}>{step.label}</div>
              <div className="text-xs text-gray-500 truncate">{step.desc}</div>
            </div>
            {!step.done && <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          </Link>
        ))}
      </div>
    </div>
  );
}