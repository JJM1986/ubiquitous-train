import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Wrench, Plus, X, Phone, Mail, Briefcase } from "lucide-react";
import { toast } from "sonner";

const statusColors = {
  "aktiv": "bg-green-100 text-green-700",
  "inaktiv": "bg-gray-100 text-gray-500",
};

const einsatzColors = {
  "Geplant": "bg-gray-100 text-gray-600",
  "In Arbeit": "bg-orange-100 text-orange-700",
  "Abgeschlossen": "bg-green-100 text-green-700",
};

export default function SubunternehmerPortal() {
  const [subs, setSubs] = useState([]);
  const [einsaetze, setEinsaetze] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEinsatz, setShowEinsatz] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [form, setForm] = useState({ company_name: "", contact_person: "", email: "", phone: "", address: "", trade: "", hourly_rate: "", status: "aktiv", notes: "" });
  const [einsatzForm, setEinsatzForm] = useState({ subcontractor_id: "", project_id: "", date: new Date().toISOString().split("T")[0], task: "", hours: "", cost: "", status: "Geplant", notes: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [s, e, p] = await Promise.all([
      base44.entities.Subunternehmer.list(),
      base44.entities.SubunternehmerEinsatz.list("-date"),
      base44.entities.Project.list(),
    ]);
    setSubs(s);
    setEinsaetze(e);
    setProjects(p);
    setLoading(false);
  }

  async function create() {
    await safeCall(() => base44.entities.Subunternehmer.create(form), { fallback: null, message: "Speichern fehlgeschlagen." });
    setShowForm(false);
    setForm({ company_name: "", contact_person: "", email: "", phone: "", address: "", trade: "", hourly_rate: "", status: "aktiv", notes: "" });
    load();
  }

  async function createEinsatz() {
    const sub = subs.find(s => s.id === einsatzForm.subcontractor_id);
    const proj = projects.find(p => p.id === einsatzForm.project_id);
    await safeCall(() => base44.entities.SubunternehmerEinsatz.create({
      ...einsatzForm,
      subcontractor_name: sub?.company_name || "",
      project_name: proj?.title || "",
      hours: parseFloat(einsatzForm.hours) || 0,
      cost: parseFloat(einsatzForm.cost) || 0,
    }), { fallback: null, message: "Speichern fehlgeschlagen." });
    setShowEinsatz(false);
    setEinsatzForm({ subcontractor_id: "", project_id: "", date: new Date().toISOString().split("T")[0], task: "", hours: "", cost: "", status: "Geplant", notes: "" });
    load();
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>;

  const subEinsaetze = selectedSub ? einsaetze.filter(e => e.subcontractor_id === selectedSub) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900">Subunternehmer-Portal</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEinsatz(true)} className="flex items-center gap-1 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50">
            <Briefcase className="w-4 h-4" /> Einsatz planen
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600">
            <Plus className="w-4 h-4" /> Subunternehmer
          </button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {subs.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">Noch keine Subunternehmer angelegt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subs.map(s => {
              const subEins = einsaetze.filter(e => e.subcontractor_id === s.id);
              const totalCost = subEins.reduce((sum, e) => sum + (e.cost || 0), 0);
              return (
                <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{s.company_name}</div>
                      {s.contact_person && <div className="text-sm text-gray-500">{s.contact_person}</div>}
                      {s.trade && <span className="text-xs text-orange-500 font-medium">{s.trade}</span>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[s.status]}`}>{s.status}</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500 mb-3">
                    {s.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</div>}
                    {s.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</div>}
                    {s.hourly_rate && <div>Stundensatz: {s.hourly_rate} €</div>}
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                    <button onClick={() => setSelectedSub(selectedSub === s.id ? null : s.id)} className="text-orange-500 font-medium hover:underline">
                      {subEins.length} Einsätze · {totalCost.toFixed(0)} €
                    </button>
                  </div>
                  {selectedSub === s.id && subEins.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {subEins.map(e => (
                        <div key={e.id} className="bg-gray-50 rounded-lg p-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-700 font-medium">{e.project_name || "—"}</span>
                            <span className={`px-1.5 py-0.5 rounded ${einsatzColors[e.status]}`}>{e.status}</span>
                          </div>
                          <div className="text-gray-400 mt-0.5">{e.date} · {e.task || "Einsatz"} · {e.hours} Std · {e.cost} €</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subunternehmer Form */}
      {showForm && (
        <Modal title="Neuer Subunternehmer" onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <Field label="Firma *" value={form.company_name} onChange={v => setForm(f => ({ ...f, company_name: v }))} />
            <Field label="Ansprechpartner" value={form.contact_person} onChange={v => setForm(f => ({ ...f, contact_person: v }))} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Telefon" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
              <Field label="E-Mail" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
            </div>
            <Field label="Adresse" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Gewerk" value={form.trade} onChange={v => setForm(f => ({ ...f, trade: v }))} />
              <Field label="Stundensatz (€)" type="number" value={form.hourly_rate} onChange={v => setForm(f => ({ ...f, hourly_rate: parseFloat(v) || 0 }))} />
            </div>
          </div>
          <button onClick={create} disabled={!form.company_name} className="w-full mt-4 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50">Anlegen</button>
        </Modal>
      )}

      {/* Einsatz Form */}
      {showEinsatz && (
        <Modal title="Subunternehmer-Einsatz planen" onClose={() => setShowEinsatz(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Subunternehmer</label>
              <select value={einsatzForm.subcontractor_id} onChange={e => setEinsatzForm(f => ({ ...f, subcontractor_id: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                <option value="">Wählen…</option>
                {subs.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Projekt</label>
              <select value={einsatzForm.project_id} onChange={e => setEinsatzForm(f => ({ ...f, project_id: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                <option value="">Wählen…</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <Field label="Datum" type="date" value={einsatzForm.date} onChange={v => setEinsatzForm(f => ({ ...f, date: v }))} />
            <Field label="Leistung" value={einsatzForm.task} onChange={v => setEinsatzForm(f => ({ ...f, task: v }))} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stunden" type="number" value={einsatzForm.hours} onChange={v => setEinsatzForm(f => ({ ...f, hours: v }))} />
              <Field label="Kosten (€)" type="number" value={einsatzForm.cost} onChange={v => setEinsatzForm(f => ({ ...f, cost: v }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <select value={einsatzForm.status} onChange={e => setEinsatzForm(f => ({ ...f, status: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300">
                <option>Geplant</option><option>In Arbeit</option><option>Abgeschlossen</option>
              </select>
            </div>
          </div>
          <button onClick={createEinsatz} disabled={!einsatzForm.subcontractor_id} className="w-full mt-4 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50">Einsatz anlegen</button>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
    </div>
  );
}