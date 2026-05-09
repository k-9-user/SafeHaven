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
- Ask questions about your finances, investments, risks
- Personalized advice without bias
- Market insights and strategy recommendations

### 💳 Smart Wallet
- Connect Solana (Phantom wallet)
- Track your balance and transactions
- Mint achievement NFTs

### 🛡️ Auto-Secure Crypto (Beta)
- Deposits tracked 24/7
- **Auto-hedge into USDC** when market risk spikes
- Protect your wealth from market volatility

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS
- **Blockchain**: Solana (web3.js, token program)
- **AI**: OpenAI integration for finance assistant
- **Backend**: Express.js
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
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Deployment

Vite + Express on any cloud (Vercel, Heroku, Azure, etc.)

```bash
npm run build      # Build for production
npm run preview    # Preview production build
```

## License

MIT
