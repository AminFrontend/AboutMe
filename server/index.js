import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleAiSummary } from './ai-service.js';
import { handleContact } from './contact-service.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

app.use(express.json({ limit: '32kb' }));
app.use(corsForLocalDev);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'about-me-api' });
});

app.post('/api/contact', async (req, res) => {
  const result = await handleContact(req.body);
  res.status(result.status).json(result.body);
});

app.post('/api/ai-summary', async (req, res) => {
  const result = await handleAiSummary(req.body);
  res.status(result.status).json(result.body);
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(rootDir, 'dist')));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(rootDir, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});

function corsForLocalDev(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((item) => item.trim());

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}
