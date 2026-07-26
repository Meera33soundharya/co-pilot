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
                <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-gray-900 text-lg font-black tracking-tight">Week of June 8, 2026</h2>
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-black text-gray-600 hover:bg-gray-50 hover:text-gray-900 uppercase tracking-widest transition-colors">
                                Today
                            </button>
                            <button className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="bg-white h-32 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer">
                                {/* Empty boxes */}
                            </div>
                        ))}
                    </div>
                </div>

                {/* All Events List */}
                <div>
                    <h3 className="text-white text-base font-bold mb-4 px-2">All Events</h3>
                    <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="divide-y divide-gray-100">
                            {EVENTS.map((evt) => (
                                <div key={evt.id} className="p-6 md:p-8 flex items-center gap-6 hover:bg-gray-50/80 transition-all cursor-pointer group">
                                    <div className="w-40 flex-shrink-0">
                                        <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-full ${TYPE_COLORS[evt.type] || "bg-gray-100 text-gray-600"}`}>
                                            {evt.type}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-[#B91C1C] transition-colors">{evt.title}</h4>
                                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4 text-gray-300" />
                                                {evt.time}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-red-400" />
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
