import React, { useState, useEffect } from "react";
import { Calendar, Users, MapPin, Plus, Trash2, X } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

interface Meeting {
  id: number;
  title: string;
  status: "Scheduled" | "Completed";
  date: string;
  attendees: string;
  location: string;
}

const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 1,
    title: "Bilateral Meeting with Trade Delegation",
    status: "Scheduled",
    date: "Jun 19, 2026 10:49 AM",
    attendees: "Trade Minister, Foreign Delegation",
    location: "State House"
  },
  {
    id: 2,
    title: "Press Briefing on Healthcare Policy",
    status: "Scheduled",
    date: "Jun 17, 2026 10:49 AM",
    attendees: "Journalists, Communications Team",
    location: "Press Conference Room"
  },
  {
    id: 3,
    title: "Town Hall — North District",
    status: "Scheduled",
    date: "Jun 16, 2026 10:49 AM",
    attendees: "Community Leaders, Local Residents",
    location: "North District Community Centre"
  },
  {
    id: 4,
    title: "Budget Review with Finance Committee",
    status: "Scheduled",
    date: "Jun 15, 2026 10:49 AM",
    attendees: "Finance Minister, Treasury Officials",
    location: "Parliament House, Room 4B"
  },
  {
    id: 5,
    title: "Party Leadership Caucus",
    status: "Completed",
    date: "Jun 9, 2026 10:49 AM",
    attendees: "Party Whip, Senior MPs",
    location: "Party HQ"
  }
];

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem("politico_meetings");
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newAttendees, setNewAttendees] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newStatus, setNewStatus] = useState<"Scheduled" | "Completed">("Scheduled");

  useEffect(() => {
    localStorage.setItem("politico_meetings", JSON.stringify(meetings));
  }, [meetings]);

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const newMeeting: Meeting = {
      id: Date.now(),
      title: newTitle,
      status: newStatus,
      date: newDate,
      attendees: newAttendees || "None specified",
      location: newLocation || "Virtual / TBD"
    };

    setMeetings(prev => [newMeeting, ...prev]);
    setNewTitle("");
    setNewDate("");
    setNewAttendees("");
    setNewLocation("");
    setNewStatus("Scheduled");
    setShowAddForm(false);
  };

  const handleDeleteMeeting = (id: number) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  return (
    <DashboardLayout title="Meetings" subtitle="Manage meetings, agendas & minutes">
      <div className="max-w-5xl mx-auto px-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">All Meetings</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMeetings([])} 
              className="flex items-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
            >
              <Trash2 className="w-4 h-4" /> Delete All
            </button>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="flex items-center gap-3 bg-[#B91C1C] hover:bg-[#991717] text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
              <Plus className="w-4 h-4" /> New Meeting
            </button>
          </div>
        </div>
        
        {/* Create Meeting Overlay Form */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-500" /> Schedule Meeting
                </h3>
                <button 
                  onClick={() => setShowAddForm(false)} 
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMeeting} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-500">Meeting Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Budget Review with Committee" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-500">Date & Time *</label>
                  <input 
                    type="text" 
                    required 
                    value={newDate} 
                    onChange={e => setNewDate(e.target.value)}
                    placeholder="e.g. Jun 19, 2026 10:49 AM" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-500">Attendees</label>
                  <input 
                    type="text" 
                    value={newAttendees} 
                    onChange={e => setNewAttendees(e.target.value)}
                    placeholder="e.g. Senior MPs, Ministers" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-500">Location</label>
                    <input 
                      type="text" 
                      value={newLocation} 
                      onChange={e => setNewLocation(e.target.value)}
                      placeholder="e.g. Room 4B, Parliament" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 transition-all placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-500">Status</label>
                    <select 
                      value={newStatus} 
                      onChange={e => setNewStatus(e.target.value as "Scheduled" | "Completed")}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 transition-all"
                    >
                      <option>Scheduled</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-base font-black uppercase tracking-widest transition-all rounded-xl shadow-lg shadow-red-950/20 active:scale-95"
                >
                  Schedule Meeting
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div 
              key={meeting.id} 
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all flex items-start justify-between group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {meeting.title}
                  </h3>
                  <span 
                    className={`px-3 py-1 rounded-full text-base font-medium border ${
                      meeting.status === 'Scheduled' 
                        ? 'bg-blue-50 text-blue-600 border-blue-100' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}
                  >
                    {meeting.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-lg text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {meeting.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    {meeting.attendees}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {meeting.location}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleDeleteMeeting(meeting.id)}
                className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0 self-center"
                title="Delete Meeting"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
