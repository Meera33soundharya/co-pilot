import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

interface Event {
    id: string;
    title: string;
    time: string;
    duration: string;
    location: string;
    type: "Meeting" | "Constituency Visit" | "Review" | "Public Session" | "Press Conference" | "Travel" | "Event";
}

const EVENTS: Event[] = [
    {
        id: "1", title: "Security Briefing", time: "Jun 14, 3:30 PM", duration: "1h",
        location: "Secure Briefing Room", type: "Meeting",
    },
    {
        id: "2", title: "Constituency Call — South Ward", time: "Jun 14, 8:00 PM", duration: "2h",
        location: "South Ward", type: "Constituency Visit",
    },
    {
        id: "3", title: "Evening Press Statement", time: "Jun 14, 10:30 PM", duration: "45m",
        location: "Parliament Forecourt", type: "Press Conference",
    },
    {
        id: "4", title: "Travel to Northern Province", time: "Jun 16, 10:49 AM", duration: "5h",
        location: "Northern Province", type: "Travel",
    },
    {
        id: "5", title: "Provincial Town Hall Address", time: "Jun 16, 9:49 PM", duration: "3h",
        location: "Provincial Hall, Northgate", type: "Event",
    }
];

const TYPE_COLORS: Record<string, string> = {
    "Meeting": "bg-blue-900/40 text-blue-400 border border-blue-800",
    "Constituency Visit": "bg-emerald-900/40 text-emerald-400 border border-emerald-800",
    "Press Conference": "bg-red-900/40 text-red-400 border border-red-800",
    "Travel": "bg-amber-900/40 text-amber-400 border border-amber-800",
    "Event": "bg-purple-900/40 text-purple-400 border border-purple-800",
};

export default function Schedule() {
    return (
        <DashboardLayout 
            title="Schedule" 
            subtitle="Your weekly calendar and event management."
        >
            <div className="space-y-8 max-w-6xl pb-12">
                
                {/* Weekly Calendar */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-white text-base font-bold">Week of June 8, 2026</h2>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="px-4 py-2 rounded-lg border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                                Today
                            </button>
                            <button className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-px bg-gray-800/50 rounded-xl overflow-hidden border border-gray-800/50">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="bg-[#111827] h-32 p-3 hover:bg-gray-800/30 transition-colors cursor-pointer">
                                {/* Empty boxes to match the screenshot */}
                            </div>
                        ))}
                    </div>
                </div>

                {/* All Events List */}
                <div>
                    <h3 className="text-white text-base font-bold mb-4">All Events</h3>
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="divide-y divide-gray-800/50">
                            {EVENTS.map((evt) => (
                                <div key={evt.id} className="p-6 flex items-center gap-6 hover:bg-gray-800/40 transition-colors cursor-pointer">
                                    <div className="w-40 flex-shrink-0">
                                        <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg ${TYPE_COLORS[evt.type] || "bg-gray-800 text-gray-300"}`}>
                                            {evt.type}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-200 mb-1">{evt.title}</h4>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {evt.time}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {evt.location}
                                            </span>
                                        </div>
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
