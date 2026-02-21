import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, LayoutDashboard, FileText, FolderOpen, Mic,
    BarChart2, AtSign, BellRing, Settings, Zap, ArrowRight,
    Brain, GraduationCap, Quote, Gamepad2, Activity, Cpu
} from "lucide-react";

const commands = [
    { icon: LayoutDashboard, label: "Go to Dashboard", path: "/dashboard", group: "Navigation" },
    { icon: Zap, label: "Go to Interactive Grid", path: "/interactive-dashboard", group: "Navigation" },
    { icon: Brain, label: "Go to BrainSpark", path: "/brainspark", group: "Navigation" },
    { icon: Activity, label: "Go to Policy Simulator", path: "/policy-simulator", group: "Navigation" },
    { icon: Cpu, label: "Go to Explainable AI", path: "/explainable-ai", group: "Navigation" },
    { icon: GraduationCap, label: "Go to Study Buddy", path: "/study-buddy", group: "Navigation" },
    { icon: Quote, label: "Go to Proverbs", path: "/proverbs", group: "Navigation" },
    { icon: Gamepad2, label: "Go to Reword Game", path: "/reword-game", group: "Navigation" },
    { icon: FileText, label: "Go to Grievances", path: "/grievances", group: "Navigation" },
    { icon: FolderOpen, label: "Go to Documents", path: "/documents", group: "Navigation" },
    { icon: Mic, label: "Go to SpeechAI", path: "/speech-ai", group: "Navigation" },
    { icon: BarChart2, label: "Go to Analytics", path: "/analytics", group: "Navigation" },
    { icon: AtSign, label: "Go to Mentions", path: "/mentions", group: "Navigation" },
    { icon: BellRing, label: "Go to Crisis Radar", path: "/ai-alerts", group: "Navigation" },
    { icon: Settings, label: "Go to Settings", path: "/settings", group: "Navigation" },
    { icon: Zap, label: "Trigger Tactical Audit", path: "/ai-alerts", group: "Actions" },
];

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(0);
    const navigate = useNavigate();

    const filtered = commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase())
    );

    const execute = useCallback((path: string) => {
        navigate(path);
        setOpen(false);
        setQuery("");
    }, [navigate]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen(o => !o);
            }
            if (e.key === "Escape") setOpen(false);
            if (!open) return;
            if (e.key === "ArrowDown") setSelected(s => Math.min(s + 1, filtered.length - 1));
            if (e.key === "ArrowUp") setSelected(s => Math.max(s - 1, 0));
            if (e.key === "Enter" && filtered[selected]) execute(filtered[selected].path);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, filtered, selected, execute]);

    useEffect(() => { setSelected(0); }, [query]);

    if (!open) return null;

    const grouped = filtered.reduce<Record<string, typeof commands>>((acc, cmd) => {
        if (!acc[cmd.group]) acc[cmd.group] = [];
        acc[cmd.group].push(cmd);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={() => setOpen(false)}>
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Search bar */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <Search className="w-5 h-5 text-gray-400 shrink-0" />
                    <input
                        autoFocus
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search commands and pages..."
                        className="flex-1 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none bg-transparent"
                    />
                    <kbd className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-400 border border-gray-200">ESC</kbd>
                </div>

                {/* Commands */}
                <div className="p-2 max-h-80 overflow-y-auto">
                    {Object.entries(grouped).map(([group, items]) => (
                        <div key={group} className="mb-2">
                            <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{group}</p>
                            {items.map((cmd) => {
                                const globalIdx = filtered.indexOf(cmd);
                                return (
                                    <button
                                        key={cmd.label}
                                        onClick={() => execute(cmd.path)}
                                        onMouseEnter={() => setSelected(globalIdx)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${globalIdx === selected ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        <div className={`p-1.5 rounded-lg ${globalIdx === selected ? "bg-blue-100" : "bg-gray-100"}`}>
                                            <cmd.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold flex-1">{cmd.label}</span>
                                        <ArrowRight className={`w-4 h-4 transition-opacity ${globalIdx === selected ? "opacity-100" : "opacity-0"}`} />
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="py-8 text-center text-gray-400 text-sm font-bold">No commands found for "{query}"</div>
                    )}
                </div>

                <div className="px-5 py-2.5 border-t border-gray-100 flex items-center gap-4 text-[10px] font-black text-gray-400">
                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">↑↓</kbd> navigate</span>
                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">↵</kbd> open</span>
                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">ESC</kbd> close</span>
                </div>
            </div>
        </div>
    );
}
