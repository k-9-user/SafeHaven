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
import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import https from 'node:https';
import multer from 'multer';
export const voiceRouter = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
});
// ─── Config ───────────────────────────────────────────────────────────────────
const VOICE_IDS = {
    en: process.env['ELEVENLABS_VOICE_ID_EN'] ?? 'EXAVITQu4vr4xnSDxMaL',
    fr: process.env['ELEVENLABS_VOICE_ID_FR'] ?? 'TX3LPaxmHKxFdv7VOQHJ',
    es: process.env['ELEVENLABS_VOICE_ID_ES'] ?? 'VR6AewLTigWG4xSOukaG',
    pt: process.env['ELEVENLABS_VOICE_ID_PT'] ?? 'pNInz6obpgDQGcFmaJgB',
    ar: process.env['ELEVENLABS_VOICE_ID_AR'] ?? 'ErXwobaYiN019PkySvjV',
    // sw + ha fall back to EN voice
};
const ELEVENLABS_MODEL = process.env['ELEVENLABS_MODEL'] ?? 'eleven_multilingual_v2';
const STT_LANGUAGE_CODES = {
    en: 'eng',
    fr: 'fra',
    es: 'spa',
    pt: 'por',
    sw: 'swa',
    ha: 'hau',
    ar: 'ara',
};
// ─── Schema ───────────────────────────────────────────────────────────────────
const SynthesizeSchema = z.object({
    text: z.string().min(1).max(1400),
    locale: z.enum(['en', 'fr', 'es', 'pt', 'sw', 'ha', 'ar']).default('en'),
    voiceId: z.string().optional(),
});
// ─── POST /api/voice/synthesize ───────────────────────────────────────────────
// Returns full audio as base64-encoded JSON — good for short utterances
voiceRouter.post('/synthesize', async (req, res) => {
    const parsed = SynthesizeSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
        return;
    }
    const apiKey = process.env['ELEVENLABS_API_KEY'];
    if (!apiKey) {
        res.status(503).json({ error: 'Voice service not configured' });
        return;
    }
    const { text, locale, voiceId } = parsed.data;
    const selectedVoiceId = voiceId ?? VOICE_IDS[locale] ?? VOICE_IDS['en'];
    try {
        const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`, {
            text,
            model_id: ELEVENLABS_MODEL,
            voice_settings: {
                stability: 0.55,
                similarity_boost: 0.85,
                style: 0.10,
                use_speaker_boost: true,
            },
        }, {
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            responseType: 'arraybuffer',
            timeout: 25_000,
        });
        const audioBase64 = Buffer.from(response.data).toString('base64');
        res.json({
            mimeType: 'audio/mpeg',
            audioBase64,
            voiceId: selectedVoiceId,
            charCount: text.length,
        });
    }
    catch (error) {
        console.error('[Voice] ElevenLabs /synthesize error:', error);
        res.status(502).json({ error: 'Voice synthesis failed. Please try again.' });
    }
});
// ─── POST /api/voice/synthesize/stream ───────────────────────────────────────
// Streams raw audio bytes as chunked transfer — lower latency for long responses
voiceRouter.post('/synthesize/stream', async (req, res) => {
    const parsed = SynthesizeSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
        return;
    }
    const apiKey = process.env['ELEVENLABS_API_KEY'];
    if (!apiKey) {
        res.status(503).json({ error: 'Voice service not configured' });
        return;
    }
    const { text, locale, voiceId } = parsed.data;
    const selectedVoiceId = voiceId ?? VOICE_IDS[locale] ?? VOICE_IDS['en'];
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream?output_format=mp3_44100_128`;
    const body = JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: {
            stability: 0.55,
            similarity_boost: 0.85,
            style: 0.10,
            use_speaker_boost: true,
        },
    });
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
            'Content-Length': Buffer.byteLength(body).toString(),
        },
    };
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-store');
    const elReq = https.request(url, options, (elRes) => {
        if (elRes.statusCode && elRes.statusCode >= 400) {
            console.error(`[Voice] ElevenLabs stream error: HTTP ${elRes.statusCode}`);
            res.status(502).end();
            return;
        }
        elRes.pipe(res);
        elRes.on('end', () => res.end());
    });
    elReq.on('error', (err) => {
        console.error('[Voice] ElevenLabs stream pipe error:', err.message);
        if (!res.headersSent)
            res.status(502).end();
    });
    // If client disconnects, abort the upstream ElevenLabs request
    req.on('close', () => elReq.destroy());
    elReq.write(body);
    elReq.end();
});
// ─── POST /api/voice/transcribe ───────────────────────────────────────────────
// Accepts a short recording from the app and proxies it to ElevenLabs Scribe.
voiceRouter.post('/transcribe', upload.single('audio'), async (req, res) => {
    const apiKey = process.env['ELEVENLABS_API_KEY'];
    if (!apiKey) {
        res.status(503).json({ error: 'Voice transcription not configured' });
        return;
    }
    const file = req.file;
    if (!file) {
        res.status(400).json({ error: 'Missing audio file' });
        return;
    }
    const locale = typeof req.body?.locale === 'string' ? req.body.locale : 'en';
    const languageCode = STT_LANGUAGE_CODES[locale] ?? STT_LANGUAGE_CODES.en;
    try {
        const formData = new FormData();
        formData.append('model_id', 'scribe_v2');
        formData.append('file', new Blob([file.buffer], { type: file.mimetype || 'audio/m4a' }), file.originalname || 'recording.m4a');
        formData.append('no_verbatim', 'true');
        formData.append('tag_audio_events', 'true');
        if (languageCode) {
            formData.append('language_code', languageCode);
        }
        const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
            },
            body: formData,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ElevenLabs STT HTTP ${response.status}: ${errorText}`);
        }
        const payload = await response.json();
        res.json({
            transcript: payload.text ?? '',
            confidence: payload.language_probability ?? 0.9,
            languageCode: payload.language_code ?? languageCode,
        });
    }
    catch (error) {
        console.error('[Voice] ElevenLabs transcription error:', error);
        res.status(502).json({ error: 'Voice transcription failed. Please try again.' });
    }
});
//# sourceMappingURL=voice.js.map