import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { MapPin, TrendingUp, Flame, AlertTriangle } from "lucide-react";

const WARDS = Array.from({ length: 12 }, (_, i) => `Ward ${i + 1}`);

const CATEGORY_COLORS: Record<string, string> = {
    "Roads & Infrastructure": "#B91C1C",
    "Water Supply": "#2563EB",
    "Electricity": "#D97706",
    "Sanitation": "#059669",
    "Drainage": "#7C3AED",
    "Public Health": "#DB2777",
    "Parks & Recreation": "#16A34A",
    "Enforcement": "#9CA3AF",
};

// Real Bengaluru neighbourhood coords per ward
const WARD_COORDS: Record<string, { lat: number; lng: number; area: string }> = {
    "Ward 1":  { lat: 12.9716, lng: 77.5946, area: "MG Road, Bengaluru" },
    "Ward 2":  { lat: 12.9279, lng: 77.6271, area: "Koramangala" },
    "Ward 3":  { lat: 13.0298, lng: 77.5668, area: "Hebbal, Bengaluru" },
    "Ward 4":  { lat: 12.9352, lng: 77.5353, area: "Vijayanagar" },
    "Ward 5":  { lat: 12.9781, lng: 77.6408, area: "Indiranagar" },
    "Ward 6":  { lat: 13.0124, lng: 77.5511, area: "Yeshwanthpur" },
    "Ward 7":  { lat: 12.9592, lng: 77.6974, area: "Whitefield" },
    "Ward 8":  { lat: 12.9116, lng: 77.6475, area: "Madiwala" },
    "Ward 9":  { lat: 12.9698, lng: 77.5499, area: "Rajajinagar" },
    "Ward 10": { lat: 12.9952, lng: 77.6035, area: "Banaswadi" },
    "Ward 11": { lat: 12.8952, lng: 77.5769, area: "JP Nagar" },
    "Ward 12": { lat: 13.0475, lng: 77.6177, area: "RT Nagar" },
};

function generateWardData(complaints: any[]) {
    return WARDS.map((ward, i) => {
        const wardComplaints = complaints.filter(c => c.ward === ward);
        const total = wardComplaints.length + Math.floor(Math.random() * 8); // Add seed data
        const resolved = wardComplaints.filter(c => c.status === "Resolved").length;
        const highPri = wardComplaints.filter(c => c.priority === "High").length + Math.floor(Math.random() * 3);

        // Seed top issue per ward
        const SEED_ISSUES = [
            "Roads & Infrastructure", "Water Supply", "Electricity", "Sanitation",
            "Drainage", "Public Health", "Roads & Infrastructure", "Water Supply",
            "Parks & Recreation", "Enforcement", "Sanitation", "Drainage"
        ];
        const topIssue = wardComplaints.length > 0
            ? (wardComplaints.reduce((acc: Record<string, number>, c) => {
                acc[c.category] = (acc[c.category] || 0) + 1; return acc;
            }, {}))
            : { [SEED_ISSUES[i]]: 1 };
        const topCat = Object.entries(topIssue).sort((a, b) => b[1] - a[1])[0]?.[0] ?? SEED_ISSUES[i];

        const intensity = Math.min(10, total); // 0–10 heat scale
        return { ward, total, resolved, highPri, topCat, intensity };
    });
}

function heatColor(intensity: number): string {
    if (intensity === 0) return "#F9FAFB";
    if (intensity <= 2) return "#FEE2E2";
    if (intensity <= 4) return "#FECACA";
    if (intensity <= 6) return "#F87171";
    if (intensity <= 8) return "#EF4444";
    return "#B91C1C";
}

function heatTextColor(intensity: number): string {
    return intensity > 4 ? "text-white" : "text-gray-900";
}

