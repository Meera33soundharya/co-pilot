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
                    <h2 className="text-gray-400 text-[11px] font-black tracking-[0.15em] uppercase mb-4">Upcoming (Next 7 Days)</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                        {MEETINGS.map(m => (
                            <div key={m.id} className="min-w-[320px] bg-[#111827] border border-gray-800 rounded-2xl p-5 flex-shrink-0 shadow-lg hover:border-gray-700 transition-colors cursor-pointer">
                                <h3 className="text-white font-bold text-sm mb-3">{m.title}</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}, {m.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{m.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* All Meetings List */}
                <div>
                    <h2 className="text-white text-base font-bold mb-4">All Meetings</h2>
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="divide-y divide-gray-800/50">
                            {[...MEETINGS].reverse().map((m) => (
                                <div key={m.id} className="p-6 flex flex-col gap-3 hover:bg-gray-800/40 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-sm font-bold text-gray-200">{m.title}</h4>
                                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-blue-900/40 text-blue-400 border border-blue-800/50">
                                            {m.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} {m.time}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" />
                                            {m.attendees}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" />
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
