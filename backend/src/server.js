require('dotenv').config();
const express = require('express');
const cors = require('cors');
const driver = require('../config/neo4j');
const authMiddleware = require('../middleware/auth');

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      process.env.CORS_ORIGIN
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
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
