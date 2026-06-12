/**
 * Stockage des tokens de réinitialisation de mot de passe.
 * Persisté dans agent/data/reset-tokens.json
 * Chaque token expire après 1 heure.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'node:crypto';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = process.env['DATA_DIR'] ?? path.join(__dirname, '../../data');
const TOKEN_FILE = path.join(DATA_DIR, 'reset-tokens.json');
const TTL_MS     = 60 * 60 * 1000; // 1 heure

interface ResetToken {
  token:     string;
  userId:    string;
  expiresAt: string; // ISO
}

function load(): ResetToken[] {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return [];
    return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8')) as ResetToken[];
  } catch { return []; }
}

function save(tokens: ResetToken[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
}

/** Génère un token pour userId, supprime les anciens tokens du même user. */
export function createResetToken(userId: string): string {
  const token     = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString();

  const tokens = load().filter(t => t.userId !== userId); // un seul token actif par user
  tokens.push({ token, userId, expiresAt });
  save(tokens);
  return token;
}

/** Vérifie le token et retourne l'userId si valide, sinon null. */
export function verifyResetToken(token: string): string | null {
  const tokens = load();
  const entry  = tokens.find(t => t.token === token);
  if (!entry) return null;
  if (new Date(entry.expiresAt) < new Date()) {
    // expiré — on le supprime
    save(tokens.filter(t => t.token !== token));
    return null;
  }
  return entry.userId;
}

/** Consomme le token (le supprime après usage). */
export function consumeResetToken(token: string): void {
  save(load().filter(t => t.token !== token));
}
