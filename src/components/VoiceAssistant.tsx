import { useState, useCallback } from 'react';
import { useComplaints } from '@/context/ComplaintsContext';
import { Mic, X, Loader2, CheckCircle2, AlertCircle, User, Phone, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { speak, listenOnce, checkMicPermission } from '@/utils/speech';

type FlowStep = 'idle' | 'checking-mic' | 'asking-name' | 'listening-name' |
  'asking-phone' | 'listening-phone' | 'asking-issue' | 'listening-issue' |
  'submitting' | 'done' | 'error';

const STEP_LABELS: Record<FlowStep, string> = {
  'idle': 'Tap the microphone to start',
  'checking-mic': 'Checking microphone access…',
  'asking-name': '🗣️ Speaking: "Please say your name"',
  'listening-name': '🎤 Listening for your name…',
  'asking-phone': '🗣️ Speaking: "Please say your phone number"',
  'listening-phone': '🎤 Listening for phone number…',
  'asking-issue': '🗣️ Speaking: "Describe the problem"',
  'listening-issue': '🎤 Listening for your complaint…',
  'submitting': '📤 Submitting your complaint…',
  'done': '✅ Complaint submitted successfully!',
  'error': '❌ Something went wrong',
};

export default function VoiceAssistant() {
  const { login, addComplaint } = useComplaints();
  const { langTag, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FlowStep>('idle');
  const [capturedName, setCapturedName] = useState('');
  const [capturedPhone, setCapturedPhone] = useState('');
  const [capturedIssue, setCapturedIssue] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isActive = step !== 'idle' && step !== 'done' && step !== 'error';

  const resetState = useCallback(() => {
    setStep('idle');
    setCapturedName('');
    setCapturedPhone('');
    setCapturedIssue('');
    setTicketId('');
    setErrorMsg('');
  }, []);

  const handleClose = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch {}
    setOpen(false);
    resetState();
  }, [resetState]);

  const startFlow = async () => {
    resetState();
    setOpen(true);

    // ── Step 1: Check mic permission ──
    setStep('checking-mic');
    const hasMic = await checkMicPermission();
    if (!hasMic) {
      setStep('error');
      setErrorMsg('Microphone access denied. Please allow microphone permission in your browser and try again.');
      return;
    }

    // ── Step 2: Ask for name ──
    setStep('asking-name');
    await speak(t('speak_name'), langTag);

    setStep('listening-name');
    const name = await listenOnce(langTag, 10000);
    const finalName = name || (langTag === 'ta-IN' ? 'அறிமுக பயனர்' : 'Guest');
    setCapturedName(finalName);

    // ── Step 3: Ask for phone ──
    setStep('asking-phone');
    await speak(t('speak_phone'), langTag);

    setStep('listening-phone');
    const phone = await listenOnce(langTag, 10000);
    setCapturedPhone(phone.replace(/\s+/g, '') || '');

    // ── Step 4: Ask for issue ──
    setStep('asking-issue');
    await speak(t('speak_issue'), langTag);

    setStep('listening-issue');
    const issue = await listenOnce(langTag, 15000);
    const finalIssue = issue || (langTag === 'ta-IN' ? 'எட்டத்திற்கான உதவி' : 'Help needed');
    setCapturedIssue(finalIssue);

    // ── Step 5: Submit ──
    setStep('submitting');

    const guestId = 'guest_' + Math.random().toString(36).slice(2, 8);
    login({ id: guestId, name: finalName, role: 'citizen', citizenId: guestId });

    const ward = 'Ward 01';
    const priority: 'Low' | 'Medium' | 'High' =
      /(urgent|immediate|burst|flood|emergency|அவசரம்|பிடிபிடுப்பு)/i.test(finalIssue) ? 'High' : 'Medium';

    const id = addComplaint({
      citizen: finalName,
      phone: phone.replace(/\s+/g, '') || '',
      ward,
      issue: finalIssue.slice(0, 80),
      description: finalIssue,
      priority,
    });

    setTicketId(id);
    setStep('done');

    // Speak confirmation
    await speak(`${t('complaint_submitted')} ${id}`, langTag);

    // Auto-close after 6s
    setTimeout(() => {
      setOpen(false);
      resetState();
    }, 6000);
  };

  const stepIcon = () => {
    if (step === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (step === 'done') return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (step === 'idle') return <Mic className="w-5 h-5 text-gray-400" />;
    return <Loader2 className="w-5 h-5 text-[#B91C1C] animate-spin" />;
  };

  return (
    <div>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex items-end gap-3 flex-col-reverse">
          {open && (
            <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2.5">
                  {stepIcon()}
                  <strong className="text-lg text-gray-800 font-bold">Voice Assistant</strong>
                </div>
                <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Status */}
              <div className="px-5 py-4">
                <p className="text-lg font-semibold text-gray-700 mb-4">{STEP_LABELS[step]}</p>

                {/* Listening animation */}
                {(step === 'listening-name' || step === 'listening-phone' || step === 'listening-issue') && (
                  <div className="flex items-center justify-center gap-1 py-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#B91C1C] rounded-full"
                        style={{
                          animation: `voiceWave 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
                          height: '12px',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Captured data preview */}
                {capturedName && (
                  <div className="flex items-center gap-2 text-base text-gray-600 mb-1.5 bg-gray-50 px-3 py-2 rounded-lg">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold">Name:</span> {capturedName}
                  </div>
                )}
                {capturedPhone && (
                  <div className="flex items-center gap-2 text-base text-gray-600 mb-1.5 bg-gray-50 px-3 py-2 rounded-lg">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold">Phone:</span> {capturedPhone}
                  </div>
                )}
                {capturedIssue && (
                  <div className="flex items-center gap-2 text-base text-gray-600 mb-1.5 bg-gray-50 px-3 py-2 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold">Issue:</span> {capturedIssue.slice(0, 60)}{capturedIssue.length > 60 ? '…' : ''}
                  </div>
                )}

                {/* Success ticket */}
                {step === 'done' && ticketId && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-base text-emerald-700 font-bold uppercase tracking-widest mb-1">Case ID</p>
                    <p className="text-lg font-black text-emerald-800 font-mono">{ticketId}</p>
                  </div>
                )}

                {/* Error message */}
                {step === 'error' && errorMsg && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3 text-base text-red-700 font-medium">
                    {errorMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAB Button */}
          <button
            title="Voice Assistant"
            onClick={startFlow}
            disabled={isActive}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${
              isActive
                ? 'bg-[#B91C1C] scale-110 shadow-red-500/30 animate-pulse cursor-not-allowed'
                : 'bg-[#B91C1C] hover:bg-[#991B1B] hover:scale-105 active:scale-95 cursor-pointer'
            }`}
          >
            {isActive
              ? <Loader2 className="w-6 h-6 text-white animate-spin" />
              : <Mic className="w-6 h-6 text-white" />
            }
          </button>
        </div>
      </div>

      {/* Keyframe for waveform animation */}
      <style>{`
        @keyframes voiceWave {
          0%   { height: 6px; }
          100% { height: 24px; }
        }
      `}</style>
    </div>
  );
}
