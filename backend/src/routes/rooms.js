const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const { authenticate, requireRoles } = require('../middleware/auth');

// GET /api/rooms/types - Public room types catalog
router.get('/types', async (req, res) => {
  try {
    const { branchId, tier, minPrice, maxPrice } = req.query;
    let sqlText = 'SELECT rt.*, b.name as branch_name, b.city as branch_city, b.state as branch_state FROM RoomTypes rt JOIN Branches b ON rt.branch_id = b.id WHERE 1=1';
    const params = [];

    if (branchId) {
      sqlText += ' AND rt.branch_id = ?';
      params.push(Number(branchId));
    }
    if (tier) {
      sqlText += ' AND rt.tier = ?';
      params.push(tier);
    }
    if (minPrice) {
      sqlText += ' AND rt.base_price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sqlText += ' AND rt.base_price <= ?';
      params.push(Number(maxPrice));
    }

    const roomTypes = await query(sqlText, params);
    res.json({ roomTypes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room types.' });
  }
});

// GET /api/rooms - Admin inventory list of specific physical rooms
router.get('/', authenticate, requireRoles(['SUPER_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING', 'MAINTENANCE']), async (req, res) => {
  try {
    const { status, branchId, type } = req.query;
    let sqlText = `
      SELECT r.*, rt.name as type_name, rt.base_price as nightly_rate, rt.size_sqm, rt.capacity_adults, b.name as branch_name 
      FROM Rooms r 
      JOIN RoomTypes rt ON r.room_type_id = rt.id 
      JOIN Branches b ON r.branch_id = b.id 
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sqlText += ' AND r.status = ?';
      params.push(status);
    }
    if (branchId) {
      sqlText += ' AND r.branch_id = ?';
      params.push(Number(branchId));
    }

    const rooms = await query(sqlText, params);
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch physical rooms inventory.' });
  }
});

// POST /api/rooms - Add physical room
router.post('/', authenticate, requireRoles(['SUPER_ADMIN', 'BRANCH_ADMIN']), async (req, res) => {
  try {
    const { branch_id, room_type_id, room_number, floor, status } = req.body;
    const resInsert = await query(
      'INSERT INTO Rooms (branch_id, room_type_id, room_number, floor, status) VALUES (?, ?, ?, ?, ?)',
      [branch_id, room_type_id, room_number, floor || 'Ground', status || 'AVAILABLE']
    );
    res.status(201).json({ message: 'Room added', id: resInsert.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add room.' });
  }
});

// PATCH /api/rooms/:id/status - Update physical room status (e.g. from Housekeeping or Maintenance)
router.patch('/:id/status', authenticate, requireRoles(['SUPER_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING', 'MAINTENANCE']), async (req, res) => {
  try {
    const { status } = req.body; // AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE
    await query('UPDATE Rooms SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Room status updated successfully to ' + status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update room status.' });
  }
});

// PATCH /api/rooms/:id/lockout - Toggle safety lockout (LOTO)
router.patch('/:id/lockout', authenticate, requireRoles(['SUPER_ADMIN', 'BRANCH_ADMIN', 'MAINTENANCE']), async (req, res) => {
  try {
    const { is_locked } = req.body;
    await query('UPDATE Rooms SET is_locked = ? WHERE id = ?', [is_locked ? 1 : 0, req.params.id]);
    res.json({ message: `Room safety lockout status updated successfully to ${is_locked ? 'LOCKED' : 'UNLOCKED'}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update room lockout status.' });
  }
});

module.exports = router;
