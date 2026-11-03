import React, { useState, useEffect } from "react";
import { Link, useLocation, useOutlet } from "react-router-dom";
import { LayoutDashboard, Users, Briefcase, FileText, UserCog, Package, Menu, X, HardHat, LogOut, Calculator, FileCheck, Camera, Download, History, ClipboardCheck, BarChart3, PackageSearch, Settings, Archive, Calendar, ArrowLeftRight, BookOpen, CalendarClock, ScanLine, Shield, Map, Box, HelpCircle, ShoppingCart, FileArchive, Wrench, ShieldCheck, Contact, AlertCircle, Truck, ClipboardList } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import TabStackProvider from "@/components/TabStackProvider";
import { useAuth } from "@/lib/AuthContext";
import TrialBanner from "@/components/TrialBanner";
import OfflineIndicator from "@/components/OfflineIndicator";
import VerhinderungAlert from "@/components/VerhinderungAlert";

const navGroups = [
  {
    label: "Übersicht",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Projekte",
    items: [
      { path: "/projects", label: "Projekte", icon: Briefcase },
      { path: "/projekt-karte", label: "Baustellenkarte", icon: Map },
      { path: "/projektarchiv", label: "Projektarchiv", icon: Archive, monteurHidden: true },
      { path: "/offers", label: "Angebote", icon: FileText, adminOnly: true },
      { path: "/einsatzplaner", label: "Einsatzplaner", icon: Calendar, monteurHidden: true },
      { path: "/baustellen", label: "Baustellen", icon: HardHat },
    ],
  },
  {
    label: "Einsätze",
    items: [
      { path: "/assignments", label: "Einsätze", icon: UserCog },
      { path: "/fuhrpark", label: "Fuhrpark", icon: Truck },
      { path: "/ladelisten", label: "Ladelisten", icon: ClipboardList },
      { path: "/kolonnen", label: "Kolonnen", icon: Users, adminOnly: true },
      { path: "/einsatzbericht", label: "Einsatzbericht", icon: BarChart3, adminOnly: true },
      { path: "/wochenauswertung", label: "Wochenauswertung", icon: CalendarClock, adminOnly: true },
    ],
  },
  {
    label: "Material & Lager",
    items: [
      { path: "/materials", label: "Material & Lager", icon: Package },
      { path: "/materialbestellungen", label: "Bestellungen", icon: ShoppingCart, monteurHidden: true },
      { path: "/lageruebersicht", label: "Lagerübersicht", icon: PackageSearch },
      { path: "/lagerbewegungen", label: "Lagerbewegungen", icon: ArrowLeftRight, monteurHidden: true },
      { path: "/materialkatalog", label: "Materialkatalog", icon: BookOpen, monteurHidden: true },
    ],
  },
  {
    label: "Gerüstplanung",
    items: [
      { path: "/geruestrechner", label: "Gerüstrechner", icon: Calculator },
      { path: "/geruest-3d", label: "3D-Viewer", icon: Box },
      { path: "/cp-pro-export", label: "CP-Pro Export", icon: Download, adminOnly: true },
      { path: "/berechnungshistorie", label: "Berechnungshistorie", icon: History, monteurHidden: true },
    ],
  },
  {
    label: "Qualität & Sicherheit",
    items: [
      { path: "/geruestfreigaben", label: "Freigaben", icon: FileCheck },
      { path: "/freigabeprotokolle", label: "Freigabeprotokolle", icon: ClipboardCheck, monteurHidden: true },
      { path: "/dokumentenarchiv", label: "Dokumentenarchiv", icon: FileArchive, monteurHidden: true },
      { path: "/baustellen-fotos", label: "Baustellen-Fotos", icon: Camera },
      { path: "/baustellen-scan", label: "Baustellen-Scan", icon: ScanLine },
      { path: "/sicherheitsunterweisungen", label: "Sicherheit", icon: ShieldCheck },
      { path: "/reklamationen", label: "Reklamationen", icon: AlertCircle },
    ],
  },
  {
    label: "Verwaltung",
    items: [
      { path: "/customers", label: "Kunden", icon: Users, adminOnly: true },
      { path: "/kundenkontakte", label: "Kundenkontakte", icon: Contact, adminOnly: true },
      { path: "/employees", label: "Mitarbeiter", icon: UserCog, adminOnly: true },
      { path: "/subunternehmer-portal", label: "Subunternehmer", icon: Wrench, adminOnly: true },
      { path: "/unternehmenseinstellungen", label: "Firmeneinstellungen", icon: Settings, adminOnly: true },
    ],
  },
  {
    label: "Hilfe",
    items: [
      { path: "/hilfezentrum", label: "Hilfezentrum", icon: HelpCircle },
    ],
  },
];

export default function Layout() {
  const location = useLocation();
  const outlet = useOutlet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const userRole = user?.role || "user";

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e) => {
      if (e.matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const visibleGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (item.adminOnly) return userRole === "admin";
        if (item.monteurHidden) return userRole === "admin" || userRole === "bauleiter";
        return true;
      }),
    }))
    .filter(group => group.items.length > 0);

  return (
    <TabStackProvider>
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 flex-shrink-0 print:hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">GerüstMeister</div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                {userRole === "admin" ? <><Shield className="w-3 h-3" /> Administrator</> : userRole === "bauleiter" ? <><HardHat className="w-3 h-3" /> Bauleiter</> : userRole === "monteur" ? "Monteur" : "Mitarbeiter"}
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {visibleGroups.map(group => (
            <div key={group.label}>
              <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{group.label}</div>
              <div className="space-y-0.5">
                {group.items.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(path)
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => base44.auth.logout("/")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between print:hidden" style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">GerüstMeister</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2.5 rounded-xl hover:bg-gray-100 touch-manipulation">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto pt-16 pb-6">
            {visibleGroups.map(group => (
              <div key={group.label} className="mb-3">
                <div className="px-5 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{group.label}</div>
                <div className="space-y-0.5 px-3">
                  {group.items.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors touch-manipulation ${
                        isActive(path) ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="px-3 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => base44.auth.logout("/")}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 w-full touch-manipulation"
              >
                <LogOut className="w-5 h-5" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-safe-top pb-safe-nav md:pt-0 md:pb-0 print:overflow-visible print:pt-0 print:pb-0">
        <OfflineIndicator />
        <TrialBanner user={user} />
        <VerhinderungAlert />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
    </TabStackProvider>
  );
}