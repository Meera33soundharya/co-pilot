import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useRef, useEffect } from "react";
import {
    Mic, Play, Square, Download, Languages, Clock, CheckCircle2,
    RefreshCw, ShieldCheck, Heart, Zap, Info, Star, Volume2
} from "lucide-react";

// ─── Tone configuration ───────────────────────────────────────────────────────
type ToneKey = "Formal" | "Empathetic" | "Urgent" | "Informational" | "Motivational";

const TONE_CONFIG: Record<ToneKey, {
    label: string; color: string; bg: string; border: string;
    icon: React.ElementType; desc: string;
    rate: number; pitch: number; volume: number;   // Web Speech API params
    prefix: string;                                // prepended to spoken text
}> = {
    Formal:        { label:"Formal",        color:"text-gray-700",    bg:"bg-gray-100",   border:"border-gray-200",   icon:ShieldCheck, desc:"Official, authoritative government-style",        rate:0.85, pitch:1.0,  volume:1.0, prefix:"Official notice from the Municipal Corporation. " },
    Empathetic:    { label:"Empathetic",    color:"text-rose-700",    bg:"bg-rose-50",    border:"border-rose-200",   icon:Heart,       desc:"Warm, understanding and community-focused",        rate:0.90, pitch:1.1,  volume:0.95,prefix:"Dear residents, we understand this may be difficult. " },
    Urgent:        { label:"Urgent",        color:"text-red-700",     bg:"bg-red-50",     border:"border-red-200",    icon:Zap,         desc:"High-alert — immediate action required",           rate:1.10, pitch:1.2,  volume:1.0, prefix:"Urgent alert. Immediate action required. " },
    Informational: { label:"Informational", color:"text-blue-700",    bg:"bg-blue-50",    border:"border-blue-200",   icon:Info,        desc:"Factual, clear, structured information",           rate:0.88, pitch:0.95, volume:0.95,prefix:"The following information is for public awareness. " },
    Motivational:  { label:"Motivational",  color:"text-emerald-700", bg:"bg-emerald-50", border:"border-emerald-200",icon:Star,        desc:"Encouraging, positive and community-building",     rate:0.95, pitch:1.15, volume:1.0, prefix:"Together, we are building a better community! " },
};

