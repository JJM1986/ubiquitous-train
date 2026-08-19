import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import Layout from './components/Layout';

// Auth page imports
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Page imports
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Offers from './pages/Offers';
import Employees from './pages/Employees';
import Assignments from './pages/Assignments';
import Materials from './pages/Materials';
import Geruestrechner from './pages/Geruestrechner';
import GeruestrechnerCalc from './pages/GeruestrechnerCalc';
import Geruestfreigaben from './pages/Geruestfreigaben';
import GeruestfreigabeDetail from './pages/GeruestfreigabeDetail';
import BaustellenFotos from './pages/BaustellenFotos';
import CpProExport from './pages/CpProExport';
import Berechnungshistorie from './pages/Berechnungshistorie';
import Freigabeprotokolle from './pages/Freigabeprotokolle';
import Einsatzbericht from './pages/Einsatzbericht';
import Lageruebersicht from './pages/Lageruebersicht';
import Unternehmenseinstellungen from './pages/Unternehmenseinstellungen';
import Projektarchiv from './pages/Projektarchiv';
import Einsatzplaner from './pages/Einsatzplaner';
import Lagerbewegungen from './pages/Lagerbewegungen';
import Materialkatalog from './pages/Materialkatalog';
import Wochenauswertung from './pages/Wochenauswertung';
import BaustellenScan from './pages/BaustellenScan';
import ProjektKarte from './pages/ProjektKarte';
import Hilfezentrum from './pages/Hilfezentrum';
import HilfeartikelDetail from './pages/HilfeartikelDetail';
import Geruest3D from './pages/Geruest3D';
import Materialbestellungen from './pages/Materialbestellungen';
import Dokumentenarchiv from './pages/Dokumentenarchiv';
import SubunternehmerPortal from './pages/SubunternehmerPortal';
import Sicherheitsunterweisungen from './pages/Sicherheitsunterweisungen';
import Kundenkontakte from './pages/Kundenkontakte';
import TechnischeDokumentation from './pages/TechnischeDokumentation';
import Preis from './pages/Preis';
import Baustellen from './pages/Baustellen';
import Kolonnen from './pages/Kolonnen';
import Fuhrpark from './pages/Fuhrpark';
import Ladelisten from './pages/Ladelisten';
import Reklamationen from './pages/Reklamationen';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import AGB from './pages/AGB';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">GerüstMeister lädt...</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/preise" element={<Preis />} />
      <Route path="/impressum" element={<Impressum />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
      <Route path="/agb" element={<AGB />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/baustellen" element={<Baustellen />} />
          <Route path="/reklamationen" element={<Reklamationen />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/fuhrpark" element={<Fuhrpark />} />
          <Route path="/ladelisten" element={<Ladelisten />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/geruestrechner" element={<Geruestrechner />} />
          <Route path="/geruestrechner/:type" element={<GeruestrechnerCalc />} />
          <Route path="/geruestfreigaben" element={<Geruestfreigaben />} />
          <Route path="/geruestfreigaben/:id" element={<GeruestfreigabeDetail />} />
          <Route path="/baustellen-fotos" element={<BaustellenFotos />} />
          <Route path="/berechnungshistorie" element={<Berechnungshistorie />} />
          <Route path="/freigabeprotokolle" element={<Freigabeprotokolle />} />
          <Route path="/lageruebersicht" element={<Lageruebersicht />} />
          <Route path="/projektarchiv" element={<Projektarchiv />} />
          <Route path="/einsatzplaner" element={<Einsatzplaner />} />
          <Route path="/lagerbewegungen" element={<Lagerbewegungen />} />
          <Route path="/materialkatalog" element={<Materialkatalog />} />
          <Route path="/baustellen-scan" element={<BaustellenScan />} />
          <Route path="/projekt-karte" element={<ProjektKarte />} />
          <Route path="/geruest-3d" element={<Geruest3D />} />
          <Route path="/hilfezentrum" element={<Hilfezentrum />} />
          <Route path="/hilfezentrum/:id" element={<HilfeartikelDetail />} />
          <Route path="/materialbestellungen" element={<Materialbestellungen />} />
          <Route path="/dokumentenarchiv" element={<Dokumentenarchiv />} />
          <Route path="/sicherheitsunterweisungen" element={<Sicherheitsunterweisungen />} />
          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="/customers" element={<Customers />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/cp-pro-export" element={<CpProExport />} />
            <Route path="/einsatzbericht" element={<Einsatzbericht />} />
            <Route path="/wochenauswertung" element={<Wochenauswertung />} />
            <Route path="/unternehmenseinstellungen" element={<Unternehmenseinstellungen />} />
            <Route path="/subunternehmer-portal" element={<SubunternehmerPortal />} />
            <Route path="/kundenkontakte" element={<Kundenkontakte />} />
            <Route path="/kolonnen" element={<Kolonnen />} />
            <Route path="/technische-dokumentation" element={<TechnischeDokumentation />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App