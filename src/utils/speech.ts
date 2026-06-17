export function speak(text: string, lang = 'en-IN') {
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  } catch (e) {
    // ignore
  }
}

export function listenOnce(lang = 'en-IN', timeout = 10000): Promise<string> {
  return new Promise((resolve) => {
    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return resolve('');
      const r = new SR();
      r.lang = lang;
      r.interimResults = false;
      let done = false;
      r.onresult = (e: any) => {
        if (done) return;
        done = true;
        const txt = e.results[0][0].transcript || '';
        r.stop();
        resolve(txt.trim());
      };
      r.onerror = () => { if (!done) { done = true; resolve(''); } };
      r.onend = () => { if (!done) { done = true; resolve(''); } };
      r.start();
      setTimeout(() => { if (!done) { done = true; try { r.stop(); } catch {} resolve(''); } }, timeout);
    } catch (e) { resolve(''); }
  });
}
