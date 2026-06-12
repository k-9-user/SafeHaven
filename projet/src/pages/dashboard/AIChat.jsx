// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import VoiceFinanceCoach from '@/components/VoiceFinanceCoach';
import { useLanguage } from '@/lib/LanguageContext';

const AGENT_URL = import.meta.env.VITE_AGENT_URL ?? '';

const LANGUAGES = {
  en: {
    code:        'en',
    label:       'English',
    flag:        '🇬🇧',
    placeholder: 'Ask Coco a question…',
    initial:     "Hello! I'm **Coco**, your AI financial coach. I can help you understand personal finance basics, evaluate safe savings options, and answer your financial questions. How can I help you?",
  },
  fr: {
    code:        'fr',
    label:       'Français',
    flag:        '🇫🇷',
    placeholder: 'Posez une question à Coco…',
    initial:     "Bonjour ! Je suis **Coco**, votre coach financier IA. Je peux vous aider à comprendre les bases de la finance, évaluer vos options d'épargne sécurisées et répondre à vos questions. Comment puis-je vous aider ?",
  },
  es: {
    code:        'es',
    label:       'Español',
    flag:        '🇪🇸',
    placeholder: 'Hazle una pregunta a Coco…',
    initial:     '¡Hola! Soy **Coco**, tu coach financiero con IA. Puedo ayudarte a entender las bases de las finanzas personales, evaluar tus opciones de ahorro seguras y responder tus preguntas. ¿En qué puedo ayudarte?',
  },
};

const ERROR_MESSAGES = {
  en: (msg) => `Sorry, I can't connect to the server. Make sure the backend is running (port 3001).\n\n_Error: ${msg}_`,
  fr: (msg) => `Désolé, je n'arrive pas à me connecter au serveur. Vérifiez que le backend est démarré (port 3001).\n\n_Erreur : ${msg}_`,
  es: (msg) => `Lo siento, no puedo conectarme al servidor. Verifica que el backend esté iniciado (puerto 3001).\n\n_Error : ${msg}_`,
};

export default function AIChat() {
  const { lang }                   = useLanguage();
  const [messages, setMessages]    = useState([{ role: 'assistant', content: LANGUAGES[lang]?.initial ?? LANGUAGES.en.initial }]);
  const [input, setInput]          = useState('');
  const [streaming, setStreaming]  = useState(false);
  const bottomRef                  = useRef(null);

  const L = LANGUAGES[lang] ?? LANGUAGES.en;

  // When global language changes, reset the conversation with the correct greeting
  useEffect(() => {
    if (!streaming) {
      const langData = LANGUAGES[lang] ?? LANGUAGES.en;
      setMessages([{ role: 'assistant', content: langData.initial }]);
      setInput('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg = { role: 'user', content: text };
    const history = [...messages, userMsg].slice(-20);
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    try {
      const token = localStorage.getItem('safehaven_token');
      const res   = await fetch(`${AGENT_URL}/api/chat`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: history, stream: true, locale: lang }),
      });

      if (!res.ok) throw new Error('Cannot reach the backend.');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              accumulated += data.chunk;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: accumulated };
                return updated;
              });
            }
            if (data.done && data.finalResponse) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: data.finalResponse };
                return updated;
              });
            }
          } catch { /* malformed SSE chunk */ }
        }
      }
    } catch (err) {
      const errFn = ERROR_MESSAGES[lang] ?? ERROR_MESSAGES.en;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: errFn(err.message) };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, messages, lang]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-3 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Coco — AI Financial Coach</p>
            <p className="text-xs text-slate-400">Powered by Claude · Safe Haven Money</p>
          </div>
          <span className="ml-auto text-lg" title={L.label}>{L.flag}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-slate-900 text-white rounded-tr-sm'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
            }`}>
              {msg.role === 'assistant' ? (
                msg.content
                  ? <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0">{msg.content}</ReactMarkdown>
                  : <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
              ) : msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 px-4 py-3 bg-white shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={L.placeholder}
            className="flex-1"
            disabled={streaming}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4"
          >
            {streaming
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>

      <VoiceFinanceCoach key={lang} language={lang} />
    </div>
  );
}
