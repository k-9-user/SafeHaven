import { useEffect } from 'react';

const DEFAULT_ELEVENLABS_AGENT_ID = 'agent_3401kr7vwyj3f1mbesw1dgjzhsay';
const configuredElevenLabsAgentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
const ELEVENLABS_AGENT_ID =
  configuredElevenLabsAgentId && !configuredElevenLabsAgentId.startsWith('replace_')
    ? configuredElevenLabsAgentId
    : DEFAULT_ELEVENLABS_AGENT_ID;

// language : 'fr' | 'es' — transmis au widget ElevenLabs
// La prop `key` côté parent force le re-montage quand la langue change
export default function VoiceFinanceCoach({ language = 'fr' }) {
  useEffect(() => {
    if (document.querySelector('script[data-elevenlabs-convai]')) return;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    script.dataset.elevenlabsConvai = 'true';
    document.body.appendChild(script);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <elevenlabs-convai
        agent-id={ELEVENLABS_AGENT_ID}
        language={language}
      />
    </div>
  );
}
