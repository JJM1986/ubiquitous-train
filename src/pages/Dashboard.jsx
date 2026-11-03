import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Users, Briefcase, FileText, HardHat, AlertTriangle, Calendar } from "lucide-react";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import PullToRefresh from "@/components/PullToRefresh";
import ProjektPhasenChart from "@/components/ProjektPhasenChart";
import UmsatzAnalyse from "@/components/UmsatzAnalyse";

export default function Dashboard() {
  const [stats, setStats] = useState({ customers: 0, projects: 0, offers: 0, employees: 0, materials: 0, totalProjects: 0, totalEmployees: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [todayAssignments, setTodayAssignments] = useState([]);
  const [companySettings, setCompanySettings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      // First batch: core data
      const [customers, projects, offers] = await Promise.all([
        base44.entities.Customer.list().catch(() => []),
        base44.entities.Project.list("-created_date").catch(() => []),
        base44.entities.Offer.list().catch(() => []),
      ]);

      // Second batch: secondary data
      const [employees, materials, assignments, settings] = await Promise.all([
        base44.entities.Employee.list().catch(() => []),
        base44.entities.Material.list().catch(() => []),
        base44.entities.Assignment.list("-date", 20).catch(() => []),
        base44.entities.CompanySetting.list().catch(() => []),
      ]);

      setCompanySettings(settings);
      setStats({
        customers: customers.length,
        projects: projects.filter(p => p.status === "In Arbeit").length,
        offers: offers.filter(o => o.status === "Gesendet").length,
        employees: employees.filter(e => e.status === "aktiv").length,
        materials: materials.length,
        totalProjects: projects.length,
        totalEmployees: employees.length,
      });
      setRecentProjects(projects.slice(0, 5));
      setAllProjects(projects);
      setAllOffers(offers);
      setLowStock(materials.filter(m => m.stock <= m.min_stock && m.min_stock > 0));
      const today = new Date().toISOString().split("T")[0];
      setTodayAssignments(assignments.filter(a => a.date === today));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const statusColors = {
    "Anfrage": "bg-gray-100 text-gray-700",
    "Angebot": "bg-blue-100 text-blue-700",
    "Beauftragt": "bg-yellow-100 text-yellow-700",
    "In Arbeit": "bg-orange-100 text-orange-700",
    "Abgeschlossen": "bg-green-100 text-green-700",
    "Storniert": "bg-red-100 text-red-700",
  };

  const onboardingComplete = companySettings.length > 0 && stats.customers > 0 && stats.materials > 0 && stats.totalEmployees > 0 && stats.totalProjects > 0;

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">GerüstMeister</h1>
            <p className="text-sm text-gray-500">Startseite</p>
          </div>
        </div>
      </div>

      <PullToRefresh onRefresh={loadData}>
      <div className="p-6 max-w-7xl mx-auto">
        {!onboardingComplete && (
          <OnboardingChecklist
            hasCompany={companySettings.length > 0}
            hasCustomers={stats.customers > 0}
            hasMaterials={stats.materials > 0}
            hasEmployees={stats.totalEmployees > 0}
            hasProjects={stats.totalProjects > 0}
          />
        )}
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link to="/customers" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.customers}</div>
            <div className="text-sm text-gray-500 mt-1">Kunden</div>
          </Link>
          <Link to="/projects" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.projects}</div>
            <div className="text-sm text-gray-500 mt-1">Aktive Projekte</div>
          </Link>
          <Link to="/offers" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.offers}</div>
            <div className="text-sm text-gray-500 mt-1">Offene Angebote</div>
          </Link>
          <Link to="/employees" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.employees}</div>
            <div className="text-sm text-gray-500 mt-1">Mitarbeiter</div>
          </Link>
        </div>

        {/* Projektphasen-Diagramm */}
        <div className="mb-6">
          <ProjektPhasenChart projects={allProjects} />
        </div>

        {/* Monatlicher Umsatz & Projektphasen */}
        <div className="mb-6">
          <UmsatzAnalyse projects={allProjects} offers={allOffers} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Aktuelle Projekte</h2>
              <Link to="/projects" className="text-sm text-orange-500 hover:text-orange-600 font-medium">Alle anzeigen →</Link>
            </div>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Noch keine Projekte vorhanden</div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map(p => (
                  <Link to={`/projects/${p.id}`} key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{p.title}</div>
                      <div className="text-xs text-gray-500">{p.city || p.address || "—"}</div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Today's Assignments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-orange-500" />
                <h2 className="font-semibold text-gray-900">Heute im Einsatz</h2>
              </div>
              {todayAssignments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">Keine Einsätze heute</p>
              ) : (
                <div className="space-y-2">
                  {todayAssignments.slice(0, 4).map(a => (
                    <div key={a.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 truncate">{a.task || "Einsatz"}</span>
                    </div>
                  ))}
                  {todayAssignments.length > 4 && (
                    <p className="text-xs text-gray-400 text-center">+{todayAssignments.length - 4} weitere</p>
                  )}
                </div>
              )}
            </div>

            {/* Low Stock */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h2 className="font-semibold text-gray-900">Niedriger Bestand</h2>
              </div>
              {lowStock.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">Alles gut bestückt ✓</p>
              ) : (
                <div className="space-y-2">
                  {lowStock.slice(0, 4).map(m => (
                    <div key={m.id} className="flex items-center justify-between text-sm p-2 bg-red-50 rounded-lg">
                      <span className="text-gray-700 truncate">{m.name}</span>
                      <span className="text-red-600 font-medium ml-2">{m.stock} {m.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </PullToRefresh>
    </div>
  );
}