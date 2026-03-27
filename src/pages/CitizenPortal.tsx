import { useState, useRef } from "react";
import { useComplaints } from "@/context/ComplaintsContext";
import { analyzeComplaint } from "@/services/aiService";
import {
    User, Phone, MapPin, AlertTriangle,
    CheckCircle2, Loader2, ArrowLeft, Send,
    MessageSquare, Shield, Camera, X, Check,
    ChevronRight, Map as MapIcon, Paperclip, Mic, Video,
    LogOut, FileText, Search, MicOff, Hash, Building2, Sparkles, Brain
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
            // STEP: Call AI Intelligence API to auto-route
            const analysis = await analyzeComplaint(form.issue, form.description);
            setAiResult(analysis);
            
            const id = addComplaint({ 
                ...form, 
                category: analysis.category,
                priority: analysis.priority,
                dept: analysis.dept
            });
            
            setTicketId(id);
            setStep("success");
        } catch (err) {
            console.error("AI Routing Error:", err);
            // Fallback: regular submit
            const id = addComplaint({ ...form });
            setTicketId(id);
            setStep("success");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const addFiles = () => {
        fileInputRef.current?.click();
    };

    const removeFile = (idx: number) => {
        set("evidence", form.evidence.filter((_, i) => i !== idx));
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [mapQuery, setMapQuery] = useState("");
    const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const url = URL.createObjectURL(file);
            // Append metadata to the URL as a fragment to help with preview detection
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

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                set("evidence", [...form.evidence, url]);
                setIsRecording(false);
                // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const handleSearchLocation = async () => {
        if (!mapQuery.trim()) return;
        setIsSearching(true);
        setSuggestions([]);
        setShowSuggestions(false);

        // 1. Check if the query itself matches an internal ward or locality
        const { matchedWard, matchedArea, found } = findInternalMatch(mapQuery);
        if (found) {
            // Simulated coordinates for Bangalore/District HQ areas (could be more specific per ward if needed)
            const baseCoords = { lat: 12.9716, lng: 77.5946 };
            setForm(f => ({
                ...f,
                location: `${matchedArea}, ${matchedWard}, Bengaluru`,
                coords: baseCoords,
                ward: matchedWard,
                area: matchedArea
            }));
            setIsSearching(false);
            return;
        }

        try {
            const res = await fetch(
                `/geo-api/search?q=${encodeURIComponent(mapQuery)}&format=json&limit=1&countrycodes=in`,
                { headers: { "Accept-Language": "en" } }
            );
            if (res.status === 429) {
                // If rate limited, just use the best internal match we found
                const { matchedWard, matchedArea } = findBestMatch(mapQuery);
                setForm(f => ({
                    ...f,
                    location: mapQuery,
                    ward: matchedWard,
                    area: matchedArea
                }));
                return;
            }
            const data = await res.json();
            if (data.length > 0) {
                const place = data[0];
                const lat = parseFloat(place.lat);
                const lon = parseFloat(place.lon);
                const parts = place.display_name.split(",");
                const name = parts.slice(0, 3).join(", ").trim();
                const { matchedWard, matchedArea } = findBestMatch(place.display_name);

                setForm(f => ({
                    ...f,
                    coords: { lat, lng: lon },
                    location: name,
                    ward: matchedWard,
                    area: matchedArea
                }));
            } else {
                alert("Location not found. Please try entering a known street or landmark name.");
            }
        } catch (error) {
            console.error("Search error:", error);
            // On error, try one last check for best match
            const { matchedWard, matchedArea } = findBestMatch(mapQuery);
            setForm(f => ({ ...f, ward: matchedWard, area: matchedArea }));
        } finally {
            setIsSearching(false);
        }
    };

    const fetchSuggestions = async (q: string) => {
        if (q.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
        
        // 1. Prioritize internal matches for suggestions
        const internalResults: any[] = [];
        const lowerQ = q.toLowerCase();
        for (const [ward, areas] of Object.entries(LOCALITIES)) {
            for (const area of areas) {
                if (area.toLowerCase().includes(lowerQ)) {
                    internalResults.push({
                        display_name: `${area}, ${ward}, Bengaluru, India`,
                        lat: "12.9716",
                        lon: "77.5946"
                    });
                }
            }
        }

        if (internalResults.length > 0) {
            setSuggestions(internalResults.slice(0, 5));
            setShowSuggestions(true);
            return;
        }

        try {
            const res = await fetch(
                `/geo-api/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`,
                { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch {
            setSuggestions([]);
        }
    };

    const findInternalMatch = (q: string) => {
        const lower = q.toLowerCase();
        for (const [ward, areas] of Object.entries(LOCALITIES)) {
            for (const area of areas) {
                if (lower.includes(area.toLowerCase()) || area.toLowerCase().includes(lower)) {
                    return { matchedWard: ward, matchedArea: area, found: true };
                }
            }
        }
        return { matchedWard: form.ward, matchedArea: form.area, found: false };
    };

    const findBestMatch = (address: string) => {
        const lower = address.toLowerCase();
        
        // 1. First, try to find an exact locality match across ALL wards
        for (const [ward, areas] of Object.entries(LOCALITIES)) {
            for (const area of areas) {
                if (lower.includes(area.toLowerCase())) {
                    return { matchedWard: ward, matchedArea: area };
                }
            }
        }

        // 2. If no locality match, try to find a ward match (e.g. "Ward 03")
        for (const w of WARDS) {
            const wardNum = w.toLowerCase().replace("ward ", "");
            if (lower.includes(w.toLowerCase()) || lower.includes(`ward ${wardNum}`) || lower.includes(`ward-${wardNum}`)) {
                return { matchedWard: w, matchedArea: LOCALITIES[w][0] };
            }
        }

        // 3. Fallback to current selections if no match found
        return { matchedWard: form.ward, matchedArea: form.area };
    };

    const pickSuggestion = (s: { display_name: string; lat: string; lon: string }) => {
        const lat = parseFloat(s.lat);
        const lon = parseFloat(s.lon);
        setForm(f => ({ ...f, coords: { lat, lng: lon } }));

        const parts = s.display_name.split(",");
        const name = parts.slice(0, 3).join(", ").trim();
        const { matchedWard, matchedArea } = findBestMatch(s.display_name);

        setForm(f => ({
            ...f,
            location: name,
            coords: { lat, lng: lon },
            ward: matchedWard,
            area: matchedArea
        }));

        setMapQuery(name);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const detectLocation = () => {
        setIsDetecting(true);
        if ("geolocation" in navigator) {
            const reverseGeocode = async (lat: number, lon: number) => {
                try {
                    const res = await fetch(
                        `/geo-api/reverse?lat=${lat}&lon=${lon}&format=json`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    if (!res.ok) throw new Error("API Limit reached");
                    const data = await res.json();
                    const addr = data.display_name ?? "";
                    const parts = addr.split(",");
                    const shortName = parts.slice(0, 3).join(", ").trim();
                    const { matchedWard, matchedArea } = findBestMatch(addr);

                    setForm(f => ({
                        ...f,
                        location: shortName || `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
                        coords: { lat, lng: lon },
                        ward: matchedWard,
                        area: matchedArea
                    }));
                    setMapQuery(shortName);
                } catch {
                    setForm(f => ({
                        ...f,
                        location: `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
                        coords: { lat, lng: lon }
                    }));
                }
                setIsDetecting(false);
            };

            const fallback = () => {
                const randoms = [
                    { lat: 11.0168, lng: 76.9558, loc: "Coimbatore, Tamil Nadu, India", ward: "Ward 07", area: "Whitefield" },
                    { lat: 12.9716, lng: 77.5946, loc: "MG Road, Bengaluru, Karnataka, India", ward: "Ward 05", area: "MG Road" },
                    { lat: 12.9279, lng: 77.6271, loc: "Koramangala, Bengaluru, India", ward: "Ward 02", area: "Koramangala 1st Block" }
                ];
                const pick = randoms[Math.floor(Math.random() * randoms.length)];
                setForm(f => ({
                    ...f,
                    coords: { lat: pick.lat, lng: pick.lng },
                    location: pick.loc,
                    ward: pick.ward,
                    area: pick.area
                }));
                setMapQuery(pick.loc);
                setIsDetecting(false);
            };

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude: lat, longitude: lon } = pos.coords;
                    reverseGeocode(lat, lon);
                },
                () => fallback(),
                { timeout: 5000, enableHighAccuracy: true }
            );
            setTimeout(() => { setIsDetecting(p => { if (p) fallback(); return false; }); }, 6000);
        } else {
            setIsDetecting(false);
        }
    };

    const handleSpeakComplaint = () => {
        if (isListening) {
            setIsListening(false);
            return;
        }
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SR();
            recognition.lang = 'en-IN';
            recognition.interimResults = false;
            setIsListening(true);
            recognition.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                set('issue', text);
                setIsListening(false);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognition.start();
        } else {
            // Demo fallback
            setIsListening(true);
            setTimeout(() => {
                const demos = [
                    "Water pipe burst near main road causing flooding",
                    "Streetlight not working in residential area for 3 days",
                    "Large pothole on Ward 5 main road near school",
                ];
                set('issue', demos[Math.floor(Math.random() * demos.length)]);
                setIsListening(false);
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCF8] flex flex-col font-inter">
            {/* ── Header ────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#B91C1C] flex items-center justify-center shadow-lg shadow-red-200">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900">Governance Co-Pilot</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Citizen Submission Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate("/citizen")}
                            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                        <button
                            onClick={() => { logout(); navigate("/"); }}
                            className="flex items-center gap-2 text-xs font-black text-red-600 hover:text-white hover:bg-red-600 transition-all bg-red-50 px-4 py-2 rounded-xl border border-red-100 uppercase tracking-widest"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Main Content ───────────────────────────────────────────── */}
            <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10">

                {/* Progress Indicator */}
                {["details", "issue", "location", "preview"].includes(step) && (
                    <div className="flex items-center justify-between mb-10 px-2">
                        {[
                            { id: "details", label: "Identity" },
                            { id: "issue", label: "Problem & Evidence" },
                            { id: "location", label: "Confirm Location" },
                            { id: "preview", label: "Confirm" }
                        ].map((s, i, arr) => {
                            const steps = ["details", "issue", "location", "preview"];
                            const currentIdx = steps.indexOf(step);
                            const thisIdx = steps.indexOf(s.id);
                            const isActive = step === s.id;
                            const isDone = thisIdx < currentIdx;

                            return (
                                <div key={s.id} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${isActive ? "bg-[#B91C1C] text-white scale-110 shadow-lg shadow-red-200" :
                                        isDone ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                                        }`}>
                                        {isDone ? <Check className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${isActive ? "text-[#B91C1C]" : "text-gray-400"}`}>
                                        {s.label}
                                    </span>
                                    {i < arr.length - 1 && <div className="w-8 h-px bg-gray-100 mx-2" />}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* STEP 1: IDENTITY */}
                {step === "details" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Identify Yourself</h1>
                            <p className="text-gray-500 text-sm">We need this so officers can contact you for updates.</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name *</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                                    <input type="text" required value={form.citizen} onChange={e => set("citizen", e.target.value)}
                                        placeholder="e.g. Meera Soundarya" className="input-field !pl-12" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contact Phone *</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                                    <input type="tel" required value={form.phone} onChange={e => set("phone", e.target.value)}
                                        placeholder="+91 XXXXX XXXXX" className="input-field !pl-12" />
                                </div>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                                <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                                <p className="text-[11px] text-blue-700 font-medium leading-relaxed">Your data is secured by district governance protocols. Only assigned officers can access your phone number.</p>
                            </div>
                            <button onClick={next} disabled={!form.citizen || !form.phone}
                                className="btn-primary w-full !py-4.5 group">
                                <span>Next: Issue Details</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: ISSUE & URGENCY */}
                {step === "issue" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Problem & Evidence Proof</h1>
                            <p className="text-gray-500 text-sm">Tell us what needs fixing and provide any supporting media or documents.</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
                            {/* Speak Your Complaint button */}
                            <button
                                type="button"
                                onClick={handleSpeakComplaint}
                                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-black transition-all ${isListening
                                    ? "bg-red-600 text-white animate-pulse shadow-lg shadow-red-300"
                                    : "bg-[#B91C1C] hover:bg-red-800 text-white shadow-lg shadow-red-100"
                                    }`}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                {isListening ? "Listening… Tap to stop" : "Speak Your Complaint"}
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-100" />
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">or type below</span>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Problem Title *</label>
                                <input type="text" required value={form.issue} onChange={e => set("issue", e.target.value)}
                                    placeholder="e.g. Pipe burst causing flooding" className="input-field" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Urgency Selector *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(["Low", "Medium", "High"] as const).map(p => (
                                        <button key={p} onClick={() => set("priority", p)}
                                            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${form.priority === p ? (
                                                p === "High" ? "bg-red-50 border-red-500 text-red-700 shadow-inner" :
                                                    p === "Medium" ? "bg-amber-50 border-amber-500 text-amber-700 shadow-inner" :
                                                        "bg-blue-50 border-blue-500 text-blue-700 shadow-inner"
                                            ) : "bg-gray-50 border-transparent grayscale italic opacity-60"
                                                }`}>
                                            <AlertTriangle className={`w-5 h-5 ${p === "High" ? "text-red-500" : p === "Medium" ? "text-amber-500" : "text-blue-500"}`} />
                                            <span className="text-xs font-black uppercase">{p}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Full Description</label>
                                <textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)}
                                    placeholder="Provide more context — how long has this been happening?" className="w-full px-5 py-5 bg-gray-50 border border-transparent rounded-2xl text-base font-bold focus:bg-white focus:border-red-200 focus:outline-none transition-all resize-none shadow-inner" />
                            </div>

                            {/* 📸 Evidence Proof Section (Moved for visibility) */}
                            <div className="pt-6 border-t border-gray-100 space-y-6">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Supporting Evidence (Audio / Docs / Media)</label>
                                    <span className="text-[9px] font-black text-[#B91C1C] uppercase py-1 px-2 bg-red-50 rounded-lg">High Sensitivity</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {form.evidence.map((rawUrl, idx) => {
                                        const [url, meta] = rawUrl.split('#');
                                        const name = meta ? decodeURIComponent(meta.split('&')[0].split('=')[1]) : "Attachment";
                                        const type = meta ? decodeURIComponent(meta.split('&')[1].split('=')[1]) : "";
                                        
                                        const isAudio = type === 'audio' || url.endsWith('.mp3') || url.endsWith('.wav') || url.startsWith('blob:audio');
                                        const isVideo = url.endsWith('.mp4');
                                        const isDoc   = type.includes('pdf') || type.includes('word') || type.includes('sheet') || url.endsWith('.pdf') || url.endsWith('.docx') || url.endsWith('.xlsx');

                                        return (
                                            <div key={idx} className="aspect-video bg-gray-50 rounded-2xl relative group overflow-hidden border border-gray-100">
                                                {isVideo ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50">
                                                        <Video className="w-6 h-6 text-indigo-400" />
                                                        <span className="text-[9px] font-black text-indigo-400 uppercase mt-1">Video</span>
                                                    </div>
                                                ) : isAudio ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 p-4">
                                                        <Mic className="w-6 h-6 text-amber-500 mb-2" />
                                                        <span className="text-[9px] font-black text-amber-500 uppercase mb-2">Voice Complaint</span>
                                                        <audio src={url} controls className="w-full h-8 scale-90" />
                                                    </div>
                                                ) : isDoc ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 p-4">
                                                        <FileText className="w-6 h-6 text-blue-500 mb-1" />
                                                        <span className="text-[9px] font-black text-blue-500 uppercase mt-1 truncate max-w-full px-2">{name}</span>
                                                        <span className="text-[8px] font-bold text-blue-300 uppercase mt-1">Document Evidence</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full relative">
                                                        <img src={url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                )}
                                                <button onClick={() => removeFile(idx)} className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    <button onClick={addFiles} className="aspect-video bg-white rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-[#B91C1C]/5 hover:border-[#B91C1C]/20 transition-all group shadow-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all shadow-sm">
                                            <Paperclip className="w-5 h-5 text-gray-400 group-hover:text-[#B91C1C]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase text-gray-900 leading-tight">Upload Document</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">PNG, JPG, PDF (Max 10MB)</p>
                                        </div>
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Audio / Voice Intelligence</p>
                                        {isRecording && (
                                            <div className="flex items-center gap-2 text-red-600 animate-pulse">
                                                <div className="w-2 h-2 bg-red-600 rounded-full" />
                                                <span className="text-[9px] font-black uppercase">Recording...</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 justify-center">
                                        <button 
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`flex items-center gap-2 text-[10px] font-black transition-all px-4 py-2 rounded-xl border ${
                                                isRecording 
                                                ? "bg-red-600 text-white border-red-700 shadow-lg shadow-red-200" 
                                                : "text-indigo-600 hover:bg-indigo-50 border-transparent"
                                            }`}
                                        >
                                            <Mic className="w-4 h-4" /> 
                                            {isRecording ? "Stop Recording" : "Record Live Voice"}
                                        </button>
                                        <div className="w-px h-6 bg-gray-200" />
                                        <button 
                                            onClick={() => audioInputRef.current?.click()}
                                            className="flex items-center gap-2 text-[10px] font-black text-amber-600 hover:bg-amber-50 transition-colors px-4 py-2 rounded-xl"
                                        >
                                            <Paperclip className="w-4 h-4" /> Upload Audio
                                        </button>
                                        <div className="w-px h-4 bg-gray-200" />
                                        <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-emerald-600 transition-colors"><Camera className="w-4 h-4" /> Camera</button>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    onChange={handleFileChange}
                                />
                                <input
                                    type="file"
                                    ref={audioInputRef}
                                    className="hidden"
                                    accept="audio/*"
                                    onChange={handleAudioUpload}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button onClick={back} className="btn-secondary flex-1 !py-4">Back</button>
                                <button onClick={next} disabled={!form.issue} className="btn-primary flex-[2] !py-4 disabled:opacity-30">
                                    Next: Confirm Location Area
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: LOCATION & EVIDENCE */}
                {step === "location" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Confirm Location</h1>
                            <p className="text-gray-500 text-sm">Help officers find the exact spot using GPS and interactive mapping.</p>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
                            {/* ── Search & Intelligence Hub ── */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#B91C1C] transition-colors" />
                                        <input
                                            type="text"
                                            value={mapQuery}
                                            onChange={e => {
                                                setMapQuery(e.target.value);
                                                fetchSuggestions(e.target.value);
                                            }}
                                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSearchLocation(); } }}
                                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            placeholder="Search locality, street or landmark..."
                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-[#B91C1C]/30 focus:outline-none transition-all shadow-inner"
                                        />

                                        {/* Suggestions dropdown */}
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl mt-2 z-[60] overflow-hidden">
                                                {suggestions.map((s, i) => (
                                                    <button
                                                        key={i}
                                                        onMouseDown={() => pickSuggestion(s)}
                                                        className="w-full text-left px-5 py-5 hover:bg-red-50 flex items-center gap-4 transition-colors border-b border-gray-50 last:border-b-0 group/item"
                                                    >
                                                        <MapPin className="w-5 h-5 text-[#B91C1C] shrink-0" />
                                                        <span className="text-sm font-bold text-gray-700 line-clamp-1">{s.display_name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSearchLocation}
                                            disabled={isSearching || !mapQuery.trim()}
                                            className="btn-primary !px-6 !py-4 flex-1 sm:flex-none !rounded-2xl active:scale-95"
                                        >
                                            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                            <span className="text-[10px] uppercase font-black">Search</span>
                                        </button>
                                        <button
                                            onClick={detectLocation}
                                            disabled={isDetecting}
                                            className="bg-gray-900 text-white rounded-2xl px-6 py-4 flex items-center gap-2 hover:bg-[#B91C1C] transition-all shadow-xl active:scale-95 disabled:opacity-50 flex-1 sm:flex-none"
                                        >
                                            {isDetecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapIcon className="w-5 h-5" />}
                                            <span className="text-[10px] uppercase font-black">GPS</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Integrated Map & Address Unit */}
                                <div className="relative rounded-[2rem] overflow-hidden border border-gray-100 shadow-2xl">
                                    <div className="h-[320px]">
                                        <iframe
                                            key={`${form.coords.lat}-${form.coords.lng}`}
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.coords.lng - 0.008},${form.coords.lat - 0.008},${form.coords.lng + 0.008},${form.coords.lat + 0.008}&layer=mapnik&marker=${form.coords.lat},${form.coords.lng}`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: "none" }}
                                            title="Complaint Location"
                                        />
                                    </div>

                                    {/* Bottom Address HUD */}
                                    <div className="absolute bottom-4 left-4 right-4 bg-gray-900/95 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-2xl">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/10">
                                                <MapPin className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest block mb-1">Live Map Intelligence</span>
                                                <p className="text-sm font-black text-white leading-tight truncate">
                                                    {form.location || "Searching for address..."}
                                                </p>
                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 className="w-3 h-3 text-white/40" />
                                                        <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">{form.ward}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapIcon className="w-3 h-3 text-white/40" />
                                                        <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">{form.area}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Hash className="w-3 h-3 text-white/40" />
                                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                                            {form.coords.lat.toFixed(5)}, {form.coords.lng.toFixed(5)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 py-2 px-3 bg-white/5 rounded-xl border border-white/10">
                                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Official Area Name</p>
                                                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-tight">{form.area}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Area Detail Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block">Election Ward</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                                        <select
                                            value={form.ward}
                                            onChange={e => {
                                                const w = e.target.value;
                                                setForm(f => ({ ...f, ward: w, area: LOCALITIES[w][0] }));
                                            }}
                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#B91C1C]/30 focus:outline-none text-gray-800 transition-all appearance-none cursor-pointer"
                                        >
                                            {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                            <ChevronRight className="w-4 h-4 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block">Specify Area / Locality</label>
                                    <div className="relative group">
                                        <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                                        <select
                                            value={form.area}
                                            onChange={e => set("area", e.target.value)}
                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#B91C1C]/30 focus:outline-none text-gray-800 transition-all appearance-none cursor-pointer"
                                        >
                                            {LOCALITIES[form.ward]?.map(a => <option key={a} value={a}>{a}</option>)}
                                            <option value="Other">Other / Not Listed</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                            <ChevronRight className="w-4 h-4 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block">Exact Landmark Detail</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={e => set("location", e.target.value)}
                                        placeholder="e.g. Opposite to Post Office, Near Blue Building"
                                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#B91C1C]/30 focus:outline-none text-gray-800 placeholder:text-gray-300 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={back} className="btn-secondary flex-1 !py-4">Back</button>
                                <button onClick={next} className="btn-primary flex-[2] !py-4 !shadow-2xl">Confirm & Review Details</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: PREVIEW & CONFIRM */}
                {step === "preview" && (
                    <div className="space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="text-center">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Review Summary</h1>
                            <p className="text-gray-500 text-sm">Please verify all details before final submission.</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
                            <div className="bg-gray-900 p-8 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${form.priority === "High" ? "bg-red-500 text-white" :
                                        form.priority === "Medium" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                                        }`}>
                                        {form.priority} Priority
                                    </span>
                                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Preview Ticket</span>
                                </div>
                                <div className="mb-6 rounded-[1.5rem] overflow-hidden border border-white/10 shadow-inner h-40 group relative">
                                    <iframe
                                        key={`preview-${form.coords.lat}-${form.coords.lng}`}
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.coords.lng - 0.005},${form.coords.lat - 0.005},${form.coords.lng + 0.005},${form.coords.lat + 0.005}&layer=mapnik&marker=${form.coords.lat},${form.coords.lng}`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: "none", opacity: 0.8, filter: "grayscale(1) invert(0.9) contrast(1.2)" }}
                                        title="Location Preview"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent pointer-events-none" />
                                </div>
                                <h2 className="text-2xl font-black leading-tight drop-shadow-md mb-2">{form.issue}</h2>
                                <div className="flex items-center gap-2 text-white/50 text-xs font-bold">
                                    <MapPin className="w-4 h-4" />
                                    {form.location || "Co-ordinates Only"}
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Citizen Name</p>
                                        <p className="text-sm font-black text-gray-900">{form.citizen}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Contact Phone</p>
                                        <p className="text-sm font-black text-gray-900">{form.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Ward & Area</p>
                                        <p className="text-sm font-black text-gray-900">{form.ward} · {form.area}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Attached Evidence</p>
                                    <div className="flex gap-2">
                                        {form.evidence.length === 0 ? (
                                            <p className="text-xs italic text-gray-400">No media attached.</p>
                                        ) : (
                                            form.evidence.map((rawUrl, i) => {
                                                const [url, meta] = rawUrl.split('#');
                                                const type = meta ? decodeURIComponent(meta.split('&')[1].split('=')[1]) : "";
                                                const isAudio = type === 'audio' || url.startsWith('blob:audio');
                                                const isDoc   = type.includes('pdf') || type.includes('word') || type.includes('sheet');

                                                return (
                                                    <div key={i} className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                                                        isAudio ? "bg-amber-50 border-amber-100 text-amber-500" :
                                                        isDoc ? "bg-blue-50 border-blue-100 text-blue-500" :
                                                        "bg-gray-50 border-gray-100 text-gray-300"
                                                    }`}>
                                                        {isAudio ? <Mic className="w-5 h-5" /> : isDoc ? <FileText className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-2">Notification Settings</p>
                                    <div className="flex gap-4">
                                        {["SMS", "Email", "None"].map(p => (
                                            <button key={p} onClick={() => set("notifPref", p)} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${form.notifPref === p ? "text-emerald-700" : "text-emerald-900/30"}`}>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${form.notifPref === p ? "border-emerald-600 bg-emerald-600" : "border-emerald-200"}`}>
                                                    {form.notifPref === p && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={back} className="btn-secondary flex-1">Back</button>
                                    <button onClick={handleSubmit}
                                        className="btn-primary flex-[2] !shadow-2xl !shadow-red-500/20 active:scale-95 group">
                                        <span>Authorize & Submit Grievance</span>
                                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SUBMITTING STATE */}
                {step === "submitting" && (
                    <div className="h-96 flex flex-col items-center justify-center gap-6">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                            <div className="absolute inset-x-0 top-0 h-1/2 rounded-full border-t-4 border-[#B91C1C] animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                {isAnalyzing ? <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" /> : <Send className="w-8 h-8 text-[#B91C1C]" />}
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 justify-center">
                                {isAnalyzing ? (
                                    <>
                                        AI Routing Engine <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                    </>
                                ) : "Finalizing Submission"}
                            </h2>
                            <p className="text-xs text-gray-400 font-bold mt-1">
                                {isAnalyzing 
                                    ? "Classifying problem and locating relevant field units..." 
                                    : "Establishing secure link between ward and officers..."}
                            </p>
                        </div>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {step === "success" && (
                    <div className="space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-2 bg-emerald-500" />
                            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-50">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 mb-2">Complaint Logged!</h2>
                            <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto">Your report has been successfully encrypted and assigned to the relevant department.</p>

                            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 mb-10 group cursor-pointer active:scale-95 transition-all">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-3">Live Tracking ID</p>
                                <p className="text-5xl font-black text-[#B91C1C] font-mono tracking-tighter group-hover:scale-110 transition-transform">{ticketId}</p>
                            </div>

                            {/* XAI Reasoning for Citizen */}
                            {aiResult && (
                                <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 text-left mb-10 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-amber-600" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-700">GovPilot AI Insight</h4>
                                    </div>
                                    <p className="text-xs font-bold text-amber-900 leading-relaxed">
                                        {aiResult.reasoning}
                                    </p>
                                    <div className="pt-3 border-t border-amber-200">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-2">Automated Next Steps:</p>
                                        <ul className="space-y-1">
                                            {aiResult.actionPlan.map((step: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-amber-800">
                                                    <div className="w-1 h-1 bg-amber-400 rounded-full" /> {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <button onClick={() => navigate("/citizen")}
                                className="btn-primary w-full !py-5 shadow-2xl shadow-red-500/20 text-sm">
                                Go to My Tracking Portal
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <footer className="py-10 text-center border-t border-gray-100 bg-white/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">District e-Governance Portal · 2026</p>
            </footer>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
