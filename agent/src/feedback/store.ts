import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FEEDBACK_FILE = join(__dirname, '../../../data/feedback.json');

export interface FeedbackEntry {
  id: string;
  ratings: {
    ease:    number;
    content: number;
    ai:      number;
    overall: number;
  };
  comment?:     string;
  lang?:        string;
  page?:        string;
  submittedAt:  string;
}

export function readFeedback(): FeedbackEntry[] {
  try {
    if (!existsSync(FEEDBACK_FILE)) return [];
    return JSON.parse(readFileSync(FEEDBACK_FILE, 'utf-8')) as FeedbackEntry[];
  } catch {
    return [];
  }
}

export function addFeedback(entry: FeedbackEntry): void {
  const dir = dirname(FEEDBACK_FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const entries = readFeedback();
  entries.push(entry);
  writeFileSync(FEEDBACK_FILE, JSON.stringify(entries, null, 2));
}
