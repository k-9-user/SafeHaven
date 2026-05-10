import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Languages, Loader2, Mic, MicOff, Phone, PhoneOff, Volume2, X } from 'lucide-react';

const LANGUAGE_OPTIONS = {
  en: {
    label: 'EN',
    speech: 'en-US',
    intro:
      'Hello. I am your SafeHaven finance advisor. I will ask one question at a time. First question: what do you want to protect or improve with your money?',
    micError:
      'I cannot hear you yet. Please allow microphone access, or configure the ElevenLabs voice agent for production.',
  },
  fr: {
    label: 'FR',
    speech: 'fr-FR',
    intro:
      'Bonjour. Je suis ton conseiller financier SafeHaven. Je vais poser une seule question a la fois. Premiere question: qu est ce que tu veux proteger ou ameliorer avec ton argent?',
    micError:
      'Je ne peux pas encore t entendre. Autorise le micro, ou configure l agent vocal ElevenLabs pour la production.',
  },
  es: {
    label: 'ES',
    speech: 'es-ES',
    intro:
      'Hola. Soy tu asesor financiero SafeHaven. Voy a hacer una sola pregunta a la vez. Primera pregunta: que quieres proteger o mejorar con tu dinero?',
    micError:
      'Todavia no puedo escucharte. Permite el microfono, o configura el agente de voz de ElevenLabs para produccion.',
  },
};

const ELEVENLABS_VOICE_ID = 'VMTRU6n4ozl5SzXToh9l';
const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

const FLOW_QUESTIONS = {
  amount: {
    en: 'Thank you. Second question: about how much money are we talking about?',
    fr: 'Merci. Deuxieme question: de quel montant parle t on environ?',
    es: 'Gracias. Segunda pregunta: de cuanto dinero estamos hablando aproximadamente?',
  },
  risk: {
    en: 'Thank you. Last question: do you want very safe, balanced, or more growth with more risk?',
    fr: 'Merci. Derniere question: veux tu quelque chose de tres prudent, equilibre, ou plus de croissance avec plus de risque?',
    es: 'Gracias. Ultima pregunta: quieres algo muy seguro, equilibrado, o mas crecimiento con mas riesgo?',
  },
};

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

async function requestMicrophoneAccess() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    console.warn('Microphone permission denied or unavailable.', error);
    return false;
  }
}

async function getSolanaMarketContext() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true',
    );
    const data = await response.json();
    const solana = data?.solana;

    if (!solana) return null;

    return {
      solPriceUsd: Number(solana.usd?.toFixed?.(2) ?? solana.usd ?? 0),
      solChange24hPct: Number(solana.usd_24h_change?.toFixed?.(2) ?? solana.usd_24h_change ?? 0),
      routeSurface:
        'LI.FI Wallet Connect is available in Platform for comparing source chain/token and destination chain/token. Prioritize protected routes into USDC on Solana when downside risk is high.',
    };
  } catch (error) {
    console.warn('Unable to fetch Solana market context.', error);
    return null;
  }
}

function stopBrowserSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function speakWithBrowser(text, language) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;

  stopBrowserSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANGUAGE_OPTIONS[language]?.speech || 'en-US';
  window.speechSynthesis.speak(utterance);
  return true;
}

function ElevenLabsVoiceAgent() {
  useEffect(() => {
    if (!ELEVENLABS_AGENT_ID || document.querySelector('script[data-elevenlabs-convai]')) return;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    script.dataset.elevenlabsConvai = 'true';
    document.body.appendChild(script);
  }, []);

  if (!ELEVENLABS_AGENT_ID) return null;

  return (
    <div className="rounded-lg border border-cyan-200 bg-white p-2">
      <elevenlabs-convai
        agent-id={ELEVENLABS_AGENT_ID}
        action-text="Talk"
        start-call-text="Start"
        end-call-text="End"
        variant="expanded"
      />
    </div>
  );
}

