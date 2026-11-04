import { safeCall } from "@/lib/safeCall";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Plus, X, Check, Calendar, MapPin, User } from "lucide-react";

export default function Sicherheitsunterweisungen() {
  const [briefings, setBriefings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: "", topic: "", date: new Date().toISOString().split("T")[0],
    location: "", instructor: "", participants: [], notes: ""
  });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [bs, emps] = await Promise.all([
      base44.entities.Sicherheitsunterweisung.list("-date"),
      base44.entities.Employee.list(),
    ]);
    setBriefings(bs);
    setEmployees(emps);
    setLoading(false);
  }

  async function create() {
    await safeCall(() => base44.entities.Sicherheitsunterweisung.create({
      ...form,
      status: "Geplant",
    }), { fallback: null, message: "Speichern fehlgeschlagen." });
    setShowForm(false);
    setForm({ title: "", topic: "", date: new Date().toISOString().split("T")[0], location: "", instructor: "", participants: [], notes: "" });
    load();
  }

  async function sign(briefingId, idx) {
    const briefing = briefings.find(b => b.id === briefingId);
    if (!briefing) return;
    const participants = [...(briefing.participants || [])];
    participants[idx] = { ...participants[idx], signed: !participants[idx].signed, signed_at: !participants[idx].signed ? new Date().toISOString() : "" };
    const allSigned = participants.every(p => p.signed);
    const status = allSigned && participants.length > 0 ? "Durchgeführt" : "Geplant";
    await safeCall(() => base44.entities.Sicherheitsunterweisung.update(briefingId, { participants, status }), { fallback: null, message: "Aktualisieren fehlgeschlagen." });
    setBriefings(prev => prev.map(b => b.id === briefingId ? { ...b, participants, status } : b));
  }

  function addParticipant(name) {
    setForm(f => ({ ...f, participants: [...f.participants, { name, signed: false, signed_at: "" }] }));
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900">Sicherheitsunterweisungen</h1>
          <span className="text-xs text-gray-400">{briefings.length} Unterweisungen</span>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600">
          <Plus className="w-4 h-4" /> Neue Unterweisung
        </button>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {briefings.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">Noch keine Unterweisungen dokumentiert.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {briefings.map(b => {
              const signedCount = (b.participants || []).filter(p => p.signed).length;
              return (
                <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{b.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.status === "Durchgeführt" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{b.status}</span>
                      </div>
                      {b.topic && <div className="text-sm text-gray-500 mt-1">{b.topic}</div>}
                      <div className="flex gap-4 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.date}</span>
                        {b.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.location}</span>}
                        {b.instructor && <span className="flex items-center gap-1"><User className="w-3 h-3" />{b.instructor}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">{signedCount}/{(b.participants || []).length} unterschrieben</div>
                      {(b.participants || []).length > 0 && (
                        <button onClick={() => setSelected(selected === b.id ? null : b.id)} className="text-xs text-orange-500 font-medium hover:underline mt-1">
                          {selected === b.id ? "Ausblenden" : "Teilnehmer anzeigen"}
                        </button>
                      )}
                    </div>
                  </div>

                  {selected === b.id && (b.participants || []).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                      {b.participants.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                          <div>
                            <span className="text-sm text-gray-700">{p.name}</span>
                            {p.signed && p.signed_at && (
                              <span className="text-xs text-gray-400 ml-2">unterschrieben am {new Date(p.signed_at).toLocaleString("de-DE")}</span>
                            )}
                          </div>
                          <button
                            onClick={() => sign(b.id, idx)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              p.signed
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                            }`}
                          >
                            {p.signed ? (
                              <><Check className="w-3 h-3" /> Unterschrieben</>
                            ) : (
                              "Digital unterschreiben"
                            )}
                          </button>
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Neue Sicherheitsunterweisung</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Titel *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="z. B. Jahresunterweisung 2026" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Thema</label>
                <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="z. B. DGUV Vorschrift 38, Arbeitssicherheit" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Datum *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Ort</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Unterweiser</label>
                <input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Teilnehmer hinzufügen</label>
                <div className="flex gap-2 mt-1">
                  <select
                    onChange={e => { if (e.target.value) { addParticipant(e.target.value); e.target.value = ""; } }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
                    defaultValue=""
                  >
                    <option value="">Mitarbeiter auswählen…</option>
                    {employees.map(emp => <option key={emp.id} value={`${emp.first_name} ${emp.last_name}`.trim()}>{emp.first_name} {emp.last_name}</option>)}
                  </select>
                  <button
                    onClick={() => { const name = prompt("Teilnehmername:"); if (name) addParticipant(name); }}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                  >+ Manuell</button>
                </div>
                {form.participants.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.participants.map((p, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg flex items-center gap-1">
                        {p.name}
                        <button onClick={() => setForm(f => ({ ...f, participants: f.participants.filter((_, i) => i !== idx) }))} className="text-gray-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500">Notizen</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
            </div>
            <button onClick={create} disabled={!form.title} className="w-full mt-4 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50">Unterweisung anlegen</button>
          </div>
        </div>
      )}
    </div>
  );
}