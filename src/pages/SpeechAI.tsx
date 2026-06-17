import { useState, useEffect } from "react";
import {
  Mic, Volume2, Play, Square, Download, Settings,
  Loader2, Sparkles, AlertCircle, Clock, Heart, Info, Star, CheckCircle2
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

/* ─── Language Config ─────────────────────────────────────── */
const LANGUAGES = [
  { id: "english",   label: "ENGLISH",   code: "EN", bcp: "en-IN", placeholder: "Write your announcement in English..." },
  { id: "hindi",     label: "HINDI",     code: "HI", bcp: "hi-IN", placeholder: "यहाँ अपना संदेश लिखें..." },
  { id: "tamil",     label: "TAMIL",     code: "TA", bcp: "ta-IN", placeholder: "உங்கள் அறிவிப்பை இங்கே எழுதவும்..." },
  { id: "telugu",    label: "TELUGU",    code: "TE", bcp: "te-IN", placeholder: "మీ ప్రకటనను ఇక్కడ వ్రాయండి..." },
  { id: "bengali",   label: "BENGALI",   code: "BN", bcp: "bn-IN", placeholder: "আপনার ঘোষণা এখানে লিখুন..." },
  { id: "marathi",   label: "MARATHI",   code: "MR", bcp: "mr-IN", placeholder: "तुमची घोषणा येथे लिहा..." },
  { id: "malayalam", label: "MALAYALAM", code: "ML", bcp: "ml-IN", placeholder: "നിങ്ങളുടെ അറിയിപ്പ് ഇവിടെ എഴുതുക..." },
];

/* ─── Tone Config ─────────────────────────────────────────── */
const TONES = [
  { id: "formal",        label: "FORMAL",        Icon: Settings,    desc: "Official, authoritative government style" },
  { id: "empathetic",    label: "EMPATHETIC",    Icon: Heart,       desc: "Caring, understanding, community-focused" },
  { id: "urgent",        label: "URGENT",        Icon: AlertCircle, desc: "Fast-paced, clear, emergency style" },
  { id: "informational", label: "INFORMATIONAL", Icon: Info,        desc: "Clear, neutral, fact-based delivery" },
  { id: "motivational",  label: "MOTIVATIONAL",  Icon: Star,        desc: "Uplifting, encouraging, positive" },
];

/* ─── Full native-language tone wrappers (no English mixing) ── */
const TONE_WRAPPERS: Record<string, Record<string, (t: string) => string>> = {
  english: {
    formal:        (t) => `Official Notice:\n\n${t}\n\nThis is an official communication from the District Administration. Please comply accordingly. Thank you for your cooperation.`,
    empathetic:    (t) => `Dear Citizens,\n\nWe understand this may cause inconvenience and we sincerely apologize.\n\n${t}\n\nYour patience and understanding means a great deal to us. We are working hard to minimize disruptions.`,
    urgent:        (t) => `URGENT ALERT. Immediate action required!\n\n${t}\n\nPlease act now. Inform your family and neighbours immediately. Do not delay.`,
    informational: (t) => `Public Information Notice:\n\n${t}\n\nFor further details, please contact your local ward office or call the helpline.`,
    motivational:  (t) => `Together, we build a stronger community!\n\n${t}\n\nEvery small step by each one of us makes our district a better place to live. Thank you for being a responsible citizen!`,
  },
  hindi: {
    formal:        (t) => `आधिकारिक सूचना:\n\n${t}\n\nयह जिला प्रशासन की आधिकारिक सूचना है। कृपया तदनुसार अनुपालन करें। आपके सहयोग के लिए धन्यवाद।`,
    empathetic:    (t) => `प्रिय नागरिकों,\n\nहम समझते हैं कि इससे असुविधा हो सकती है और हम क्षमा चाहते हैं।\n\n${t}\n\nआपका धैर्य और समझदारी हमारे लिए बहुत महत्वपूर्ण है।`,
    urgent:        (t) => `तत्काल चेतावनी! तुरंत कार्रवाई आवश्यक!\n\n${t}\n\nकृपया अभी कार्रवाई करें। अपने परिवार और पड़ोसियों को तुरंत सूचित करें। देरी न करें।`,
    informational: (t) => `जन सूचना:\n\n${t}\n\nअधिक जानकारी के लिए कृपया अपने स्थानीय वार्ड कार्यालय से संपर्क करें।`,
    motivational:  (t) => `मिलकर हम एक मजबूत समुदाय बनाएंगे!\n\n${t}\n\nहम में से हर एक का छोटा कदम हमारे जिले को बेहतर बनाता है। एक जिम्मेदार नागरिक होने के लिए धन्यवाद!`,
  },
  tamil: {
    formal:        (t) => `அதிகாரப்பூர்வ அறிவிப்பு:\n\n${t}\n\nஇது மாவட்ட நிர்வாகத்தின் அதிகாரப்பூர்வ அறிவிப்பு ஆகும். தயவுசெய்து இதன்படி நடவடிக்கை எடுக்கவும். உங்கள் ஒத்துழைப்புக்கு நன்றி.`,
    empathetic:    (t) => `அன்புள்ள குடிமக்களே,\n\nஇது சிரமத்தை ஏற்படுத்தலாம் என்பதை நாங்கள் புரிந்துகொள்கிறோம், மன்னிக்கவும்.\n\n${t}\n\nஉங்கள் பொறுமையும் புரிதலும் எங்களுக்கு மிகவும் முக்கியம்.`,
    urgent:        (t) => `அவசர எச்சரிக்கை! உடனடி நடவடிக்கை தேவை!\n\n${t}\n\nதயவுசெய்து இப்போதே நடவடிக்கை எடுக்கவும். உங்கள் குடும்பத்தினருக்கும் அண்டை வீட்டாருக்கும் உடனடியாக தெரிவிக்கவும். தாமதிக்காதீர்கள்.`,
    informational: (t) => `பொது தகவல் அறிவிப்பு:\n\n${t}\n\nமேலும் விவரங்களுக்கு உங்கள் உள்ளூர் வார்டு அலுவலகத்தை தொடர்பு கொள்ளவும்.`,
    motivational:  (t) => `ஒன்றாக சேர்ந்து ஒரு வலுவான சமூகத்தை உருவாக்குவோம்!\n\n${t}\n\nநம் ஒவ்வொருவரின் சிறிய முயற்சியும் நமது மாவட்டத்தை சிறந்ததாக மாற்றுகிறது. பொறுப்பான குடிமகனாக இருப்பதற்கு நன்றி!`,
  },
  telugu: {
    formal:        (t) => `అధికారిక ప్రకటన:\n\n${t}\n\nఇది జిల్లా పరిపాలన నుండి అధికారిక ప్రకటన. దయచేసి తదనుగుణంగా పాటించండి. మీ సహకారానికి ధన్యవాదాలు.`,
    empathetic:    (t) => `ప్రియమైన పౌరులారా,\n\nఇది అసౌకర్యం కలిగించవచ్చని మేము అర్థం చేసుకుంటున్నాము, క్షమించండి.\n\n${t}\n\nమీ ఓపిక మరియు అవగాహన మాకు చాలా ముఖ్యం.`,
    urgent:        (t) => `అత్యవసర హెచ్చరిక! తక్షణ చర్య అవసరం!\n\n${t}\n\nదయచేసి ఇప్పుడే చర్య తీసుకోండి. మీ కుటుంబ సభ్యులకు మరియు ఇరుగుపొరుగు వారికి వెంటనే తెలియజేయండి. ఆలస్యం చేయకండి.`,
    informational: (t) => `ప్రజా సమాచార ప్రకటన:\n\n${t}\n\nమరిన్ని వివరాల కోసం దయచేసి మీ స్థానిక వార్డు కార్యాలయాన్ని సంప్రదించండి.`,
    motivational:  (t) => `కలిసి మనం బలమైన సమాజాన్ని నిర్మిద్దాం!\n\n${t}\n\nమనలో ప్రతి ఒక్కరి చిన్న అడుగు మన జిల్లాను మెరుగైనదిగా చేస్తుంది. బాధ్యతాయుతమైన పౌరునిగా ఉన్నందుకు ధన్యవాదాలు!`,
  },
  bengali: {
    formal:        (t) => `সরকারি বিজ্ঞপ্তি:\n\n${t}\n\nএটি জেলা প্রশাসনের সরকারি বিজ্ঞপ্তি। অনুগ্রহ করে সেই অনুযায়ী মেনে চলুন। আপনার সহযোগিতার জন্য ধন্যবাদ।`,
    empathetic:    (t) => `প্রিয় নাগরিকবৃন্দ,\n\nএতে অসুবিধা হতে পারে বলে আমরা বুঝতে পারি এবং আমরা ক্ষমাপ্রার্থী।\n\n${t}\n\nআপনার ধৈর্য এবং বোঝাপড়া আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ।`,
    urgent:        (t) => `জরুরি সতর্কতা! অবিলম্বে পদক্ষেপ নিন!\n\n${t}\n\nঅনুগ্রহ করে এখনই পদক্ষেপ নিন। আপনার পরিবার এবং প্রতিবেশীদের অবিলম্বে জানান। বিলম্ব করবেন না।`,
    informational: (t) => `জন তথ্য বিজ্ঞপ্তি:\n\n${t}\n\nআরও বিস্তারিত জানতে অনুগ্রহ করে আপনার স্থানীয় ওয়ার্ড অফিসে যোগাযোগ করুন।`,
    motivational:  (t) => `একসাথে আমরা একটি শক্তিশালী সমাজ গড়ে তুলব!\n\n${t}\n\nআমাদের প্রতিটি ছোট পদক্ষেপ আমাদের জেলাকে আরও ভালো করে তোলে। একজন দায়িত্বশীল নাগরিক হওয়ার জন্য ধন্যবাদ!`,
  },
  marathi: {
    formal:        (t) => `अधिकृत सूचना:\n\n${t}\n\nही जिल्हा प्रशासनाची अधिकृत सूचना आहे. कृपया तदनुसार अनुपालन करा. आपल्या सहकार्यासाठी धन्यवाद.`,
    empathetic:    (t) => `प्रिय नागरिकांनो,\n\nयामुळे गैरसोय होऊ शकते हे आम्हाला समजते आणि आम्ही क्षमा मागतो.\n\n${t}\n\nतुमचा संयम आणि समज आमच्यासाठी खूप महत्त्वाची आहे.`,
    urgent:        (t) => `तातडीचा इशारा! तात्काळ कारवाई आवश्यक!\n\n${t}\n\nकृपया आत्ताच कारवाई करा. तुमच्या कुटुंबाला आणि शेजाऱ्यांना तात्काळ कळवा. विलंब करू नका.`,
    informational: (t) => `सार्वजनिक माहिती सूचना:\n\n${t}\n\nअधिक माहितीसाठी कृपया तुमच्या स्थानिक वार्ड कार्यालयाशी संपर्क साधा.`,
    motivational:  (t) => `एकत्र येऊन आपण एक मजबूत समाज बनवूया!\n\n${t}\n\nआपल्या प्रत्येकाचे छोटे पाऊल आपला जिल्हा अधिक चांगला बनवते. जबाबदार नागरिक असल्याबद्दल धन्यवाद!`,
  },
  malayalam: {
    formal:        (t) => `ഔദ്യോഗിക അറിയിപ്പ്:\n\n${t}\n\nഇത് ജില്ലാ ഭരണകൂടത്തിന്റെ ഔദ്യോഗിക അറിയിപ്പാണ്. ദയവായി അതനുസരിച്ച് പ്രവർത്തിക്കുക. നിങ്ങളുടെ സഹകരണത്തിന് നന്ദി.`,
    empathetic:    (t) => `പ്രിയ പൗരന്മാരേ,\n\nഇത് അസൗകര്യം ഉണ്ടാക്കിയേക്കാം എന്ന് ഞങ്ങൾ മനസ്സിലാക്കുന്നു, ക്ഷമിക്കുക.\n\n${t}\n\nനിങ്ങളുടെ ക്ഷമയും ധാരണയും ഞങ്ങൾക്ക് വളരെ പ്രധാനമാണ്.`,
    urgent:        (t) => `അടിയന്തര മുന്നറിയിപ്പ്! ഉടനടി നടപടി ആവശ്യമാണ്!\n\n${t}\n\nദയവായി ഇപ്പോൾ തന്നെ നടപടി എടുക്കുക. നിങ്ങളുടെ കുടുംബത്തെയും അയൽവാസികളെയും ഉടൻ അറിയിക്കുക. താമസിക്കരുത്.`,
    informational: (t) => `പൊതു വിവര അറിയിപ്പ്:\n\n${t}\n\nകൂടുതൽ വിവരങ്ങൾക്ക് ദയവായി നിങ്ങളുടെ പ്രാദേശിക വാർഡ് ഓഫീസുമായി ബന്ധപ്പെടുക.`,
    motivational:  (t) => `ഒരുമിച്ച് നമ്മൾ ശക്തമായ ഒരു സമൂഹം കെട്ടിപ്പടുക്കാം!\n\n${t}\n\nനമ്മൾ ഓരോരുത്തരുടെയും ചെറിയ ചുവട് നമ്മുടെ ജില്ലയെ മെച്ചപ്പെടുത്തുന്നു. ഉത്തരവാദിത്വമുള്ള പൗരനായതിന് നന്ദി!`,
  },
};

/* ─── Initial broadcasts ──────────────────────────────────── */
const INITIAL_BROADCASTS = [
  { id: 1, title: "Council Address - Water Crisis Resolution",  fullText: "அதிகாரப்பூர்வ அறிவிப்பு:\n\nநீர் நெருக்கடி தீர்வு குறித்த இந்த அறிவிப்பு. மாவட்ட நிர்வாகம் சிக்கலை தீர்க்க நடவடிக்கை எடுத்துள்ளது.\n\nஇது மாவட்ட நிர்வாகத்தின் அதிகாரப்பூர்வ அறிவிப்பு ஆகும். தயவுசெய்து இதன்படி நடவடிக்கை எடுக்கவும். உங்கள் ஒத்துழைப்புக்கு நன்றி.", date: "FEB 18, 2026", duration: "4:32", lang: "TAMIL" },
  { id: 2, title: "Public Health Advisory - Dengue Prevention", fullText: "Official Notice:\n\nPublic health advisory: Please clear all stagnant water around your homes to prevent dengue mosquito breeding. Health camps will be organized in affected wards.\n\nThis is an official communication from the District Administration. Please comply accordingly. Thank you for your cooperation.", date: "FEB 17, 2026", duration: "2:15", lang: "ENGLISH" },
  { id: 3, title: "Budget Announcement FY 2025-26",             fullText: "आधिकारिक सूचना:\n\nवित्त वर्ष 2025-26 का नगर पालिका बजट बुनियादी ढांचे और सार्वजनिक स्वास्थ्य को प्राथमिकता देता है। सड़क मरम्मत और जल आपूर्ति उन्नयन के लिए 450 करोड़ रुपये आवंटित किए गए हैं।\n\nयह जिला प्रशासन की आधिकारिक सूचना है। कृपया तदनुसार अनुपालन करें। आपके सहयोग के लिए धन्यवाद।", date: "FEB 15, 2026", duration: "7:45", lang: "HINDI" },
  { id: 4, title: "Emergency Road Closure Notice - NH48",       fullText: "అత్యవసర హెచ్చరిక! తక్షణ చర్య అవసరం!\n\nఎన్‌హెచ్ 48 వాహనం బోల్తా పడిన కారణంగా 12 గంటల పాటు మూసివేయబడుతుంది. దయచేసి ఇన్నర్ రింగ్ రోడ్ ద్వారా ప్రత్యామ్నాయ మార్గాలను ఉపయోగించండి.\n\nదయచేసి ఇప్పుడే చర్య తీసుకోండి. మీ కుటుంబ సభ్యులకు మరియు ఇరుగుపొరుగు వారికి వెంటనే తెలియజేయండి. ఆలస్యం చేయకండి.", date: "FEB 12, 2026", duration: "1:05", lang: "TELUGU" },
];

/* ─── Component ───────────────────────────────────────────── */
export default function SpeechAI() {
  const [inputText,       setInputText]       = useState("Water supply will be disrupted tomorrow from 10 AM to 4 PM in Wards 12 and 13. Please store sufficient water.");
  const [selectedLangId,  setSelectedLangId]  = useState("english");
  const [selectedToneId,  setSelectedToneId]  = useState("formal");
  const [isGenerating,    setIsGenerating]    = useState(false);
  const [broadcasts,      setBroadcasts]      = useState(INITIAL_BROADCASTS);
  const [expandedId,      setExpandedId]      = useState<number | null>(null);
  const [justGenerated,   setJustGenerated]   = useState(false);
  const [isSpeaking,      setIsSpeaking]      = useState(false);
  const [speakingId,      setSpeakingId]      = useState<number | null>(null);

  const activeLang = LANGUAGES.find(l => l.id === selectedLangId)!;
  const activeTone = TONES.find(t => t.id === selectedToneId)!;

  // Load voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  function handlePlay(text: string, langLabel: string, broadcastId: number, e: React.MouseEvent) {
    e.stopPropagation();
    
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in your browser. Please use Google Chrome.");
      return;
    }

    // If already speaking this broadcast, stop it
    if (isSpeaking && speakingId === broadcastId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Find the matching language config by label
    const langConfig = LANGUAGES.find(l => l.label === langLabel);
    const bcp = langConfig?.bcp || 'en-IN';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp;
    utterance.rate = 0.85;  // Slower for clarity
    utterance.pitch = 1.0;

    // Find best voice for this language
    const voices = window.speechSynthesis.getVoices();
    const langVoices = voices.filter(v => v.lang === bcp || v.lang.startsWith(bcp.split('-')[0]));
    
    if (langVoices.length > 0) {
      // Prefer: Google > Microsoft > Remote > any
      const googleVoice = langVoices.find(v => v.name.toLowerCase().includes('google'));
      const msVoice = langVoices.find(v => v.name.toLowerCase().includes('microsoft'));
      const remoteVoice = langVoices.find(v => !v.localService);
      utterance.voice = googleVoice || msVoice || remoteVoice || langVoices[0];
    }

    utterance.onstart = () => { setIsSpeaking(true); setSpeakingId(broadcastId); };
    utterance.onend = () => { setIsSpeaking(false); setSpeakingId(null); };
    utterance.onerror = () => { setIsSpeaking(false); setSpeakingId(null); };
    
    window.speechSynthesis.speak(utterance);
  }

  /* ── Native-language input translations ─────────────────── */
  const NATIVE_INPUT: Record<string, Record<string, string>> = {
    hindi: {
      "Water supply will be disrupted tomorrow from 10 AM to 4 PM in Wards 12 and 13. Please store sufficient water.":
        "जल आपूर्ति कल सुबह 10 बजे से शाम 4 बजे तक वार्ड 12 और 13 में बाधित रहेगी। कृपया पर्याप्त जल का भंडारण करें।",
    },
    tamil: {
      "Water supply will be disrupted tomorrow from 10 AM to 4 PM in Wards 12 and 13. Please store sufficient water.":
        "நாளை காலை 10 மணி முதல் மாலை 4 மணி வரை வார்டு 12 மற்றும் 13ல் குடிநீர் விநியோகம் தடைபடும். போதிய அளவு தண்ணீரை சேமித்து வைக்கவும்.",
    },
    telugu: {
      "Water supply will be disrupted tomorrow from 10 AM to 4 PM in Wards 12 and 13. Please store sufficient water.":
        "రేపు ఉదయం 10 గంటల నుండి సాయంత్రం 4 గంటల వరకు వార్డు 12 మరియు 13లో నీటి సరఫరా నిలిపివేయబడుతుంది. దయచేసి తగినంత నీటిని నిల్వ చేసుకోండి.",
    },
    bengali: {
      "Water supply will be disrupted tomorrow from 10 AM to 4 PM in Wards 12 and 13. Please store sufficient water.":
        "আগামীকাল সকাল ১০টা থেকে বিকাল ৪টা পর্যন্ত ১২ ও ১৩ নং ওয়ার্ডে জল সরবরাহ ব্যাহত হবে। অনুগ্রহ করে পর্যাপ্ত জল সংরক্ষণ করুন।",
    },
    marathi: {
      "Water supply will be disrupted tomorrow from 10 AM to 4 PM in Wards 12 and 13. Please store sufficient water.":
        "उद्या सकाळी १० ते दुपारी ४ वाजेपर्यंत प्रभाग १२ आणि १३ मध्ये पाणीपुरवठा खंडित होईल. कृपया पुरेशा पाण्याची साठवणूक करा.",
    },
    malayalam: {
      "Water supply will be disrupted tomorrow from 10 AM to 4 PM in Wards 12 and 13. Please store sufficient water.":
        "നാളെ രാവിലെ 10 മണി മുതൽ വൈകുന്നേരം 4 മണി വരെ വാർഡ് 12, 13 എന്നിവിടങ്ങളിൽ ജലവിതരണം തടസ്സപ്പെടും. ദയവായി ആവശ്യമായ വെള്ളം ശേഖരിച്ചു വയ്ക്കുക.",
    },
  };

  function handleGenerate() {
    const text = inputText.trim();
    if (!text || isGenerating) return;

    setIsGenerating(true);
    setJustGenerated(false);

    const langId = selectedLangId;
    const toneId = selectedToneId;
    const langObj = LANGUAGES.find(l => l.id === langId)!;

    setTimeout(() => {
      let result: string;

      if (langId === "english") {
        // English: just apply English tone wrapper
        const wrapper = TONE_WRAPPERS.english[toneId];
        result = wrapper ? wrapper(text) : text;
      } else {
        // Non-English: translate input first, then wrap in native tone
        const translatedInput = NATIVE_INPUT[langId]?.[text] || text;
        const wrapper = TONE_WRAPPERS[langId]?.[toneId];
        result = wrapper ? wrapper(translatedInput) : translatedInput;
      }

      const titleSnippet = text.length > 45 ? text.substring(0, 45) + "..." : text;

      const newBroadcast = {
        id:       Date.now(),
        title:    titleSnippet,
        fullText: result,
        date:     new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase(),
        duration: "0:45",
        lang:     langObj.label,
      };

      setBroadcasts(prev => [newBroadcast, ...prev]);
      setExpandedId(newBroadcast.id);
      setIsGenerating(false);
      setJustGenerated(true);
    }, 1800);
  }

  return (
    <DashboardLayout
      title="Speech AI"
      subtitle="Create spoken announcements for citizens in any Indian language"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── LEFT PANEL: Input ── */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-xl flex flex-col border border-gray-100 gap-7">
          
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#C81D25]" />
            <h2 className="text-xs font-black text-gray-500 tracking-widest uppercase">Create New Announcement</h2>
          </div>

          {/* Language Selection */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3 flex items-center gap-2">
              <Settings className="w-3 h-3" /> Select Language
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLangId(lang.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedLangId === lang.id
                      ? "bg-[#C81D25] text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {lang.label}
                  <span className={`text-[10px] ${selectedLangId === lang.id ? "text-red-200" : "text-gray-400"}`}>{lang.code}</span>
                </button>
              ))}
            </div>
            <div className="bg-blue-50 text-blue-700 text-xs font-bold px-4 py-2.5 rounded-lg border border-blue-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
              Selected {activeLang.label} ({activeLang.code}) — announcement will be fully spoken in {activeLang.label.toLowerCase()}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3 flex items-center gap-2">
              <Volume2 className="w-3 h-3" /> Write Your Announcement
            </h3>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={activeLang.placeholder}
              rows={5}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-red-300 focus:ring-4 focus:ring-red-50 transition-all resize-none"
            />
            <div className="mt-1.5 text-right text-[10px] text-gray-400 font-bold">{inputText.length} characters</div>
          </div>

          {/* Tone Selection */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3 flex items-center gap-2">
              <Settings className="w-3 h-3" /> Select Tone of Voice
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {TONES.map(tone => {
                const Icon = tone.Icon;
                const active = selectedToneId === tone.id;
                return (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedToneId(tone.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                      active
                        ? "bg-gray-100 border-gray-300 text-gray-900 shadow-sm"
                        : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-gray-700" : "text-gray-400"}`} />
                    {tone.label}
                  </button>
                );
              })}
            </div>
            <div className="bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-lg border border-gray-200 flex items-center gap-2 uppercase tracking-wide">
              <activeTone.Icon className="w-4 h-4 text-gray-500 shrink-0" />
              {activeTone.label} : {activeTone.desc}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || inputText.trim().length === 0}
            className={`w-full py-4 rounded-xl font-black tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-lg ${
              inputText.trim().length > 0 && !isGenerating
                ? "bg-[#C81D25] hover:bg-[#a01520] text-white shadow-red-900/30 cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isGenerating
              ? <><Loader2 className="w-5 h-5 animate-spin" /> GENERATING AUDIO...</>
              : justGenerated
              ? <><CheckCircle2 className="w-5 h-5" /> GENERATE AGAIN</>
              : <><Mic className="w-5 h-5" /> GENERATE — {activeLang.label} ({activeLang.code}) · {activeTone.label} TONE</>
            }
          </button>

        </div>

        {/* ── RIGHT PANEL: Output ── */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-xl flex flex-col border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-black text-gray-500 tracking-widest uppercase">Recent Broadcasts</h2>
            <span className="ml-auto text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{broadcasts.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ maxHeight: "calc(100vh - 280px)" }}>
            {broadcasts.map(broadcast => (
              <div key={broadcast.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                
                {/* Broadcast Header Row */}
                <div
                  className="flex items-start justify-between gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === broadcast.id ? null : broadcast.id)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1.5 hover:text-[#C81D25] transition-colors line-clamp-2">
                      {broadcast.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      <span>{broadcast.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{broadcast.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">
                      <Sparkles className="w-3 h-3 text-blue-500" />{broadcast.lang}
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0 mt-0.5">
                    <button
                      onClick={e => handlePlay(broadcast.fullText, broadcast.lang, broadcast.id, e)}
                      title={isSpeaking && speakingId === broadcast.id ? "Stop Audio" : "Play Audio"}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                        isSpeaking && speakingId === broadcast.id
                          ? "border-[#C81D25] text-white bg-[#C81D25] shadow-md"
                          : "border-gray-200 text-gray-500 hover:border-[#C81D25] hover:text-[#C81D25] hover:bg-red-50"
                      }`}
                    >
                      {isSpeaking && speakingId === broadcast.id
                        ? <Square className="w-3 h-3" />
                        : <Play className="w-3.5 h-3.5 ml-0.5" />
                      }
                    </button>
                    <button
                      onClick={e => e.stopPropagation()}
                      className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#C81D25] hover:text-[#C81D25] hover:bg-red-50 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Full Text */}
                {expandedId === broadcast.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                      {broadcast.fullText}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
