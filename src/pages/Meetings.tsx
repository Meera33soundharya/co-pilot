import React from "react";
import { Calendar, Users, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

const MEETINGS = [
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
  return (
    <DashboardLayout title="Meetings" subtitle="Manage meetings, agendas & minutes">
      <div className="max-w-5xl mx-auto px-2">
        <h2 className="text-xl font-bold text-white mb-6">All Meetings</h2>
        
        <div className="space-y-4">
          {MEETINGS.map((meeting) => (
            <div 
              key={meeting.id} 
              className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-5 hover:bg-[#111827] transition-colors"
            >
              <div className="flex items-center gap-4 mb-3">
                <h3 className="text-base font-semibold text-white">
                  {meeting.title}
                </h3>
                <span 
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    meeting.status === 'Scheduled' 
                      ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' 
                      : 'bg-green-900/30 text-emerald-400 border-green-800/50'
                  }`}
                >
                  {meeting.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-400">
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
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
