/**
 * SafeHaven — Solana Program (Anchor)
 *
 * NOTE: SafeHaven v1 delegates DeFi operations entirely to existing
 * audited protocols (Kamino, MarginFi) via CPI (Cross-Program Invocation).
 * This program currently serves as a thin coordination layer and
 * may expand in future versions.
 *
 * Current responsibilities:
 *   - None yet (v1 interacts with Kamino/MarginFi directly from the app)
 *
 * Planned v2 responsibilities:
 *   - User position registry (off-chain mirror with on-chain verification)
 *   - Emergency withdrawal failsafe
 *   - Yield claim aggregation across protocols
 *
 * Build: anchor build
 * Test:  anchor test
 * Deploy: anchor deploy --provider.cluster devnet
 */

use anchor_lang::prelude::*;

declare_id!("SafeHvN1111111111111111111111111111111111111");

#[program]
pub mod safehaven {
    use super::*;

    /// Placeholder instruction — will be replaced in v2.
    /// Emits an event confirming the program is deployed and functional.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.version = 1;
        state.authority = ctx.accounts.authority.key();
        state.initialized_at = Clock::get()?.unix_timestamp;

        emit!(SafeHavenInitialized {
            authority: state.authority,
            version: state.version,
        });

        msg!("SafeHaven program initialized. Version: {}", state.version);
        Ok(())
    }
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + SafeHavenState::INIT_SPACE,
        seeds = [b"safehaven-state"],
        bump
    )]
    pub state: Account<'info, SafeHavenState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ─── State ────────────────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct SafeHavenState {
    pub version: u8,
    pub authority: Pubkey,
    pub initialized_at: i64,
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct SafeHavenInitialized {
    pub authority: Pubkey,
    pub version: u8,
}

// ─── Errors ───────────────────────────────────────────────────────────────────

#[error_code]
pub enum SafeHavenError {
    #[msg("Unauthorized: only the program authority can perform this action")]
    Unauthorized,

    #[msg("Invalid amount: deposit must be greater than zero")]
    InvalidAmount,

    #[msg("Amount exceeds maximum allowed per transaction")]
    AmountTooLarge,
}
