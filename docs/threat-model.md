# SafeHaven — Threat Model

**Version:** 1.0  
**Date:** 2026-05-09  
**Framework:** STRIDE  
**Scope:** Mobile app, agent backend, DeFi execution layer

---

## System Overview

```
[User] ←→ [Mobile App] ←→ [Agent Backend] ←→ [Claude API]
                                          ←→ [ElevenLabs API]
              ↓
        [Solana MWA] → [User Wallet App] → [Solana RPC]
                                          → [Kamino / MarginFi]
              ↓
           [Li.Fi SDK] → [Li.Fi API] → [Bridge Protocols]
```

**Trust boundary:** The mobile app is untrusted (user device). The agent backend is trusted. External APIs (Anthropic, ElevenLabs, Li.Fi, Solana RPC) are conditionally trusted.

---

## Assets to Protect

| Asset | Sensitivity | Owner |
|---|---|---|
| User's private keys / seed phrase | Critical | User's wallet app (NEVER SafeHaven) |
| User's wallet funds | Critical | User |
| User's risk profile (goals, capital range) | High | Agent DB |
| ElevenLabs API key | High | SafeHaven backend |
| Anthropic API key | High | SafeHaven backend |
| Li.Fi API key | Medium | SafeHaven backend |
| Agent LLM conversation history | Medium | Agent backend (ephemeral) |

---

## STRIDE Analysis

### S — Spoofing

| Threat | Vector | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Attacker impersonates SafeHaven to steal private keys | Fake app in app store, phishing website | Medium | Critical | Never ask for private keys (by design). Publish app only on official stores. Deep link scheme `safehaven://` registered. |
| Prompt injection: user crafts message to make Claude impersonate a different service | Chat input | Low | Medium | System prompt immutability; safety guardrails in `filterInput()`; Claude trained against impersonation. |
| Man-in-the-middle on agent API calls | Compromised Wi-Fi | Low | High | TLS 1.3 enforced for all API calls; certificate pinning on mobile recommended for v2. |

### T — Tampering

| Threat | Vector | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Attacker modifies strategy recommendation in transit | MITM on HTTP | Low | High | TLS 1.3; `validateStrategyResponse()` schema validation in app before display. |
| Attacker modifies unsigned transaction before it reaches user wallet | Compromised RPC node | Low | High | Transactions built from validated strategy params; user reviews in their own wallet app before signing. |
| Malicious app update tampers with wallet integration | Supply chain attack | Very Low | Critical | Pin Expo SDK version; lock npm dependencies; audit PRs before merge. |

### R — Repudiation

| Threat | Vector | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| User claims they did not consent to DeFi transaction | Memory / confusion | Medium | Medium | Risk disclosure modal with explicit "I understand" checkbox required before every deposit. Timestamp logged. |
| Agent denies recommending a high-risk strategy | Log deletion | Very Low | Low | Agent logs all tool calls with strategy ID and risk score. |

### I — Information Disclosure

| Threat | Vector | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| API keys leaked in mobile bundle | Reverse engineering the APK | High risk if not addressed | Critical | All API keys are server-side only; `EXPO_PUBLIC_` variables contain only public endpoints. |
| User PII leaked to Claude | Message containing phone/email | Medium | Medium | `filterInput()` strips PII with regex before every Claude call. |
| User's capital/goal data leaked from agent DB | DB breach | Low | High | Store only ranges (not exact amounts); no names or IDs; encrypt at rest. |
| ElevenLabs API key leaked in network traffic | MITM | Low | High | API call proxied through agent backend; key never in mobile bundle or response headers. |
| Conversation history accessed by third party | Agent log exposure | Low | Medium | Conversations are ephemeral in v1 (not persisted); logs auto-purge after 24 hours. |

### D — Denial of Service

| Threat | Vector | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Flooding the /api/chat endpoint | Automated bot | Medium | Medium | Rate limiting: 60 req/min global, 20 req/min per user. |
| Exhausting Anthropic API quota | Bot abuse | Medium | High | Per-user rate limiting; request budgeting; circuit breaker with offline fallback. |
| ElevenLabs TTS flooding | Bot abuse | Low | Medium | Text capped at 1400 chars; rate limiting on /api/voice/synthesize. |
| Solana RPC rate limiting | High app usage | Medium | Low | Use Helius dedicated RPC node (much higher rate limits than public). |

### E — Elevation of Privilege

