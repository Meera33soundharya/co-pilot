import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { Mic, Play, Download, Wand2, Languages, Volume2, Clock, CheckCircle2 } from "lucide-react";

const recentSpeeches = [
    { title: "Council Address – Water Crisis Resolution", date: "Feb 19, 2026", duration: "4:32", lang: "Hindi + English", status: "completed" },
    { title: "Public Health Advisory – Dengue Prevention", date: "Feb 17, 2026", duration: "2:18", lang: "English", status: "completed" },
    { title: "Budget Announcement FY2025-26", date: "Feb 15, 2026", duration: "7:45", lang: "Hindi", status: "completed" },
    { title: "Emergency Road Closure Notice – NH48", date: "Feb 12, 2026", duration: "1:05", lang: "English + Tamil", status: "completed" },
];

const toneOptions = ["Formal", "Empathetic", "Urgent", "Informational", "Motivational"];
const langOptions = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi"];
const audienceOptions = ["Constituents", "Youth", "Senior Citizens", "Opposition", "Media"];

export default function SpeechAI() {
    const [inputText, setInputText] = useState("");
    const [selectedTone, setSelectedTone] = useState("Formal");
    const [selectedLang, setSelectedLang] = useState("English");
    const [selectedAudience, setSelectedAudience] = useState("Constituents");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);

    const handleGenerate = () => {
        if (!inputText.trim()) return;
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setGenerated(true);
        }, 2200);
    };

    return (
        <DashboardLayout title="SpeechAI" subtitle="AI-powered government speech synthesis & translation">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* Main Generator */}
                <div className="xl:col-span-3 space-y-5">
                    {/* Input */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-blue-500" />
                            Generate AI Speech
                        </h3>

                        <textarea
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            placeholder="Enter speech topic, key points or objectives... e.g. 'Announce new water supply restoration plan for Ward 03 citizens'"
                            className="w-full h-36 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                        />

                        {/* Options */}
                        <div className="mt-4 flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[160px]">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Tone</label>
                                <div className="flex flex-wrap gap-2">
                                    {toneOptions.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedTone(t)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${selectedTone === t ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 min-w-[160px]">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Language</label>
                                <div className="flex flex-wrap gap-2">
                                    {langOptions.map(l => (
                                        <button
                                            key={l}
                                            onClick={() => setSelectedLang(l)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${selectedLang === l ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 min-w-[160px]">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Target Audience</label>
                                <div className="flex flex-wrap gap-2">
                                    {audienceOptions.map(a => (
                                        <button
                                            key={a}
                                            onClick={() => setSelectedAudience(a)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${selectedAudience === a ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !inputText.trim()}
                            className="mt-5 w-full py-3 bg-blue-600 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating Speech...
                                </>
                            ) : (
                                <>
                                    <Mic className="w-4 h-4" />
                                    Generate AI Speech
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output */}
                    {generated && (
                        <div className="bg-[#0B1221] border border-white/10 rounded-2xl p-6 shadow-2xl text-white">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-black flex items-center gap-2 text-sm">
                                    <Volume2 className="w-4.5 h-4.5 text-blue-400" />
                                    Generated Speech
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={() => alert('Playing generated speech audio...')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-[10px] font-black hover:bg-white/20 transition-all">
                                        <Play className="w-3 h-3" /> Play
                                    </button>
                                    <button onClick={() => alert('Exporting speech as MP3 file...')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all">
                                        <Download className="w-3 h-3" /> Export
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-sm leading-relaxed text-white/80 border border-white/10">
                                "Respected citizens of Ward 03, I am pleased to announce that the Municipal Corporation, in collaboration with the Water Supply Department, has initiated an emergency restoration program to address the critical water supply disruption that has affected our community over the past 72 hours. As your government co-pilot, we are committed to ensuring full restoration of water supply within the next 48 hours. A dedicated team of 24 engineers is working round the clock..."
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-black text-white/30 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Est. 2m 40s</span>
                                <span className="flex items-center gap-1"><Languages className="w-3 h-3" /> {selectedLang}</span>
                                <span>Tone: {selectedTone}</span>
                                <span>Target: {selectedAudience}</span>
                                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" /> AI Generated</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Speeches */}
                <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            Recent Speeches
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentSpeeches.map((s, i) => (
                            <div key={i} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{s.title}</p>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-bold">
                                            <span>{s.date}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration}</span>
                                            <span className="flex items-center gap-1"><Languages className="w-3 h-3" />{s.lang}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => alert(`Playing: ${s.title}`)} className="h-8 w-8 rounded-xl bg-gray-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all">
                                            <Play className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => alert(`Downloading: ${s.title}`)} className="h-8 w-8 rounded-xl bg-gray-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all">
                                            <Download className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Feature cards */}
                    <div className="p-5 space-y-3">
                        {[
                            { icon: Languages, label: "Multi-lingual Translation", desc: "Auto-translate to 20+ Indian languages", color: "text-blue-500 bg-blue-50" },
                            { icon: Mic, label: "Voice Cloning", desc: "Clone officer voice for consistency", color: "text-purple-500 bg-purple-50" },
                        ].map(f => (
                            <div key={f.label} onClick={() => alert(`${f.label}: ${f.desc}\n\nThis feature is coming soon!`)} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                                <div className={`p-2.5 rounded-xl ${f.color}`}>
                                    <f.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900">{f.label}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
