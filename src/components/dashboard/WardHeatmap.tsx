import { useState } from "react";
import { MapPin, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const wards = [
    { id: "W01", name: "Ward 01", x: 20, y: 20, w: 90, h: 70, cases: 176, resolved: 154, risk: "low", dept: "Education" },
    { id: "W02", name: "Ward 02", x: 120, y: 20, w: 85, h: 70, cases: 198, resolved: 160, risk: "medium", dept: "Water" },
    { id: "W03", name: "Ward 03", x: 215, y: 20, w: 100, h: 70, cases: 312, resolved: 195, risk: "critical", dept: "Infrastructure" },
    { id: "W04", name: "Ward 04", x: 325, y: 20, w: 80, h: 70, cases: 143, resolved: 130, risk: "low", dept: "Sanitation" },
    { id: "W05", name: "Ward 05", x: 415, y: 20, w: 90, h: 70, cases: 121, resolved: 115, risk: "low", dept: "Parks" },
    { id: "W06", name: "Ward 06", x: 20, y: 100, w: 90, h: 75, cases: 245, resolved: 190, risk: "high", dept: "Roads" },
    { id: "W07", name: "Ward 07", x: 120, y: 100, w: 95, h: 75, cases: 154, resolved: 148, risk: "low", dept: "Electricity" },
    { id: "W08", name: "Ward 08", x: 225, y: 100, w: 90, h: 75, cases: 132, resolved: 122, risk: "low", dept: "Health" },
    { id: "W09", name: "Ward 09", x: 325, y: 100, w: 80, h: 75, cases: 287, resolved: 198, risk: "high", dept: "Sanitation" },
    { id: "W10", name: "Ward 10", x: 415, y: 100, w: 90, h: 75, cases: 109, resolved: 105, risk: "low", dept: "Education" },
    { id: "W11", name: "Ward 11", x: 20, y: 185, w: 90, h: 70, cases: 128, resolved: 120, risk: "low", dept: "Enforcement" },
    { id: "W12", name: "Ward 12", x: 120, y: 185, w: 95, h: 70, cases: 198, resolved: 167, risk: "medium", dept: "Electricity" },
    { id: "W13", name: "Ward 13", x: 225, y: 185, w: 90, h: 70, cases: 88, resolved: 85, risk: "low", dept: "Parks" },
    { id: "W14", name: "Ward 14", x: 325, y: 185, w: 80, h: 70, cases: 167, resolved: 140, risk: "medium", dept: "Water" },
    { id: "W15", name: "Ward 15", x: 415, y: 185, w: 90, h: 70, cases: 95, resolved: 91, risk: "low", dept: "Health" },
];

const riskConfig = {
    critical: { fill: "#FEE2E2", stroke: "#EF4444", badge: "bg-rose-500 text-white", label: "Critical" },
    high: { fill: "#FEF3C7", stroke: "#F59E0B", badge: "bg-amber-500 text-white", label: "High Risk" },
    medium: { fill: "#DBEAFE", stroke: "#3B82F6", badge: "bg-blue-500 text-white", label: "Medium" },
    low: { fill: "#D1FAE5", stroke: "#10B981", badge: "bg-emerald-500 text-white", label: "Stable" },
};

export function WardHeatmap() {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState<string | null>(null);

    const hoveredWard = wards.find(w => w.id === hovered);

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-violet-600" />
                    <h2 className="text-base font-bold text-gray-950 tracking-tight">District Heat Map</h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-xl">
                        15 Wards
                    </span>
                </div>
                <button
                    onClick={() => navigate("/analytics")}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-all"
                >
                    Full Analytics →
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* SVG Map */}
                <div className="xl:col-span-2 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 relative">
                    <svg viewBox="0 0 510 270" className="w-full h-auto" style={{ minHeight: "200px" }}>
                        {wards.map(ward => {
                            const cfg = riskConfig[ward.risk as keyof typeof riskConfig];
                            const isHov = hovered === ward.id;
                            return (
                                <g
                                    key={ward.id}
                                    onMouseEnter={() => setHovered(ward.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={() => navigate("/analytics")}
                                    style={{ cursor: "pointer" }}
                                >
                                    <rect
                                        x={ward.x}
                                        y={ward.y}
                                        width={ward.w}
                                        height={ward.h}
                                        rx={10}
                                        ry={10}
                                        fill={cfg.fill}
                                        stroke={cfg.stroke}
                                        strokeWidth={isHov ? 2.5 : 1.5}
                                        opacity={isHov ? 1 : 0.85}
                                        style={{ transition: "all 0.15s" }}
                                    />
                                    <text
                                        x={ward.x + ward.w / 2}
                                        y={ward.y + ward.h / 2 - 8}
                                        textAnchor="middle"
                                        fontSize="10"
                                        fontWeight="800"
                                        fill={cfg.stroke}
                                        style={{ fontFamily: "Inter, sans-serif", pointerEvents: "none" }}
                                    >
                                        {ward.id}
                                    </text>
                                    <text
                                        x={ward.x + ward.w / 2}
                                        y={ward.y + ward.h / 2 + 8}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fontWeight="700"
                                        fill={cfg.stroke}
                                        opacity={0.7}
                                        style={{ fontFamily: "Inter, sans-serif", pointerEvents: "none" }}
                                    >
                                        {ward.cases} cases
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-3">
                        {Object.entries(riskConfig).map(([key, cfg]) => (
                            <div key={key} className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm border" style={{ background: cfg.fill, borderColor: cfg.stroke }} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{cfg.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Panel */}
                <div className="space-y-3">
                    {hoveredWard ? (
                        <div className="p-5 rounded-2xl border-2 bg-white" style={{ borderColor: riskConfig[hoveredWard.risk as keyof typeof riskConfig].stroke }}>
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4" style={{ color: riskConfig[hoveredWard.risk as keyof typeof riskConfig].stroke }} />
                                <span className="font-black text-gray-900">{hoveredWard.name}</span>
                                <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-lg ${riskConfig[hoveredWard.risk as keyof typeof riskConfig].badge}`}>
                                    {riskConfig[hoveredWard.risk as keyof typeof riskConfig].label}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500 font-bold">Total Cases</span>
                                    <span className="font-black text-gray-900">{hoveredWard.cases}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500 font-bold">Resolved</span>
                                    <span className="font-black text-emerald-600">{hoveredWard.resolved}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500 font-bold">Resolution Rate</span>
                                    <span className="font-black text-blue-600">{Math.round(hoveredWard.resolved / hoveredWard.cases * 100)}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500 font-bold">Top Issue</span>
                                    <span className="font-black text-gray-700">{hoveredWard.dept}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-500"
                                        style={{ width: `${Math.round(hoveredWard.resolved / hoveredWard.cases * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 rounded-2xl border border-dashed border-gray-200 text-center">
                            <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-400">Hover over a ward to see details</p>
                        </div>
                    )}

                    {/* Top at-risk wards */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Top Risk Wards</p>
                        {wards
                            .filter(w => w.risk === "critical" || w.risk === "high")
                            .slice(0, 4)
                            .map(ward => {
                                const cfg = riskConfig[ward.risk as keyof typeof riskConfig];
                                return (
                                    <div
                                        key={ward.id}
                                        onMouseEnter={() => setHovered(ward.id)}
                                        onMouseLeave={() => setHovered(null)}
                                        onClick={() => navigate("/analytics")}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all cursor-pointer"
                                    >
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.stroke }} />
                                        <span className="text-xs font-bold text-gray-800 flex-1">{ward.name}</span>
                                        <span className="text-xs font-black text-gray-500">{ward.cases}</span>
                                        <TrendingUp className="w-3.5 h-3.5 text-gray-300" />
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
}
