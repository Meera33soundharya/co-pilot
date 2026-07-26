import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, MapPin, Tag } from "lucide-react";

const ISSUES = [
    {
        id: "c1", title: "Sewage overflow near market", location: "East Side", category: "Sanitation",
        affected: 7200, priority: "High", status: "Resolved",
        priorityColor: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", border: "rgba(245,158,11,0.3)" },
        statusColor: { bg: "rgba(16,185,129,0.15)", text: "#10B981", border: "rgba(16,185,129,0.3)" },
    },
    {
        id: "c2", title: "Youth unemployment — no skills centre", location: "West Precinct", category: "Employment",
        affected: 5400, priority: "Medium", status: "Open",
        priorityColor: { bg: "rgba(139,92,246,0.15)", text: "#A78BFA", border: "rgba(139,92,246,0.3)" },
        statusColor: { bg: "rgba(59,130,246,0.12)", text: "#3B82F6", border: "rgba(59,130,246,0.3)" },
    },
    {
        id: "c3", title: "Water borehole breakdown", location: "Rural North", category: "Water & Sanitation",
        affected: 2100, priority: "Urgent", status: "Open",
        priorityColor: { bg: "rgba(239,68,68,0.15)", text: "#EF4444", border: "rgba(239,68,68,0.3)" },
        statusColor: { bg: "rgba(59,130,246,0.12)", text: "#3B82F6", border: "rgba(59,130,246,0.3)" },
    },
    {
        id: "c4", title: "Clinic equipment replacement needed", location: "Central District", category: "Health",
        affected: 12000, priority: "High", status: "Open",
        priorityColor: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", border: "rgba(245,158,11,0.3)" },
        statusColor: { bg: "rgba(59,130,246,0.12)", text: "#3B82F6", border: "rgba(59,130,246,0.3)" },
    },
    {
        id: "c5", title: "Shortage of qualified teachers", location: "South Ward", category: "Education",
        affected: 3200, priority: "High", status: "In Progress",
        priorityColor: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", border: "rgba(245,158,11,0.3)" },
        statusColor: { bg: "rgba(139,92,246,0.15)", text: "#A78BFA", border: "rgba(139,92,246,0.3)" },
    },
    {
        id: "c6", title: "Unpaved roads causing flooding during rains", location: "North District", category: "Infrastructure",
        affected: 8500, priority: "Urgent", status: "Open",
        priorityColor: { bg: "rgba(239,68,68,0.15)", text: "#EF4444", border: "rgba(239,68,68,0.3)" },
        statusColor: { bg: "rgba(59,130,246,0.12)", text: "#3B82F6", border: "rgba(59,130,246,0.3)" },
    },
    {
        id: "c7", title: "Lack of public lighting in market area", location: "South Market", category: "Infrastructure",
        affected: 4100, priority: "Medium", status: "In Progress",
        priorityColor: { bg: "rgba(139,92,246,0.15)", text: "#A78BFA", border: "rgba(139,92,246,0.3)" },
        statusColor: { bg: "rgba(139,92,246,0.15)", text: "#A78BFA", border: "rgba(139,92,246,0.3)" },
    },
    {
        id: "c8", title: "Elderly care facility understaffed", location: "Central District", category: "Health",
        affected: 650, priority: "Medium", status: "Resolved",
        priorityColor: { bg: "rgba(139,92,246,0.15)", text: "#A78BFA", border: "rgba(139,92,246,0.3)" },
        statusColor: { bg: "rgba(16,185,129,0.15)", text: "#10B981", border: "rgba(16,185,129,0.3)" },
    },
];

const FILTER_TABS = ["All", "open", "in progress", "resolved"];

export default function Constituency() {
    const [activeFilter, setActiveFilter] = useState("All");

    const filtered = activeFilter === "All"
        ? ISSUES
        : ISSUES.filter(i => i.status.toLowerCase() === activeFilter.toLowerCase());

    return (
        <DashboardLayout title="Constituency" subtitle="Manage and monitor constituent issues.">
            <div>

                {/* Filter tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveFilter(tab)}
                            style={{
                                background: activeFilter === tab ? "#3B82F6" : "#111827",
                                color: activeFilter === tab ? "#fff" : "#6B7280",
                                border: `1px solid ${activeFilter === tab ? "#3B82F6" : "#1F2937"}`,
                                borderRadius: 8, padding: "6px 16px", fontSize: "0.82rem", fontWeight: 600,
                                cursor: "pointer", transition: "all 0.15s", textTransform: "capitalize"
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Issues list */}
                <div style={{ background: "#111827", borderRadius: 16, border: "1px solid #1F2937", overflow: "hidden" }}>
                    {filtered.map((issue, idx) => (
                        <div
                            key={issue.id}
                            style={{
                                padding: "18px 22px",
                                borderBottom: idx < filtered.length - 1 ? "1px solid #1F2937" : "none",
                                cursor: "pointer", transition: "background 0.15s"
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#1A2236")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                        <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.97rem" }}>{issue.title}</span>
                                        <span style={{
                                            background: issue.priorityColor.bg, color: issue.priorityColor.text,
                                            border: `1px solid ${issue.priorityColor.border}`,
                                            borderRadius: 6, padding: "2px 9px", fontSize: "0.72rem", fontWeight: 700
                                        }}>{issue.priority}</span>
                                        <span style={{
                                            background: issue.statusColor.bg, color: issue.statusColor.text,
                                            border: `1px solid ${issue.statusColor.border}`,
                                            borderRadius: 6, padding: "2px 9px", fontSize: "0.72rem", fontWeight: 700
                                        }}>{issue.status}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 20 }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#6B7280", fontSize: "0.8rem" }}>
                                            <MapPin className="w-3 h-3" /> {issue.location}
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#6B7280", fontSize: "0.8rem" }}>
                                            <Tag className="w-3 h-3" /> {issue.category}
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#6B7280", fontSize: "0.8rem" }}>
                                            <Users className="w-3 h-3" /> {issue.affected.toLocaleString()} affected
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ textAlign: "center", color: "#374151", padding: "60px 0", fontSize: "0.9rem" }}>
                            No issues matching this filter.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
