import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'node:crypto';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = process.env['DATA_DIR'] ?? path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  isActive: boolean;
}

function loadUsers(): User[] {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, '[]', 'utf-8');
      return [];
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')) as User[];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export function findByEmail(email: string): User | undefined {
  return loadUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findById(id: string): User | undefined {
  return loadUsers().find(u => u.id === id);
}

export function createUser(data: Omit<User, 'id' | 'createdAt' | 'isActive'> & Partial<Pick<User, 'isActive'>>): User {
  const users = loadUsers();
  const user: User = {
    id: randomUUID(),
    isActive: data.isActive ?? true,
    ...data,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function updatePassword(id: string, passwordHash: string): boolean {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  users[idx]!.passwordHash = passwordHash;
  saveUsers(users);
  return true;
}

export function updateUser(id: string, updates: Partial<Pick<User, 'isActive' | 'name'>>): User | null {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx]!, ...updates };
  saveUsers(users);
  return users[idx]!;
}

export function deleteUser(id: string): boolean {
  const users = loadUsers();
  const next = users.filter(u => u.id !== id);
  if (next.length === users.length) return false;
  saveUsers(next);
  return true;
}

export function listUsers(): User[] {
  return loadUsers();
}
