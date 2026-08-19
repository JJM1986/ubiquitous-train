import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Truck, Package, CheckCircle2, Clock, X, ChevronDown, ChevronUp, Send } from "lucide-react";
import { toast } from "sonner";
import { markMaterialOrderDelivered } from "@/lib/materialDelivery";

const STATUSES = ["Offen", "Bestellt", "Unterwegs", "Teilgeliefert", "Geliefert", "Storniert"];

const statusConfig = {
  Offen: { color: "bg-gray-100 text-gray-600", icon: Clock, label: "Offen" },
  Bestellt: { color: "bg-blue-100 text-blue-700", icon: Package, label: "Bestellt" },
  Unterwegs: { color: "bg-orange-100 text-orange-700", icon: Truck, label: "Unterwegs" },
  Teilgeliefert: { color: "bg-yellow-100 text-yellow-700", icon: Package, label: "Teilgeliefert" },
  Geliefert: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Geliefert" },
  Storniert: { color: "bg-red-100 text-red-700", icon: X, label: "Storniert" },
};

// Fortschrittsstufen für die visuelle Anzeige
const PROGRESS = ["Offen", "Bestellt", "Unterwegs", "Geliefert"];

export default function LieferstatusTracker({ onDelivered }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await safeCall(() => base44.entities.Materialbestellung.list("-order_date"), { fallback: [], message: "Daten konnten nicht geladen werden." });
      setOrders(data);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  }

  async function updateStatus(order, newStatus) {
    setUpdating(order.id);
    try {
      if (newStatus === "Geliefert") {
        // Zentrale Buchung: setzt den Status, erhoeht den Bestand und
        // protokolliert die Lagerbewegung - inklusive Ruecknahme bei Fehlern.
        await markMaterialOrderDelivered(order);
        toast.success("Lieferung gebucht und Lagerbestand aktualisiert.");
      } else {
        await base44.entities.Materialbestellung.update(order.id, { status: newStatus });
      }
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));

      if (newStatus === "Geliefert" && onDelivered) {
        await onDelivered(order);
      }
    } catch (error) {
      toast.error("Lieferstatus konnte nicht aktualisiert werden: " + (error.message || "Unbekannter Fehler"));
    } finally {
      setUpdating(null);
    }
  }

  const activeOrders = orders.filter((o) => o.status !== "Geliefert" && o.status !== "Storniert");
  const deliveredOrders = orders.filter((o) => o.status === "Geliefert");
  const overdueOrders = activeOrders.filter((o) => {
    if (!o.expected_delivery) return false;
    return new Date(o.expected_delivery) < new Date(new Date().toDateString());
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Aktive Bestellungen */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-orange-500" />
            <h2 className="font-semibold text-gray-900">Offene Bestellungen</h2>
            {activeOrders.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">{activeOrders.length}</span>
            )}
          </div>
          {overdueOrders.length > 0 && (
            <span className="text-xs text-red-600 font-medium">⚠ {overdueOrders.length} überfällig</span>
          )}
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Keine offenen Bestellungen
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((o) => {
              const cfg = statusConfig[o.status] || statusConfig.Offen;
              const Icon = cfg.icon;
              const progressIdx = PROGRESS.indexOf(o.status === "Teilgeliefert" ? "Unterwegs" : o.status);
              const isOverdue = o.expected_delivery && new Date(o.expected_delivery) < new Date(new Date().toDateString());

              return (
                <div key={o.id} className="border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm truncate">{o.material_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                          <Icon className="w-3 h-3 inline mr-1" />{cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                        <span>{o.quantity} {o.unit || "Stk"}</span>
                        {o.supplier && <span>· {o.supplier}</span>}
                        {o.order_date && <span>· bestellt {o.order_date}</span>}
                        {o.expected_delivery && (
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            · {isOverdue ? "⚠ " : ""}Lieferung {o.expected_delivery}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                    >
                      {expanded === o.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Fortschrittsanzeige */}
                  <div className="flex items-center gap-1 mt-2.5">
                    {PROGRESS.map((step, idx) => {
                      const reached = idx <= progressIdx;
                      return (
                        <React.Fragment key={step}>
                          <div className={`flex items-center gap-1 ${reached ? "text-orange-600" : "text-gray-300"}`}>
                            <div className={`w-2 h-2 rounded-full ${reached ? "bg-orange-500" : "bg-gray-200"}`} />
                            <span className="text-[10px] font-medium">{step}</span>
                          </div>
                          {idx < PROGRESS.length - 1 && (
                            <div className={`flex-1 h-0.5 ${idx < progressIdx ? "bg-orange-500" : "bg-gray-200"}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Schnell-Statuswechsel */}
                  {expanded === o.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">Lieferstatus ändern:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUSES.map((s) => {
                          const sc = statusConfig[s];
                          const SIcon = sc.icon;
                          const active = o.status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => updateStatus(o, s)}
                              disabled={updating === o.id || active}
                              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1 disabled:opacity-50 ${
                                active ? sc.color + " border-transparent" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              <SIcon className="w-3 h-3" /> {sc.label}
                            </button>
                          );
                        })}
                      </div>
                      {o.tracking_note && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                          Sendungsverfolgung: {o.tracking_note}
                        </div>
                      )}
                      {o.notes && (
                        <div className="mt-1 text-xs text-gray-400">{o.notes}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zuletzt geliefert */}
      {deliveredOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h2 className="font-semibold text-gray-900">Zuletzt geliefert</h2>
          </div>
          <div className="space-y-1.5">
            {deliveredOrders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-gray-900 font-medium">{o.material_name}</span>
                  <span className="text-gray-400 ml-2">{o.quantity} {o.unit || "Stk"}</span>
                </div>
                <span className="text-xs text-gray-400">{o.order_date || ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}