// ─── Language configuration ───────────────────────────────────────────────────
// `voiceLang`  = BCP-47 code used to pick the right system voice
// `fallback`   = language code to try if primary not found
const LANG_CONFIG: Record<string, {
    label: string; native: string; voiceLang: string; fallback: string;
    placeholder: string;
    toneOutputs: Record<ToneKey, string>;
}> = {
    English: {
        label:"English", native:"EN", voiceLang:"en-IN", fallback:"en-US",
        placeholder:"Write your announcement in English…\ne.g. Water supply will be disrupted tomorrow from 10 AM to 4 PM in Wards 12 and 13. Please store sufficient water.",
        toneOutputs:{
            Formal:        "This is an official notice from the Municipal Corporation. Water supply will be disrupted on March 15th from 10 AM to 4 PM in Wards 12 and 13. All citizens are requested to store adequate water before this period. Thank you for your cooperation.",
            Empathetic:    "Dear residents, we understand this may cause inconvenience and we are deeply sorry. Tomorrow, water supply will be interrupted from 10 AM to 4 PM in Wards 12 and 13 due to essential maintenance. Please store enough water. We truly appreciate your patience and understanding.",
            Urgent:        "Urgent alert. Immediate action required by all citizens. Water supply in Wards 12 and 13 will be cut off tomorrow from 10 AM to 4 PM. Store water right now. Inform elderly and differently-abled neighbours immediately. Do not delay.",
            Informational: "Public information notice. Date: March 15th, 2026. Affected wards: Ward 12 and Ward 13. Disruption time: 10 AM to 4 PM. Reason: Scheduled pipeline maintenance. Action required: Store 2 to 3 days of drinking water. For help, contact the ward office helpline.",
            Motivational:  "Together we are building a stronger community! Tomorrow our teams will work hard to improve your water infrastructure in Wards 12 and 13 from 10 AM to 4 PM. A small inconvenience today means a better system for all of us tomorrow. Your cooperation makes our ward shine!",
        },
    },
    Hindi: {
        label:"Hindi", native:"हिंदी", voiceLang:"hi-IN", fallback:"hi",
        placeholder:"यहाँ हिंदी में अपनी घोषणा लिखें…\nकल सुबह 10 बजे से शाम 4 बजे तक वार्ड 12 और 13 में पानी की आपूर्ति बंद रहेगी।",
        toneOutputs:{
            Formal:        "यह नगर निगम की आधिकारिक सूचना है। कल 15 मार्च को सुबह 10 बजे से शाम 4 बजे तक वार्ड 12 और 13 में पानी की आपूर्ति बाधित रहेगी। सभी नागरिकों से अनुरोध है कि पर्याप्त मात्रा में पानी संग्रहित करें। आपके सहयोग के लिए धन्यवाद।",
            Empathetic:    "प्रिय निवासियों, हम जानते हैं यह असुविधाजनक है और हमें खेद है। कल सुबह 10 से शाम 4 बजे तक वार्ड 12 और 13 में पानी नहीं आएगा। कृपया पर्याप्त पानी संग्रहित करें। आपकी सहनशीलता का हम हृदय से धन्यवाद करते हैं।",
            Urgent:        "तत्काल सूचना। सभी नागरिक तुरंत ध्यान दें। कल सुबह 10 बजे से शाम 4 बजे तक वार्ड 12 और 13 में पानी की आपूर्ति पूरी तरह बंद रहेगी। अभी पानी संग्रहित करें। बुजुर्गों को तुरंत सूचित करें। देरी न करें।",
            Informational: "सार्वजनिक सूचना। तिथि: 15 मार्च 2026। प्रभावित क्षेत्र: वार्ड 12 और 13। समय: सुबह 10 से शाम 4 बजे। कारण: पाइपलाइन रखरखाव। आवश्यक कदम: 2 से 3 दिनों का पेयजल संग्रहित करें। अधिक जानकारी के लिए वार्ड कार्यालय से संपर्क करें।",
            Motivational:  "मिलकर हम एक बेहतर समाज बना रहे हैं। कल हमारी टीम वार्ड 12 और 13 में जल व्यवस्था को मजबूत बनाएगी। आज की छोटी असुविधा कल एक बेहतर जीवन देगी। आपका सहयोग हमारे वार्ड को चमकाता है।",
        },
    },
    Tamil: {
        label:"Tamil", native:"தமிழ்", voiceLang:"ta-IN", fallback:"ta",
        placeholder:"இங்கே தமிழில் அறிவிப்பை எழுதுங்கள்…\nவார்டு 12 மற்றும் 13இல் நாளை தண்ணீர் விநியோகம் நிறுத்தப்படும்.",
        toneOutputs:{
            Formal:        "இது நகராட்சி மன்றத்தின் அதிகாரப்பூர்வ அறிவிப்பு. நாளை மார்ச் 15 அன்று காலை 10 மணி முதல் மாலை 4 மணி வரை வார்டு 12 மற்றும் 13இல் தண்ணீர் விநியோகம் நிறுத்தப்படும். அனைத்து குடிமக்களும் தேவையான தண்ணீர் சேமிக்கவும். ஒத்துழைப்புக்கு நன்றி.",
            Empathetic:    "அன்புள்ள குடிமக்களே, இது உங்களுக்கு சிரமம் என்று நாங்கள் அறிவோம், மிகவும் மன்னிக்கவும். நாளை காலை 10 முதல் மாலை 4 வரை வார்டு 12 மற்றும் 13இல் தண்ணீர் இருக்காது. தேவையான தண்ணீர் வையுங்கள். உங்கள் பொறுமைக்கு நன்றி.",
            Urgent:        "அவசர அறிவிப்பு. அனைத்து குடிமக்களும் உடனே கவனிக்கவும். நாளை காலை 10 முதல் மாலை 4 வரை வார்டு 12 மற்றும் 13இல் தண்ணீர் முற்றிலும் இருக்காது. இப்போதே தண்ணீர் சேமிக்கவும். வயதானவர்களுக்கு உடனே தெரிவிக்கவும்.",
            Informational: "பொது விழிப்புணர்வு சூட்டிச் சொல். தேதி: மார்ச் 15, 2026. பாதிக்கப்படும் பகுதி: வார்டு 12 மற்றும் 13. நேரம்: காலை 10 முதல் மாலை 4 வரை. காரணம்: குழாய் பராமரிப்பு. நடவடிக்கை: 2 முதல் 3 நாட்களுக்கான குடிநீர் சேமியுங்கள். வார்டு அலுவலகத்தை தொடர்பு கொள்ளவும்.",
            Motivational:  "ஒன்றாக சேர்ந்து நாம் சிறந்த சமுதாயம் கட்டுகிறோம். நாளை வார்டு 12 மற்றும் 13இல் சிறந்த நீர் வழங்கல் உள்கட்டமைப்பை உருவாக்க நமது குழு உழைக்கும். இன்றைய சிறு இடர்பாடு நாளை சிறந்த வாழ்க்கையை தரும். உங்கள் ஒத்துழைப்பு நம் வார்டை பிரகாசிக்க வைக்கிறது!",
        },
    },
    Telugu: {
        label:"Telugu", native:"తెలుగు", voiceLang:"te-IN", fallback:"te",
        placeholder:"ఇక్కడ తెలుగులో ప్రకటన రాయండి…\nవార్డు 12 మరియు 13లో రేపు నీటి సరఫరా నిలిచిపోతుంది.",
        toneOutputs:{
            Formal:        "ఇది మున్సిపల్ కార్పొరేషన్ అధికారిక నోటీసు. రేపు మార్చి 15న, ఉదయం 10 నుండి సాయంత్రం 4 వరకు వార్డులు 12 మరియు 13లో నీటి సరఫరా నిలిపివేయబడుతుంది. అందరు నాగరికులు తగినంత నీటిని నిల్వ చేసుకోవాలి. మీ సహకారానికి ధన్యవాదాలు.",
            Empathetic:    "ప్రియమైన నివాసితులారా, ఇది మీకు అసౌకర్యం కలిగిస్తుందని మాకు తెలుసు, మేము మిక్కిలి క్షమించమని కోరుతున్నాం. రేపు ఉదయం 10 నుండి సాయంత్రం 4 వరకు వార్డులు 12 మరియు 13లో నీటి సరఫరా ఉండదు. దయచేసి నీటిని నిల్వ చేసుకోండి. మీ సహనానికి ధన్యవాదాలు.",
            Urgent:        "అత్యవసర హెచ్చరిక. అన్ని నాగరికులు వెంటనే దృష్టి పెట్టండి. రేపు ఉదయం 10 నుండి సాయంత్రం 4 వరకు వార్డులు 12 మరియు 13లో నీటి సరఫరా పూర్తిగా నిలిపివేయబడుతుంది. ఇప్పుడే నీటిని నిల్వ చేసుకోండి. వృద్ధులకు వెంటనే తెలియజేయండి.",
            Informational: "ప్రజా అవగాహన నోటీసు. తేదీ: మార్చి 15, 2026. ప్రభావిత ప్రాంతాలు: వార్డు 12 మరియు 13. సమయం: ఉదయం 10 నుండి సాయంత్రం 4 గంటల వరకు. కారణం: పైప్‌లైన్ నిర్వహణ. చర్య: 2 నుండి 3 రోజులు తాగునీరు నిల్వ చేసుకోండి. వార్డు కార్యాలయాన్ని సంప్రదించండి.",
            Motivational:  "కలిసికట్టుగా మనం మెరుగైన సమాజాన్ని నిర్మిస్తున్నాం. రేపు మన బృందం వార్డు 12 మరియు 13 నీటి సౌకర్యాన్ని మెరుగుపరచడానికి కష్టపడి పని చేస్తుంది. నేటి చిన్న అసౌకర్యం రేపు మెరుగైన జీవితాన్ని అందిస్తుంది. మీ సహకారం మన వార్డును వెలిగిస్తుంది.",
        },
    },
    Bengali: {
        label:"Bengali", native:"বাংলা", voiceLang:"bn-IN", fallback:"bn",
        placeholder:"এখানে বাংলায় বিজ্ঞপ্তি লিখুন…\nওয়ার্ড ১২ ও ১৩-এ আগামীকাল জলের সরবরাহ বন্ধ থাকবে।",
        toneOutputs:{
            Formal:        "এটি পৌরসভার একটি আনুষ্ঠানিক নোটিশ। আগামীকাল ১৫ই মার্চ সকাল ১০টা থেকে বিকাল ৪টা পর্যন্ত ওয়ার্ড ১২ ও ১৩-এ জলের সরবরাহ বাধাগ্রস্ত হবে। সকল নাগরিকদের প্রয়োজনীয় জল সঞ্চয় করতে অনুরোধ করা হচ্ছে। আপনাদের সহযোগিতার জন্য ধন্যবাদ।",
            Empathetic:    "প্রিয় বাসিন্দারা, আমরা বুঝতে পারছি এটি অসুবিধাজনক এবং এজন্য আমরা আন্তরিকভাবে দুঃখিত। আগামীকাল সকাল ১০টা থেকে বিকাল ৪টা পর্যন্ত ওয়ার্ড ১২ ও ১৩-এ জলের সরবরাহ থাকবে না। দয়া করে জল সংরক্ষণ করুন। আপনাদের ধৈর্যের জন্য আন্তরিক ধন্যবাদ।",
            Urgent:        "জরুরি সতর্কতা। সকল নাগরিকদের অবিলম্বে মনোযোগ দিন। আগামীকাল সকাল ১০টা থেকে বিকাল ৪টা পর্যন্ত ওয়ার্ড ১২ ও ১৩-এ জলের সরবরাহ সম্পূর্ণ বন্ধ থাকবে। এখনই জল সংগ্রহ করুন। প্রবীণ প্রতিবেশীদের তাৎক্ষণিকভাবে জানান।",
            Informational: "জনসচেতনতার জন্য। তারিখ: ১৫ই মার্চ, ২০২৬। আক্রান্ত এলাকা: ওয়ার্ড ১২ ও ১৩। সময়: সকাল ১০টা থেকে বিকাল ৪টা। কারণ: পাইপলাইন রক্ষণাবেক্ষণ। পদক্ষেপ: দুই থেকে তিন দিনের পানীয় জল সঞ্চয় করুন। বিস্তারিত জানতে ওয়ার্ড অফিসে যোগাযোগ করুন।",
            Motivational:  "একসাথে আমরা একটি উন্নত সমাজ গড়ছি। আগামীকাল আমাদের দল ওয়ার্ড ১২ ও ১৩-এর জল সরবরাহ ব্যবস্থা উন্নত করতে কঠোর পরিশ্রম করবে। আজকের ছোট্ট অসুবিধা আগামীকালের উন্নত জীবন নিশ্চিত করবে। আপনাদের সহযোগিতা আমাদের ওয়ার্ডকে আলোকিত করে।",
        },
    },
    Marathi: {
        label:"Marathi", native:"मराठी", voiceLang:"mr-IN", fallback:"mr",
        placeholder:"येथे मराठीत घोषणा लिहा…\nवार्ड १२ आणि १३ मध्ये उद्या पाणीपुरवठा बंद राहील.",
        toneOutputs:{
            Formal:        "हे महानगरपालिकेचे अधिकृत परिपत्रक आहे. उद्या १५ मार्च रोजी सकाळी १० ते संध्याकाळी ४ पर्यंत वार्ड १२ आणि १३ मध्ये पाणीपुरवठा बंद राहील. सर्व नागरिकांनी पुरेसे पाणी साठवून ठेवावे. आपल्या सहकार्याबद्दल धन्यवाद.",
            Empathetic:    "प्रिय नागरिकांनो, यामुळे त्रास होईल हे आम्हाला माहीत आहे आणि आम्ही मनापासून दिलगीर आहोत. उद्या सकाळी १० ते संध्याकाळी ४ वार्ड १२ आणि १३ मध्ये पाणी येणार नाही. कृपया पुरेसे पाणी साठवा. आपल्या संयमाबद्दल मनापासून आभार.",
            Urgent:        "तातडीची सूचना. सर्व नागरिकांनी त्वरित लक्ष द्यावे. उद्या सकाळी १० ते संध्याकाळी ४ वार्ड १२ आणि १३ मध्ये पाणीपुरवठा पूर्णपणे बंद राहणार आहे. आत्ताच पाणी साठवा. वृद्ध शेजाऱ्यांना तत्काळ सांगा. उशीर करू नका.",
            Informational: "जनजागृतीसाठी. तारीख: १५ मार्च २०२६. प्रभावित भाग: वार्ड १२ आणि १३. वेळ: सकाळी १० ते संध्याकाळी ४. कारण: पाइपलाइन देखभाल. कृती: दोन ते तीन दिवसांचे पिण्याचे पाणी साठवा. अधिक माहितीसाठी वार्ड कार्यालयाशी संपर्क करा.",
            Motivational:  "एकत्र मिळून आपण उत्तम समाज घडवतो आहोत. उद्या आमची टीम वार्ड १२ आणि १३ मधील पाणी व्यवस्था अधिक मजबूत करण्यासाठी कठोर परिश्रम करेल. आजची ही अडचण उद्या बेहतर जीवन देईल. आपले सहकार्य आपल्या वार्डाला उजळवते.",
        },
    },
};