export default function Heatmap() {
    const { complaints } = useComplaints();
    const [selected, setSelected] = useState<string | null>(null);
    const wardData = generateWardData(complaints);
    const selectedWard = wardData.find(w => w.ward === selected);
    const totalComplaints = wardData.reduce((s, w) => s + w.total, 0);
    const hottest = [...wardData].sort((a, b) => b.intensity - a.intensity)[0];

    return (
        <DashboardLayout
            title="Constituency Heatmap"
            subtitle="Visual complaint density across all 12 wards — click any ward for details"
        >
            <div className="space-y-6">

                {/* Summary KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: "Total Wards",      value: "12",               sub: "All monitored",   color: "text-gray-900",    bg: "bg-gray-50"    },
                        { label: "Total Complaints", value: String(totalComplaints), sub: "Across all wards", color: "text-red-600",     bg: "bg-red-50"     },
                        { label: "Hottest Ward",     value: hottest.ward,        sub: `${hottest.total} complaints`, color: "text-amber-600", bg: "bg-amber-50"   },
                        { label: "High Priority",    value: String(wardData.reduce((s, w) => s + w.highPri, 0)), sub: "Urgent cases", color: "text-red-600", bg: "bg-red-50" },
                    ].map(k => (
                        <div key={k.label} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <div className={`inline-flex p-2 ${k.bg} rounded-xl mb-3`}>
                                <Flame className={`w-4 h-4 ${k.color}`} />
                            </div>
                            <p className={`text-3xl font-black ${k.color} mb-1`}>{k.value}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{k.label}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{k.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Heatmap Grid */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-7 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ward Complaint Density</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-gray-300 uppercase">Low</span>
                                <div className="flex gap-1">
                                    {["#FEE2E2","#FECACA","#F87171","#EF4444","#B91C1C"].map(c => (
                                        <div key={c} className="w-5 h-3 rounded-sm" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                                <span className="text-[9px] font-black text-gray-300 uppercase">High</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {wardData.map(w => (
                                <button
                                    key={w.ward}
                                    onClick={() => setSelected(selected === w.ward ? null : w.ward)}
                                    className={`rounded-2xl p-4 text-left transition-all hover:scale-105 active:scale-95 ${
                                        selected === w.ward ? "ring-4 ring-[#B91C1C] ring-offset-2" : ""
                                    }`}
                                    style={{ backgroundColor: heatColor(w.intensity) }}
                                >
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${heatTextColor(w.intensity)}`}>
                                        {w.ward}
                                    </p>
                                    <p className={`text-2xl font-black ${heatTextColor(w.intensity)}`}>{w.total}</p>
                                    {w.highPri > 0 && (
                                        <div className="flex items-center gap-1 mt-2">
                                            <AlertTriangle className={`w-3 h-3 ${w.intensity > 4 ? "text-white/70" : "text-red-400"}`} />
                                            <span className={`text-[8px] font-black ${w.intensity > 4 ? "text-white/70" : "text-red-500"}`}>
                                                {w.highPri} urgent
                                            </span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ward Detail / Top Issues */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                        {selectedWard ? (
                            <>
                                {/* Mini OSM map for selected ward */}
                                {WARD_COORDS[selectedWard.ward] && (
                                    <div className="relative" style={{ height: "180px" }}>
                                        <iframe
                                            key={selectedWard.ward}
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${WARD_COORDS[selectedWard.ward].lng - 0.025},${WARD_COORDS[selectedWard.ward].lat - 0.025},${WARD_COORDS[selectedWard.ward].lng + 0.025},${WARD_COORDS[selectedWard.ward].lat + 0.025}&layer=mapnik&marker=${WARD_COORDS[selectedWard.ward].lat},${WARD_COORDS[selectedWard.ward].lng}`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: "none" }}
                                            title={`${selectedWard.ward} map`}
                                            loading="lazy"
                                        />
                                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#B91C1C] border border-red-100 flex items-center gap-1.5">
                                            <MapPin className="w-2.5 h-2.5" /> {selectedWard.ward}
                                        </div>
                                        <div
                                            className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase text-white"
                                            style={{ backgroundColor: heatColor(selectedWard.intensity) }}
                                        >
                                            {selectedWard.total} cases
                                        </div>
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-red-50 rounded-xl">
                                            <MapPin className="w-4 h-4 text-[#B91C1C]" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900">{selectedWard.ward}</h3>
                                            <p className="text-[10px] text-gray-400 font-medium">{WARD_COORDS[selectedWard.ward]?.area}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        {[
                                            { label: "Total Complaints", value: selectedWard.total,   color: "text-gray-900" },
                                            { label: "Resolved",         value: selectedWard.resolved, color: "text-emerald-600" },
                                            { label: "High Priority",    value: selectedWard.highPri,  color: "text-red-600" },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-500">{item.label}</span>
                                                <span className={`text-lg font-black ${item.color}`}>{item.value}</span>
                                            </div>
                                        ))}
                                        <div className="py-2.5 border-b border-gray-50">
                                            <p className="text-xs font-bold text-gray-500 mb-1.5">Top Issue</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[selectedWard.topCat] ?? "#9CA3AF" }} />
                                                <span className="text-xs font-black text-gray-900">{selectedWard.topCat}</span>
                                            </div>
                                        </div>
                                        <div className="pt-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Heat Level</p>
                                            <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(selectedWard.intensity / 10) * 100}%`, backgroundColor: heatColor(selectedWard.intensity) }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                                <div className="p-4 bg-gray-50 rounded-3xl mb-4">
                                    <MapPin className="w-8 h-8 text-gray-200" />
                                </div>
                                <p className="text-sm font-black text-gray-400 mb-2">Select a Ward</p>
                                <p className="text-xs text-gray-300">Click any ward cell to see its map and stats</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Legend */}
                <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5">Issue Categories Across Wards</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                            const count = complaints.filter(c => c.category === cat).length;
                            return (
                                <div key={cat} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-gray-900 truncate">{cat}</p>
                                        <p className="text-[10px] text-gray-400">{count} complaints</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top 5 Hottest Wards Bar */}
                <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-4 h-4 text-[#B91C1C]" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Top 5 Problem Wards</h3>
                    </div>
                    <div className="space-y-3">
                        {[...wardData].sort((a, b) => b.total - a.total).slice(0, 5).map((w, i) => {
                            const pct = Math.round((w.total / (wardData[0]?.total || 1)) * 100);
                            return (
                                <div key={w.ward} className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-gray-400 w-4">{i + 1}</span>
                                    <span className="text-xs font-black text-gray-900 w-16">{w.ward}</span>
                                    <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, backgroundColor: heatColor(w.intensity) }}
                                        />
                                    </div>
                                    <span className="text-xs font-black text-gray-700 w-6 text-right">{w.total}</span>
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[w.topCat] ?? "#9CA3AF" }} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
