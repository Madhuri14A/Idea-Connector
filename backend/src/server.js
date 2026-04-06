require('dotenv').config();
const express = require('express');
const driver = require('../config/neo4j');
const authMiddleware = require('../middleware/auth');

const app = express();

const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isVercelDomain = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  ...envOrigins
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin) || isVercelDomain(origin);
};

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  } else if (origin) {
    console.warn(`Blocked by CORS: ${origin}`);
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json({ limit: '150kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.use('/api/auth', require('../routes/auth'));
app.use('/api/notes', authMiddleware, require('../routes/notes'));
app.use('/api/ideas', authMiddleware, require('../routes/ideas'));
app.use('/api/weaver', authMiddleware, require('../routes/weaver'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await driver.close();
  process.exit(0);
});
