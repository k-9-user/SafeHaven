/**
 * SafeHaven Agent — Server Entry Point
 *
 * HTTP API powering the SafeHaven mobile app.
 * Built with Express, secured with Helmet + rate-limiting.
 *
 * Routes:
 *   POST /api/chat              → AI chat (Claude, streaming)
 *   POST /api/chat/summarize    → Compress older turns into summary paragraph
 *   POST /api/risk-profile      → Save/update risk profile
 *   GET  /api/strategies        → Available strategies for risk tier
 *   GET  /api/yields            → Current protocol APY snapshot
 *   POST /api/voice/synthesize  → ElevenLabs TTS proxy
 *   POST /api/voice/transcribe  → Audio transcription
 *   GET  /health                → Health check
 */
import 'dotenv/config';
declare const app: import("express-serve-static-core").Express;
export default app;
//# sourceMappingURL=index.d.ts.map