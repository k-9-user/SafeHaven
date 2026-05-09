# SafeHaven 🛡️

> **24/7 AI-powered personal finance guidance for the people Wall Street forgot.**

SafeHaven is a mobile-first, voice-accessible AI agent that helps adults in Latin America and Africa — and people with disabilities worldwide — understand basic personal finance and safely grow small savings using conservative DeFi strategies on Solana.

---

## Why SafeHaven Exists

More than **1.4 billion adults** have no access to formal financial services. Of those who do, most receive advice optimized for wealth — not for survival, resilience, or first-time savers with $20 to their name.

SafeHaven is built on three convictions:

1. **Financial literacy is a human right.** Every adult deserves to understand budgeting, saving, and risk — in their own language, at their own pace.
2. **Safe yield should be accessible to anyone.** USDC lending on Solana can earn 4–8% APY with minimal risk. That opportunity shouldn't require a finance degree or a brokerage account.
3. **Voice and accessibility are not optional.** Our users may be visually impaired, semi-literate, or on a $40 Android with 200 MB of data per month. The app must work for all of them.

---

## Who We Serve

| Profile | Description |
|---|---|
| 🌍 LATAM & Africa | Adults with little-to-no financial education, unbanked or underbanked, earning in volatile local currencies |
| ♿ Disability-first | Users with visual, motor, cognitive, or hearing impairments anywhere in the world |
| 📱 Low-resource mobile | Smartphone users on intermittent connectivity, low-end Android hardware, limited data plans |

---

## Core Features

### 🎙️ Voice-First AI Agent
Talk to SafeHaven in your language. Ask questions about budgeting, saving, and investing. Get clear, jargon-free answers spoken back to you. Powered by **ElevenLabs** multilingual TTS + **Claude** (Anthropic) reasoning.

### 📚 Gamified Financial Education
Progress through levels — Novice → Saver → Investor — earning badges and completing bite-sized lessons on budgeting, emergency funds, inflation, and DeFi basics. Inspired by the progression UX of GitMastery.

### 🤖 AI Risk Profiler
Answer a few conversational questions. SafeHaven builds your risk profile — capital available, goals, time horizon, risk tolerance — and recommends a conservative, personalized DeFi strategy.

### 💰 Conservative DeFi Strategies
Only USDC-denominated yield via audited Solana lending protocols (Kamino, MarginFi). No leverage. No perps. No exotic farms. Maximum transparency, minimum risk for beginners.

### 🌉 Cross-Chain Bridging
Bring funds from other chains via **Li.Fi** (Solana ecosystem). Users don't need to start on Solana — they can bridge from wherever their assets are.

### 🔐 Non-Custodial by Design
SafeHaven never holds user funds. All transactions are signed by the user's own wallet via **Solana Mobile Wallet Adapter**. The agent recommends; the user decides and signs.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Expo SDK 52), TypeScript |
| Voice AI | ElevenLabs Conversational AI + TTS (`eleven_multilingual_v2`) |
| LLM Brain | Anthropic Claude (`claude-sonnet-4-6`) |
| Agent Framework | Virtuals Protocol |
| Blockchain | Solana (web3.js v1) |
| Wallet | Solana Mobile Wallet Adapter |
| DeFi / Bridging | Li.Fi (Solana ecosystem), Kamino Finance, MarginFi |
| Backend Agent | Node.js + TypeScript, Express |
| Localization | i18next (en, fr, es, pt, sw, ha, ar) |
| Accessibility | WCAG 2.2 AA; react-native-accessibility-engine |

---

## Supported Languages (MVP)

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
safehaven/
├── app/              # React Native (Expo) mobile app
│   └── src/
│       ├── screens/       # App screens (Onboarding, Home, Learn, DeFi, Settings)
│       ├── components/    # Shared UI components (accessible, WCAG 2.2 AA)
│       ├── voice/         # ElevenLabs STT/TTS integration
│       ├── wallet/        # Solana Mobile Wallet Adapter
│       ├── defi/          # Strategy engine + Li.Fi bridge
│       ├── learning/      # Gamified lesson engine
│       ├── i18n/          # Localization (7 languages)
│       ├── accessibility/ # A11y helpers and audit hooks
│       └── security/      # Guardrails, fraud detection, disclosure logic
│
├── agent/            # Backend AI agent service (Node.js + TypeScript)
│   └── src/
│       ├── llm/           # Anthropic Claude client
│       ├── risk/          # Risk profiling logic
│       ├── strategies/    # Conservative DeFi strategy templates
│       └── safety/        # Refusal guardrails, scam detection
│
├── contracts/        # Solana programs (Anchor framework)
│   └── programs/safehaven/
│
├── docs/             # Architecture decisions, accessibility audit, threat model
│
└── projet/           # Web prototype (React + Vite) — reference implementation
```

---

## Getting Started

### Prerequisites
- Node.js >= 20
- Expo CLI: `npm install -g expo-cli`
- Android device or emulator (primary target)
- Anchor CLI (for contracts only)

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/your-org/safehaven.git
cd safehaven

# 2. Copy env and fill in your keys
cp .env.example .env

# 3. Start the AI agent backend
cd agent && npm install && npm run dev

# 4. Start the mobile app
cd ../app && npm install && npx expo start --android
```

### Environment Variables

See [`.env.example`](.env.example) for all required keys.

---

## Design Principles

- **Blue-first UI:** Primary `#2563EB`, accent `#60A5FA`, background `#F8FAFC`
- **Touch targets >= 48x48dp** on all interactive elements
- **Minimum font size 16sp** in body text; 14sp minimum anywhere
- **Contrast ratio >= 4.5:1** on all text (WCAG 2.2 AA)
- **Screen reader labels** on every touchable and icon
- **Haptic feedback** for confirmations and errors
- **Offline-first:** Core educational content cached locally; agent calls queue when offline

---

## Safety & Ethics Commitments

- Never recommend leverage, perpetuals, or exotic yield farms to non-expert users
- Never custody user funds
- Never give specific investment advice without a risk disclaimer
- Always explain what a strategy does in plain language before presenting it
- Always disclose risks and direct users to consult local financial professionals for major decisions
- Built-in scam and phishing detection in the agent safety layer

---

## License

MIT

---

*SafeHaven — Because financial safety shouldn't depend on where you were born.*
