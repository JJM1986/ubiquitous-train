import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const projectColors = [
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-yellow-100 text-yellow-700 border-yellow-200",
  "bg-teal-100 text-teal-700 border-teal-200",
];

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

export default function Einsatzplaner() {
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
    setEmployees(e.filter((emp) => emp.status === "aktiv"));
    setProjects(p);
    setLoading(false);
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const pmap = Object.fromEntries(projects.map((p) => [p.id, p.title]));
  const pColorMap = {};
  projects.forEach((p, i) => { pColorMap[p.id] = projectColors[i % projectColors.length]; });

  function getAssignmentsForDay(empId, dateStr) {
    return assignments.filter((a) => a.employee_id === empId && a.date === dateStr);
  }

  function prevWeek() { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }
  function nextWeek() { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">Einsatzplaner</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-medium text-gray-900">{fmtDisplay(weekStart)} – {fmtDisplay(weekDays[6])}</span>
            <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : employees.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine aktiven Mitarbeiter</p>
          </div>
        ) : (
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200 w-40">Mitarbeiter</th>
                {weekDays.map((d, i) => (
                  <th key={i} className="px-2 py-2 text-xs font-medium text-gray-500 border-b border-gray-200 text-center">
                    <div>{DAYS[i]}</div>
                    <div className="text-gray-400">{fmtDisplay(d)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-100">
                  <td className="px-3 py-2 text-sm text-gray-900 font-medium">{emp.first_name} {emp.last_name}</td>
                  {weekDays.map((d, i) => {
                    const dayAss = getAssignmentsForDay(emp.id, fmtDate(d));
                    return (
                      <td key={i} className="px-1 py-1 align-top">
                        <div className="space-y-1 min-h-[40px]">
                          {dayAss.map((a) => (
                            <div key={a.id} className={`text-xs px-2 py-1 rounded-lg border ${pColorMap[a.project_id] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                              <div className="font-medium truncate">{pmap[a.project_id] || "—"}</div>
                              {a.start_time && <div className="opacity-70">{a.start_time}{a.end_time ? `–${a.end_time}` : ""}</div>}
                              {a.task && <div className="opacity-60 truncate">{a.task}</div>}
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}