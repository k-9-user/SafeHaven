# Safe Haven Money

> **Voice AI for LATAM, Africa & people with disabilities** — protect money, learn finance, access safer Solana DeFi.

Safe Haven Money is a voice-first, multilingual financial assistant for adults in Latin America and Africa — and people with disabilities worldwide — to understand personal finance and safely grow savings via conservative DeFi on Solana.

---

## Why Safe Haven Money Exists

More than **1.4 billion adults** have no access to formal financial services. Of those who do, most receive advice optimized for wealth — not for survival, resilience, or first-time savers with $20 to their name.

Three convictions drive this project:

1. **Financial literacy is a human right.** Every adult deserves to understand budgeting, saving, and risk — in their own language, at their own pace.
2. **Safe yield should be accessible to anyone.** USDC lending on Solana earns 4–8 % APY with minimal risk. That shouldn't require a finance degree.
3. **Voice and accessibility are not optional.** Our users may be visually impaired, semi-literate, or on a $40 Android with 200 MB of data per month. The app must work for all of them.

---

## Who We Serve

| Profile | Description |
|---|---|
| 🌍 LATAM & Africa | Adults with little financial education, unbanked or underbanked, earning in volatile local currencies |
| ♿ Disability-first | Users with visual, motor, cognitive, or hearing impairments anywhere in the world |
| 📱 Low-resource mobile | Smartphone users on intermittent connectivity, low-end Android, limited data plans |

---

## Core Features

### 🎙️ Voice-First AI Coach
Talk to Safe Haven Money in your language. Ask questions about budgeting, saving, and investing. Get clear, jargon-free answers spoken back to you. Powered by **ElevenLabs** multilingual TTS + **Claude** (Anthropic) reasoning.

Key component: `agent/src/routes/voice.ts` → ElevenLabs proxy; `projet/src/pages/dashboard/AIChat.jsx` → streaming chat UI.

### 📚 Financial Education (7 languages)
Progress through levels — Novice → Saver → Investor — with bite-sized lessons on budgeting, emergency funds, inflation, and DeFi basics.

Languages: `en`, `fr`, `es`, `pt`, `sw`, `ha`, `ar`.

### 🤖 AI Risk Profiler
Answer a few conversational questions. Safe Haven Money builds your risk profile and recommends a conservative, personalized DeFi strategy.

### 💰 Conservative DeFi Strategies
USDC-denominated yield via audited Solana lending protocols (Kamino, MarginFi). No leverage. No perps. No exotic farms. Maximum transparency for first-time DeFi users.

### 🌉 Cross-Chain Bridge
**LI.FI widget** embedded in the Platform tab — users can bridge from other chains to Solana without leaving the app.

### 🔐 Non-Custodial by Design
Safe Haven Money never holds user funds. All transactions are signed by the user's wallet via Solana Mobile Wallet Adapter. **The agent recommends; the user decides and signs.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web prototype | React 18 + Vite + Tailwind CSS + shadcn/ui |
| Mobile app | React Native (Expo SDK 52), TypeScript |
| Voice AI | ElevenLabs Conversational AI + TTS (`eleven_multilingual_v2`) |
| LLM | Anthropic Claude (`claude-sonnet-4-6`) |
| Blockchain | Solana (`@solana/web3.js` v1) |
| Wallet | Solana Mobile Wallet Adapter |
| DeFi / Bridge | LI.FI widget, Kamino Finance, MarginFi |
| Backend | Node.js + TypeScript + Express |
| Auth | JWT + bcrypt |
| Hosting | Railway (API) + Vercel (frontend) |
| Accessibility | WCAG 2.2 AA |

---

## Supported Languages

| Code | Language | Region |
|---|---|---|
| `en` | English | Global |
| `fr` | French | West/Central Africa, LATAM |
| `es` | Spanish | Latin America |
| `pt` | Portuguese | Brazil, Mozambique, Angola |
| `sw` | Swahili | East Africa |
| `ha` | Hausa | West Africa |
| `ar` | Arabic | North Africa, Middle East |

---

## Monorepo Structure

```
SHM/
├── agent/            # Express API — Railway
│   └── src/
│       ├── routes/        # auth, admin, chat, voice, strategies, yields
│       ├── auth/          # JWT middleware, users, mailer, reset tokens
│       └── llm/           # Claude system-prompt, memory/summarization
│
├── projet/           # React web prototype — Vercel
│   └── src/
│       ├── pages/         # Login, Register, Dashboard, Admin, EducationalHub
│       └── lib/           # api.js, AuthContext, courseProgress
│
├── app/              # React Native mobile app (Expo)
│   └── src/screens/       # Onboarding + DeFi screens (WIP)
│
└── contracts/        # Solana program (Anchor) — devnet deploy pending
```

---

## Local Development

### Prerequisites
- Node.js >= 20
- API keys: Anthropic, ElevenLabs

### Install & Run

```bash
# Install all dependencies
npm run install:all

# Start backend + frontend concurrently
npm run dev
```

Backend → `http://localhost:3001` | Frontend → `http://localhost:5173`

### Environment variables

```bash
cp agent/.env.example agent/.env
# Fill in ANTHROPIC_API_KEY, JWT_SECRET, ELEVENLABS_API_KEY, etc.
```

---

## Deployment

### Railway (Backend API)

1. Connect GitHub repo → Railway
2. **Root Directory** → `agent`
3. Add all env vars (see `agent/.env.example`)
4. Push to `main` → Railway auto-deploys

### Vercel (Frontend)

1. Connect GitHub repo → Vercel
2. **Root Directory** → `projet` | **Framework** → Vite
3. Add env var: `VITE_AGENT_URL` = `https://your-railway-url.up.railway.app`
4. Push to `main` → Vercel auto-deploys

> **Important:** `VITE_AGENT_URL` is baked in at **build time** by Vite.
> After changing it in Vercel, always trigger a **Redeploy** (Vercel → Deployments → Redeploy) for the change to take effect.

### CORS

In Railway → Variables, set `CORS_ORIGINS` to the Vercel URL **without trailing slash**:
```
CORS_ORIGINS=https://your-app.vercel.app
```

---

## Partner Integrations

| Partner | Integration | Location |
|---|---|---|
| **ElevenLabs** | Voice synthesis + transcription | `agent/src/routes/voice.ts` |
| **LI.FI** | DeFi bridge/swap widget | `projet/src/components/LiFiWalletWidget.jsx` |
| **Anthropic** | Claude chat reasoning | `agent/src/llm/` |

---

## Design Principles

- **Agent recommends; user decides and signs** — non-custodial always
- **Conservative DeFi only** — USDC, audited protocols, no leverage
- **Voice-first** — every action accessible without reading or typing
- **Education before action** — financial literacy precedes DeFi access
- **WCAG 2.2 AA** — contrast, touch targets, screen reader labels on all elements

---

## Safety & Ethics

- Never recommend leverage, perpetuals, or exotic yield farms to non-expert users
- Never custody user funds
- Always explain what a strategy does in plain language before presenting it
- Always disclose risks — direct users to local financial professionals for major decisions
- Built-in scam and phishing detection in the agent safety layer

---

*Safe Haven Money — Because financial safety shouldn't depend on where you were born.*
