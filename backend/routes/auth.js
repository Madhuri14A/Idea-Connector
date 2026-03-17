const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const driver = require('../config/neo4j');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    const session = driver.session();

    try {
      const result = await session.run(
        `MATCH (u:User {email: $email}) RETURN u`,
        { email }
      );

      let user;
      if (result.records.length === 0) {
        const createResult = await session.run(
          `CREATE (u:User {email: $email, name: $name, createdAt: datetime()}) RETURN u`,
          { email, name }
        );
        user = createResult.records[0].get('u').properties;
      } else {
        user = result.records[0].get('u').properties;
      }

      const jwtToken = jwt.sign(
        { userId: email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token: jwtToken,
        user: {
          email: user.email,
          name: user.name
        }
      });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
