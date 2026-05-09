/**
 * SafeHaven — Agent Safety Guardrails
 *
 * Two-stage safety system:
 *   1. PRE-LLM: Filter incoming user messages before they reach Claude
 *   2. POST-LLM: Validate and sanitize Claude's responses before sending to app
 *
 * The safety layer CANNOT be bypassed by user input or Claude's output.
 * It runs as middleware on every /api/chat request.
 */
export interface InputFilterResult {
    blocked: boolean;
    blockedReason?: string;
    safeResponse?: string;
    sanitizedMessage?: string;
}
/**
 * Filter and sanitize incoming user messages.
 * Returns either a block reason + canned response, or the sanitized message.
 */
export declare function filterInput(message: string): InputFilterResult;
export interface OutputFilterResult {
    clean: string;
    wasModified: boolean;
    modifications: string[];
}
/**
 * Sanitize Claude's response before sending to the mobile app.
 * Removes any accidentally included sensitive data.
 */
export declare function filterOutput(response: string): OutputFilterResult;
/**
 * Check if a response that contains financial advice also contains a disclaimer.
 * If not, append a standard disclaimer.
 */
export declare function ensureDisclaimer(response: string, locale?: string): string;
export interface ScamCheckResult {
    isSuspicious: boolean;
    warningMessage?: string;
}
/**
 * Check if a message the user received (e.g., from another source)
 * shows signs of being a scam. Used when user asks "is this legitimate?"
 */
export declare function checkForScam(text: string): ScamCheckResult;
//# sourceMappingURL=guardrails.d.ts.map