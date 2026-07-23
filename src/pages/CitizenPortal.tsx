import React, { useState, useRef, useEffect, useCallback } from "react";
import { useComplaints } from "@/context/ComplaintsContext";

import { analyzeComplaint } from "@/services/aiService";
import {
    User, Phone, MapPin, AlertTriangle,
    CheckCircle2, Loader2, ArrowLeft, Send,
    MessageSquare, Shield, Camera, X, Check,
    ChevronRight, Map as MapIcon, Paperclip, Mic, Video,
    LogOut, FileText, Search, MicOff, Hash, Building2, Sparkles, Brain, Navigation
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createLocationMarker = (label: string) => {
    let short = "📍";
    const wardMatch = label.match(/Ward(?:\s+Number)?\s+(\d+)/i);
    if (wardMatch) {
        short = `W${wardMatch[1]}`;
    } else if (label.trim().length > 0) {
        short = label.trim().substring(0, 2).toUpperCase();
    }
    
    return L.divIcon({
        className: 'custom-ward-marker bg-transparent border-0',
        html: `
            <div style="
                width: 44px; height: 44px; 
                background-color: #059669;
                border-radius: 50% 50% 50% 0; 
                transform: rotate(-45deg);
                box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.4);
                display: flex; 
                align-items: center; 
                justify-content: center;
                cursor: pointer;
            ">
                <div style="
                    transform: rotate(45deg); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    width: 100%; 
                    height: 100%;
                ">
                    <span style="
                        font-family: 'Inter', sans-serif;
                        font-size: 11px; 
                        font-weight: 900; 
                        color: white; 
                        line-height: 1;
                        font-variant-numeric: tabular-nums;
                        display: flex;
                        align-items: center;
                        gap: 1px;
                    ">
                        ${short.startsWith('W') ? `<span>W</span><span style="display: inline-block; width: 14px; text-align: left;">${short.substring(1)}</span>` : short}
                    </span>
                </div>
            </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -44],
        tooltipAnchor: [0, -44]
    });
};




type Step = "details" | "issue" | "location" | "preview" | "submitting" | "success";

function MapUpdater({ coords }: { coords: { lat: number, lng: number } }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([coords.lat, coords.lng], map.getZoom());
    }, [coords, map]);
    return null;
}

function MapEventsHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// ─── Stable Search Input with Nominatim Autocomplete ─────────────────────────
// React.memo prevents re-renders from parent state — fixes "one letter" bug.
// Includes a live suggestion dropdown powered by Nominatim (no API key needed).
const LocationSearchInput = React.memo(function LocationSearchInput({
    inputRef,
    onSearch,
    isSearching,
}: {
    inputRef: React.RefObject<HTMLInputElement | null>;
    onSearch: () => void;
    isSearching: boolean;
}) {
    const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
    const [showSugg, setShowSugg] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.trim().length < 2) { setSuggestions([]); setShowSugg(false); return; }
        debounceRef.current = setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=in`)
                .then(r => r.json())
                .then(data => { setSuggestions(data); setShowSugg(data.length > 0); })
                .catch(() => {});
        }, 350);
    };

    const pickSuggestion = (s: { display_name: string; lat: string; lon: string }) => {
        if (inputRef.current) inputRef.current.value = s.display_name;
        setSuggestions([]);
        setShowSugg(false);
        onSearch();
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }} />
            <input
                ref={inputRef}
                type="text"
                placeholder="Search any village, street or landmark in India..."
                className="w-full py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-red-300 focus:outline-none transition-all shadow-inner"
                style={{ paddingLeft: '3.5rem', paddingRight: '128px' }}
                onChange={handleInput}
                onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); setShowSugg(false); onSearch(); }
                    if (e.key === 'Escape') setShowSugg(false);
                }}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                autoComplete="off"
            />
            <button
                type="button"
                onClick={() => { setShowSugg(false); onSearch(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-colors flex items-center justify-center min-w-[100px] z-20"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
            {showSugg && suggestions.length > 0 && (
                <ul style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
                    background: 'white', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    border: '1px solid #e5e7eb', marginTop: '6px', maxHeight: '260px', overflowY: 'auto',
                    listStyle: 'none', padding: '6px 0'
                }}>
                    {suggestions.map((s, i) => (
                        <li key={i}
                            onMouseDown={() => pickSuggestion(s)}
                            style={{
                                padding: '10px 18px', cursor: 'pointer', fontSize: '0.95rem',
                                fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'flex-start', gap: '10px'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                        >
                            <span style={{ color: '#6b7280', marginTop: '2px', flexShrink: 0 }}>📍</span>
                            <span style={{ lineHeight: 1.4 }}>{s.display_name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

const WARDS = Array.from({ length: 100 }, (_, i) => `Ward ${(i + 1).toString().padStart(2, '0')}`);

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
    "Ward 12": ["Vijayanagar", "Govindraj Nagar", "RPC Layout"],
};

// Fill missing localities for all other wards up to 100 to prevent errors
WARDS.forEach(w => {
    if (!LOCALITIES[w]) {
        if (w === "Ward 28") {
            LOCALITIES[w] = ["Saravanampatti", "KGISL Campus", "CHIL SEZ"];
        } else {
            LOCALITIES[w] = ["General Area", "Main Road", "Residential Layout"];
        }
    }
});

export default function CitizenPortal() {
    const { addComplaint, currentUser, logout } = useComplaints();

    const navigate = useNavigate();
    const [step, setStep] = useState<Step>("details");
    const [ticketId, setTicketId] = useState("");

    const [form, setForm] = useState({
        citizen: currentUser?.name || "",
        phone: "",
        ward: "Ward 28",
        area: "Saravanampatti",
        priority: "Medium" as "Low" | "Medium" | "High",
        issue: "",
        description: "",
        location: "",
        landmark: "",
        coords: { lat: 11.0836, lng: 76.9979 }, // Default: Coimbatore
        evidence: [] as string[],
        notifPref: "SMS" as "SMS" | "Email" | "None"
    });

    const mapsLoaded = false; // Google Maps SDK removed - using Nominatim
    const mapDivRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const [mapQuery, setMapQuery] = useState("");
    const [isDetecting, setIsDetecting] = useState(false);
    const [pendingLocation, setPendingLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);

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
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [audioPreview, setAudioPreview] = useState<{url: string, name: string} | null>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            setCameraStream(stream);
            setShowCamera(true);
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const b64 = reader.result as string;
                            const metaUrl = `${b64}#name=Camera_Capture_${Date.now()}.png&type=image/png`;
                            set("evidence", [...form.evidence, metaUrl]);
                            stopCamera();
                        };
                        reader.readAsDataURL(blob);
                    }
                }, "image/png");
            }
        }
    };

    const [isListening, setIsListening] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const speechRecRef = useRef<any>(null);

    // Autocomplete is now handled inside LocationSearchInput component via Nominatim

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const b64 = reader.result as string;
                const metaUrl = `${b64}#name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type)}`;
                set("evidence", [...form.evidence, metaUrl]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const b64 = reader.result as string;
                const metaUrl = `${b64}#name=${encodeURIComponent(file.name)}&type=audio`;
                set("evidence", [...form.evidence, metaUrl]);
            };
            reader.readAsDataURL(file);
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
                const reader = new FileReader();
                reader.onload = () => {
                    const b64 = reader.result as string;
                    const name = `Live_Voice_Record_${Date.now()}.webm`;
                    setAudioPreview({ url: b64, name });
                };
                reader.readAsDataURL(blob);
                setIsRecording(false);
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

    // Manual Search with Nominatim (Google API is restricted for this key)
    const handleManualSearch = () => {
        const query = autocompleteInputRef.current?.value || mapQuery;
        if (!query.trim()) return;
        setIsSearching(true);

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=in`)
            .then(res => res.json())
            .then(data => {
                setIsSearching(false);
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lng = parseFloat(data[0].lon);
                    setForm(f => ({ ...f, coords: { lat, lng } }));
                    reverseGeocodeGoogle(lat, lng);
                } else {
                    alert("Location not found. Try selecting from the suggestions or refining your search.");
                }
            })
            .catch(() => {
                setIsSearching(false);
                alert("Location not found. Try selecting from the suggestions or refining your search.");
            });
    };

    // Reverse geocode using Nominatim — auto-fills location + landmark fields
    const reverseGeocodeGoogle = useCallback((lat: number, lng: number) => {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
            .then(res => res.json())
            .then(data => {
                const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                const a = data.address || {};

                // Build a short, human-friendly landmark string from structured fields
                const landmarkParts: string[] = [];
                if (a.road)          landmarkParts.push(a.road);
                if (a.neighbourhood) landmarkParts.push(a.neighbourhood);
                else if (a.suburb)   landmarkParts.push(a.suburb);
                else if (a.village)  landmarkParts.push(a.village);
                else if (a.town)     landmarkParts.push(a.town);
                if (a.city || a.county) landmarkParts.push(a.city || a.county);
                const autoLandmark = landmarkParts.join(', ');

                setPendingLocation({ address: addr, lat, lng });
                setMapQuery(addr);
                if (autocompleteInputRef.current) autocompleteInputRef.current.value = addr;

                // Auto-fill the form fields
                setForm(f => ({
                    ...f,
                    location: addr,
                    landmark: autoLandmark || f.landmark,
                }));
            })
            .catch(() => {
                const fallbackAddr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                setPendingLocation({ address: fallbackAddr, lat, lng });
                setMapQuery(fallbackAddr);
                if (autocompleteInputRef.current) autocompleteInputRef.current.value = fallbackAddr;
            });
    }, []);


    const detectLocation = () => {
        setIsDetecting(true);

        const onCoords = (lat: number, lng: number) => {
            setForm(f => ({ ...f, coords: { lat, lng }, location: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
            setMapQuery(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            reverseGeocodeGoogle(lat, lng);
            setIsDetecting(false);
        };

        const fallback = () => {
            // Fallback to Coimbatore KGISL
            onCoords(11.0836, 76.9979);
        };

        if ('geolocation' in navigator) {
            let settled = false;
            const timeout = setTimeout(() => { if (!settled) { settled = true; fallback(); } }, 10000);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timeout);
                    onCoords(pos.coords.latitude, pos.coords.longitude);
                },
                () => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timeout);
                    fallback();
                },
                { timeout: 9000, enableHighAccuracy: true }
            );
        } else {
            fallback();
        }
    };

    const handleSpeakComplaint = () => {
        if (isListening) {
            if (speechRecRef.current) speechRecRef.current.stop();
            setIsListening(false);
            return;
        }
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SR();
            speechRecRef.current = recognition;
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
                            <p className="text-lg font-black text-gray-900">Governance Co-Pilot</p>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Citizen Submission Portal</p>
                        </div>
                    </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate("/citizen")}
                                    className="flex items-center gap-2 text-base font-bold text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                                </button>

                                <button
                                    onClick={() => { logout(); navigate("/"); }}
                                    className="flex items-center gap-2 text-base font-black text-red-600 hover:text-white hover:bg-red-600 transition-all bg-red-50 px-4 py-2 rounded-xl border border-red-100 uppercase tracking-widest"
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
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-black transition-all ${isActive ? "bg-[#B91C1C] text-white scale-110 shadow-lg shadow-red-200" :
                                        isDone ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                                        }`}>
                                        {isDone ? <Check className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className={`text-sm font-black uppercase tracking-widest hidden sm:block ${isActive ? "text-[#B91C1C]" : "text-gray-400"}`}>
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
                            <p className="text-gray-500 text-lg">We need this so officers can contact you for updates.</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-gray-400 ml-1">Full Name *</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                                    <input type="text" required value={form.citizen} onChange={e => set("citizen", e.target.value)}
                                        placeholder="e.g. Meera Soundarya" className="input-field !pl-12" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-gray-400 ml-1">Contact Phone *</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                                    <input type="tel" required value={form.phone} onChange={e => set("phone", e.target.value)}
                                        placeholder="+91 XXXXX XXXXX" className="input-field !pl-12" />
                                </div>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                                <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                                <p className="text-base text-blue-700 font-medium leading-relaxed">Your data is secured by district governance protocols. Only assigned officers can access your phone number.</p>
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
                            <p className="text-gray-500 text-lg">Tell us what needs fixing and provide any supporting media or documents.</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">


                            <div className="space-y-2">
                                <label className="text-base font-black uppercase tracking-widest text-gray-500 ml-1">Problem Title *</label>
                                <input type="text" required value={form.issue} onChange={e => set("issue", e.target.value)}
                                    placeholder="e.g. Pipe burst causing flooding" className="input-field" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-base font-black uppercase tracking-widest text-gray-500 ml-1">Urgency Selector *</label>
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
                                            <span className="text-base font-black uppercase">{p}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-base font-black uppercase tracking-widest text-gray-500 ml-1">Full Description</label>
                                <textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)}
                                    placeholder="Provide more context — how long has this been happening?" className="w-full px-5 py-5 bg-gray-50 border border-transparent rounded-2xl text-base font-bold focus:bg-white focus:border-red-200 focus:outline-none transition-all resize-none shadow-inner" />
                            </div>

                            {/* 📸 Evidence Proof Section (Moved for visibility) */}
                            <div className="pt-6 border-t border-gray-100 space-y-6">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Supporting Evidence (Audio / Docs / Media)</label>
                                    <span className="text-[9px] font-black text-[#B91C1C] uppercase py-1 px-2 bg-red-50 rounded-lg">High Sensitivity</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {form.evidence.map((rawUrl, idx) => {
                                        const [url, meta] = rawUrl.split('#');
                                        const metaParsed = new URLSearchParams(meta || "");
                                        const name = metaParsed.get("name") || "Attachment";
                                        const type = metaParsed.get("type") || "";
                                        
                                        const isAudio = type.includes('audio') || url.endsWith('.mp3') || url.endsWith('.wav') || url.startsWith('blob:audio');
                                        const isVideo = type.includes('video') || url.endsWith('.mp4');
                                        const isImage = type.includes('image') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                        const isDoc   = type.includes('pdf') || type.includes('word') || type.includes('sheet') || type.includes('presentation') || url.match(/\.(pdf|docx|xlsx|pptx)$/i);

                                        return (
                                            <div key={idx} className="aspect-video bg-gray-50 rounded-2xl relative group overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                                                {isImage ? (
                                                    <div 
                                                        className="w-full h-full relative cursor-pointer" 
                                                        onClick={() => setPreviewImage(url)}
                                                    >
                                                        <img src={url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Search className="w-6 h-6 text-white drop-shadow-lg" />
                                                        </div>
                                                    </div>
                                                ) : isAudio ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 p-4">
                                                        <Mic className="w-6 h-6 text-amber-500 mb-2" />
                                                        <span className="text-[9px] font-black text-amber-500 uppercase mb-2 truncate max-w-full px-2">{name}</span>
                                                        <audio src={url} controls className="w-full h-8 scale-90" />
                                                    </div>
                                                ) : isVideo ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50">
                                                        <Video className="w-6 h-6 text-indigo-400" />
                                                        <span className="text-[9px] font-black text-indigo-400 uppercase mt-1">Video Evidence</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 p-4">
                                                        <FileText className="w-6 h-6 text-blue-500 mb-1" />
                                                        <span className="text-[9px] font-black text-blue-500 uppercase mt-1 truncate max-w-full px-2">{name}</span>
                                                        <span className="text-[8px] font-bold text-blue-300 uppercase mt-1">
                                                            {isDoc ? "Document Registered" : "Signal Registered"}
                                                        </span>
                                                    </div>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-xl flex items-center justify-center shadow-lg hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    <button onClick={addFiles} className="aspect-video bg-white rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-[#B91C1C]/5 hover:border-[#B91C1C]/20 transition-all group shadow-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all shadow-sm">
                                            <Paperclip className="w-5 h-5 text-gray-400 group-hover:text-[#B91C1C]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black uppercase text-gray-900 leading-tight">Upload Document</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">PNG, JPG, PDF (Max 10MB)</p>
                                        </div>
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-black uppercase tracking-widest text-gray-400">Audio / Voice Intelligence</p>
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
                                            className={`flex items-center gap-2 text-sm font-black transition-all px-4 py-2 rounded-xl border ${
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
                                            className="flex items-center gap-2 text-sm font-black text-amber-600 hover:bg-amber-50 transition-colors px-4 py-2 rounded-xl"
                                        >
                                            <Paperclip className="w-4 h-4" /> Upload Audio
                                        </button>
                                        <div className="w-px h-4 bg-gray-200" />
                                        <button 
                                            type="button"
                                            onClick={startCamera}
                                            className="flex items-center gap-2 text-sm font-black text-emerald-600 hover:bg-emerald-50 transition-colors px-4 py-2 rounded-xl"
                                        >
                                            <Camera className="w-4 h-4" /> Camera
                                        </button>
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
                            <p className="text-gray-500 text-lg">Search any village, street, or landmark. Click on map to pin the exact spot.</p>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
                            <div className="space-y-4">
                                {/* Google Places Autocomplete search bar */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1 group">
                                        {(
                                            <LocationSearchInput
                                                inputRef={autocompleteInputRef}
                                                onSearch={handleManualSearch}
                                                isSearching={isSearching}
                                            />
                                        )}
                                    </div>
                                    <button
                                        onClick={detectLocation}
                                        disabled={isDetecting}
                                        className="bg-gray-900 text-white rounded-2xl px-6 py-4 flex items-center gap-2 hover:bg-[#B91C1C] transition-all shadow-xl active:scale-95 disabled:opacity-50 flex-1 sm:flex-none"
                                    >
                                        {isDetecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                                        <span className="text-sm uppercase font-black">My GPS</span>
                                    </button>
                                </div>

                                {/* OpenStreetMap (Leaflet) */}
                                <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-2xl bg-gray-900 relative z-0">
                                    <div className="h-[320px] w-full">
                                        <MapContainer center={[form.coords.lat, form.coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer
                                                attribution='&copy; Google Maps'
                                                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                            />
                                            <Marker 
                                                position={[form.coords.lat, form.coords.lng]} 
                                                draggable={true} 
                                                icon={createLocationMarker(form.location)}
                                                eventHandlers={{
                                                    dragend: (e) => {
                                                        const pos = e.target.getLatLng();
                                                        setForm(f => ({ ...f, coords: { lat: pos.lat, lng: pos.lng } }));
                                                        reverseGeocodeGoogle(pos.lat, pos.lng);
                                                    }
                                                }}
                                            >
                                                {form.location && (
                                                    <Tooltip direction="top" offset={[0, -4]} opacity={1} className="bg-transparent border-0 shadow-none p-0 !m-0">
                                                        <div className="bg-gray-900 text-left p-3 rounded-2xl shadow-xl border border-white/10 max-w-[200px] whitespace-normal">
                                                            <p className="font-black text-white text-sm">Location</p>
                                                            <p className="text-xs text-gray-400 font-medium">
                                                                {form.location}
                                                            </p>
                                                        </div>
                                                    </Tooltip>
                                                )}
                                            </Marker>
                                            <MapUpdater coords={form.coords} />
                                            <MapEventsHandler onLocationChange={(lat, lng) => {
                                                setForm(f => ({ ...f, coords: { lat, lng } }));
                                                reverseGeocodeGoogle(lat, lng);
                                            }} />
                                        </MapContainer>
                                    </div>

                                    {/* Bottom Address HUD */}
                                    <div className="bg-gray-900 p-5 border-t border-white/10">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/10">
                                                <MapPin className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest block mb-1">Live Map Intelligence · Powered by Google</span>
                                                <p className="text-xl font-black text-white leading-tight line-clamp-2">
                                                    {form.location || "Select a location on the map..."}
                                                </p>
                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Hash className="w-3 h-3 text-white/40" />
                                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                                            {form.coords.lat.toFixed(5)}, {form.coords.lng.toFixed(5)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between py-2 px-3 bg-white/5 rounded-xl border border-white/10">
                                                    <div>
                                                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Ward / Area</p>
                                                        <p className="text-base font-black text-emerald-400 uppercase tracking-tight">{form.ward} · {form.area}</p>
                                                    </div>
                                                    <a
                                                        href={`https://www.google.com/maps?q=${form.coords.lat},${form.coords.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-500/40 transition-colors border border-emerald-500/30"
                                                    >
                                                        <MapIcon className="w-3 h-3" /> OPEN MAPS
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pending Location Confirmation Banner */}
                                {pendingLocation && (
                                    <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow">
                                                <MapPin className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">📍 Location Selected</p>
                                                <p className="text-base font-black text-gray-900 leading-tight line-clamp-2">{pendingLocation.address}</p>
                                                <p className="text-[10px] text-gray-400 font-bold mt-0.5">{pendingLocation.lat.toFixed(5)}, {pendingLocation.lng.toFixed(5)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                            <button
                                                onClick={() => setPendingLocation(null)}
                                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-black hover:bg-gray-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setForm(f => ({
                                                        ...f,
                                                        location: pendingLocation.address,
                                                        coords: { lat: pendingLocation.lat, lng: pendingLocation.lng }
                                                    }));
                                                    setPendingLocation(null);
                                                }}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                                            >
                                                <Check className="w-4 h-4" /> Add This Location
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Confirmed location display */}
                                {form.location && !pendingLocation && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-0.5">✅ Location Added to Complaint</p>
                                            <p className="text-sm font-black text-gray-900 line-clamp-1">{form.location}</p>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps?q=${form.coords.lat},${form.coords.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-blue-600 text-xs font-bold hover:underline shrink-0"
                                        >
                                            <MapIcon className="w-3 h-3" /> View
                                        </a>
                                    </div>
                                )}

                                <p className="text-xs text-gray-400 font-bold text-center">💡 Search above, click on the map, or drag the pin — then press <strong>Add This Location</strong></p>
                            </div>

                            {/* Area Detail Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-gray-400 ml-1 block">Election Ward</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                                        <select
                                            value={form.ward}
                                            onChange={e => {
                                                const w = e.target.value;
                                                const newArea = LOCALITIES[w]?.[0] || "Other";
                                                setForm(f => ({ ...f, ward: w, area: newArea }));
                                            }}
                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-bold focus:bg-white focus:border-[#B91C1C]/30 focus:outline-none text-gray-800 transition-all appearance-none cursor-pointer"
                                        >
                                            {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                            <ChevronRight className="w-4 h-4 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-gray-400 ml-1 block">Specify Area / Locality</label>
                                    <div className="relative group">
                                        <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                                        <select
                                            value={form.area}
                                            onChange={e => {
                                                const a = e.target.value;
                                                setForm(f => ({ ...f, area: a }));
                                            }}
                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-bold focus:bg-white focus:border-[#B91C1C]/30 focus:outline-none text-gray-800 transition-all appearance-none cursor-pointer"
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
                                <label className="text-sm font-black uppercase tracking-widest text-gray-400 ml-1 block">Exact Landmark Detail</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                                    <input
                                        type="text"
                                        value={form.landmark}
                                        onChange={e => set("landmark", e.target.value)}
                                        placeholder="e.g. Opposite to Post Office, Near Blue Building"
                                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-bold focus:bg-white focus:border-[#B91C1C]/30 focus:outline-none text-gray-800 placeholder:text-gray-300 transition-all"
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
                            <p className="text-gray-500 text-lg">Please verify all details before final submission.</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">

                            {/* ── Light Header ── */}
                            <div className="bg-gray-50 border-b border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-sm font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                                        form.priority === "High"   ? "bg-red-100 text-red-600" :
                                        form.priority === "Medium" ? "bg-amber-100 text-amber-600" :
                                                                     "bg-blue-100 text-blue-600"
                                    }`}>
                                        {form.priority} Priority
                                    </span>
                                    <span className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Preview Ticket</span>
                                </div>

                                {/* Map preview — light style */}
                                <div className="mb-5 rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-40 relative">
                                    <iframe
                                        key={`preview-${form.coords.lat}-${form.coords.lng}`}
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.coords.lng - 0.002},${form.coords.lat - 0.002},${form.coords.lng + 0.002},${form.coords.lat + 0.002}&layer=mapnik&marker=${form.coords.lat},${form.coords.lng}`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: "none" }}
                                        title="Location Preview"
                                    />
                                </div>

                                <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">{form.issue}</h2>
                                <div className="flex items-start gap-2 text-gray-500 text-sm font-semibold">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#B91C1C]" />
                                    <span>{form.location || `${form.coords.lat.toFixed(5)}, ${form.coords.lng.toFixed(5)}`}
                                        {form.landmark && <span className="text-gray-700 font-bold"> · {form.landmark}</span>}
                                    </span>
                                </div>
                            </div>

                            {/* ── Body ── */}
                            <div className="p-8 space-y-6">

                                {/* Citizen details */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Citizen Name</p>
                                        <p className="text-base font-black text-gray-900">{form.citizen}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Contact Phone</p>
                                        <p className="text-base font-black text-gray-900">{form.phone}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 col-span-2">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Ward &amp; Area</p>
                                        <p className="text-base font-black text-gray-900">{form.ward} · {form.area}</p>
                                    </div>
                                </div>

                                {/* Evidence */}
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Attached Evidence</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {form.evidence.length === 0 ? (
                                            <p className="text-sm italic text-gray-400">No media attached.</p>
                                        ) : (
                                            form.evidence.map((rawUrl, i) => {
                                                const [url, meta] = rawUrl.split('#');
                                                const metaParsed = new URLSearchParams(meta || "");
                                                const type = metaParsed.get("type") || "";
                                                const isAudio = type.includes('audio') || url.startsWith('blob:audio');
                                                const isDoc   = type.includes('pdf') || type.includes('word') || type.includes('sheet');
                                                return (
                                                    <div key={i} className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                                                        isAudio ? "bg-amber-50 border-amber-100 text-amber-500" :
                                                        isDoc   ? "bg-blue-50 border-blue-100 text-blue-500" :
                                                                  "bg-gray-50 border-gray-100 text-gray-400"
                                                    }`}>
                                                        {isAudio ? <Mic className="w-5 h-5" /> : isDoc ? <FileText className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Notification */}
                                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-3">Notification Settings</p>
                                    <div className="flex gap-5">
                                        {["SMS", "Email", "None"].map(p => (
                                            <button key={p} onClick={() => set("notifPref", p)}
                                                className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-colors ${form.notifPref === p ? "text-emerald-700" : "text-gray-400"}`}>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${form.notifPref === p ? "border-emerald-600 bg-emerald-600" : "border-gray-300"}`}>
                                                    {form.notifPref === p && <Check className="w-2.5 h-2.5 text-white" />}
                                                </div>
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-2">
                                    <button onClick={back} className="btn-secondary flex-1">Back</button>
                                    <button onClick={handleSubmit}
                                        className="btn-primary flex-[2] !shadow-2xl !shadow-red-500/20 active:scale-95 group">
                                        <span>Authorize &amp; Submit Grievance</span>
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
                            <p className="text-base text-gray-400 font-bold mt-1">
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
                                <p className="text-sm font-black uppercase tracking-[0.4em] text-gray-400 mb-3">Live Tracking ID</p>
                                <p className="text-5xl font-black text-[#B91C1C] font-mono tracking-tighter group-hover:scale-110 transition-transform">{ticketId}</p>
                            </div>

                            {/* XAI Reasoning for Citizen */}
                            {aiResult && (
                                <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 text-left mb-10 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-amber-600" />
                                        <h4 className="text-sm font-black uppercase tracking-widest text-amber-700">GovPilot AI Insight</h4>
                                    </div>
                                    <p className="text-base font-bold text-amber-900 leading-relaxed">
                                        {aiResult.reasoning}
                                    </p>
                                    <div className="pt-3 border-t border-amber-200">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-2">Automated Next Steps:</p>
                                        <ul className="space-y-1">
                                            {aiResult.actionPlan.map((step: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2 text-sm font-bold text-amber-800">
                                                    <div className="w-1 h-1 bg-amber-400 rounded-full" /> {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <button onClick={() => navigate("/citizen")}
                                className="btn-primary w-full !py-5 shadow-2xl shadow-red-500/20 text-lg">
                                Go to My Tracking Portal
                            </button>

                            {/* Micro Strategic Manual for Success Flow */}
                            <div className="mt-16 pt-16 border-t border-gray-100 space-y-10">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="px-5 py-1.5 bg-gray-50 text-gray-400 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-gray-100">
                                        Post-Submission Protocol
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight italic uppercase">What happens next?</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-8 text-left">
                                    {[
                                        { step: "01", title: "Dept Handoff", desc: "Automated routing to the specific district unit." },
                                        { step: "02", title: "Field Triage", desc: "Assigned officer verifies the ticket intelligence." },
                                        { step: "03", title: "Site Action", desc: "Units deployed to your coordinates for resolution." },
                                        { step: "04", title: "Proofing", desc: "Officer uploads resolution proof for your verify." },
                                    ].map((s, i) => (
                                        <div key={i} className="flex gap-4 group/step">
                                            <div className="text-2xl font-black text-gray-900/5 italic tracking-tighter group-hover/step:text-[#B91C1C]/10 transition-colors uppercase pt-1">{s.step}</div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover/step:text-[#B91C1C] transition-colors italic">{s.title}</h4>
                                                <p className="text-sm text-gray-400 font-bold leading-relaxed">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="py-10 text-center border-t border-gray-100 bg-white/50">
                <p className="text-sm font-black uppercase tracking-widest text-gray-300">District e-Governance Portal · 2026</p>
            </footer>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
            {/* Live Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-xl bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">Live Camera Capture</h3>
                            </div>
                            <button 
                                onClick={stopCamera} 
                                className="p-2 rounded-xl hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                            <video 
                                ref={(node) => {
                                    if (videoRef) {
                                        (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
                                    }
                                    if (node && cameraStream && node.srcObject !== cameraStream) {
                                        node.srcObject = cameraStream;
                                    }
                                }}
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="p-6 bg-gray-50 flex items-center justify-between gap-4">
                            <button 
                                onClick={stopCamera} 
                                className="btn-secondary !py-3 !px-6 text-sm font-black uppercase tracking-widest !rounded-xl"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={capturePhoto} 
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                            >
                                <Camera className="w-4 h-4" /> Capture Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Audio Preview Modal */}
            {audioPreview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-xl bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-2">
                                <Mic className="w-5 h-5 text-amber-500" />
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">Voice Recording Preview</h3>
                            </div>
                            <button 
                                onClick={() => setAudioPreview(null)} 
                                className="p-2 rounded-xl hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-12 flex flex-col items-center justify-center bg-white">
                            <audio src={audioPreview.url} controls className="w-full max-w-md" />
                        </div>

                        <div className="p-6 bg-gray-50 flex items-center justify-between gap-4 border-t border-gray-100">
                            <button 
                                onClick={() => setAudioPreview(null)} 
                                className="btn-secondary !py-3 !px-6 text-sm font-black uppercase tracking-widest !rounded-xl"
                            >
                                Discard
                            </button>
                            <button 
                                onClick={() => {
                                    const metaUrl = `${audioPreview.url}#name=${audioPreview.name}&type=audio/webm`;
                                    set("evidence", [...form.evidence, metaUrl]);
                                    setAudioPreview(null);
                                }} 
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                            >
                                <Check className="w-4 h-4" /> Attach Recording
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <button 
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Prevent click from closing immediately
                    />
                </div>
            )}
        </div>
    );
}
