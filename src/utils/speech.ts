/**
 * Speech utilities for Voice Assistant
 * Uses Web Speech API (SpeechSynthesis + SpeechRecognition)
 */

/** Speak text aloud and WAIT until finished before resolving */
export function speak(text: string, lang = 'en-IN'): Promise<void> {
  return new Promise((resolve) => {
    try {
      const tl = lang.split('-')[0] || 'en';
      // Truncate to 190 chars just in case, since Google TTS limits to ~200
      const safeText = text.substring(0, 190);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(safeText)}&tl=${tl}&client=tw-ob`;
      
      const audio = new Audio(url);
      
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      
      audio.play().catch(e => {
        console.warn('[speech] audio play blocked by browser:', e);
        // If autoplay is blocked, resolve so the flow doesn't freeze
        resolve();
      });
      
    } catch (e) {
      console.warn('[speech] speak error:', e);
      resolve();
    }
  });
}

/** Check if microphone permission is available */
export async function checkMicPermission(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately stop the stream — we just needed permission
    stream.getTracks().forEach(t => t.stop());
    return true;
  } catch {
    return false;
  }
}

/**
 * Listen for speech input once.
 * Returns the recognized transcript, or '' on timeout/error.
 * Waits a small delay before starting to avoid picking up lingering TTS audio.
 */
export function listenOnce(lang = 'en-IN', timeout = 12000): Promise<string> {
  return new Promise((resolve) => {
    // Small delay to let TTS audio fully stop before mic opens
    setTimeout(() => {
      try {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) {
          console.warn('[speech] SpeechRecognition API not available. Use Chrome.');
          return resolve('');
        }

        const recognition = new SR();
        recognition.lang = lang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        let done = false;

        recognition.onresult = (e: any) => {
          if (done) return;
          done = true;
          const transcript = e.results?.[0]?.[0]?.transcript || '';
          try { recognition.stop(); } catch {}
          resolve(transcript.trim());
        };

        recognition.onerror = (e: any) => {
          console.warn('[speech] recognition error:', e.error);
          if (!done) {
            done = true;
            resolve('');
          }
        };

        recognition.onend = () => {
          if (!done) {
            done = true;
            resolve('');
          }
        };

        recognition.start();

        // Timeout safety
        setTimeout(() => {
          if (!done) {
            done = true;
            try { recognition.stop(); } catch {}
            resolve('');
          }
        }, timeout);
      } catch (e) {
        console.warn('[speech] listenOnce error:', e);
        resolve('');
      }
    }, 500); // 500ms delay after TTS ends
  });
}
