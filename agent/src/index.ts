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
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { chatRouter } from './routes/chat.js';
import { memoryRouter } from './llm/memory.js';
import { riskRouter } from './routes/risk.js';
import { strategyRouter } from './routes/strategies.js';
import { voiceRouter } from './routes/voice.js';
import { yieldsRouter } from './routes/yields.js';

const app = express();
const PORT = parseInt(process.env['AGENT_PORT'] ?? '3001', 10);

// ─── Security Middleware ────────────────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.anthropic.com', 'https://api.elevenlabs.io', 'https://li.quest'],
    },
  },
}));

// CORS — mobile app + web frontend dev server
const allowedOrigins = (
  process.env['CORS_ORIGINS'] ?? 'http://localhost:8081,http://localhost:5173,http://localhost:4173'
)
  .split(',')
  .map((o: string) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) { callback(null, true); return; }
    // En dev : whitelist locale. En prod : accepte aussi *.vercel.app
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ──────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env['RATE_LIMIT_RPM'] ?? '60', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment.' },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env['RATE_LIMIT_USER_RPM'] ?? '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Chat rate limit reached. Please wait a moment before sending another message.' },
});

app.use(globalLimiter);

// ─── Body Parsing ───────────────────────────────────────────────────────────

app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: false, limit: '512kb' }));

// ─── Routes ─────────────────────────────────────────────────────────────────

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', chatLimiter, chatRouter);
app.use('/api/chat', chatLimiter, memoryRouter);   // POST /api/chat/summarize
app.use('/api/risk-profile', riskRouter);
app.use('/api/strategies', strategyRouter);
app.use('/api/yields', yieldsRouter);
app.use('/api/voice', voiceRouter);

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'safehaven-agent',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] ?? 'development',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Agent] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`SafeHaven Agent running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
  console.log(`Anthropic model: ${process.env['ANTHROPIC_MODEL'] ?? 'claude-sonnet-4-6'}`);
});

export default app;
