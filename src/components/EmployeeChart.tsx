/**
 * ComplaintsByCategoryChart.tsx
 *
 * DATA SOURCE: complaints[] grouped by category field — NEVER employees/departments.
 *
 * Props:
 *   complaints — the date-range-filtered complaint array passed down from Dashboard.
 *                Must be the SAME filtered array used by the bar chart above it so
 *                both charts always show the same date window.
 *
 * Naming convention: this component is intentionally named "ComplaintsByCategoryChart"
 * (not a generic "PieChart") so copy-paste mismatches are caught immediately in review.
 */

import React, { useMemo } from "react";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import type { Complaint } from "@/store/complaintsStore";

// ── Category colour palette ────────────────────────────────────────────────
// Keyed by exact category enum value from complaintsStore.ts
const CATEGORY_COLORS: Record<string, string> = {
    "Water Supply":                "#3B82F6",   // blue
    "Electricity":                 "#F59E0B",   // amber
    "Roads & Infrastructure":      "#8B5CF6",   // violet
    "Sanitation":                  "#EF4444",   // red
    "Drainage":                    "#06B6D4",   // cyan
    "Public Health":               "#10B981",   // emerald
    "Parks & Recreation":          "#84CC16",   // lime
    "Enforcement":                 "#F97316",   // orange
    "Education":                   "#EC4899",   // pink
    "Ward Committee & Governance": "#6366F1",   // indigo
    "Other":                       "#9CA3AF",   // gray
};

const FALLBACK_COLORS = [
    "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444",
    "#06B6D4", "#10B981", "#84CC16", "#F97316",
    "#EC4899", "#6366F1", "#9CA3AF",
];

function getColor(category: string, index: number): string {
    return CATEGORY_COLORS[category] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

// ── Custom tooltip ─────────────────────────────────────────────────────────
function CategoryTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const { name, value, count } = payload[0].payload;
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-3 text-sm">
            <p className="font-black text-gray-900 mb-1">{name}</p>
            <p className="text-gray-500">
                <span className="font-black text-gray-900">{count}</span> complaints
                {" "}(<span className="font-black text-gray-900">{value.toFixed(1)}%</span>)
            </p>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────
interface ComplaintsByCategoryChartProps {
    /** Date-range-filtered complaints — same array as the bar chart above. */
    complaints: Complaint[];
}

export function ComplaintsByCategoryChart({ complaints }: ComplaintsByCategoryChartProps) {
    // ── Group by category — data source is always complaints[], never employees ──
    const chartData = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const c of complaints) {
            const cat = (c.category ?? "Other").trim();
            counts[cat] = (counts[cat] ?? 0) + 1;
        }
        const total = complaints.length;
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count], i) => ({
                name,
                count,
                value: total > 0 ? (count / total) * 100 : 0,
                color: getColor(name, i),
            }));
    }, [complaints]);

    // ── Empty state ────────────────────────────────────────────────────────
    if (complaints.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Complaints in This Period</p>
                <p className="text-xs text-gray-400 mt-1">Adjust the date range to see category breakdown.</p>
            </div>
        );
    }

    return (
        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            {/* ── Header ── */}
            <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">
                    Complaint Breakdown
                </p>
                <h3 className="text-xl font-black text-gray-900 mt-0.5">
                    Complaints by Category
                </h3>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* ── Pie chart ── */}
                <div className="w-full md:w-[55%] h-[300px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={118}
                                innerRadius={50}
                                dataKey="value"
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                                    if (value < 5) return null; // skip tiny slices
                                    const RADIAN = Math.PI / 180;
                                    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
                                    const x = cx + r * Math.cos(-midAngle * RADIAN);
                                    const y = cy + r * Math.sin(-midAngle * RADIAN);
                                    return (
                                        <text
                                            x={x} y={y}
                                            fill="#fff"
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            style={{ fontSize: 11, fontWeight: 900 }}
                                        >
                                            {`${value.toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CategoryTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* ── Legend ── */}
                <div className="flex-1 w-full">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">Categories</p>
                    <div className="space-y-2">
                        {chartData.map((entry, i) => (
                            <div key={i} className="flex items-center justify-between gap-3 py-1.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-sm font-bold text-gray-700 truncate">{entry.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs font-black text-gray-900">{entry.count}</span>
                                    <span className="text-xs font-bold text-gray-400 w-10 text-right">{entry.value.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs font-black text-gray-400 px-3">
                        <span>TOTAL</span>
                        <span>{complaints.length} complaints</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Legacy named export removed intentionally ──────────────────────────────
// The old `EmployeeChart` export has been replaced. Any remaining import of
// `EmployeeChart` will cause a compile error, making stale references visible.
