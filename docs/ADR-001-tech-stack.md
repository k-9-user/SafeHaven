# ADR-001: Technology Stack Selection

**Status:** Accepted  
**Date:** 2026-05-09  
**Author:** SafeHaven Engineering

---

## Context

SafeHaven needs to deliver a production-quality mobile application to users in Latin America and Africa, many of whom have:
- Low-end Android devices (2–4 GB RAM, Android 10+)
- Intermittent or metered internet connections (2G/3G)
- Limited data plans
- No prior experience with DeFi or crypto wallets
- Potential visual, motor, or cognitive impairments

The app must also integrate with Solana (hackathon partner), Li.Fi (hackathon partner with prize), and support voice interaction.

---

## Decision

### Mobile App: React Native (Expo SDK 52)

**Chosen over:** Flutter, native Android (Kotlin), PWA

**Rationale:**
- Expo simplifies Android audio/microphone permissions required for ElevenLabs voice integration
- `expo-speech` and `expo-av` provide reliable cross-platform audio without native modules
- Solana Mobile Wallet Adapter (`@solana-mobile/mobile-wallet-adapter-protocol-web3js`) has first-class React Native support
- Single codebase for Android (primary target) and iOS (future)
- Expo EAS Build removes the need for complex CI/CD for APK generation at hackathon speed
- Larger talent pool vs Flutter for LATAM/Africa-focused dev teams

**Trade-offs accepted:**
- React Native bundle size (~12 MB baseline) is larger than native; mitigated with Hermes engine
- Performance ceiling lower than native for complex animations; acceptable given our UI complexity

### Backend Agent: Node.js + TypeScript (Express)

**Chosen over:** Python (FastAPI), Go, Deno

**Rationale:**
- TypeScript consistency across frontend and backend reduces context switching
- `@anthropic-ai/sdk` is best-maintained in Node.js
- Express is lightweight and well-understood; no framework overhead
- Streaming support (`res.write` SSE) is straightforward in Express

### LLM: Anthropic Claude (`claude-sonnet-4-6`)

**Chosen over:** OpenAI GPT-4o, Google Gemini, Llama (self-hosted)

**Rationale:**
- Existing web prototype used OpenAI — migrating to Claude for superior safety alignment
- Claude's Constitutional AI training is better suited for financial safety use cases
- Superior multilingual performance for French, Spanish, Portuguese, Arabic, Swahili
- Tool use (function calling) is more reliable for structured risk profiling
- `claude-sonnet-4-6` balances cost and quality; `claude-haiku-4-5` available as cost fallback

### Voice: ElevenLabs

**Chosen over:** Google TTS, Azure TTS, on-device TTS (only)

**Rationale:**
- Hackathon partner — `eleven_multilingual_v2` supports all 7 target languages in one model
- Voice quality significantly better than on-device TTS for non-English languages
- Conversational AI WebSocket enables real-time low-latency voice interaction
- `expo-speech` retained as offline fallback (zero data cost)

**Risk:** ElevenLabs API cost at scale; mitigated by 1400-char TTS cap per response and server-side key (no direct client calls)

### Blockchain: Solana

**Chosen over:** Ethereum mainnet, Polygon, BSC

**Rationale:**
- Hackathon requirement (Solana track)
- Low fees (~$0.00025/tx) critical for users with small capital ($5–$50)
- Settlement finality in ~400ms — better UX than Ethereum's 12-second block times
- Kamino Finance and MarginFi are audited, established Solana lending protocols
- Helius RPC provides reliable rate limits for production use

### Cross-Chain Bridge: Li.Fi

**Chosen over:** Wormhole (direct), deBridge, Stargate

**Rationale:**
- Hackathon partner with prize incentive
- Li.Fi aggregates multiple bridges (Wormhole, Stargate, Across) — best route automatically
- Solana ecosystem support added in late 2024
- `@lifi/sdk` has clean TypeScript interface
- Price impact protection built-in (rejects >5% impact routes)

### DeFi Protocols: Kamino Finance + MarginFi

**Chosen over:** Solend (deprecated), Port Finance, Tulip**

**Rationale:**
- Both are the largest, most liquid, most actively audited lending protocols on Solana in 2026
- USDC lending only — no volatile asset exposure
- No lock-up periods — users can withdraw at any time
- Kamino: TVL > $1B, multiple audits (OtterSec, Kudelski)
- MarginFi: TVL > $500M, multiple audits (OtterSec, Sec3)

### Agent Framework: Virtuals Protocol

**Rationale:**
- Hackathon partner
- Provides agent identity, memory, and orchestration layer above Claude
- Allows SafeHaven's AI personality to be persistent and composable

---

## Consequences

**Positive:**
- Consistent TypeScript throughout reduces bugs and onboarding time
- Expo EAS enables rapid APK delivery for testing in LATAM/Africa
- Claude's safety properties reduce need for complex output filtering
- Li.Fi and ElevenLabs partnerships provide funded API access for hackathon

**Negative / Risks:**
- React Native can have jank on very low-end devices; requires careful profiling
- ElevenLabs latency (1–3 seconds for TTS) may feel slow on 2G; offline fallback critical
- Li.Fi Solana routes are newer and less battle-tested than EVM routes
- Solana Mobile Wallet Adapter requires user to have a Solana wallet app installed

**Mitigations:**
- Use Hermes JS engine (enabled by default in Expo SDK 52)
- Pre-cache TTS for common responses
- Show clear loading states for all async operations
- Offer demo/simulation mode for users without a wallet

---

## Review

This ADR will be revisited after the first production deployment with real user data on device performance and latency metrics.
