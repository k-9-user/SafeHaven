# SafeHaven: AI-Powered Personal Finance

**SafeHaven** is a fintech platform for Africa and South America combining financial education, AI-powered advice, and **secure crypto investing** with automatic risk management.

## Philosophy

Inspired by [*AI for Personal Finance*](https://gustaf.ai/ai-for-personal-finance) by Gustaf Alströmer, we believe every person deserves:
- **Accessible education** on personal finance, investments, and wealth-building
- **Unbiased AI guidance** personalized to their situation
- **Secure crypto investing** with automatic downside protection

## Features

### 🎓 Educational Hub
- Learn about budgeting, saving, and investing
- Courses tailored to emerging markets (Africa, South America)
- Interactive tools: budget planner, goal setter, currency converter

### 🤖 AI Finance Agent
- Floating 24/7 finance advisor chatbot
- Voice-only input in English, French, or Spanish
- Personalized guidance from risk profile, amount, and goal, collected conversationally by voice
- ElevenLabs voice output when configured, browser voice fallback otherwise

### 💳 LI.FI Wallet Connect
- Compare swap and bridge routes
- Prepare protected USDC routes on Solana
- Keep wallet approval under the user's control

### 🛡️ Auto-Secure Crypto (Beta)
- Deposits tracked 24/7
- **Auto-hedge into USDC** when market risk spikes
- Protect your wealth from market volatility

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS
- **Blockchain**: Solana (web3.js, token program)
- **AI**: OpenAI integration for finance assistant
- **Voice**: ElevenLabs text-to-speech endpoint with browser fallback
- **Backend**: Express.js locally, Vercel serverless functions in production
- **Database**: Via API integration

## Getting Started

### Installation

```bash
npm install
npm run dev        # Dev server + frontend on http://localhost:5173
npm run server     # Express backend on http://localhost:3000
npm run dev:all    # Both in parallel
```

### Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
ELEVENLABS_VOICE_ID=optional_voice_id
VITE_ELEVENLABS_AGENT_ID=optional_public_elevenlabs_agent_id
VITE_WALLET_CONNECT_PROJECT_ID=optional_walletconnect_project_id
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Deployment

Vite frontend with `/api` serverless functions on Vercel.

```bash
npm run build      # Build for production
npm run preview    # Preview production build
```

For Vercel, add `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, and optional `ELEVENLABS_VOICE_ID` in Project Settings > Environment Variables.
Add `VITE_ELEVENLABS_AGENT_ID` when you create a public ElevenLabs Conversational AI agent and want the production voice agent widget instead of browser speech recognition.

The current voice MVP does not require an MCP. ElevenLabs Agents can run with a public `agentId`; use MCP later only if the agent needs to call external tools beyond the current SafeHaven APIs.

## License

MIT
