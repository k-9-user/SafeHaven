// Chat endpoint for SafeHaven Finance AI Agent
// /api/finance-agent

import { OpenAI } from 'openai';

const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);
const client = hasOpenAiKey
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
const hasElevenLabsKey = Boolean(process.env.ELEVENLABS_API_KEY);

const SYSTEM_PROMPT = `You are SafeHaven's AI Finance Agent, a helpful and unbiased personal finance educator for people in Africa, Latin America, and accessibility-first communities who may have no prior financial education.

Your expertise:
- Personal finance & budgeting for low/middle-income individuals
- Investment strategies for emerging markets with high inflation/volatility
- Cryptocurrency & stablecoin usage (especially USDC on Solana)
- Risk management & wealth protection
- Remittance optimization
- Beginner DeFi routes using Solana and LI.FI, explained without jargon

Tone: Friendly, educational, non-judgmental, concise, and accessible. Reply in the user's requested language when provided (English, French, or Spanish). This product is voice-first for users who may not read, so keep answers short, conversational, and easy to understand by listening. Always recommend consulting a licensed advisor for major decisions.

Key Topics to Emphasize:
1. Emergency funds (3-6 months expenses)
2. Diversification across USD, local currency, and stablecoins
3. Dollar-cost averaging for volatile markets
4. Using USDC/stablecoins as inflation hedge
5. Low-cost index funds or ETFs when possible and locally available
6. SafeHaven's auto-secure feature for crypto risk management on Solana
7. Accessibility: offer simple next steps that work for voice users and beginners

When the user provides a risk profile, amount, and goal:
- Start with a one-line safety summary.
- Give at most 3 practical steps.
- Mention what SafeHaven can simulate or execute, but make clear that no transaction happens without wallet approval.
- Never recommend allocating more than a small beginner-safe portion to DeFi unless the user has emergency savings and understands risk.

If the user does not provide risk profile, amount, and goal:
- Ask one simple follow-up question at a time.
- First ask for their goal, then amount, then risk comfort.
- Do not overwhelm them with long explanations.
- Never ask them to type anything; ask them to answer by voice.

When market and LI.FI context is available:
- Use the Solana price and 24h change to explain whether the market looks calm or risky.
- Suggest arbitrage/protection routes at a high level, for example local currency or existing token -> USDC on Solana, SOL -> USDC on Solana, or other chain/token -> USDC on Solana through LI.FI.
- Tell the user to compare source chain/token and destination chain/token in LI.FI Wallet Connect.
- Do not invent exact yield, price guarantees, or execution certainty.
- Keep execution instructions simple: "compare route, check fees, approve only if you understand."

Do NOT:
- Give illegal financial advice
- Promise unrealistic returns
- Encourage excessive risk-taking
- Give tax advice (recommend local professionals)
- Ask the user to share private keys, seed phrases, or passwords`;

export async function handleFinanceAgentChat(req, res) {
  try {
    const {
      message,
      language = 'en',
      riskProfile,
      amount,
      goal,
      voiceOnly = false,
      marketContext,
      lifiContext,
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userContext = [
      `Requested language: ${language}.`,
      riskProfile ? `Risk profile: ${riskProfile}.` : null,
      amount ? `Amount available: ${amount} USD equivalent or local equivalent.` : null,
      goal ? `Financial goal: ${goal}.` : null,
      voiceOnly ? 'Interface mode: voice-only. Keep the response natural for audio playback.' : null,
      marketContext ? `Solana market context: ${JSON.stringify(marketContext)}.` : null,
      lifiContext ? `LI.FI wallet context: ${JSON.stringify(lifiContext)}.` : null,
      `Question: ${message}`,
    ].filter(Boolean).join('\n');

    if (!client) {
      return res.json({
        response:
          'OpenAI is not configured on this environment yet. For now, focus on emergency savings, budget tracking, and stablecoin protection. Ask me a finance question and I will keep it practical.',
      });
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userContext,
        },
      ],
    });

    const aiResponse = response.choices[0].message.content || 'I can help with that!';

    return res.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      response: 'For emerging markets, focus on dollar-cost averaging and diversifying across stablecoins. What specific question do you have?'
    });
  }
}

// Auto-secure endpoint
// POST /api/crypto/auto-secure-usdc
// Body: { walletAddress, solAmount, secureReason }

export async function triggerAutoSecureUSdC(req, res) {
  try {
    const { walletAddress, solAmount, secureReason } = req.body;

    if (!walletAddress || !solAmount) {
      return res.status(400).json({ error: 'walletAddress and solAmount required' });
    }

    // TODO: Implement Solana swap logic
    // 1. Get SOL balance from wallet
    // 2. Get current SOL/USDC rate from Jupiter/Magic Eden
    // 3. Execute swap: SOL → USDC via Jupiter Aggregator or Magic Eden
    // 4. Sign transaction with user's keypair (if in backend) or use a safe escrow
    // 5. Log transaction to SafeHaven backend database

    // For now, return a mock response
    const txHash = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    return res.json({
      success: true,
      message: 'Auto-secure initiated',
      transactionHash: txHash,
      walletAddress,
      solAmount,
      usdcAmount: solAmount * 141.25, // Mock conversion rate
      secureReason,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auto-secure error:', error);
    res.status(500).json({
      error: 'Failed to execute auto-secure swap',
      message: 'Please try again or swap manually.',
    });
  }
}

// Voice synthesis endpoint
// POST /api/finance-agent/voice
// Body: { text, voiceId? }
export async function synthesizeFinanceVoice(req, res) {
  try {
    const { text, voiceId } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }

    if (!hasElevenLabsKey) {
      return res.status(503).json({
        error: 'Voice service unavailable',
        message: 'ELEVENLABS_API_KEY is not configured on this environment.',
      });
    }

    const selectedVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || 'VMTRU6n4ozl5SzXToh9l';
    const trimmedText = text.slice(0, 1400);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: trimmedText,
          model_id: 'eleven_multilingual_v2',
        }),
      },
    );

    if (!response.ok) {
      const failure = await response.text();
      console.error('ElevenLabs error:', failure);
      return res.status(502).json({
        error: 'Voice generation failed',
        message: 'Failed to synthesize audio from ElevenLabs.',
      });
    }

    const audioArrayBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');

    return res.json({
      mimeType: 'audio/mpeg',
      audioBase64,
      voiceId: selectedVoiceId,
    });
  } catch (error) {
    console.error('Voice synthesis error:', error);
    return res.status(500).json({
      error: 'Voice generation failed',
      message: 'An unexpected error occurred while generating voice output.',
    });
  }
}
