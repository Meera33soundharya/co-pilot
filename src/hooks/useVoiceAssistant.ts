import { useState, useCallback, useEffect, useRef } from "react";

// Web Speech API Types
type SpeechRecognition = any;
type SpeechRecognitionEvent = any;

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export type VoiceLanguage = "en-IN" | "hi-IN" | "ta-IN";

interface UseVoiceAssistantProps {
  onResult?: (text: string) => void;
  lang?: VoiceLanguage;
}

export function useVoiceAssistant({ onResult, lang = "en-IN" }: UseVoiceAssistantProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isActiveRef = useRef(false); // true while recognition is actively running

  // Audio Context for Chimes
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      if (audioCtxRef.current?.state !== "closed") {
        audioCtxRef.current?.close();
      }
    };
  }, []);

  const playChime = useCallback((type: "start" | "stop" | "success" | "fail") => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "start") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "stop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.setValueAtTime(0.3, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "fail") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // slightly slower for better comprehension
    
    if (onEnd) {
      utterance.onend = onEnd;
      // safety timeout just in case onend doesn't fire
      setTimeout(onEnd, text.length * 100 + 2000); 
    }
    
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  useEffect(() => {
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        isActiveRef.current = true;
        setIsListening(true);
        setError(null);
        setTranscript("");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const resultText = event.results[current][0].transcript;
        setTranscript(resultText);
        
        setIsProcessing(true);
        setIsListening(false);
        
        // Auto-read back for confirmation
        speak(resultText, () => {
           playChime("success");
           setIsProcessing(false);
           if (onResult) onResult(resultText);
        });
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== "no-speech") {
          console.error("Speech recognition error", event.error);
        }
        playChime("fail");
        setError("audio-fail");
        speak("I didn't catch that, please try again.");
      };

      recognition.onend = () => {
        isActiveRef.current = false;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang, speak, playChime, onResult]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      playChime("stop");
    } else {
      if (!recognitionRef.current) {
        alert("Your browser does not support Voice Input.");
        return;
      }
      recognitionRef.current.lang = lang;
      try {
        if (!isActiveRef.current) {
          recognitionRef.current.start();
          playChime("start");
        }
      } catch (e) {
        // Handle case where it might already be started
        console.error(e);
      }
    }
  }, [isListening, lang, playChime]);

  return {
    isListening,
    isProcessing,
    transcript,
    error,
    toggleListening,
    isSupported: !!SpeechRecognitionAPI
  };
}