const toneOptions: ToneKey[] = ["Formal", "Empathetic", "Urgent", "Informational", "Motivational"];

const recentSpeeches = [
    { title:"Council Address – Water Crisis Resolution",   date:"Feb 19, 2026", duration:"4:32", lang:"Hindi + English" },
    { title:"Public Health Advisory – Dengue Prevention", date:"Feb 17, 2026", duration:"2:18", lang:"English" },
    { title:"Budget Announcement FY2025-26",               date:"Feb 15, 2026", duration:"7:45", lang:"Hindi" },
    { title:"Emergency Road Closure Notice – NH48",        date:"Feb 12, 2026", duration:"1:05", lang:"English + Tamil" },
];

// ─── Helper: find best voice for a given lang code ────────────────────────────
function pickVoice(primary: string, fallback: string): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    return (
        voices.find(v => v.lang === primary) ||
        voices.find(v => v.lang.startsWith(primary.split("-")[0])) ||
        voices.find(v => v.lang === fallback) ||
        voices.find(v => v.lang.startsWith(fallback)) ||
        voices.find(v => v.lang.startsWith("en")) ||
        voices[0] || null
    );
}

export default function SpeechAI() {
    const [inputText,     setInputText]     = useState("");
    const [selectedTone,  setSelectedTone]  = useState<ToneKey>("Formal");
    const [selectedLang,  setSelectedLang]  = useState("English");
    const [isGenerating,  setIsGenerating]  = useState(false);
    const [isPlaying,     setIsPlaying]     = useState(false);
    const [generated,     setGenerated]     = useState(false);
    const [generatedLang, setGeneratedLang] = useState("English");
    const [generatedTone, setGeneratedTone] = useState<ToneKey>("Formal");
    const [generatedText, setGeneratedText] = useState("");
    const [action,        setAction]        = useState<string | null>(null);
    const [voicesReady,   setVoicesReady]   = useState(false);

    const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Load voices (some browsers require this event)
    useEffect(() => {
        const load = () => setVoicesReady(true);
        if (window.speechSynthesis.getVoices().length > 0) { setVoicesReady(true); return; }
        window.speechSynthesis.addEventListener("voiceschanged", load);
        return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
    }, []);

    // Stop speech on unmount
    useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

    const langCfg = LANG_CONFIG[selectedLang];
    const toneCfg = TONE_CONFIG[selectedTone];

    // ── Generate: build output text + show it ─────────────────────────────────
    const handleGenerate = () => {
        if (!inputText.trim()) return;
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsGenerating(true);
        setTimeout(() => {
            const output = LANG_CONFIG[selectedLang].toneOutputs[selectedTone];
            setIsGenerating(false);
            setGenerated(true);
            setGeneratedLang(selectedLang);
            setGeneratedTone(selectedTone);
            setGeneratedText(output);
        }, 1800);
    };

    // ── Play: use Web Speech API ──────────────────────────────────────────────
    const handlePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        const text = generatedText;
        if (!text) return;

        const cfg   = LANG_CONFIG[generatedLang];
        const tcfg  = TONE_CONFIG[generatedTone];
        const voice = voicesReady ? pickVoice(cfg.voiceLang, cfg.fallback) : null;

        const utter = new SpeechSynthesisUtterance(text);
        if (voice) utter.voice = voice;
        utter.lang   = cfg.voiceLang;
        utter.rate   = tcfg.rate;
        utter.pitch  = tcfg.pitch;
        utter.volume = tcfg.volume;

        utter.onstart = () => setIsPlaying(true);
        utter.onend   = () => setIsPlaying(false);
        utter.onerror = () => setIsPlaying(false);

        utterRef.current = utter;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
    };

    // ── Download: create .txt file ────────────────────────────────────────────
    const handleDownload = () => {
        const blob = new Blob([generatedText], { type: "text/plain;charset=utf-8" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `announcement_${generatedLang}_${generatedTone}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setAction("downloaded");
        setTimeout(() => setAction(null), 2000);
    };

    const handleLangChange = (lang: string) => { setSelectedLang(lang);   setGenerated(false); setIsPlaying(false); window.speechSynthesis.cancel(); };
    const handleToneChange = (t: ToneKey)   => { setSelectedTone(t);      setGenerated(false); setIsPlaying(false); window.speechSynthesis.cancel(); };

    const ToneIcon    = toneCfg.icon;
    const GenToneIcon = TONE_CONFIG[generatedTone].icon;

    return (
        <DashboardLayout title="Speech AI" subtitle="Create spoken announcements for citizens in any Indian language">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                {/* ── Main Generator ── */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[40px] pointer-events-none" />
                        <h3 className="text-[10px] font-black text-gray-400 mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" /> Create New Announcement
                        </h3>

                        {/* ── Language Selector ── */}
                        <div className="mb-6 space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">① Select Language</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(LANG_CONFIG).map(([key, cfg]) => (
                                    <button key={key} onClick={() => handleLangChange(key)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all flex items-center gap-2 ${
                                            selectedLang === key
                                                ? "bg-[#B91C1C] text-white shadow-lg shadow-red-900/20 scale-105"
                                                : "bg-gray-50 text-gray-500 hover:bg-white hover:text-gray-900 border border-gray-100"
                                        }`}>
                                        {cfg.label}
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${selectedLang === key ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>
                                            {cfg.native}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                                <Languages className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <p className="text-[10px] font-black text-blue-700">
                                    Selected: <span className="text-blue-900">{langCfg.label} ({langCfg.native})</span> — announcement will be spoken in this language
                                </p>
                            </div>
                        </div>

                        {/* ── Textarea ── */}
                        <div className="mb-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">② Write your announcement</label>
                            <textarea
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                placeholder={langCfg.placeholder}
                                className="w-full h-36 p-6 bg-gray-50 border border-transparent rounded-[2rem] text-sm font-medium text-gray-900 resize-none focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:bg-white focus:border-red-100 transition-all placeholder:text-gray-300 shadow-inner leading-relaxed"
                            />
                        </div>

                        {/* ── Tone Selector ── */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">③ Select Tone of Voice</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {toneOptions.map(t => {
                                    const tc   = TONE_CONFIG[t];
                                    const Icon = tc.icon;
                                    const active = selectedTone === t;
                                    return (
                                        <button key={t} onClick={() => handleToneChange(t)}
                                            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all flex items-center gap-2 border ${
                                                active ? `${tc.bg} ${tc.color} ${tc.border} shadow-md scale-[1.03]`
                                                       : "bg-gray-50 text-gray-400 border-transparent hover:bg-white hover:border-gray-100"
                                            }`}>
                                            <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? tc.color : "text-gray-300"}`} />
                                            {tc.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${toneCfg.bg} ${toneCfg.border}`}>
                                <ToneIcon className={`w-3.5 h-3.5 shrink-0 ${toneCfg.color}`} />
                                <p className={`text-[10px] font-black ${toneCfg.color}`}>
                                    <span className="uppercase tracking-widest">{toneCfg.label}:</span> {toneCfg.desc}
                                </p>
                            </div>
                        </div>

                        {/* ── Generate Button ── */}
                        <button onClick={handleGenerate}
                            disabled={isGenerating || !inputText.trim()}
                            className="btn-primary mt-8 w-full !py-5 disabled:opacity-40">
                            {isGenerating
                                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating {langCfg.label} · {toneCfg.label} voice…</>
                                : <><Mic className="w-4 h-4" /> Generate — {langCfg.label} ({langCfg.native}) · {toneCfg.label} Tone</>
                            }
                        </button>
                    </div>

                    {/* ── Generated Output ── */}
                    {generated && (
                        <div className="bg-[#111827] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-white animate-fade-in">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                                <h3 className="text-[10px] font-black flex items-center gap-3 uppercase tracking-[0.2em] text-white/40">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Ready to Play
                                </h3>
                                <div className="flex gap-3">
                                    {/* PLAY / STOP — uses real Web Speech API */}
                                    <button onClick={handlePlay}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                            isPlaying
                                                ? "bg-red-600 text-white hover:bg-red-700"
                                                : "bg-white/5 border border-white/10 hover:bg-white/10"
                                        }`}>
                                        {isPlaying
                                            ? <><Square className="w-4 h-4 fill-current" /> Stop</>
                                            : <><Play className="w-4 h-4" /> Play Now</>
                                        }
                                    </button>
                                    {/* DOWNLOAD — saves .txt */}
                                    <button onClick={handleDownload}
                                        className="flex items-center gap-3 px-6 py-3 bg-[#B91C1C] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-500/20">
                                        {action === "downloaded" ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Download className="w-4 h-4" /> Download</>}
                                    </button>
                                </div>
                            </div>

                            {/* Tone + Lang badge */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border mb-5 w-fit ${TONE_CONFIG[generatedTone].bg} ${TONE_CONFIG[generatedTone].border}`}>
                                <GenToneIcon className={`w-3.5 h-3.5 ${TONE_CONFIG[generatedTone].color}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${TONE_CONFIG[generatedTone].color}`}>
                                    {TONE_CONFIG[generatedTone].label} Tone · {LANG_CONFIG[generatedLang].label} ({LANG_CONFIG[generatedLang].native})
                                </span>
                            </div>

                            {/* Text output */}
                            <div className="bg-white/5 rounded-[2rem] p-8 text-base leading-relaxed text-white/90 border border-white/10 shadow-inner font-medium">
                                {generatedText}
                            </div>

                            {isPlaying && (
                                <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                    <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                                        Speaking in {LANG_CONFIG[generatedLang].label} · {TONE_CONFIG[generatedTone].label} tone…
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 flex flex-wrap gap-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Approx. 1–3 min</span>
                                <span className="flex items-center gap-2 text-blue-400">
                                    <Languages className="w-4 h-4" /> {LANG_CONFIG[generatedLang].label} · {LANG_CONFIG[generatedLang].native}
                                </span>
                                <span className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" /> Ready for Broadcast
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Recent Broadcasts ── */}
                <div className="xl:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden h-fit">
                    <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-[10px] font-black text-gray-900 flex items-center gap-3 uppercase tracking-[0.2em]">
                            <Clock className="w-4 h-4 text-gray-400" /> Recent Broadcasts
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentSpeeches.map((s, i) => (
                            <div key={i} className="p-8 hover:bg-gray-50 transition-all cursor-pointer group relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#B91C1C] group-hover:h-full transition-all duration-500" />
                                <div className="flex items-start justify-between gap-6 relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900 group-hover:text-[#B91C1C] transition-colors leading-tight mb-2">{s.title}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                            <span>{s.date}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{s.duration}</span>
                                            <span className="flex items-center gap-1.5 text-blue-500"><Languages className="w-3.5 h-3.5" />{s.lang}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button className="h-12 w-12 rounded-2xl bg-gray-50 hover:bg-[#B91C1C] hover:text-white flex items-center justify-center transition-all hover:shadow-xl active:scale-90">
                                            <Play className="w-5 h-5" />
                                        </button>
                                        <button className="h-12 w-12 rounded-2xl bg-gray-50 hover:bg-[#B91C1C] hover:text-white flex items-center justify-center transition-all hover:shadow-xl active:scale-90">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
