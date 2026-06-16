/**
 * Tokens de vérification d'email.
 * Persisté dans agent/data/email-verif-tokens.json
 * Chaque token expire après 24 heures.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'node:crypto';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = process.env['DATA_DIR'] ?? path.join(__dirname, '../../data');
const TOKEN_FILE = path.join(DATA_DIR, 'email-verif-tokens.json');
const TTL_MS     = 24 * 60 * 60 * 1000; // 24 heures

interface EmailVerifToken {
  token:     string;
  userId:    string;
  expiresAt: string;
}

function load(): EmailVerifToken[] {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return [];
    return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8')) as EmailVerifToken[];
  } catch { return []; }
}

function save(tokens: EmailVerifToken[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
}

export function createEmailVerifToken(userId: string): string {
  const token     = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString();
  const tokens    = load().filter(t => t.userId !== userId); // un seul token actif par user
  tokens.push({ token, userId, expiresAt });
  save(tokens);
  return token;
}

export function verifyEmailVerifToken(token: string): string | null {
  const tokens = load();
  const entry  = tokens.find(t => t.token === token);
  if (!entry) return null;
  if (new Date(entry.expiresAt) < new Date()) {
    save(tokens.filter(t => t.token !== token));
    return null;
  }
  return entry.userId;
}

export function consumeEmailVerifToken(token: string): void {
  save(load().filter(t => t.token !== token));
}
