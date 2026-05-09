/**
 * SafeHaven — ElevenLabs Voice Integration
 *
 * Provides:
 *   - Text-to-Speech (TTS) via ElevenLabs API (proxied through agent for key security)
 *   - Speech-to-Text (STT) via ElevenLabs Conversational AI WebSocket
 *   - Offline fallback: expo-speech (on-device TTS)
 *   - Language-aware voice ID selection
 *
 * SECURITY: ElevenLabs API key is NEVER in the mobile bundle.
 * All calls go through the agent backend at EXPO_PUBLIC_AGENT_URL.
 */

import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import axios from 'axios';

const AGENT_URL = process.env['EXPO_PUBLIC_AGENT_URL'] ?? 'http://localhost:3001';

export type SupportedLocale = 'en' | 'fr' | 'es' | 'pt' | 'sw' | 'ha' | 'ar';

// Voice ID map — corresponds to ELEVENLABS_VOICE_ID_* in .env
const VOICE_ID_MAP: Record<SupportedLocale, string> = {
  en: 'EXAVITQu4vr4xnSDxMaL', // Sarah
  fr: 'TX3LPaxmHKxFdv7VOQHJ', // Liam (FR)
  es: 'VR6AewLTigWG4xSOukaG', // Arnold (ES)
  pt: 'pNInz6obpgDQGcFmaJgB', // Adam (PT)
  sw: 'EXAVITQu4vr4xnSDxMaL', // Fallback to EN
  ha: 'EXAVITQu4vr4xnSDxMaL', // Fallback to EN
  ar: 'ErXwobaYiN019PkySvjV', // Arabic voice
};

export interface TTSOptions {
  locale: SupportedLocale;
  /** Override the default voice for this locale */
  voiceId?: string;
  /** Max characters to synthesize (default 1400 — data-efficient) */
  maxChars?: number;
}

export interface TTSResult {
  /** Base64-encoded MP3 audio data */
  audioBase64: string;
  mimeType: 'audio/mpeg';
  voiceId: string;
}

/**
 * Synthesize speech via the agent backend (ElevenLabs proxy).
 * Falls back to expo-speech if the network call fails.
 */
export async function synthesizeSpeech(
  text: string,
  options: TTSOptions,
): Promise<void> {
  const { locale, voiceId, maxChars = 1400 } = options;
  const trimmedText = text.slice(0, maxChars);
  const selectedVoiceId = voiceId ?? VOICE_ID_MAP[locale];

  try {
    const response = await axios.post<TTSResult>(
      `${AGENT_URL}/api/voice/synthesize`,
      { text: trimmedText, voiceId: selectedVoiceId, locale },
      { timeout: 15_000 },
    );

    const { audioBase64, mimeType } = response.data;
    await playAudioBase64(audioBase64, mimeType);
  } catch (error) {
    console.warn('[ElevenLabs] TTS failed, falling back to expo-speech:', error);
    await speakWithExpofallback(trimmedText, locale);
  }
}

/**
 * Play base64-encoded audio using expo-av.
 * Manages audio session to prevent conflicts with system audio.
 */
async function playAudioBase64(
  base64: string,
  mimeType: string,
): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  const uri = `data:${mimeType};base64,${base64}`;
  const { sound } = await Audio.Sound.createAsync({ uri });

  await sound.playAsync();

  // Unload when playback finishes
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync().catch(console.warn);
    }
  });
}

/**
 * On-device TTS fallback using expo-speech.
 * Works offline with lower quality but zero data usage.
 */
async function speakWithExpofallback(
  text: string,
  locale: SupportedLocale,
): Promise<void> {
  const languageMap: Record<SupportedLocale, string> = {
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
    pt: 'pt-BR',
    sw: 'sw-TZ',
    ha: 'ha-NG',
    ar: 'ar-SA',
  };

  await Speech.speak(text, {
    language: languageMap[locale],
    rate: 0.9, // Slightly slower for clarity
    pitch: 1.0,
  });
}

/**
 * Stop any currently playing TTS audio.
 */
export async function stopSpeech(): Promise<void> {
  await Speech.stop();
}

/**
 * Check if TTS is currently speaking.
 */
export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

export type VoiceRecordingState =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'error';

export interface VoiceRecordingResult {
  transcript: string;
  confidence: number;
}

/**
 * Record audio from the microphone and transcribe via the agent.
 * Returns the transcribed text.
 *
 * Requires android.permission.RECORD_AUDIO — declared in app.json.
 */
export async function recordAndTranscribe(
  locale: SupportedLocale,
  onStateChange?: (state: VoiceRecordingState) => void,
): Promise<VoiceRecordingResult | null> {
  onStateChange?.('recording');

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );

    // Record for up to 30 seconds
    await new Promise<void>((resolve) => setTimeout(resolve, 30_000));

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (!uri) {
      onStateChange?.('error');
      return null;
    }

    onStateChange?.('processing');

    // Send to agent for transcription
    const formData = new FormData();
    formData.append('audio', {
      uri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as unknown as Blob);
    formData.append('locale', locale);

    const response = await axios.post<VoiceRecordingResult>(
      `${AGENT_URL}/api/voice/transcribe`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30_000,
      },
    );

    onStateChange?.('idle');
    return response.data;
  } catch (error) {
    console.error('[ElevenLabs] Recording/transcription error:', error);
    onStateChange?.('error');
    return null;
  }
}
