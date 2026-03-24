const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const driver = require('../config/neo4j');
const { sendResetEmail } = require('../utils/emailService');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many accounts created from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

router.post('/google', authLimiter, async (req, res) => {
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

router.post('/register', registerLimiter, async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Email, name, and password are required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (name.trim().length < 2 || name.trim().length > 50) {
    return res.status(400).json({ error: 'Name must be between 2 and 50 characters' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters, contain an uppercase letter and a number' 
    });
  }

  const session = driver.session();

  try {
    const existingUser = await session.run(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );

    if (existingUser.records.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createResult = await session.run(
      `CREATE (u:User {email: $email, name: $name, password: $password, authType: 'local', createdAt: datetime()}) RETURN u`,
      { email, name, password: hashedPassword }
    );

    const user = createResult.records[0].get('u').properties;

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
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    await session.close();
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );

    if (result.records.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.records[0].get('u').properties;

    if (!user.password) {
      return res.status(401).json({ error: 'This account was registered with Google. Please use Google Sign-In.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  } finally {
    await session.close();
  }
});

router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your_gmail')) {
    return res.status(503).json({ error: 'Email service is not configured on this server. Contact the administrator.' });
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const user = result.records[0].get('u').properties;
    if (!user.password) {
      return res.status(400).json({ error: 'This account uses Google Sign-In. No password to reset.' });
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 1800000).toISOString();

    await session.run(
      `MATCH (u:User {email: $email}) SET u.resetToken = $token, u.resetTokenExpiry = $expiry`,
      { email, token: resetToken, expiry: resetTokenExpiry }
    );

    const emailSent = await sendResetEmail(email, resetToken);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send reset email. Please try again later.' });
    }

    res.json({ message: 'Password reset link sent! Check your inbox (and spam folder).' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  } finally {
    await session.close();
  }
});

router.post('/reset-password', authLimiter, async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters, contain an uppercase letter and a number' 
    });
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.records[0].get('u').properties;

    if (user.resetToken !== resetToken) {
      return res.status(401).json({ error: 'Invalid reset token' });
    }

    if (new Date() > new Date(user.resetTokenExpiry)) {
      return res.status(401).json({ error: 'Reset token has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await session.run(
      `MATCH (u:User {email: $email}) SET u.password = $password, u.resetToken = null, u.resetTokenExpiry = null`,
      { email, password: hashedPassword }
    );

    res.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  } finally {
    await session.close();
  }
});

module.exports = router;
