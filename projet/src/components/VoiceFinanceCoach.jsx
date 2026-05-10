import { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mic, MicOff, Send, Volume2 } from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    text: 'Tell me your risk profile, amount, and goal. I can answer by text and voice, with beginner-safe DeFi guidance on Solana.',
  },
];

const ELEVENLABS_VOICE_ID = 'VMTRU6n4ozl5SzXToh9l';

function getSpeechRecognition() {
  const win = window;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export default function VoiceFinanceCoach() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [statusText, setStatusText] = useState('');
  const [riskProfile, setRiskProfile] = useState('beginner');
  const [amount, setAmount] = useState('50');
  const [goal, setGoal] = useState('Build emergency savings');

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const speechRecognitionSupported = useMemo(() => Boolean(getSpeechRecognition()), []);

  const startListening = () => {
    if (!speechRecognitionSupported) {
      setStatusText('Speech recognition is not supported on this browser.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const SpeechRecognition = getSpeechRecognition();
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setStatusText('Listening...');
    };

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setDraft((existing) => (existing ? `${existing} ${transcript}` : transcript));
      }
    };

    recognition.onerror = () => {
      setStatusText('Speech recognition failed. Try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatusText((current) => (current === 'Listening...' ? 'Listening finished.' : current));
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const playVoice = async (text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
      setStatusText('Local voice playback is running.');
      return;
    }

    try {
      const response = await fetch('/api/finance-agent/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: ELEVENLABS_VOICE_ID }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setStatusText(payload?.message || 'Voice synthesis is unavailable.');
        return;
      }

      const payload = await response.json();
      if (!payload?.audioBase64 || !payload?.mimeType) {
        setStatusText('No audio received from the server.');
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(`data:${payload.mimeType};base64,${payload.audioBase64}`);
      audioRef.current = audio;
      await audio.play();
      setStatusText('Voice answer is playing.');
    } catch (error) {
      console.error('Voice playback error:', error);
      setStatusText('Audio playback failed.');
    }
  };

  const askAssistant = async () => {
    if (!draft.trim() || isSending) return;

    const userText = [
      `Risk profile: ${riskProfile}.`,
      `Amount available: ${amount || 'not specified'} USD equivalent.`,
      `Goal: ${goal || 'not specified'}.`,
      `Question: ${draft.trim()}`,
    ].join(' ');
    setDraft('');
    setStatusText('');

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: userText,
    };
    setMessages((previous) => [...previous, userMessage]);
    setIsSending(true);

    try {
      const response = await fetch('/api/finance-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error(`Finance endpoint error: ${response.status}`);
      }

      const payload = await response.json();
      const answer = payload?.response || 'I can help with budgeting, protection, and safer beginner investing.';

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: answer,
      };
      setMessages((previous) => [...previous, assistantMessage]);

      if (voiceEnabled) {
        await playVoice(answer);
      }
    } catch (error) {
      console.error('Assistant request failed:', error);
      const fallback = {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Local mode is active. Start with an emergency buffer, keep only a limited portion in USDC, and avoid concentrating everything in one asset.',
      };
      setMessages((previous) => [...previous, fallback]);
      setStatusText('Local mode is active.');
    } finally {
      setIsSending(false);
      stopListening();
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-lg">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-slate-900">Voice AI Finance Coach</CardTitle>
            <CardDescription>
              Ask by text or voice. ElevenLabs is used when configured, with browser voice as a fallback.
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-md border-cyan-200 bg-cyan-50 text-cyan-700">
            Novice Friendly
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-56 space-y-3 overflow-auto rounded-xl border bg-slate-50 p-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg p-3 text-sm ${
                message.role === 'assistant'
                  ? 'border border-cyan-200 bg-cyan-50 text-slate-800'
                  : 'border border-slate-200 bg-white text-slate-900'
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {message.role === 'assistant' ? 'AI Coach' : 'You'}
              </p>
              <p className="mt-1 leading-6">{message.text}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_0.8fr_1.2fr]">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Risk profile</label>
            <Select value={riskProfile} onValueChange={setRiskProfile}>
              <SelectTrigger>
                <SelectValue placeholder="Risk profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner, capital protection first</SelectItem>
                <SelectItem value="moderate">Moderate, balanced growth</SelectItem>
                <SelectItem value="volatile">Volatile income, low downside tolerance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Amount</label>
            <Input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Goal</label>
            <Input value={goal} onChange={(event) => setGoal(event.target.value)} />
          </div>
        </div>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-24"
          placeholder="Example: How should I protect my money if crypto markets fall?"
          disabled={isSending}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={isListening ? 'destructive' : 'outline'}
            onClick={isListening ? stopListening : startListening}
            disabled={isSending || !speechRecognitionSupported}
          >
            {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
            {isListening ? 'Stop mic' : 'Speak'}
          </Button>

          <Button
            type="button"
            variant={voiceEnabled ? 'default' : 'outline'}
            onClick={() => setVoiceEnabled((enabled) => !enabled)}
            disabled={isSending}
            className={voiceEnabled ? 'bg-cyan-600 text-white hover:bg-cyan-500' : ''}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
          </Button>

          <Button type="button" onClick={askAssistant} disabled={isSending || !draft.trim()}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send
          </Button>
        </div>

        {statusText && (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {statusText}
          </p>
        )}

        {!speechRecognitionSupported && (
          <p className="text-xs text-slate-500">
            This browser does not support Web Speech API recognition. Text chat still works.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
