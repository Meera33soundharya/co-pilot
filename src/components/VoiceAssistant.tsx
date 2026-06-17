import React, { useState } from 'react';
import { useComplaints } from '@/context/ComplaintsContext';
import { Mic, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { speak, listenOnce } from '@/utils/speech';

export default function VoiceAssistant() {
  const { login, addComplaint } = useComplaints();
  const { langTag, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');

  const startFlow = async () => {
    setStatus('Starting voice assistant');
    setOpen(true);
    // Greet
    speak(t('speak_name'), langTag);
    setStatus('Listening for name');
    const name = (await listenOnce(langTag, 8000)) || (langTag === 'ta-IN' ? 'அமரர்' : 'Guest');

    speak(t('speak_phone'), langTag);
    setStatus('Listening for phone');
    const phone = (await listenOnce(langTag, 8000)) || '';

    speak(t('speak_issue'), langTag);
    setStatus('Listening for issue');
    const issue = (await listenOnce(langTag, 12000)) || (langTag === 'ta-IN' ? 'எட்டத்திற்கான உதவி' : 'Help needed');

    // Auto-register guest user
    const guestId = 'guest_' + Math.random().toString(36).slice(2, 8);
    login({ id: guestId, name: name || 'Guest', role: 'citizen', citizenId: guestId });

    setStatus('Submitting complaint');
    // Minimal ward/location for now
    const ward = 'Ward 01';
    const description = issue;
    const priority: 'Low'|'Medium'|'High' = /(urgent|immediate|burst|flood|emergency|அவசரம்|பிடிபிடுப்பு)/i.test(issue) ? 'High' : 'Medium';
    const id = addComplaint({ citizen: name || 'Guest', phone: phone.replace(/\s+/g, '') || '', ward, issue: issue.slice(0, 80), description, priority });

    speak(`${t('complaint_submitted')} ${id}`, langTag);
    setStatus('Done');
    setTimeout(() => setOpen(false), 4000);
  };

  return (
    <div>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex items-end gap-3 flex-col-reverse">
          {open && (
            <div className="w-80 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <strong className="text-sm">Voice Assistant</strong>
                <button onClick={() => setOpen(false)} className="p-1 rounded-md"><X className="w-4 h-4" /></button>
              </div>
              <div className="text-sm font-medium">{status}</div>
            </div>
          )}

          <button title="Voice Assistant" onClick={startFlow} className="w-16 h-16 rounded-full bg-[#B91C1C] text-white flex items-center justify-center shadow-xl">
            <Mic className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
