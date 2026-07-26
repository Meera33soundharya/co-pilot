import { useState } from "react";
import { X, CheckCircle2, Loader2, MapPin, User, Tag, AlertTriangle } from "lucide-react";

interface NewGrievanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const departments = ["Water Supply", "Roads & Infrastructure", "Electricity", "Sanitation", "Public Health", "Parks & Recreation", "Enforcement", "Education"];
const wards = ["Ward 01", "Ward 02", "Ward 03", "Ward 04", "Ward 05", "Ward 06", "Ward 07", "Ward 08", "Ward 09", "Ward 10", "Ward 11", "Ward 12", "Ward 13", "Ward 14", "Ward 15"];
const priorities = ["Low", "Medium", "High"];

export function NewGrievanceModal({ isOpen, onClose }: NewGrievanceModalProps) {
    const [step, setStep] = useState<"form" | "loading" | "success">("form");
    const [form, setForm] = useState({
        citizen: "",
        phone: "",
        ward: "Ward 01",
        dept: "Water Supply",
        priority: "Medium",
        issue: "",
        description: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("loading");
        setTimeout(() => setStep("success"), 1800);
    };

    const handleClose = () => {
        setStep("form");
        setForm({ citizen: "", phone: "", ward: "Ward 01", dept: "Water Supply", priority: "Medium", issue: "", description: "" });
        onClose();
    };

    if (!isOpen) return null;

    const ticketId = `GRV-${8295 + Math.floor(Math.random() * 10)}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="px-7 py-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">New Grievance</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">Citizen complaint submission</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                {step === "form" && (
                    <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[70vh] overflow-y-auto">
                        {/* Citizen Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <User className="w-3 h-3" /> Citizen Name *
                                </label>
                                <input
                                    required
                                    value={form.citizen}
                                    onChange={e => setForm(f => ({ ...f, citizen: e.target.value }))}
                                    placeholder="e.g. Amit Patel"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-300 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Phone Number
                                </label>
                                <input
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-300 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Ward + Department */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <MapPin className="w-3 h-3" /> Ward *
                                </label>
                                <select
                                    required
                                    value={form.ward}
                                    onChange={e => setForm(f => ({ ...f, ward: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-300 transition-all"
                                >
                                    {wards.map(w => <option key={w}>{w}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <Tag className="w-3 h-3" /> Department *
                                </label>
                                <select
                                    required
                                    value={form.dept}
                                    onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-300 transition-all"
                                >
                                    {departments.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <AlertTriangle className="w-3 h-3" /> Priority
                            </label>
                            <div className="flex gap-3">
                                {priorities.map(p => {
                                    const colors = {
                                        Low: "border-sky-200 bg-sky-50 text-sky-600",
                                        Medium: "border-amber-200 bg-amber-50 text-amber-600",
                                        High: "border-rose-200 bg-rose-50 text-rose-600",
                                    };
                                    const active = {
                                        Low: "border-sky-400 ring-2 ring-sky-400/30",
                                        Medium: "border-amber-400 ring-2 ring-amber-400/30",
                                        High: "border-rose-400 ring-2 ring-rose-400/30",
                                    };
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, priority: p }))}
                                            className={`flex-1 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${colors[p as keyof typeof colors]} ${form.priority === p ? active[p as keyof typeof active] : "opacity-50"}`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Issue Title */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Issue Title *</label>
                            <input
                                required
                                value={form.issue}
                                onChange={e => setForm(f => ({ ...f, issue: e.target.value }))}
                                placeholder="Brief title of the complaint..."
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-300 transition-all placeholder:text-gray-400"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                rows={3}
                                placeholder="Provide additional details about the issue..."
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-300 transition-all placeholder:text-gray-400 resize-none"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                        >
                            Submit Grievance
                        </button>
                    </form>
                )}

                {step === "loading" && (
                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                        <p className="text-sm font-bold text-gray-600">Submitting grievance...</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">AI triage in progress</p>
                    </div>
                )}

                {step === "success" && (
                    <div className="p-10 flex flex-col items-center justify-center gap-5 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 mb-1">Submitted!</h3>
                            <p className="text-sm text-gray-500 font-medium">Your ticket has been registered</p>
                        </div>
                        <div className="px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl w-full">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Ticket ID</p>
                            <p className="text-2xl font-black text-blue-600 font-mono">{ticketId}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">AI has auto-triaged to {form.dept}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-full py-3 bg-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
