import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Clock, MapPin, Plus, Users, Globe, Mic, Shield } from "lucide-react";

const MEETINGS = [
    {
        id: "m1", title: "Budget Review with Finance Committee", type: "Scheduled", date: "2026-06-15", time: "10:49 AM",
        location: "Parliament House, Room 4B", attendees: "Finance Committee", status: "confirmed",
    },
    {
        id: "m2", title: "Town Hall — North District", type: "Scheduled", date: "2026-06-16", time: "10:49 AM",
        location: "North District Community Centre", attendees: "Community Leaders, Local Residents", status: "confirmed",
    },
    {
        id: "m3", title: "Press Briefing on Healthcare Policy", type: "Scheduled", date: "2026-06-17", time: "10:49 AM",
        location: "Press Conference Room", attendees: "Journalists, Communications Team", status: "confirmed",
    },
    {
        id: "m4", title: "Bilateral Meeting with Trade Delegation", type: "Scheduled", date: "2026-06-19", time: "10:49 AM",
        location: "State House", attendees: "Trade Minister, Foreign Delegation", status: "confirmed",
    }
];

export default function Meetings() {
    return (
        <DashboardLayout title="Meetings" subtitle="Schedule and track all official meetings.">
            <div className="space-y-8 max-w-6xl pb-12">
                
                {/* Upcoming */}
                <div>
                    <h2 className="text-gray-500 text-[11px] font-black tracking-[0.15em] uppercase mb-4 px-2">Upcoming (Next 7 Days)</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-2">
                        {MEETINGS.map(m => (
                            <div key={m.id} className="min-w-[320px] bg-white border border-gray-200 rounded-[2rem] p-6 flex-shrink-0 shadow-sm hover:border-red-200 transition-colors cursor-pointer group">
                                <h3 className="text-gray-900 font-bold text-sm mb-4 group-hover:text-[#B91C1C] transition-colors">{m.title}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>{new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}, {m.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                        <MapPin className="w-4 h-4 text-red-400" />
                                        <span>{m.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* All Meetings List */}
                <div>
                    <h2 className="text-gray-900 text-base font-bold mb-4 px-2">All Meetings</h2>
                    <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="divide-y divide-gray-100">
                            {[...MEETINGS].reverse().map((m) => (
                                <div key={m.id} className="p-6 md:p-8 flex flex-col gap-4 hover:bg-gray-50/80 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-base font-black text-gray-900 group-hover:text-[#B91C1C] transition-colors">{m.title}</h4>
                                        <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                                            {m.type}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-gray-300" />
                                            {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} {m.time}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-blue-400" />
                                            {m.attendees}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-red-400" />
                                            {m.location}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
