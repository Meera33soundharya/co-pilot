import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Clock, BookOpen, Newspaper, Tv, ChevronRight, X } from "lucide-react";

const INITIAL_ITEMS = [
    {
        id: "q1", title: "Youth Employment Reform", source: "Reuters", dueDate: "Jun 17", status: "Draft",
        notes: "Need to address the 3 specific policy proposals mentioned in the question."
    },
    {
        id: "q2", title: "Food Security Initiative", source: "National Tribune", dueDate: "Jun 16", status: "Draft",
        notes: "Reference recent agricultural report figures."
    },
    {
        id: "q3", title: "Infrastructure Bill", source: "The Daily Record", dueDate: "Jun 15", status: "Approved",
        notes: "Confirmed by Chief of Staff. Ready to release."
    },
    {
        id: "q4", title: "Foreign Policy Statement", source: "BBC Africa", dueDate: "Jun 12", status: "Published",
        notes: "Published on official website and shared to all channels."
    },
];

const STATUSES = ["Draft", "Approved", "Published"];

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
    "Draft": { bg: "rgba(59,130,246,0.12)", text: "#3B82F6", border: "rgba(59,130,246,0.3)" },
    "Approved": { bg: "rgba(16,185,129,0.12)", text: "#10B981", border: "rgba(16,185,129,0.3)" },
    "Published": { bg: "rgba(139,92,246,0.12)", text: "#A78BFA", border: "rgba(139,92,246,0.3)" },
};

const SOURCE_ICON = (src: string) => {
    if (src.includes("BBC") || src.includes("TV")) return <Tv className="w-3 h-3" />;
    if (src.includes("Tribune") || src.includes("Record") || src.includes("Times")) return <Newspaper className="w-3 h-3" />;
    return <BookOpen className="w-3 h-3" />;
};

