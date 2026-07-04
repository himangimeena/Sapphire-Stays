const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const { authenticate, requireRoles } = require('../middleware/auth');

// GET /api/branches - Public list of luxury Indian branches
router.get('/', async (req, res) => {
  try {
    const { city, minPrice, maxPrice } = req.query;
    let sqlText = 'SELECT * FROM Branches WHERE is_active = 1';
    const params = [];

    if (city) {
      sqlText += ' AND (LOWER(city) LIKE ? OR LOWER(name) LIKE ? OR LOWER(state) LIKE ? OR LOWER(address) LIKE ? OR LOWER(description) LIKE ?)';
      params.push(`%${city.toLowerCase()}%`, `%${city.toLowerCase()}%`, `%${city.toLowerCase()}%`, `%${city.toLowerCase()}%`, `%${city.toLowerCase()}%`);
    }
    if (minPrice) {
      sqlText += ' AND starting_price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sqlText += ' AND starting_price <= ?';
      params.push(Number(maxPrice));
    }

    const branches = await query(sqlText, params);

    // Attach amenities for each branch
    for (const b of branches) {
      const amenities = await query(
        `SELECT a.id, a.name, a.icon, a.category 
         FROM Amenities a 
         JOIN BranchAmenities ba ON a.id = ba.amenity_id 
         WHERE ba.branch_id = ?`,
        [b.id]
      );
      b.amenities = amenities;
    }

    res.json({ branches });
  } catch (err) {
    console.error('Fetch branches error:', err);
    res.status(500).json({ error: 'Failed to fetch branches.' });
  }
});

// GET /api/branches/:id - Detailed branch view
router.get('/:id', async (req, res) => {
  try {
    const branches = await query('SELECT * FROM Branches WHERE id = ?', [req.params.id]);
    if (branches.length === 0) {
      return res.status(404).json({ error: 'Branch not found.' });
    }
    const branch = branches[0];

    // Amenities
    branch.amenities = await query(
      `SELECT a.id, a.name, a.icon, a.category 
       FROM Amenities a 
       JOIN BranchAmenities ba ON a.id = ba.amenity_id 
       WHERE ba.branch_id = ?`,
      [branch.id]
    );

    // Room Types in this branch
    branch.roomTypes = await query('SELECT * FROM RoomTypes WHERE branch_id = ?', [branch.id]);

    // Reviews for this branch
    branch.reviews = await query(
      `SELECT r.*, u.name as guest_name, u.avatar_url 
       FROM Reviews r 
       JOIN Users u ON r.user_id = u.id 
       WHERE r.branch_id = ? AND r.is_hidden = 0 
       ORDER BY r.created_at DESC`,
      [branch.id]
    );

    res.json({ branch });
  } catch (err) {
    console.error('Fetch branch detail error:', err);
    res.status(500).json({ error: 'Failed to fetch branch details.' });
  }
});

// POST /api/branches - Super Admin create branch
router.post('/', authenticate, requireRoles(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { name, city, state, address, description, hero_image, starting_price, contact_email, contact_phone } = req.body;
    const resInsert = await query(
      'INSERT INTO Branches (name, city, state, address, description, hero_image, starting_price, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, city, state, address, description, hero_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945', starting_price || 25000.00, contact_email, contact_phone]
    );
    res.status(201).json({ message: 'Branch created successfully', id: resInsert.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create branch.' });
  }
});

module.exports = router;
