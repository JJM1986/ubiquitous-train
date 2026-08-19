import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { downloadCSV, dateStr } from "@/lib/csvExport";
import { CalendarClock, Download, ChevronLeft, ChevronRight } from "lucide-react";

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDate(d) {
  return d.toISOString().split("T")[0];
}

function fmtDisplay(d) {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

function getWeekNumber(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

export default function Wochenauswertung() {
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [a, e, p] = await Promise.all([
      base44.entities.Assignment.list("-created_date", 500),
      base44.entities.Employee.list(),
      base44.entities.Project.list(),
    ]);
    setAssignments(a);
    setEmployees(e);
    setProjects(p);
    setLoading(false);
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekAssignments = assignments.filter((a) => {
    if (!a.date) return false;
    const d = new Date(a.date);
    return d >= weekStart && d <= weekEnd;
  });

  const pmap = Object.fromEntries(projects.map((p) => [p.id, p.title]));

  // Group by employee, then by project
  const byEmployee = {};
  weekAssignments.forEach((a) => {
    const eid = a.employee_id || "ohne";
    if (!byEmployee[eid]) byEmployee[eid] = { projects: {}, total: 0 };
    const pid = a.project_id || "ohne";
    if (!byEmployee[eid].projects[pid]) byEmployee[eid].projects[pid] = 0;
    byEmployee[eid].projects[pid] += a.hours || 0;
    byEmployee[eid].total += a.hours || 0;
  });

  const empList = employees
    .filter((e) => byEmployee[e.id])
    .map((e) => ({ ...e, name: `${e.first_name} ${e.last_name}`, ...byEmployee[e.id] }));

  const grandTotal = empList.reduce((s, e) => s + e.total, 0);

  function prevWeek() { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }
  function nextWeek() { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }

  function exportCSV() {
    const rows = [];
    empList.forEach((emp) => {
      Object.entries(emp.projects).forEach(([pid, hours]) => {
        rows.push([fmtDate(weekStart), fmtDate(weekEnd), emp.name, pmap[pid] || "Ohne Projekt", hours]);
      });
    });
    downloadCSV(`Wochenauswertung_${fmtDate(weekStart)}.csv`,
      ["Woche_von", "Woche_bis", "Mitarbeiter", "Projekt", "Stunden"], rows);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">Wochenauswertung</h1>
          </div>
          <button onClick={exportCSV} disabled={empList.length === 0} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
            <Download className="w-4 h-4" /> CSV Export
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium text-gray-900">
            KW {getWeekNumber(weekStart)} · {fmtDisplay(weekStart)} – {fmtDisplay(weekEnd)}
          </span>
          <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : empList.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Einsätze in dieser Woche</p>
          </div>
        ) : (
          <div className="space-y-3">
            {empList.map((emp) => (
              <div key={emp.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">{emp.name}</h3>
                  <span className="text-xs text-orange-500 font-medium">{emp.total} Std. gesamt</span>
                </div>
                <div className="p-3 space-y-1.5">
                  {Object.entries(emp.projects).map(([pid, hours]) => (
                    <div key={pid} className="flex items-center justify-between px-2 py-1.5 bg-gray-50/50 rounded-lg">
                      <span className="text-sm text-gray-700">{pmap[pid] || "Ohne Projekt"}</span>
                      <span className="text-sm font-semibold text-gray-900">{hours} Std.</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="bg-orange-50 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Gesamt alle Mitarbeiter</span>
              <span className="text-lg font-bold text-orange-600">{grandTotal} Std.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}