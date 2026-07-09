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

module.exports = router;