export default function VoiceFinanceCoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('fr');
  const [callActive, setCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('ready');
  const [conversationStep, setConversationStep] = useState('goal');
  const [voiceProfile, setVoiceProfile] = useState({
    goal: '',
    amount: '',
    riskProfile: '',
  });

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const speechRecognitionSupported = useMemo(() => Boolean(getSpeechRecognition()), []);
  const selectedLanguage = LANGUAGE_OPTIONS[language] || LANGUAGE_OPTIONS.fr;

  const setSpokenStatus = (nextStatus, textToSpeak) => {
    setStatus(nextStatus);
    if (textToSpeak) {
      speakWithBrowser(textToSpeak, language);
    }
  };

  const playVoice = async (text) => {
    setIsSpeaking(true);

    try {
      const response = await fetch('/api/finance-agent/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: ELEVENLABS_VOICE_ID }),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload?.audioBase64 && payload?.mimeType) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }

          const audio = new Audio(`data:${payload.mimeType};base64,${payload.audioBase64}`);
          audioRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => setIsSpeaking(false);
          await audio.play();
          return;
        }
      }
    } catch (error) {
      console.warn('ElevenLabs TTS unavailable, using browser voice.', error);
    }

    if (speakWithBrowser(text, language)) {
      window.setTimeout(() => setIsSpeaking(false), Math.min(9000, Math.max(2500, text.length * 45)));
    } else {
      setIsSpeaking(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const endCall = () => {
    stopListening();
    stopBrowserSpeech();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCallActive(false);
    setIsThinking(false);
    setIsSpeaking(false);
    setStatus('ready');
    setConversationStep('goal');
    setVoiceProfile({ goal: '', amount: '', riskProfile: '' });
  };

  const askAssistant = async (spokenQuestion, profileOverride = voiceProfile) => {
    if (!spokenQuestion || isThinking) return;

    setIsThinking(true);
    setStatus('thinking');

    try {
      const marketContext = await getSolanaMarketContext();
      const response = await fetch('/api/finance-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          message: spokenQuestion,
          voiceOnly: true,
          goal: profileOverride.goal,
          amount: profileOverride.amount,
          riskProfile: profileOverride.riskProfile,
          marketContext,
          lifiContext: {
            availableInPlatform: true,
            purpose:
              'Use LI.FI Wallet Connect to compare source chain/token and destination chain/token before any wallet approval.',
            safeDefault:
              'For savings protection, explain routes toward USDC on Solana when appropriate, while keeping final execution inside the LI.FI widget.',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Finance endpoint error: ${response.status}`);
      }

      const data = await response.json();
      const answer =
        data?.response ||
        'Start with protecting essential money first. Use stable routes only after you understand the risk and approve the wallet transaction yourself.';

      setStatus('speaking');
      await playVoice(answer);
    } catch (error) {
      console.error('Voice advisor failed:', error);
      const fallback =
        language === 'fr'
          ? 'Mode local. Protege d abord ton argent essentiel. Garde une reserve d urgence, puis compare les routes USDC avant toute validation wallet.'
          : language === 'es'
            ? 'Modo local. Protege primero tu dinero esencial. Guarda una reserva de emergencia y compara rutas USDC antes de aprobar la wallet.'
            : 'Local mode. Protect essential money first. Keep an emergency buffer, then compare USDC routes before any wallet approval.';
      setStatus('speaking');
      await playVoice(fallback);
    } finally {
      setIsThinking(false);
      setStatus('ready');
    }
  };

  const handleSpokenAnswer = async (transcript) => {
    const spokenAnswer = transcript.trim();
    if (!spokenAnswer) return;

    if (conversationStep === 'goal') {
      setVoiceProfile((previous) => ({ ...previous, goal: spokenAnswer }));
      setConversationStep('amount');
      setStatus('speaking');
      await playVoice(FLOW_QUESTIONS.amount[language] || FLOW_QUESTIONS.amount.en);
      setStatus('ready');
      return;
    }

    if (conversationStep === 'amount') {
      setVoiceProfile((previous) => ({ ...previous, amount: spokenAnswer }));
      setConversationStep('risk');
      setStatus('speaking');
      await playVoice(FLOW_QUESTIONS.risk[language] || FLOW_QUESTIONS.risk.en);
      setStatus('ready');
      return;
    }

    if (conversationStep === 'risk') {
      const completedProfile = {
        ...voiceProfile,
        riskProfile: spokenAnswer,
      };
      setVoiceProfile(completedProfile);
      setConversationStep('ready');
      await askAssistant(
        [
          `Goal: ${completedProfile.goal}.`,
          `Amount: ${completedProfile.amount}.`,
          `Risk comfort: ${completedProfile.riskProfile}.`,
          'Give a short voice-first recommendation using current Solana market context and LI.FI route options.',
        ].join(' '),
        completedProfile,
      );
      return;
    }

    await askAssistant(spokenAnswer);
  };

  const startListening = () => {
    if (!speechRecognitionSupported) {
      setSpokenStatus('mic-error', selectedLanguage.micError);
      return;
    }

    stopBrowserSpeech();

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const SpeechRecognition = getSpeechRecognition();
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage.speech;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('listening');
    };

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      setIsListening(false);
      if (transcript) {
        handleSpokenAnswer(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setSpokenStatus('mic-error', selectedLanguage.micError);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const startCall = async () => {
    const microphoneReady = await requestMicrophoneAccess();
    if (!microphoneReady) {
      setCallActive(true);
      setSpokenStatus('mic-error', selectedLanguage.micError);
      return;
    }

    setCallActive(true);
    setConversationStep('goal');
    setVoiceProfile({ goal: '', amount: '', riskProfile: '' });
    setStatus('speaking');
    await playVoice(selectedLanguage.intro);
    setStatus('ready');
  };

  const toggleOpen = () => {
    setIsOpen((open) => !open);
  };

  const statusLabel = {
    ready: 'Ready',
    listening: 'Listening',
    thinking: 'Thinking',
    speaking: 'Speaking',
    'mic-error': 'Mic needed',
  }[status] || 'Ready';

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
      {isOpen && (
        <section className="w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-lg border border-blue-200 bg-white shadow-2xl">
          <header className="flex items-start justify-between gap-3 bg-gradient-to-r from-slate-950 via-blue-900 to-cyan-800 p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Voice Finance Advisor</h2>
                <p className="mt-1 text-xs leading-5 text-cyan-50">24/7 voice-only guidance</p>
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              onClick={() => {
                endCall();
                setIsOpen(false);
              }}
              aria-label="Close voice advisor"
            >
              <X className="h-4 w-4" />
            </Button>
          </header>

          <div className="space-y-4 p-4">
            {ELEVENLABS_AGENT_ID ? (
              <ElevenLabsVoiceAgent />
            ) : (
              <>
                <div className="flex justify-center gap-2">
                  {Object.entries(LANGUAGE_OPTIONS).map(([value, option]) => (
                    <Button
                      key={value}
                      type="button"
                      variant={language === value ? 'default' : 'outline'}
                      className={language === value ? 'bg-cyan-600 text-white hover:bg-cyan-500' : ''}
                      onClick={() => setLanguage(value)}
                      aria-label={`Use ${option.speech}`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                <div className="rounded-lg border border-cyan-200 bg-gradient-to-b from-cyan-50 to-blue-50 p-5 text-center">
                  <div
                    className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 ${
                      isListening
                        ? 'animate-pulse border-cyan-500 bg-cyan-100 text-cyan-700'
                        : isThinking
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : isSpeaking
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                            : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    {isThinking ? (
                      <Loader2 className="h-12 w-12 animate-spin" />
                    ) : isListening ? (
                      <Mic className="h-12 w-12" />
                    ) : isSpeaking ? (
                      <Volume2 className="h-12 w-12" />
                    ) : (
                      <Phone className="h-12 w-12" />
                    )}
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">{statusLabel}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {!callActive ? (
                    <Button
                      type="button"
                      className="col-span-2 h-14 bg-cyan-600 text-base text-white hover:bg-cyan-500"
                      onClick={startCall}
                    >
                      <Phone className="h-5 w-5" />
                      Start voice
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        className="h-14 bg-cyan-600 text-base text-white hover:bg-cyan-500"
                        onClick={isListening ? stopListening : startListening}
                        disabled={isThinking || isSpeaking}
                      >
                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        {isListening ? 'Stop' : 'Speak'}
                      </Button>
                      <Button type="button" variant="outline" className="h-14 text-base" onClick={endCall}>
                        <PhoneOff className="h-5 w-5" />
                        End
                      </Button>
                    </>
                  )}
                </div>

                {!speechRecognitionSupported && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    onClick={() => setSpokenStatus('mic-error', selectedLanguage.micError)}
                  >
                    <Volume2 className="h-4 w-4" />
                    Hear setup need
                  </Button>
                )}
              </>
            )}
          </div>
        </section>
      )}

      <Button
        type="button"
        onClick={toggleOpen}
        className="h-14 rounded-full bg-gradient-to-r from-blue-700 to-cyan-600 px-5 text-white shadow-2xl hover:from-blue-800 hover:to-cyan-700"
        aria-label="Open voice finance advisor"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        <span>Voice Advisor</span>
        <Languages className="h-4 w-4" />
      </Button>
    </div>
  );
}