export default function MediaQueue() {
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [showNew, setShowNew] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newSource, setNewSource] = useState("");
    const [newDue, setNewDue] = useState("");
    const [selected, setSelected] = useState<typeof INITIAL_ITEMS[0] | null>(null);

    const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: items.filter(i => i.status === s).length }), {} as Record<string, number>);

    function addItem() {
        if (!newTitle.trim()) return;
        setItems(prev => [...prev, {
            id: `q${Date.now()}`, title: newTitle, source: newSource || "Unknown", dueDate: newDue || "TBD", status: "Draft", notes: ""
        }]);
        setNewTitle(""); setNewSource(""); setNewDue("");
        setShowNew(false);
    }

    return (
        <DashboardLayout 
            title="Media Queue" 
            subtitle="Manage press queries and official responses."
            actions={
                <button
                    onClick={() => setShowNew(true)}
                    style={{
                        display: "flex", alignItems: "center", gap: 8, background: "#3B82F6",
                        color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px",
                        fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                        boxShadow: "0 4px 20px rgba(59,130,246,0.35)"
                    }}
                >
                    <Plus className="w-4 h-4" /> New Response
                </button>
            }
        >
            <div>

                {/* Kanban columns */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {STATUSES.map(status => {
                        const ss = STATUS_STYLE[status];
                        const colItems = items.filter(i => i.status === status);
                        return (
                            <div key={status} style={{ background: "#111827", borderRadius: 16, border: "1px solid #1F2937", overflow: "hidden" }}>
                                {/* Column header */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #1F2937" }}>
                                    <span style={{ color: "#9CA3AF", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>{status}</span>
                                    <span style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.border}`, borderRadius: 20, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 800 }}>
                                        {counts[status] || 0}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
                                    {colItems.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelected(item)}
                                            style={{
                                                background: "#1F2937", borderRadius: 12, padding: "14px 16px",
                                                border: "1px solid #374151", cursor: "pointer", transition: "border-color 0.15s"
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.borderColor = "#3B82F6")}
                                            onMouseLeave={e => (e.currentTarget.style.borderColor = "#374151")}
                                        >
                                            <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", margin: "0 0 8px" }}>{item.title}</p>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9CA3AF", fontSize: "0.75rem", marginBottom: 6 }}>
                                                {SOURCE_ICON(item.source)}
                                                {item.source}
                                            </div>
                                            {item.dueDate !== "TBD" && (
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: "0.73rem" }}>
                                                    <Clock className="w-3 h-3" />
                                                    Due {item.dueDate}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {colItems.length === 0 && (
                                        <div style={{ textAlign: "center", color: "#374151", fontSize: "0.8rem", padding: "30px 0" }}>No items</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detail modal */}
            {selected && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setSelected(null)}>
                    <div style={{ background: "#111827", border: "1px solid #1F2937", borderRadius: 20, padding: 32, width: 520, maxWidth: "95vw" }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.15rem", margin: 0 }}>{selected.title}</h2>
                            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer" }}><X className="w-5 h-5" /></button>
                        </div>
                        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                            <span style={{ ...STATUS_STYLE[selected.status] && { background: STATUS_STYLE[selected.status].bg, color: STATUS_STYLE[selected.status].text, border: `1px solid ${STATUS_STYLE[selected.status].border}` }, borderRadius: 8, padding: "4px 12px", fontSize: "0.78rem", fontWeight: 700 }}>{selected.status}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#9CA3AF", fontSize: "0.8rem", background: "#1F2937", border: "1px solid #374151", borderRadius: 8, padding: "4px 12px" }}>
                                {SOURCE_ICON(selected.source)} {selected.source}
                            </span>
                            {selected.dueDate !== "TBD" && (
                                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#9CA3AF", fontSize: "0.8rem", background: "#1F2937", border: "1px solid #374151", borderRadius: 8, padding: "4px 12px" }}>
                                    <Clock className="w-3 h-3" /> Due {selected.dueDate}
                                </span>
                            )}
                        </div>
                        <label style={{ color: "#9CA3AF", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Notes / Draft Response</label>
                        <textarea rows={5} defaultValue={selected.notes} style={{
                            width: "100%", background: "#1F2937", border: "1px solid #374151", borderRadius: 10,
                            padding: "12px 14px", color: "#fff", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box"
                        }} />
                        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                            {STATUSES.filter(s => s !== selected.status).map(s => (
                                <button key={s} onClick={() => {
                                    setItems(prev => prev.map(i => i.id === selected.id ? { ...i, status: s } : i));
                                    setSelected(null);
                                }} style={{
                                    flex: 1, background: STATUS_STYLE[s].bg, border: `1px solid ${STATUS_STYLE[s].border}`,
                                    color: STATUS_STYLE[s].text, borderRadius: 10, padding: "9px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer"
                                }}>
                                    Move to {s} <ChevronRight className="w-3 h-3 inline" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* New item modal */}
            {showNew && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setShowNew(false)}>
                    <div style={{ background: "#111827", border: "1px solid #1F2937", borderRadius: 20, padding: 32, width: 460, maxWidth: "95vw" }}
                        onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem", marginBottom: 20 }}>New Press Query</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {[
                                { label: "Query Title", value: newTitle, set: setNewTitle, placeholder: "e.g. Infrastructure Funding..." },
                                { label: "Source / Outlet", value: newSource, set: setNewSource, placeholder: "e.g. Reuters, BBC..." },
                                { label: "Due Date", value: newDue, set: setNewDue, placeholder: "e.g. Jun 20" },
                            ].map(f => (
                                <div key={f.label}>
                                    <label style={{ color: "#9CA3AF", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 6 }}>{f.label}</label>
                                    <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={{
                                        width: "100%", background: "#1F2937", border: "1px solid #374151", borderRadius: 10,
                                        padding: "10px 14px", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box"
                                    }} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
                            <button onClick={() => setShowNew(false)} style={{ flex: 1, background: "#1F2937", border: "1px solid #374151", borderRadius: 10, padding: "10px", color: "#9CA3AF", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                            <button onClick={addItem} style={{ flex: 1, background: "#3B82F6", border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Add to Draft</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
