import React from "react";
import { Clock, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

const EVENTS = [
  {
    id: 1,
    title: "Security Briefing",
    type: "Meeting",
    typeColor: "bg-blue-900/30 text-blue-400 border-blue-800/50",
    time: "Jun 14, 3:30 PM",
    location: "Secure Briefing Room"
  },
  {
    id: 2,
    title: "Constituency Call — South Ward",
    type: "Constituency Visit",
    typeColor: "bg-green-900/30 text-emerald-400 border-green-800/50",
    time: "Jun 14, 8:00 PM",
    location: null
  },
  {
    id: 3,
    title: "Evening Press Statement",
    type: "Press Conference",
    typeColor: "bg-red-900/30 text-red-400 border-red-800/50",
    time: "Jun 14, 10:30 PM",
    location: "Parliament Forecourt"
  },
  {
    id: 4,
    title: "Travel to Northern Province",
    type: "Travel",
    typeColor: "bg-yellow-900/30 text-yellow-500 border-yellow-800/50",
    time: "Jun 16, 10:49 AM",
    location: null
  }
];

export default function Schedule() {
  return (
    <DashboardLayout title="POLITICO AI" subtitle="OPERATIONS">
      <div className="max-w-5xl mx-auto space-y-6 px-2">
        {/* Calendar Navigation Block */}
        <div className="bg-[#0B1120] border border-[#1E293B] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Week of June 8, 2026</h2>
            <div className="flex gap-3">
              <button className="w-10 h-10 flex justify-center items-center rounded border border-[#1E293B] text-white hover:bg-[#1E293B] transition-colors">
                &lt;
              </button>
              <button className="px-5 py-2 rounded border border-[#1E293B] text-sm text-white hover:bg-[#1E293B] transition-colors">
                Today
              </button>
              <button className="w-10 h-10 flex justify-center items-center rounded border border-[#1E293B] text-white hover:bg-[#1E293B] transition-colors">
                &gt;
              </button>
            </div>
          </div>
          
          {/* Day blocks placeholder */}
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i} 
                className="h-28 bg-[#0F172A] rounded-xl border border-[#1E293B]"
              />
            ))}
          </div>
        </div>

        {/* All Events List */}
        <div className="bg-[#0B1120] border border-[#1E293B] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">All Events</h2>
          
          <div className="space-y-4">
            {EVENTS.map((event) => (
              <div 
                key={event.id} 
                className="flex flex-col sm:flex-row sm:items-center gap-6 py-4 border-b border-[#1E293B]/50 last:border-0 hover:bg-[#0F172A] rounded-xl p-4 transition-colors"
              >
                <div className="shrink-0 w-36">
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold border ${event.typeColor}`}>
                    {event.type}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white mb-2">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-400">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
