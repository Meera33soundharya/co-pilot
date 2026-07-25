import { useState, useRef } from "react";
import { useComplaints } from "@/context/ComplaintsContext";
import { useLanguage } from "@/context/LanguageContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { analyzeComplaint } from "@/services/aiService";
import {
    User, Phone, MapPin, AlertTriangle,
    CheckCircle2, Loader2, ArrowLeft, Send,
    MessageSquare, Shield, Camera, X, Check,
    ChevronRight, Map as MapIcon, Paperclip, Mic, Video,
    LogOut, FileText, Search, MicOff, Hash, Building2, Sparkles, Brain, ArrowRight, FileUp, Volume2, Upload, LocateFixed
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Step = "details" | "issue" | "location" | "preview" | "submitting" | "success";

const WARDS = ["Ward 01", "Ward 02", "Ward 03", "Ward 04", "Ward 05", "Ward 06", "Ward 07", "Ward 08", "Ward 09", "Ward 10", "Ward 11", "Ward 12"];

const LOCALITIES: Record<string, string[]> = {
    "Ward 01": ["Richmond Town", "Langford Town", "Austin Town"],
    "Ward 02": ["Koramangala 1st Block", "ST Bed", "Venkatappa Layout"],
    "Ward 03": ["Indiranagar 100ft Rd", "Defense Colony", "HAL 2nd Stage"],
    "Ward 04": ["Jayanagar 4th Block", "TilakNagar", "Swagath Rd"],
    "Ward 05": ["MG Road", "Brigade Road", "Commercial Street"],
    "Ward 06": ["Malleshwaram 15th Cross", "Margosa Road", "Sampige Road"],
    "Ward 07": ["Whitefield", "ITPL Area", "Hope Farm"],
    "Ward 08": ["HSR Layout Sector 1", "Sector 3", "Agara"],
    "Ward 09": ["Hebbal", "Manyata Tech Park", "Sahakar Nagar"],
    "Ward 10": ["Bannerghatta Road", "Bilekahalli", "Arakere"],
    "Ward 11": ["Electronic City Phase 1", "Phase 2", "Velankani Drive"],
    "Ward 12": ["Vijayanagar", "Govindraj Nagar", "RPC Layout"]
};

export default function CitizenPortal() {
    const { addComplaint, currentUser, logout } = useComplaints();
    const { t, lang } = useLanguage();
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>("details");
    const [ticketId, setTicketId] = useState("");

    const [form, setForm] = useState({
        citizen: currentUser?.name || "",
        phone: "",
        ward: "Ward 01",
        area: "Richmond Town",
        priority: "Medium" as "Low" | "Medium" | "High",
        issue: "",
        description: "",
        location: "",
        coords: { lat: 12.9716, lng: 77.5946 }, // Default
        evidence: [] as string[],
        notifPref: "SMS" as "SMS" | "Email" | "None"
    });

    const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

    const [isTranslating, setIsTranslating] = useState(false);

    const autoTranslate = async (field: "issue" | "description" | "citizen", text: string) => {
        if (lang !== "ta" || !text.trim()) return;
        if (/[\u0B80-\u0BFF]/.test(text)) return;

        setIsTranslating(true);
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Translation request failed");
            const data = await res.json();
            const translatedText = data[0].map((item: any) => item[0]).join("");
            set(field, translatedText);
        } catch (e) {
            console.error("Auto-translation failed", e);
        } finally {
            setIsTranslating(false);
        }
    };

    const next = () => {
        if (step === "details") setStep("issue");
        else if (step === "issue") setStep("location");
        else if (step === "location") setStep("preview");
    };
    const back = () => {
        if (step === "issue") setStep("details");
        else if (step === "location") setStep("issue");
        else if (step === "preview") setStep("location");
    };

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep("submitting");
        setIsAnalyzing(true);

        try {
            const analysis = await analyzeComplaint(form.issue, form.description);
            setAiResult(analysis);

            const id = await addComplaint({
                ...form,
                category: analysis.category,
                priority: analysis.priority,
                dept: analysis.dept
            });

            setTicketId(id);
            setStep("success");
        } catch (err) {
            console.error("AI Routing Error:", err);
            const id = await addComplaint({ ...form });
            setTicketId(id);
            setStep("success");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [mapQuery, setMapQuery] = useState("");
    const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const url = URL.createObjectURL(file);
            const metaUrl = `${url}#name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type)}`;
            set("evidence", [...form.evidence, metaUrl]);
        }
    };

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const url = URL.createObjectURL(file);
            const metaUrl = `${url}#name=${encodeURIComponent(file.name)}&type=audio`;
            set("evidence", [...form.evidence, metaUrl]);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                set("evidence", [...form.evidence, `${url}#name=Voice-Recording&type=audio`]);
                setIsRecording(false);
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };

    const stopRecording = () => { if (mediaRecorderRef.current && isRecording) mediaRecorderRef.current.stop(); };

    const handleSearchLocation = async () => {
        if (!mapQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`/geo-api/search?q=${encodeURIComponent(mapQuery)}&format=json&limit=1&countrycodes=in`);
            const data = await res.json();
            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                setForm(f => ({ ...f, coords: { lat: parseFloat(lat), lng: parseFloat(lon) }, location: display_name }));
            }
        } finally { setIsSearching(false); }
    };

    const detectLocation = () => {
        setIsDetecting(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude: lat, longitude: lon } = pos.coords;
                    setForm(f => ({ ...f, coords: { lat, lng: lon } }));
                    setIsDetecting(false);
                },
                () => setIsDetecting(false)
            );
        } else { setIsDetecting(false); }
    };

    return (
        <DashboardLayout title={t("portal_title")} subtitle={t("portal_subtitle")}>
            <main className="max-w-3xl mx-auto px-6 py-10">
                <button onClick={() => navigate("/citizen")} className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {t("portal_backDash")}
                </button>

                {["details", "issue", "location", "preview"].includes(step) && (
                    <div className="flex items-center justify-between mb-10 px-2">
                        {[t("portal_step_identity"), t("portal_step_problem"), t("portal_step_location"), t("portal_step_confirm")].map((label, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${i <= ["details", "issue", "location", "preview"].indexOf(step) ? "bg-[#B91C1C] text-white" : "bg-gray-100 text-gray-400"}`}>
                                    {i + 1}
                                </div>
                                <span className="text-[9px] font-black uppercase text-gray-400">{label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {step === "details" && (
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t("portal_fullName")}</label>
                            <input
                                value={form.citizen}
                                onChange={e => set("citizen", e.target.value)}
                                onBlur={e => autoTranslate("citizen", e.target.value)}
                                className="input-field w-full"
                                placeholder={t("portal_fullName")}
                            />
                            {isTranslating && <Loader2 className="w-4 h-4 text-gray-400 absolute right-4 top-9 animate-spin" />}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t("portal_phone")}</label>
                            <input value={form.phone} onChange={e => set("phone", e.target.value)} className="input-field" placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <button onClick={next} disabled={!form.citizen || !form.phone} className="btn-primary w-full !py-4">{t("portal_nextIssue")} <ArrowRight className="w-4 h-4" /></button>
                    </div>
                )}

                {step === "issue" && (
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
                        <button onClick={isRecording ? stopRecording : startRecording} className={`w-full py-4 rounded-2xl font-black uppercase text-xs ${isRecording ? "bg-red-600 text-white" : "bg-gray-100"}`}>
                            {isRecording ? t("portal_stopRecording") : t("portal_recordVoice")}
                        </button>
                        <div className="relative">
                            <input
                                value={form.issue}
                                onChange={e => set("issue", e.target.value)}
                                onBlur={e => autoTranslate("issue", e.target.value)}
                                className="input-field w-full"
                                placeholder={t("portal_problemTitle_label")}
                            />
                            {isTranslating && <Loader2 className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />}
                        </div>
                        <div className="relative">
                            <textarea
                                value={form.description}
                                onChange={e => set("description", e.target.value)}
                                onBlur={e => autoTranslate("description", e.target.value)}
                                rows={4}
                                className="input-field w-full"
                                placeholder={t("portal_descPlaceholder")}
                            />
                            {isTranslating && <Loader2 className="w-4 h-4 text-gray-400 absolute right-4 top-4 animate-spin" />}
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="btn-secondary w-full">{t("portal_uploadDoc")}</button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                        <div className="flex gap-4">
                            <button onClick={back} className="btn-secondary flex-1">{t("back")}</button>
                            <button onClick={next} className="btn-primary flex-[2]">{t("portal_nextLocation")}</button>
                        </div>
                    </div>
                )}

                {step === "location" && (
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
                        <input value={mapQuery} onChange={e => setMapQuery(e.target.value)} className="input-field" placeholder={t("portal_searchLocation")} />
                        <button onClick={detectLocation} className="btn-secondary w-full">{t("portal_detectLocation")}</button>
                        <div className="flex gap-4">
                            <button onClick={back} className="btn-secondary flex-1">{t("back")}</button>
                            <button onClick={next} className="btn-primary flex-[2]">{t("next")}</button>
                        </div>
                    </div>
                )}

                {step === "preview" && (
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
                        <h2 className="text-2xl font-black">{t("portal_review_title")}</h2>
                        <div className="bg-gray-50 p-4 rounded-xl text-sm font-bold">{form.issue}</div>
                        <button onClick={handleSubmit} className="btn-primary w-full !py-5">{t("portal_submit")} <Send className="w-4 h-4" /></button>
                    </div>
                )}

                {step === "submitting" && (
                    <div className="flex flex-col items-center justify-center gap-4 py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#B91C1C]" />
                        <p className="font-black uppercase text-sm tracking-widest">{t("portal_aiRouting")}</p>
                    </div>
                )}

                {step === "success" && (
                    <div className="text-center py-20 space-y-6">
                        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
                        <h2 className="text-3xl font-black">{t("portal_success_title")}</h2>
                        <div className="bg-emerald-50 p-6 rounded-3xl inline-block text-emerald-800">
                            <p className="text-xs uppercase font-black mb-1">{t("portal_ticketId")}</p>
                            <p className="text-4xl font-mono font-black">{ticketId}</p>
                        </div>
                    </div>
                )}
            </main>

            <footer className="py-10 text-center border-t border-gray-100 bg-white/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">{lang === "ta" ? "மாவட்ட மின் ஆளுமை போர்ட்டல் · 2026" : "District e-Governance Portal · 2026"}</p>
            </footer>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </DashboardLayout>
    );
}
