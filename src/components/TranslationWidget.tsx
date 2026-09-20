import { useState } from "react";
import { Languages, X, Loader2, ArrowRight } from "lucide-react";
import { api } from "@/services/api";

export default function TranslationWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState("");
    const [targetLang, setTargetLang] = useState("Tamil");
    const [translation, setTranslation] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTranslate = async () => {
        if (!text.trim()) {
            setError("Please enter text to translate.");
            return;
        }
        setIsLoading(true);
        setError("");
        setTranslation("");
        
        try {
            const res = await api.translate.translateText(text, targetLang);
            setTranslation(res.translation);
        } catch (err: any) {
            setError(err.message || "Translation failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-xl border transition-all ${
                    isOpen
                        ? "bg-red-50 border-red-200 text-[#B91C1C]"
                        : "bg-white/50 border-gray-100 text-gray-900 hover:bg-white"
                }`}
                title="Translate"
            >
                <Languages className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                <Languages className="w-4 h-4 text-[#B91C1C]" /> Translate
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enter text to translate</label>
                                <textarea
                                    className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C]/50 resize-none"
                                    rows={3}
                                    placeholder="Type here..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                ></textarea>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Language</label>
                                    <select
                                        className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20"
                                        value={targetLang}
                                        onChange={(e) => setTargetLang(e.target.value)}
                                    >
                                        <option value="Auto Detect">Auto Detect</option>
                                        <option value="English">English</option>
                                        <option value="Tamil">Tamil</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleTranslate}
                                    disabled={isLoading}
                                    className="mt-5 px-4 py-2 bg-[#B91C1C] text-white text-sm font-bold rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Translate"}
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            {translation && (
                                <div className="mt-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                        <ArrowRight className="w-3 h-3 text-[#B91C1C]" /> Translation
                                    </label>
                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 break-words whitespace-pre-wrap font-medium">
                                        {translation}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
