import React from "react";
import { Link } from "react-router-dom";
import { Calendar, AlertTriangle, ArrowRight } from "lucide-react";

export default function TrialBanner({ user }) {
  if (!user?.created_date) return null;

  const created = new Date(user.created_date);
  const now = new Date();
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  const daysRemaining = 30 - diffDays;
  const isAdmin = user?.role === "admin";

  if (daysRemaining > 0) {
    return (
      <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 print:hidden">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <Calendar className="w-4 h-4" />
            <span>Testphase aktiv: <strong>{daysRemaining} {daysRemaining === 1 ? "Tag" : "Tage"}</strong> verbleibend</span>
          </div>
          <Link to="/preise" className="text-xs text-orange-700 font-medium hover:underline flex items-center gap-1">
            Paket wählen <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  if (daysRemaining <= 0 && !isAdmin) {
    return (
      <div className="bg-red-50 border-b border-red-200 px-4 py-2 print:hidden">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span>Testphase abgelaufen – Bitte Paket auswählen</span>
          </div>
          <Link to="/preise" className="text-xs bg-red-500 text-white font-medium px-3 py-1 rounded-full hover:bg-red-600 flex items-center gap-1">
            Jetzt upgraden <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}