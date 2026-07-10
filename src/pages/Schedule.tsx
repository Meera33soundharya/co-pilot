import React, { useState, useEffect, useMemo } from "react";
import { Clock, MapPin, Plus, Trash2, Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

interface ScheduleEvent {
  id: number;
  title: string;
  type: string;
  typeColor: string;
  date: string;   // ISO format: YYYY-MM-DD
  time: string;   // 24h HH:MM
  location: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  "Meeting":            "bg-blue-50 text-blue-700 border-blue-200",
  "Constituency Visit": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Press Conference":   "bg-red-50 text-red-700 border-red-200",
  "Travel":             "bg-amber-50 text-amber-700 border-amber-200",
  "Inspection":         "bg-purple-50 text-purple-700 border-purple-200",
  "Other":              "bg-gray-50 text-gray-700 border-gray-200",
};

const TYPE_DOT: Record<string, string> = {
  "Meeting":            "bg-blue-500",
  "Constituency Visit": "bg-emerald-500",
  "Press Conference":   "bg-red-500",
  "Travel":             "bg-amber-500",
  "Inspection":         "bg-purple-500",
  "Other":              "bg-gray-400",
};

// ── Date helpers ────────────────────────────────────────────────
function getMonday(d: Date): Date {
  const dt = new Date(d);
  const day = dt.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function addDays(d: Date, n: number): Date {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatTime(hhmm: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function todayISO(): string {
  return toISODate(new Date());
}

// ── Migrate legacy events that have a string like "Jun 14, 3:30 PM" ──
function migrateLegacy(events: any[]): ScheduleEvent[] {
  return events.map(e => {
    if (e.date) return e as ScheduleEvent; // already new format
    // Old format: time = "Jun 14, 3:30 PM"
    const match = (e.time as string).match(/^(\w+)\s+(\d+),\s+(\d+):(\d+)\s+(AM|PM)$/i);
    let isoDate = todayISO();
    let isoTime = "09:00";
    if (match) {
      const [, mon, dayStr, hStr, mStr, ampm] = match;
      const year = new Date().getFullYear();
      const parsed = new Date(`${mon} ${dayStr} ${year}`);
      isoDate = toISODate(isNaN(parsed.getTime()) ? new Date() : parsed);
      let h = parseInt(hStr);
      if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
      if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
      isoTime = `${String(h).padStart(2, "0")}:${mStr}`;
    }
    return {
      id: e.id,
      title: e.title,
      type: e.type,
      typeColor: TYPE_COLORS[e.type] || TYPE_COLORS["Other"],
      date: isoDate,
      time: isoTime,
      location: e.location ?? null,
    } as ScheduleEvent;
  });
}

// ── Component ───────────────────────────────────────────────────
export default function Schedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    try {
      const saved = localStorage.getItem("politico_events_v2");
      if (saved) return migrateLegacy(JSON.parse(saved));
      // Try migrating old key
      const old = localStorage.getItem("politico_events");
      if (old) return migrateLegacy(JSON.parse(old));
    } catch { /* ignore */ }
    return [];
  });

  // The Monday of the currently displayed week
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newTitle, setNewTitle]     = useState("");
  const [newType, setNewType]       = useState("Meeting");
  const [newDate, setNewDate]       = useState(todayISO);
  const [newTime, setNewTime]       = useState("09:00");
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    localStorage.setItem("politico_events_v2", JSON.stringify(events));
  }, [events]);

  // Build this week's 7 days
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      return {
        iso: toISODate(d),
        dayName: d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase(),
        date: d.getDate(),
      };
    }),
    [weekStart]
  );

  const today = todayISO();

  // Week label
  const weekLabel = useMemo(() => {
    const from = weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    return `Week of ${from}`;
  }, [weekStart]);

  // Navigation
  const goToPrevWeek = () => setWeekStart(d => addDays(d, -7));
  const goToNextWeek = () => setWeekStart(d => addDays(d, 7));
  const goToToday   = () => setWeekStart(getMonday(new Date()));

  // Add event
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate || !newTime) return;

    const newEvent: ScheduleEvent = {
      id: Date.now(),
      title: newTitle.trim(),
      type: newType,
      typeColor: TYPE_COLORS[newType] || TYPE_COLORS["Other"],
      date: newDate,
      time: newTime,
      location: newLocation.trim() || null,
    };

    setEvents(prev => [...prev, newEvent].sort((a, b) =>
      a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    ));

    // Navigate to the week containing the new event
    setWeekStart(getMonday(new Date(newDate + "T00:00:00")));

    setNewTitle(""); setNewTime("09:00"); setNewDate(todayISO()); setNewLocation("");
    setShowAddForm(false);
  };

  const handleDeleteEvent = (id: number) => setEvents(prev => prev.filter(e => e.id !== id));

  // All events sorted
  const sortedEvents = useMemo(() =>
    [...events].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [events]
  );

  return (
    <DashboardLayout title="Schedule" subtitle="Operational event calendar">
      <div className="max-w-5xl mx-auto space-y-6 px-2">

        {/* ── Calendar Block ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-bold text-gray-900">{weekLabel}</h2>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setEvents([])}
                className="px-4 py-2 flex items-center gap-2 rounded bg-red-500/10 text-sm font-bold text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors active:scale-95"
              >
                <Trash2 className="w-4 h-4" /> Delete All
              </button>
              <button
                onClick={() => { setNewDate(today); setShowAddForm(true); }}
                className="px-4 py-2 flex items-center gap-2 rounded bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Event
              </button>

              {/* Navigation */}
              <button
                onClick={goToPrevWeek}
                className="w-9 h-9 flex justify-center items-center rounded border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                title="Previous week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 rounded border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNextWeek}
                className="w-9 h-9 flex justify-center items-center rounded border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                title="Next week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day blocks */}
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map(day => {
              const dayEvents = events.filter(e => e.date === day.iso);
              const isToday = day.iso === today;
              return (
                <div
                  key={day.iso}
                  onClick={() => { setNewDate(day.iso); setShowAddForm(true); }}
                  className={`h-28 rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer hover:bg-gray-50 ${
                    isToday
                      ? "bg-blue-50/50 border-blue-500 shadow-lg shadow-blue-500/20"
                      : "bg-white border-gray-100"
                  }`}
                  title={`Add event on ${day.iso}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {day.dayName}
                    </span>
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl font-bold ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                      {day.date}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-1 h-1">
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        className={`flex-1 rounded-full ${TYPE_DOT[ev.type] || "bg-gray-400"}`}
                        title={ev.title}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Add Event Modal ── */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-500" /> Create Operational Event
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Press Statement or Security Briefing"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>

                {/* Type + Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Type *</label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value)}
                      className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    >
                      {Object.keys(TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Date *</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Time *</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Location (Optional)</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    placeholder="e.g. Secure Briefing Room"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-base font-black uppercase tracking-widest transition-all rounded-xl shadow-lg shadow-red-950/20 active:scale-95"
                >
                  Save Operational Event
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── All Events List ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">All Events</h2>

          {sortedEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">No events yet. Click any day or "Add Event" to create one.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedEvents.map(event => (
                <div
                  key={event.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-xl px-3 transition-colors group"
                >
                  <div className="shrink-0 w-36">
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold border ${event.typeColor}`}>
                      {event.type}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{formatDisplayDate(event.date)}, {formatTime(event.time)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 self-end sm:self-center"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
