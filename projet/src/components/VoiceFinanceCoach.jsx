import { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mic, MicOff, Send, Volume2 } from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    text: 'Pose ta question finance. Je peux aussi répondre à voix haute avec ElevenLabs si la clé API est configurée.',
  },
];

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

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const speechRecognitionSupported = useMemo(() => Boolean(getSpeechRecognition()), []);

  const startListening = () => {
    if (!speechRecognitionSupported) {
      setStatusText('Reconnaissance vocale non supportee sur ce navigateur.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const SpeechRecognition = getSpeechRecognition();
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setStatusText('Ecoute en cours...');
    };

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setDraft((existing) => (existing ? `${existing} ${transcript}` : transcript));
      }
    };

    recognition.onerror = () => {
      setStatusText('Erreur de reconnaissance vocale. Reessaie.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatusText((current) => (current === 'Ecoute en cours...' ? 'Ecoute terminee.' : current));
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
    try {
      const response = await fetch('/api/finance-agent/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setStatusText(payload?.message || 'Synthese vocale indisponible.');
        return;
      }

      const payload = await response.json();
      if (!payload?.audioBase64 || !payload?.mimeType) {
        setStatusText('Aucun audio recu du serveur.');
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(`data:${payload.mimeType};base64,${payload.audioBase64}`);
      audioRef.current = audio;
      await audio.play();
      setStatusText('Reponse vocale en lecture.');
    } catch (error) {
      console.error('Voice playback error:', error);
      setStatusText('Lecture audio impossible.');
    }
  };

  const askAssistant = async () => {
    if (!draft.trim() || isSending) return;

    const userText = draft.trim();
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
      const answer = payload?.response || 'Je peux t aider avec ton budget, ta protection et tes investissements.';

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
        text: 'Je ne peux pas joindre le service IA pour le moment. Continue avec emergency fund, diversification et conversion defensive en USDC.',
      };
      setMessages((previous) => [...previous, fallback]);
      setStatusText('Mode secours active.');
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
            <CardTitle className="text-slate-900">Coach IA vocal</CardTitle>
            <CardDescription>
              Pose des questions finance en texte ou a la voix. Reponse vocale via ElevenLabs quand disponible.
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
                {message.role === 'assistant' ? 'Coach IA' : 'Toi'}
              </p>
              <p className="mt-1 leading-6">{message.text}</p>
            </div>
          ))}
        </div>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-24"
          placeholder="Ex: Comment proteger mon capital quand le marche crypto chute ?"
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
            {isListening ? 'Stop micro' : 'Parler'}
          </Button>

          <Button
            type="button"
            variant={voiceEnabled ? 'default' : 'outline'}
            onClick={() => setVoiceEnabled((enabled) => !enabled)}
            disabled={isSending}
            className={voiceEnabled ? 'bg-cyan-600 text-white hover:bg-cyan-500' : ''}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            {voiceEnabled ? 'Voix ON' : 'Voix OFF'}
          </Button>

          <Button type="button" onClick={askAssistant} disabled={isSending || !draft.trim()}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Envoyer
          </Button>
        </div>

        {statusText && (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {statusText}
          </p>
        )}

        {!speechRecognitionSupported && (
          <p className="text-xs text-slate-500">
            Ton navigateur ne supporte pas la reconnaissance vocale Web Speech API. Tu peux quand meme utiliser le chat texte.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
