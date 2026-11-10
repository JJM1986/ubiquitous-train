import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 print:hidden">
      <div className="flex items-center gap-2 text-sm text-yellow-700 max-w-5xl mx-auto">
        <WifiOff className="w-4 h-4 flex-shrink-0" />
        <span>Sie sind offline. Daten werden synchronisiert, sobald die Verbindung wiederhergestellt ist.</span>
      </div>
    </div>
  );
}