/**
 * SafeHaven — Voice Routes
 *
 * POST /api/voice/synthesize        → ElevenLabs TTS proxy (returns base64 mp3)
 * POST /api/voice/synthesize/stream → ElevenLabs TTS proxy (streams raw audio chunks)
 * POST /api/voice/transcribe        → On-device STT recommended; server stub returns 501
 *
 * Security:
 *   - ElevenLabs API key is never in the mobile bundle
 *   - Text is length-capped at 1400 chars (data-efficient, matches elevenlabs.ts)
 *   - Locale allowlist prevents misuse of unsupported voices
 *
 * Streaming endpoint (POST /synthesize/stream):
 *   Returns Content-Type: audio/mpeg as a chunked transfer stream.
 *   The app pipes this directly into expo-av for low-latency playback.
 *   The client should abort the request (AbortController) when playback stops.
 */
export declare const voiceRouter: import("express-serve-static-core").Router;
//# sourceMappingURL=voice.d.ts.map