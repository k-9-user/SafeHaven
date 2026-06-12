/**
 * Routes admin — identifiant unique Kheira_Mialy (défini dans .env)
 * POST   /api/admin/login          → connexion admin (pas de création possible)
 * GET    /api/admin/users          → liste de tous les comptes
 * PATCH  /api/admin/users/:id      → modifier isActive
 * DELETE /api/admin/users/:id      → supprimer un compte
 * GET    /api/admin/stats          → statistiques globales
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { listUsers, updateUser, deleteUser } from '../auth/users.js';
import { requireAdmin, signAdminToken, type AdminAuthRequest } from '../auth/middleware.js';

export const adminRouter = Router();

// Hash du mot de passe admin calculé une fois au démarrage du serveur
const ADMIN_USERNAME = process.env['ADMIN_USERNAME'] ?? 'Kheira_Mialy';
const ADMIN_PASSWORD = process.env['ADMIN_PASSWORD'] ?? '';
const adminPassHash  = bcrypt.hashSync(ADMIN_PASSWORD, 10);

// ── Sanitize : ne jamais exposer le passwordHash ───────────────────────────

function sanitize(user: ReturnType<typeof listUsers>[number]) {
  const { passwordHash: _ph, ...safe } = user;
  return safe;
}

// ── POST /api/admin/login ─────────────────────────────────────────────────────

const LoginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

adminRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Identifiant ou mot de passe invalide.' });
    return;
  }

  const { username, password } = parsed.data;

  const usernameMatch = username === ADMIN_USERNAME;
  const passwordMatch = await bcrypt.compare(password, adminPassHash);

  if (!usernameMatch || !passwordMatch) {
    res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
    return;
  }

  const adminToken = signAdminToken(username);
  res.json({ adminToken });
});

// ── Routes protégées (token admin requis) ─────────────────────────────────────

adminRouter.use(requireAdmin);

// ── GET /api/admin/users ─────────────────────────────────────────────────────

adminRouter.get('/users', (_req: AdminAuthRequest, res: Response): void => {
  const users = listUsers().map(sanitize);
  res.json({ users, total: users.length });
});

// ── PATCH /api/admin/users/:id — modifier isActive uniquement ─────────────────

const PatchSchema = z.object({
  isActive: z.boolean(),
});

adminRouter.patch('/users/:id', (req: AdminAuthRequest, res: Response): void => {
  const parsed = PatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Données invalides. Envoyez { isActive: true|false }.' });
    return;
  }

  const updated = updateUser(req.params['id']!, { isActive: parsed.data.isActive });
  if (!updated) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }

  res.json({ user: sanitize(updated) });
});

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────

adminRouter.delete('/users/:id', (req: AdminAuthRequest, res: Response): void => {
  const ok = deleteUser(req.params['id']!);
  if (!ok) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }
  res.json({ message: 'Compte supprimé.' });
});

// ── GET /api/admin/stats ──────────────────────────────────────────────────────

adminRouter.get('/stats', (_req: AdminAuthRequest, res: Response): void => {
  const users = listUsers();
  const now   = Date.now();
  const day7  = now - 7  * 24 * 60 * 60 * 1000;
  const day30 = now - 30 * 24 * 60 * 60 * 1000;

  res.json({
    total:       users.length,
    active:      users.filter(u => u.isActive).length,
    inactive:    users.filter(u => !u.isActive).length,
    last7days:   users.filter(u => new Date(u.createdAt).getTime() > day7).length,
    last30days:  users.filter(u => new Date(u.createdAt).getTime() > day30).length,
    newestUsers: users
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(sanitize),
  });
});
