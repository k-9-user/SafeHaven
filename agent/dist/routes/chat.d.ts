/**
 * POST /api/chat
 *
 * Main conversational endpoint — streams Claude responses to the app.
 *
 * SSE event format:
 *   data: {"chunk": "..."}                        — streaming text delta
 *   data: {"done": true, "finalResponse": "...",  — stream complete
 *           "distressLevel": "none|financial|emotional|crisis",
 *           "tokensUsed": 1234}
 *
 * Non-streaming (stream: false):
 *   {"response": "...", "toolUse": null|{...}, "distressLevel": "none|..."}
 *
 * v2 additions:
 *   conversationSummary — compressed context injected into system prompt
 *   voiceMode           — strip markdown for TTS responses
 *   distressLevel       — propagated in SSE done event for UI awareness
 */
export declare const chatRouter: import("express-serve-static-core").Router;
//# sourceMappingURL=chat.d.ts.map