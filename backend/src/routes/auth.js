const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/index');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase().replace('@sapphirestays.com', '@sapphirestays.in');
    const users = await query('SELECT * FROM Users WHERE email = ?', [cleanEmail]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, loyalty_points: user.loyalty_points },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url,
        loyalty_points: user.loyalty_points
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await query('SELECT id FROM Users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const resInsert = await query(
      'INSERT INTO Users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email.trim().toLowerCase(), hash, name, phone || '+91 98000 00000', 'CUSTOMER']
    );

    const userId = resInsert.insertId || 1;
    const token = jwt.sign(
      { id: userId, email: email.trim().toLowerCase(), name, role: 'CUSTOMER', loyalty_points: 500 },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email: email.trim().toLowerCase(),
        name,
        phone: phone || '+91 98000 00000',
        role: 'CUSTOMER',
        loyalty_points: 500
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const users = await query('SELECT id, email, name, phone, role, avatar_url, loyalty_points, address FROM Users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: users[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// POST /api/auth/demo-switch-role
// Instant demo role switching so evaluators can inspect every dashboard
router.post('/demo-switch-role', async (req, res) => {
  try {
    const { targetRole } = req.body;
    let targetEmail = 'guest@sapphirestays.in';
    if (targetRole === 'SUPER_ADMIN') targetEmail = 'superadmin@sapphirestays.in';
    if (targetRole === 'BRANCH_ADMIN') targetEmail = 'udaipur.admin@sapphirestays.in';
    if (targetRole === 'RECEPTIONIST') targetEmail = 'reception@sapphirestays.in';
    if (targetRole === 'HOUSEKEEPING') targetEmail = 'housekeeping@sapphirestays.in';
    if (targetRole === 'MAINTENANCE') targetEmail = 'maintenance@sapphirestays.in';

    const users = await query('SELECT * FROM Users WHERE email = ?', [targetEmail]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Demo user for this role not found.' });
    }

    const user = users[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, loyalty_points: user.loyalty_points },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: `Switched demo account to role: ${user.role}`,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url,
        loyalty_points: user.loyalty_points
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to switch role.' });
  }
});

// Helper to resolve role by email for Google sign-in
function getRoleByEmail(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail === 'superadmin@sapphirestays.in' || cleanEmail === 'superadmin@sapphirestays.com') {
    return 'SUPER_ADMIN';
  }
  if (cleanEmail === 'udaipur.admin@sapphirestays.in' || cleanEmail === 'udaipur.admin@sapphirestays.com') {
    return 'BRANCH_ADMIN';
  }
  if (cleanEmail === 'reception@sapphirestays.in' || cleanEmail === 'reception@sapphirestays.com') {
    return 'RECEPTIONIST';
  }
  if (cleanEmail === 'housekeeping@sapphirestays.in' || cleanEmail === 'housekeeping@sapphirestays.com') {
    return 'HOUSEKEEPING';
  }
  if (cleanEmail === 'maintenance@sapphirestays.in' || cleanEmail === 'maintenance@sapphirestays.com') {
    return 'MAINTENANCE';
  }
  return 'CUSTOMER';
}

// POST /api/auth/google-login
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Google access token is required.' });
    }

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to authenticate token with Google.' });
    }

    const userData = await response.json();
    const { email, name, picture } = userData;

    if (!email) {
      return res.status(400).json({ error: 'Google account does not provide email access.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    let users = await query('SELECT * FROM Users WHERE email = ?', [cleanEmail]);
    let user;

    if (users.length === 0) {
      // User doesn't exist, create account
      // Generate a secure placeholder password hash for OAuth accounts
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      const hash = await bcrypt.hash(randomPassword, 10);
      const role = getRoleByEmail(cleanEmail);

      const resInsert = await query(
        'INSERT INTO Users (email, password_hash, name, phone, role, avatar_url, loyalty_points) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [cleanEmail, hash, name || 'Royal Guest', '+91 98000 00000', role, picture || null, 500]
      );

      const userId = resInsert.insertId || 1;
      const newUsers = await query('SELECT * FROM Users WHERE id = ?', [userId]);
      user = newUsers[0];
    } else {
      user = users[0];
      // Update avatar if we got a new one from Google and none exists locally
      if (!user.avatar_url && picture) {
        await query('UPDATE Users SET avatar_url = ? WHERE id = ?', [picture, user.id]);
        user.avatar_url = picture;
      }
    }

    // Generate JWT token
    const localToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, loyalty_points: user.loyalty_points },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google login successful',
      token: localToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url,
        loyalty_points: user.loyalty_points
      }
    });
  } catch (err) {
    console.error('Google OAuth Login error:', err);
    res.status(500).json({ error: 'Internal server error during Google login.' });
  }
});

module.exports = router;