| Threat | Vector | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Prompt injection elevates user to "expert" tier, unlocking high-risk strategies | Crafted user message | Low | Medium | Risk tier determined by risk profiler score, not by Claude's output; app enforces `riskScore <= 3` for novice users. |
| User bypasses risk disclosure to deposit | Client-side bypass | Medium | Medium | `guardDeposit()` checks `DisclosureToken` validity server-side; disclosure re-required every 30 min. |
| Attacker convinces Claude to output transaction data | Adversarial prompt | Low | High | `filterOutput()` removes base58 key patterns and large base64 blobs from all Claude responses. |

---

## DeFi-Specific Threats

| Threat | Description | Mitigation |
|---|---|---|
| Smart contract exploit (Kamino / MarginFi) | Protocol hack drains USDC from lending pool | User funds are in protocol (not SafeHaven). Show audit links. Warn in disclosure. |
| Liquidity crunch | Borrower demand exceeds supply; withdrawals delayed | Disclosed in risk disclosure modal. Never promise instant liquidity. |
| Oracle manipulation | Price oracle attack affects borrower liquidations | Only USDC positions — no volatile collateral exposure for SafeHaven users. |
| Bridge exploit (Li.Fi) | Vulnerability in bridge protocol loses bridged funds | Show Li.Fi's audit status. Require user confirmation. Display bridge risks explicitly. |
| MEV sandwich attack on bridge | Bot front-runs user's bridge transaction | Li.Fi `maxPriceImpact: 5%` filter blocks routes vulnerable to >5% slippage. |
| Fake Solana wallet app | User installs malicious wallet impersonating Phantom | Educate users to only install wallets from official stores. SafeHaven doesn't control wallet app. |

---

## AI-Specific Threats

| Threat | Description | Mitigation |
|---|---|---|
| Prompt injection via financial data | User pastes a malicious "prompt" in the chat | `filterInput()` pre-filters; Claude's system prompt instructs it to ignore instruction-like content from users. |
| Jailbreak to remove safety guidelines | User attempts to make Claude ignore financial safety rules | System prompt immutability; post-output `filterOutput()` and `ensureDisclaimer()` as belt-and-suspenders. |
| Hallucinated yield rates | Claude invents APY numbers that don't exist | APY data served from `/api/yields` (protocol APIs), not from Claude's knowledge. Claude instructed to use tool calls for yield data. |
| Language confusion attack | User writes in an unusual language to confuse safety filters | Safety filters are pattern-based (language-agnostic); Claude instructed to maintain safety in all languages. |
| Misinformation about scams | Claude accidentally validates a scam | `checkForScam()` runs on suspicious user-pasted text; Claude prompted to flag scam patterns. |

---

## Data Flow Security Summary

```
User message
    │
    ▼
[filterInput()]          ← strips PII, blocks STRIDE topics
    │
    ▼
[Claude API call]        ← system prompt enforced, tools restricted
    │
    ▼
[filterOutput()]         ← removes keys, base64 blobs
    │
    ▼
[ensureDisclaimer()]     ← adds disclaimer if financial advice detected
    │
    ▼
App display
    │
    ▼ (if DeFi action)
[validateStrategyResponse()]  ← Zod schema validation
    │
    ▼
[guardDeposit()]         ← checks disclosure, amounts, tier
    │
    ▼
[buildDepositTransaction()]   ← unsigned tx, no keys involved
    │
    ▼
[Solana Mobile Wallet Adapter] ← USER SIGNS IN THEIR OWN WALLET
    │
    ▼
Solana RPC → Protocol
```

---

## Residual Risks (Accepted)

| Risk | Reason Accepted |
|---|---|
| Smart contract exploit in Kamino/MarginFi | Risk disclosed to users; SafeHaven cannot prevent third-party protocol bugs |
| User loses phone with unlocked wallet app | Outside SafeHaven's control; recommend hardware wallet for large amounts |
| Local currency devaluation vs USDC | USDC itself can theoretically depeg; disclosed as a risk |
| Claude API outage | Graceful offline fallback with canned helpful responses |

---

## Recommended v2 Security Additions

1. Certificate pinning for agent backend API calls
2. Jailbreak/root detection on Android (prevents certain key-extraction attacks)
3. Biometric authentication before DeFi actions
4. Server-side conversation persistence (encrypted) for audit trail
5. Formal penetration test before public launch
