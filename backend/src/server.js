require('dotenv').config();
const express = require('express');
const cors = require('cors');
const driver = require('../config/neo4j');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Routes
app.use('/api/notes', require('../routes/notes'));
// app.use('/api/connections', require('../routes/connections'));
// app.use('/api/search', require('../routes/search'));
// app.use('/api/suggestions', require('../routes/suggestions'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await driver.close();
  process.exit(0);
});
