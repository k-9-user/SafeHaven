/**
 * POST /api/voice/synthesize — ElevenLabs TTS proxy (keeps API key server-side)
 * POST /api/voice/transcribe — Audio transcription
 */
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

export const voiceRouter = Router();

const VOICE_IDS: Record<string, string> = {
  en: process.env['ELEVENLABS_VOICE_ID_EN'] ?? 'EXAVITQu4vr4xnSDxMaL',
  fr: process.env['ELEVENLABS_VOICE_ID_FR'] ?? 'TX3LPaxmHKxFdv7VOQHJ',
  es: process.env['ELEVENLABS_VOICE_ID_ES'] ?? 'VR6AewLTigWG4xSOukaG',
  pt: process.env['ELEVENLABS_VOICE_ID_PT'] ?? 'pNInz6obpgDQGcFmaJgB',
  ar: process.env['ELEVENLABS_VOICE_ID_AR'] ?? 'ErXwobaYiN019PkySvjV',
};

const SynthesizeSchema = z.object({
  text: z.string().min(1).max(1400),
  locale: z.enum(['en', 'fr', 'es', 'pt', 'sw', 'ha', 'ar']).default('en'),
  voiceId: z.string().optional(),
});

voiceRouter.post('/synthesize', async (req: Request, res: Response): Promise<void> => {
  const parsed = SynthesizeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  const apiKey = process.env['ELEVENLABS_API_KEY'];
  if (!apiKey) {
    res.status(503).json({ error: 'Voice service not configured' });
    return;
  }

  const { text, locale, voiceId } = parsed.data;
  const selectedVoiceId = voiceId ?? VOICE_IDS[locale] ?? VOICE_IDS['en']!;

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`,
      { text, model_id: process.env['ELEVENLABS_MODEL'] ?? 'eleven_multilingual_v2' },
      { headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey }, responseType: 'arraybuffer', timeout: 20_000 },
    );
    const audioBase64 = Buffer.from(response.data as ArrayBuffer).toString('base64');
    res.json({ mimeType: 'audio/mpeg', audioBase64, voiceId: selectedVoiceId });
  } catch (error) {
    console.error('[Voice] ElevenLabs error:', error);
    res.status(502).json({ error: 'Voice synthesis failed. Please try again.' });
  }
});

// Transcription endpoint placeholder
voiceRouter.post('/transcribe', async (_req: Request, res: Response): Promise<void> => {
  // TODO: Integrate ElevenLabs speech-to-text or Whisper API
  // For now, return a not-implemented response
  res.status(501).json({ error: 'Transcription not yet implemented. Use on-device STT.' });
});
