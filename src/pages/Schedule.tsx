import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import {
    Clock, MapPin, Users,
    Plus, ChevronLeft, ChevronRight, MoreVertical,
    CheckCircle2, AlertCircle, Search, Filter
} from "lucide-react";

interface Event {
    id: string;
    title: string;
    time: string;
    duration: string;
    location: string;
    type: "Meeting" | "Site Visit" | "Review" | "Public Session";
    status: "Confirmed" | "Tentative" | "Critical";
    attendees: string[];
}

const scheduleEvents: Event[] = [
    {
        id: "1",
        title: "Ward 03 Area Inspection",
        time: "10:30 AM",
        duration: "1h 30m",
        location: "Ward 03 Main Square",
        type: "Site Visit",
        status: "Confirmed",
        attendees: ["Ramesh K.", "Sarah L.", "Admin"]
    },
    {
        id: "2",
        title: "Public Hearing: New Park",
        time: "02:00 PM",
        duration: "2h 00m",
        location: "Town Hall Room 4",
        type: "Public Session",
        status: "Critical",
        attendees: ["Community Leaders", "Admin"]
    },
    {
        id: "3",
        title: "Weekly Staff Review",
        time: "04:30 PM",
        duration: "45m",
        location: "Meeting Room B",
        type: "Review",
        status: "Tentative",
        attendees: ["Team Leads", "Admin"]
    },
    {
        id: "4",
        title: "Budget Planning Session",
        time: "09:00 AM",
        duration: "30m",
        location: "Office / Video Call",
        type: "Meeting",
        status: "Confirmed",
        attendees: ["Finance Dept", "Admin"]
    }
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Schedule() {
    const [view, setView] = useState<"Day" | "Week" | "Month">("Day");

    return (
        <DashboardLayout 
            title="Meeting Schedule" 
            subtitle="Manage your daily appointments and field visits"
            bgImage="/images/dashboard_bg.png"
        >
            <div className="space-y-6 pb-12">
                
                {/* Schedule Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-1.5 shadow-inner">
                        {["Day", "Week", "Month"].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v as any)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? "bg-white text-gray-900 shadow-md" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search appointments..."
                                className="pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:bg-white focus:border-red-100 transition-all min-w-[300px]"
                            />
                        </div>
                        <button className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-[#B91C1C] hover:bg-white transition-all shadow-sm">
                            <Filter className="w-5 h-5" />
                        </button>
                        <button className="flex items-center gap-3 px-8 py-3.5 bg-[#B91C1C] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-red-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <Plus className="w-4 h-4" />
                            Add Meeting
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    
                    {/* Left Column: Calendar Mini-View */}
                    <div className="xl:col-span-1 space-y-8">
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-gray-900">March 2026</h3>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                    <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-4">
                                {dayNames.map(d => (
                                    <div key={d} className="text-[9px] font-black uppercase text-gray-300 text-center py-2">{d}</div>
                                ))}
                                {Array.from({ length: 31 }).map((_, i) => {
                                    const day = i + 1;
                                    const isSelected = day === 11;
                                    const hasEvent = [11, 14, 15, 22].includes(day);
                                    return (
                                        <button
                                            key={i}
                                            className={`h-10 rounded-xl text-[11px] font-black transition-all flex flex-col items-center justify-center relative ${isSelected ? "bg-[#B91C1C] text-white shadow-lg shadow-red-900/20" : "text-gray-500 hover:bg-gray-50"}`}
                                        >
                                            {day}
                                            {hasEvent && !isSelected && (
                                                <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-red-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-50">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Upcoming Important Dates</h4>
                                <div className="space-y-6">
                                    {[
                                        { label: "Quarterly Review", date: "Mar 14", status: "Critical" },
                                        { label: "Planning Meeting", date: "Mar 15", status: "Normal" },
                                        { label: "Ward Visit", date: "Mar 22", status: "Normal" },
                                    ].map(m => (
                                        <div key={m.label} className="flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-gray-300 group-hover:bg-red-300'}`} />
                                                <p className="text-[11px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{m.label}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-300">{m.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Schedule Alert Card */}
                        <div className="bg-[#111827] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] pointer-events-none group-hover:bg-red-500/20 transition-all duration-700" />
                            <div className="relative z-10">
                                <AlertCircle className="w-8 h-8 text-rose-500 mb-6" />
                                <h3 className="text-xl font-black mb-2">Time Conflict</h3>
                                <p className="text-xs text-white/50 leading-relaxed font-medium">You have two meetings scheduled at the same time in Ward 03. Please check your timing.</p>
                                <button className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Event List */}
                    <div className="xl:col-span-3 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                                Wednesday, March 11
                                <span className="text-[10px] font-black py-1 px-3 bg-red-50 text-[#B91C1C] rounded-full uppercase tracking-tighter shadow-sm border border-red-100">4 Meetings Today</span>
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {scheduleEvents.map((event, idx) => (
                                <div 
                                    key={event.id}
                                    className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all group flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden"
                                >
                                    {/* Event Type Stripe */}
                                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                                        event.status === 'Critical' ? 'bg-red-500' : 'bg-[#B91C1C]/20 group-hover:bg-[#B91C1C]'
                                    } transition-all`} />

                                    <div className="flex flex-col items-center justify-center gap-1 min-w-[100px] border-r border-gray-50 pr-8">
                                        <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{event.time.split(' ')[0]}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{event.time.split(' ')[1]}</p>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-lg font-black text-gray-900 group-hover:text-[#B91C1C] transition-colors">{event.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    event.status === 'Critical' ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-500 group-hover:bg-red-50 group-hover:text-red-700'
                                                }`}>
                                                    {event.type}
                                                </span>
                                            </div>
                                            <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-6 text-[11px] font-bold text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-300" />
                                                <span>{event.duration} Long</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-300" />
                                                <span>{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-300" />
                                                <span>{event.attendees.length} people attending</span>
                                            </div>
                                        </div>

                                        {/* Attendees Avatars */}
                                        <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                                            <div className="flex -space-x-3">
                                                {event.attendees.map((a, i) => (
                                                    <div 
                                                        key={i} 
                                                        title={a}
                                                        className="w-10 h-10 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-md cursor-pointer hover:-translate-y-1 transition-transform"
                                                    >
                                                        {a.substring(0, 2).toUpperCase()}
                                                    </div>
                                                ))}
                                                {idx === 1 && (
                                                    <div className="w-10 h-10 rounded-full bg-[#B91C1C] border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-md">
                                                        +12
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <button className={`ml-auto flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                event.status === 'Confirmed' 
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                    : 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                                            }`}>
                                                {event.status === 'Confirmed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                {event.status}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Status */}
                        <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center space-y-4">
                            <Clock className="w-8 h-8 text-gray-200" />
                            <h4 className="text-sm font-black text-gray-400">End of daily schedule</h4>
                            <p className="text-xs text-gray-400 max-w-sm font-medium">All your events for today are listed above. Your data is automatically saved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
