import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  handleFinanceAgentChat,
  triggerAutoSecureUSdC,
  synthesizeFinanceVoice,
} from './handlers/financeAgent.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the parent directory (project root)
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SafeHaven API' });
});

// SafeHaven Routes
app.post('/api/finance-agent', handleFinanceAgentChat);
app.post('/api/finance-agent/voice', synthesizeFinanceVoice);
app.post('/api/crypto/auto-secure-usdc', triggerAutoSecureUSdC);

// Load routes dynamically after env is set
async function startServer() {
  console.log('Loading .env from:', envPath);
  console.log('SafeHaven Backend Starting...');
  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 SafeHaven API running on http://localhost:${PORT}`);
    console.log(`📚 Finance Agent: POST /api/finance-agent`);
    console.log(`🔊 Finance Voice: POST /api/finance-agent/voice`);
    console.log(`🛡️  Auto-Secure: POST /api/crypto/auto-secure-usdc`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
