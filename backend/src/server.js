require('dotenv').config();
const express = require('express');
const cors = require('cors');
const driver = require('../config/neo4j');
const authMiddleware = require('../middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.use('/auth', require('../routes/auth'));
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
