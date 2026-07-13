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

// PUT /api/auth/profile - Update user profile contact details
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email is already taken by another user
    const existing = await query('SELECT id FROM Users WHERE email = ? AND id != ?', [cleanEmail, req.user.id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    await query(
      'UPDATE Users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, cleanEmail, phone || '', req.user.id]
    );

    // Fetch updated details
    const updatedUsers = await query('SELECT id, email, name, phone, role, avatar_url, loyalty_points FROM Users WHERE id = ?', [req.user.id]);
    const user = updatedUsers[0];

    // Generate new token with updated information
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, loyalty_points: user.loyalty_points },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Profile updated successfully',
      token,
      user
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
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
    return 'CUSTOMER';
}

router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Google access token is required.' });
    }

    if (token === 'MOCK_GOOGLE_OAUTH_TOKEN') {
      const mockUserData = {
        email: 'guest.google@sapphirestays.in',
        name: 'Google Guest Member',
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
      };
      
      const cleanEmail = mockUserData.email;
      let users = await query('SELECT * FROM Users WHERE email = ?', [cleanEmail]);
      let user;

      if (users.length === 0) {
        const randomPassword = require('crypto').randomBytes(32).toString('hex');
        const hash = await bcrypt.hash(randomPassword, 10);
        const role = getRoleByEmail(cleanEmail);

        const resInsert = await query(
          'INSERT INTO Users (email, password_hash, name, phone, role, avatar_url, loyalty_points) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [cleanEmail, hash, mockUserData.name, '+91 98000 70707', role, mockUserData.picture, 8500]
        );

        const userId = resInsert.insertId || 707;
        const newUsers = await query('SELECT * FROM Users WHERE id = ?', [userId]);
        user = newUsers[0];
      } else {
        user = users[0];
      }

      const localToken = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role, loyalty_points: user.loyalty_points },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Google login successful (Simulated)',
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
    }

    const googleUrl = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`;
    const response = await fetch(googleUrl);

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
