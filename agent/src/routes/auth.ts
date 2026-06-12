/**
 * Auth routes
 * POST /api/auth/register         → Créer un compte
 * POST /api/auth/login            → Connexion
 * GET  /api/auth/me               → Profil (JWT requis)
 * POST /api/auth/forgot-password  → Demande de réinit. mot de passe
 * POST /api/auth/reset-password   → Nouveau mot de passe avec token
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { findByEmail, createUser, findById, updatePassword } from '../auth/users.js';
import { signToken, requireAuth, type AuthRequest } from '../auth/middleware.js';
import { sendWelcomeEmail, sendResetEmail } from '../auth/mailer.js';
import { createResetToken, verifyResetToken, consumeResetToken } from '../auth/resetTokens.js';

export const authRouter = Router();

// ── Schémas ───────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  email:    z.string().email().max(255),
  password: z.string().min(8).max(128),
  name:     z.string().min(1).max(100).optional(),
});

const LoginSchema = z.object({
  email:    z.string().email().max(255),
  password: z.string().min(1).max(128),
});

const ForgotSchema = z.object({
  email: z.string().email().max(255),
});

const ResetSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8).max(128),
});

// ── POST /api/auth/register ───────────────────────────────────────────────────

authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Données invalides', details: parsed.error.flatten() });
    return;
  }

  const { email, password, name } = parsed.data;

  if (findByEmail(email)) {
    res.status(409).json({ error: 'Cet email est déjà utilisé' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = createUser({
    email,
    passwordHash,
    name: name?.trim() || email.split('@')[0] || 'Utilisateur',
  });

  const token = signToken(user.id, user.email);

  // Email de bienvenue (non bloquant)
  sendWelcomeEmail(user.email, user.name).catch((err) =>
    console.error('[Mailer] Welcome email failed:', err.message)
  );

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Email ou mot de passe invalide' });
    return;
  }

  const { email, password } = parsed.data;
  const user = findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    return;
  }

  const token = signToken(user.id, user.email);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

authRouter.get('/me', requireAuth, (req: AuthRequest, res: Response): void => {
  const user = findById(req.userId!);
  if (!user) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }
  res.json({ id: user.id, email: user.email, name: user.name, isActive: user.isActive, createdAt: user.createdAt });
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────

authRouter.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const parsed = ForgotSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Email invalide' });
    return;
  }

  const user = findByEmail(parsed.data.email);

  // Réponse identique qu'il existe ou non (sécurité : pas d'énumération d'emails)
  res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });

  if (!user) return;

  const resetToken = createResetToken(user.id);
  sendResetEmail(user.email, user.name, resetToken).catch((err) =>
    console.error('[Mailer] Reset email failed:', err.message)
  );
});

// ── POST /api/auth/reset-password ─────────────────────────────────────────────

authRouter.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const parsed = ResetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Données invalides' });
    return;
  }

  const { token, password } = parsed.data;
  const userId = verifyResetToken(token);

  if (!userId) {
    res.status(400).json({ error: 'Lien invalide ou expiré. Faites une nouvelle demande.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const updated = updatePassword(userId, passwordHash);

  if (!updated) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
    return;
  }

  consumeResetToken(token);
  res.json({ message: 'Mot de passe mis à jour avec succès.' });
});
