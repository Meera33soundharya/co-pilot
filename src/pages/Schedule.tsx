import React, { useState, useEffect } from "react";
import { Clock, MapPin, Plus, Trash2, Calendar, X } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

interface ScheduleEvent {
  id: number;
  title: string;
  type: string;
  typeColor: string;
  time: string;
  location: string | null;
}

const INITIAL_EVENTS: ScheduleEvent[] = [
  {
    id: 1,
    title: "Security Briefing",
    type: "Meeting",
    typeColor: "bg-blue-50 text-blue-700 border-blue-200",
    time: "Jun 14, 3:30 PM",
    location: "Secure Briefing Room"
  },
  {
    id: 2,
    title: "Constituency Call — South Ward",
    type: "Constituency Visit",
    typeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    time: "Jun 14, 8:00 PM",
    location: null
  },
  {
    id: 3,
    title: "Evening Press Statement",
    type: "Press Conference",
    typeColor: "bg-red-50 text-red-700 border-red-200",
    time: "Jun 14, 10:30 PM",
    location: "Parliament Forecourt"
  },
  {
    id: 4,
    title: "Travel to Northern Province",
    type: "Travel",
    typeColor: "bg-amber-50 text-amber-700 border-amber-200",
    time: "Jun 16, 10:49 AM",
    location: null
  }
];

const TYPE_COLORS: Record<string, string> = {
  "Meeting": "bg-blue-50 text-blue-700 border-blue-200",
  "Constituency Visit": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Press Conference": "bg-red-50 text-red-700 border-red-200",
  "Travel": "bg-amber-50 text-amber-700 border-amber-200"
};

const DAYS = [
  { name: "Mon", date: 8 },
  { name: "Tue", date: 9 },
  { name: "Wed", date: 10 },
  { name: "Thu", date: 11 },
  { name: "Fri", date: 12 },
  { name: "Sat", date: 13 },
  { name: "Sun", date: 14 }
];

export default function Schedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem("politico_events");
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Meeting");
  const [newDate, setNewDate] = useState("14");
  const [newTime, setNewTime] = useState("");
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    localStorage.setItem("politico_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    const hasLegacyColors = events.some(e => e.typeColor.includes("900/30"));
    if (hasLegacyColors) {
      setEvents(events.map(e => ({
        ...e,
        typeColor: TYPE_COLORS[e.type] || TYPE_COLORS["Meeting"]
      })));
    }
  }, []);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTime) return;

    const newEvent: ScheduleEvent = {
      id: Date.now(),
      title: newTitle,
      type: newType,
      typeColor: TYPE_COLORS[newType] || TYPE_COLORS["Meeting"],
      time: `Jun ${newDate}, ${newTime}`,
      location: newLocation.trim() || null
    };

    setEvents(prev => [...prev, newEvent]);
    setNewTitle("");
    setNewTime("");
    setNewLocation("");
    setShowAddForm(false);
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <DashboardLayout title="POLITICO AI" subtitle="OPERATIONS">
      <div className="max-w-5xl mx-auto space-y-6 px-2">
        {/* Calendar Navigation Block */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Week of June 8, 2026</h2>
            <div className="flex gap-3">
              <button 
                onClick={() => setEvents([])} 
                className="px-4 py-2 flex items-center gap-2 rounded bg-red-500/10 text-lg font-bold text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors active:scale-95"
              >
                <Trash2 className="w-4 h-4" /> Delete All
              </button>
              <button 
                onClick={() => setShowAddForm(true)} 
                className="px-4 py-2 flex items-center gap-2 rounded bg-red-600 text-lg font-bold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Event
              </button>
              <button className="w-10 h-10 flex justify-center items-center rounded border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                &lt;
              </button>
              <button className="px-5 py-2 rounded border border-gray-200 text-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Today
              </button>
              <button className="w-10 h-10 flex justify-center items-center rounded border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                &gt;
              </button>
            </div>
          </div>
          
          {/* Day blocks */}
          <div className="grid grid-cols-7 gap-4">
            {DAYS.map((day, i) => {
              const dateStr = `Jun ${day.date}`;
              const dayEvents = events.filter(e => e.time.includes(dateStr));
              const isToday = day.date === 14;

              return (
                <div 
                  key={i} 
                  className={`h-28 rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer hover:bg-gray-50 ${
                    isToday 
                      ? "bg-blue-50/50 border-blue-500 shadow-lg shadow-blue-500/20" 
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-400 uppercase tracking-wider">
                      {day.name}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    )}
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
                    {dayEvents.map(e => (
                      <div 
                        key={e.id} 
                        className={`flex-1 rounded-full ${
                          e.type === "Meeting" ? "bg-blue-500" :
                          e.type === "Constituency Visit" ? "bg-emerald-500" :
                          e.type === "Press Conference" ? "bg-red-500" :
                          "bg-yellow-500"
                        }`}
                        title={e.title}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Event Dialog/Panel overlay */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-500" /> Create Operational Event
                </h3>
                <button 
                  onClick={() => setShowAddForm(false)} 
                  className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-400">Event Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Press Statement or Security Briefing" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Type *</label>
                    <select 
                      value={newType} 
                      onChange={e => setNewType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    >
                      <option>Meeting</option>
                      <option>Constituency Visit</option>
                      <option>Press Conference</option>
                      <option>Travel</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Date *</label>
                    <select 
                      value={newDate} 
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    >
                      {DAYS.map(d => (
                        <option key={d.date} value={d.date}>Jun {d.date} ({d.name})</option>
                      ))}
                      <option value="16">Jun 16 (Tue)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-400">Time *</label>
                  <input 
                    type="text" 
                    required 
                    value={newTime} 
                    onChange={e => setNewTime(e.target.value)}
                    placeholder="e.g. 10:30 AM or 3:00 PM" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-400">Location (Optional)</label>
                  <input 
                    type="text" 
                    value={newLocation} 
                    onChange={e => setNewLocation(e.target.value)}
                    placeholder="e.g. Secure Briefing Room" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
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

        {/* All Events List */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">All Events</h2>
          
          <div className="space-y-4">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="flex flex-col sm:flex-row sm:items-center gap-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-xl p-4 transition-colors group"
              >
                <div className="shrink-0 w-36">
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-base font-semibold border ${event.typeColor}`}>
                    {event.type}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 truncate">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-lg text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {event.time}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteEvent(event.id)}
                  className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 self-end sm:self-center"
                  title="Delete Event"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
