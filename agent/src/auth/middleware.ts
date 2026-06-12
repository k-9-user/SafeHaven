import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findById } from './users.js';

const getSecret = () => process.env['JWT_SECRET'] ?? 'safehaven-dev-secret-change-in-production';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export interface AdminAuthRequest extends Request {
  adminUsername?: string;
}

// ── Middleware utilisateur normal ─────────────────────────────────────────────

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, getSecret()) as { userId: string; email: string; isAdmin?: boolean };
    if (payload.isAdmin) {
      res.status(403).json({ error: 'Token invalide pour cet endpoint.' });
      return;
    }
    const user = findById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ error: 'Compte désactivé. Contactez l\'administrateur.' });
      return;
    }
    req.userId    = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Middleware admin (token séparé avec isAdmin: true) ────────────────────────

export function requireAdmin(req: AdminAuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Accès non autorisé.' });
    return;
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, getSecret()) as { isAdmin?: boolean; username?: string };
    if (!payload.isAdmin) {
      res.status(403).json({ error: 'Accès réservé à l\'administrateur.' });
      return;
    }
    req.adminUsername = payload.username;
    next();
  } catch {
    res.status(401).json({ error: 'Session admin expirée. Reconnectez-vous.' });
  }
}

// ── Génération de tokens ──────────────────────────────────────────────────────

export function signToken(userId: string, email: string): string {
  return jwt.sign({ userId, email, isAdmin: false }, getSecret(), { expiresIn: '7d' });
}

export function signAdminToken(username: string): string {
  return jwt.sign({ isAdmin: true, username }, getSecret(), { expiresIn: '12h' });
}
