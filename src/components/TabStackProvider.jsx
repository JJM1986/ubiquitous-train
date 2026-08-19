import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Primäre Tabs für die mobile Tab-Leiste. Jeder Tab besitzt einen Satz
// zugehöriger Routen-Präfixe; die darin liegenden Detailseiten gehören zum Tab.
export const TABS = [
  {
    key: "home",
    root: "/dashboard",
    label: "Startseite",
    prefixes: [],
  },
  {
    key: "baustellen",
    root: "/baustellen",
    label: "Baustellen",
    prefixes: [
      "/baustellen",
      "/projects",
      "/projekt-karte",
      "/projektarchiv",
      "/baustellen-fotos",
      "/baustellen-scan",
      "/geruestfreigaben",
      "/freigabeprotokolle",
      "/reklamationen",
    ],
  },
  {
    key: "geruestrechner",
    root: "/geruestrechner",
    label: "Gerüstrechner",
    prefixes: ["/geruestrechner", "/geruest-3d", "/berechnungshistorie", "/cp-pro-export"],
  },
  {
    key: "einsatzplanung",
    root: "/einsatzplaner",
    label: "Einsatzplanung",
    prefixes: [
      "/einsatzplaner",
      "/assignments",
      "/fuhrpark",
      "/ladelisten",
      "/kolonnen",
      "/einsatzbericht",
      "/wochenauswertung",
    ],
  },
];

function matchTab(pathname) {
  if (pathname === "/dashboard") return "home";
  for (const t of TABS) {
    if (t.key === "home") continue;
    if (t.prefixes.some((pre) => pathname === pre || pathname.startsWith(pre + "/"))) {
      return t.key;
    }
  }
  return null;
}

const TabStackContext = createContext(null);

export default TabStackProvider;

export function useTabStack() {
  return useContext(TabStackContext);
}

export function TabStackProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [savedPaths, setSavedPaths] = useState(() => {
    const init = {};
    TABS.forEach((t) => (init[t.key] = t.root));
    return init;
  });
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const tab = matchTab(location.pathname);
    if (tab) {
      setActiveTab(tab);
      setSavedPaths((prev) =>
        prev[tab] === location.pathname ? prev : { ...prev, [tab]: location.pathname }
      );
    }
  }, [location.pathname]);

  function goToTab(key) {
    const tab = TABS.find((t) => t.key === key);
    if (!tab) return;
    if (key === activeTab) {
      // Bereits aktiv: auf Tab-Root zurückkehren (Stack leeren)
      navigate(tab.root);
      setSavedPaths((prev) => ({ ...prev, [key]: tab.root }));
    } else {
      navigate(savedPaths[key] || tab.root);
    }
  }

  return (
    <TabStackContext.Provider value={{ tabs: TABS, activeTab, savedPaths, goToTab }}>
      {children}
    </TabStackContext.Provider>
  );
}