# SafeHaven — Architecture Overview

## Data Flow: User → Voice → Agent → Risk Profile → Strategy → Wallet

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MOBILE APP (Expo / RN)                       │
│                                                                     │
│  ┌──────────┐    ┌─────────────┐    ┌──────────────┐               │
│  │  Voice   │    │    Text     │    │   Learning   │               │
│  │  Input   │    │   Input     │    │   Module     │               │
│  │ (ElevenL)│    │  (Keyboard) │    │  (Gamified)  │               │
│  └────┬─────┘    └─────┬───────┘    └──────────────┘               │
│       │                │                                            │
│       └────────┬───────┘                                            │
│                ▼                                                     │
│         ┌─────────────┐                                             │
│         │  i18n Layer │  (en / fr / es / pt / sw / ha / ar)        │
│         │  + Security │  (PII strip, scam pre-filter)              │
│         └──────┬──────┘                                             │
└────────────────│────────────────────────────────────────────────────┘
                 │ HTTPS (TLS 1.3) — JSON
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AGENT SERVICE (Node.js + TS)                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Safety Layer (FIRST)                       │   │
│  │  • Scam / phishing keyword detection                         │   │
│  │  • PII redaction before LLM call                            │   │
│  │  • Topic guardrails (no leverage, perps, tax advice)        │   │
│  │  • Rate limiting per user (abuse prevention)                │   │
│  └──────────────────────┬──────────────────────────────────────┘   │
│                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Claude LLM Client (Anthropic)                   │  │
│  │  • System prompt: finance-safe, literacy-appropriate         │  │
│  │  • Tool use: get_risk_profile, recommend_strategy,           │  │
│  │              explain_concept, get_balance (read-only)        │  │
│  │  • Streaming response → chunked to app                      │  │
│  └──────────────────────┬──────────────────────────────────────┘  │
│                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  Risk Profiler                               │  │
│  │  • Collects: available capital, goals, time horizon,         │  │
│  │              monthly income/expenses, risk tolerance         │  │
│  │  • Outputs: RiskProfile (conservative / moderate)           │  │
│  │  • Stored: encrypted per-user in agent DB                   │  │
│  └──────────────────────┬──────────────────────────────────────┘  │
│                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               Strategy Engine                                │  │
│  │  • Input: RiskProfile + current on-chain yields             │  │
│  │  • Conservative only: USDC lending (Kamino / MarginFi)      │  │
│  │  • Outputs: StrategyRecommendation with:                    │  │
│  │      - Protocol name, APY range, risk score (0-10)         │  │
│  │      - Plain-language explanation (in user's language)      │  │
│  │      - Required steps + estimated gas                       │  │
│  │      - Mandatory risk disclosure                            │  │
│  └──────────────────────┬──────────────────────────────────────┘  │
└────────────────────────│────────────────────────────────────────────┘
                         │ Strategy Recommendation (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        MOBILE APP (cont.)                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Voice Output (ElevenLabs TTS)                   │  │
│  │  • Streams audio chunks — low latency                        │  │
│  │  • Model: eleven_multilingual_v2                             │  │
│  │  • Falls back to expo-speech (on-device) if offline         │  │
│  └──────────────────────┬──────────────────────────────────────┘  │
│                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │        User Reviews Strategy (Consent Screen)                │  │
│  │  • Plain-language summary                                    │  │
│  │  • Risk score visualization                                  │  │
│  │  • Risk disclosure (mandatory, translated)                   │  │
│  │  • "I understand the risks" checkbox                         │  │
│  │  • Estimated APY range (never a guarantee)                  │  │
│  └──────────────────────┬──────────────────────────────────────┘  │
│                         │  User taps "Confirm"                     │
│                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              DeFi Execution Layer                            │  │
│  │                                                              │  │
│  │  ┌──────────────────┐      ┌────────────────────────────┐   │  │
│  │  │  Li.Fi Bridge    │      │  Solana Protocol Call      │   │  │
│  │  │  (if cross-chain)│─────▶│  (Kamino / MarginFi deposit│   │  │
│  │  │  EVM → Solana   │      │   via @solana/web3.js)     │   │  │
│  │  └──────────────────┘      └───────────┬────────────────┘   │  │
│  │                                         │                    │  │
│  │                                         ▼                    │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │     Solana Mobile Wallet Adapter                     │   │  │
│  │  │  • Transaction built by app (never by agent)         │   │  │
│  │  │  • Sent to user's wallet (Phantom / Backpack / etc.) │   │  │
│  │  │  • User signs IN their wallet app — not in SafeHaven │   │  │
│  │  │  • SafeHaven NEVER sees private keys                 │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

### App — `app/src/voice/`
Handles all audio I/O:
- **STT (Speech-to-Text):** ElevenLabs Conversational AI WebSocket or expo-av recording → agent transcription
- **TTS (Text-to-Speech):** ElevenLabs `/v1/text-to-speech` streaming API, falling back to `expo-speech` offline
- Language detected from `i18n` locale; voice ID selected per language

### App — `app/src/wallet/`
Non-custodial Solana integration:
- Uses `@solana-mobile/mobile-wallet-adapter-protocol-web3js`
- Read-only operations (balance, positions) done via RPC directly
- Write operations (deposit, withdraw) always require explicit user wallet signing
- Never stores or transmits private keys

### App — `app/src/defi/`
Two sub-modules:

**`strategies.ts`** — builds unsigned transactions for:
- USDC deposit to Kamino Finance (lending vault)
- USDC deposit to MarginFi (lending pool)
- Withdrawal from either protocol

**`lifi.ts`** — cross-chain bridging:
- Uses `@lifi/sdk` to find optimal routes from EVM chains → Solana USDC
- Quote displayed to user before any execution
- Li.Fi routes submitted through user's connected wallet

### App — `app/src/learning/`
Gamified lesson engine:
- Lesson data stored locally (bundled JSON) — works offline
- XP / badge system with local state (zustand store)
- Lesson categories: Budget 101, Emergency Fund, Inflation, Intro to DeFi, USDC & Stablecoins, Risk Management
- Each lesson has: reading content, a quiz, and a badge reward

### App — `app/src/i18n/`
i18next setup with:
- Namespace: `common`, `finance`, `defi`, `onboarding`, `errors`
- Languages: `en`, `fr`, `es`, `pt`, `sw`, `ha`, `ar`
- RTL support for Arabic via `I18nManager.forceRTL`
- Locale auto-detected from device; user can override in Settings

### App — `app/src/accessibility/`
- `useAccessibilityAnnounce()` hook — wraps `AccessibilityInfo.announceForAccessibility`
- `useFocusVisible()` hook — keyboard navigation focus ring
- `A11yButton` component — enforces 48×48dp minimum, `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`
- Color contrast validator (dev-mode only)
- Reduced-motion detection via `useReducedMotion()`

### App — `app/src/security/`
Client-side security layer:
- `stripPII()` — removes phone numbers, emails, ID numbers before sending to agent
- `detectSuspiciousLinks()` — warns user about phishing URLs in agent responses
- `validateStrategyResponse()` — ensures agent response schema matches expected StrategyRecommendation type
- `requireDisclosureAck()` — enforces risk disclosure acknowledgement before any DeFi action

### Agent — `agent/src/llm/`
Anthropic Claude client:
- Model: `claude-sonnet-4-6`
- System prompt enforces: literacy-appropriate language, no jargon, financial safety rules, language-matching
- Tool definitions: `get_risk_profile`, `recommend_strategy`, `explain_concept`, `check_protocol_yield`
- Streaming enabled; 1500-token response cap for mobile data efficiency

### Agent — `agent/src/risk/`
Risk profiling state machine:
- Multi-turn conversation collects: available capital, monthly surplus, financial goal, time horizon, loss tolerance
- Outputs `RiskProfile` with score 1–5 and recommended strategy tier
- Score 1–2: USDC savings only; Score 3–4: USDC lending; Score 5+: diversified (not yet enabled)

### Agent — `agent/src/strategies/`
Strategy template library:
- Each template: protocol, min deposit, expected APY range, risk score, audit links, explanation strings (per language)
- Templates are read-only configuration — no execution logic lives in the agent

### Agent — `agent/src/safety/`
Pre-LLM and post-LLM guardrails:
- **Blocklist:** leverage, margin, perps, short selling, options, pyramid scheme keywords
- **PII scrubber:** regex-based removal of wallet addresses, phone numbers, government IDs
- **Response validator:** ensures Claude output never contains executable transaction data
- **Scam patterns:** detects "guaranteed returns", "double your money", impersonation patterns

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat` | Main conversational endpoint — streamed |
| `POST` | `/api/risk-profile` | Save / update user risk profile |
| `GET` | `/api/strategies` | List available strategies for a risk tier |
| `GET` | `/api/yields` | Current on-chain yield snapshot (cached 5 min) |
| `POST` | `/api/voice/synthesize` | ElevenLabs TTS proxy (server-side key) |
| `GET` | `/health` | Health check |

---

## Security Architecture

```
Client                Agent                  External APIs
  │                     │                        │
  │──── TLS 1.3 ────────▶│                        │
  │                     │── Safety filter ──▶ │  │
  │                     │── PII strip    ──▶ │  │
  │                     │                  Claude│
  │                     │◀── Response ───────── │
  │                     │── Post-filter ──▶ │  │
  │◀── Sanitized ────────│                        │
  │                     │                        │
  │   [User signs tx]   │                        │
  │── Wallet Adapter ───▶ Solana RPC             │
```

Key security properties:
1. **Agent never builds signed transactions** — only suggests unsigned tx parameters
2. **Private keys never leave the user's wallet app**
3. **All external API keys are server-side only** — never in the mobile bundle
4. **Rate limiting:** 60 req/min per IP, 20 req/min per authenticated user
5. **No user PII stored by agent** beyond risk profile (capital ranges, goals — no names or IDs)

---

## Offline Strategy

| Feature | Online | Offline |
|---|---|---|
| Educational content | Fetched + cached | Served from bundle |
| AI chat | Full Claude response | Canned helpful responses |
| Voice output | ElevenLabs streaming | expo-speech (on-device) |
| Wallet balance | Live RPC | Last cached value |
| DeFi execution | Full flow | Disabled (requires signing) |
| Yields display | Live | Last cached (timestamped) |

---

## Accessibility Compliance Target

- **WCAG 2.2 AA** — all screens
- **Android TalkBack** — all interactive elements labelled
- **Large text** — all layouts tested at 200% font scale
- **Motor:** all primary actions reachable in ≤ 3 taps; no gestures without tap alternative
- **Cognitive:** reading level ≤ Grade 6 in all UI copy (Flesch-Kincaid validated per language)
- **Hearing:** no audio-only content; all voice output mirrored as on-screen text

---

## Deployment Topology

```
┌────────────────┐     ┌────────────────────┐     ┌─────────────┐
│  Expo EAS      │     │  Agent (Railway /  │     │  Solana     │
│  Build Service │     │  Render / Fly.io)  │     │  Mainnet    │
│  → APK / AAB   │     │  Node.js container │     │  RPC        │
└────────────────┘     └────────────────────┘     └─────────────┘
        │                       │
        ▼                       ▼
   Google Play             Anthropic API
   Store                   ElevenLabs API
                           Li.Fi API
```
