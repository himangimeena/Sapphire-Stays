const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const { authenticate, requireRoles } = require('../middleware/auth');

// GET /api/operations/housekeeping - Get all housekeeping tasks
router.get('/housekeeping', authenticate, requireRoles(['SUPER_ADMIN', 'BRANCH_ADMIN', 'HOUSEKEEPING']), async (req, res) => {
  try {
    const tasks = await query(
      `SELECT h.*, r.room_number, r.floor, rt.name as room_type_name, b.name as branch_name 
       FROM HousekeepingTasks h 
       JOIN Rooms r ON h.room_id = r.id 
       JOIN RoomTypes rt ON r.room_type_id = rt.id 
       JOIN Branches b ON r.branch_id = b.id 
       ORDER BY CASE WHEN h.priority = 'VIP' THEN 1 WHEN h.priority = 'URGENT' THEN 2 ELSE 3 END, h.updated_at DESC`
    );
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch housekeeping tasks.' });
  }
});

// PATCH /api/operations/housekeeping/:id - Toggle task status
router.patch('/housekeeping/:id', authenticate, requireRoles(['SUPER_ADMIN', 'BRANCH_ADMIN', 'HOUSEKEEPING']), async (req, res) => {
  try {
    const { status, roomId } = req.body;
    await query('UPDATE HousekeepingTasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
    if (status === 'COMPLETED' && roomId) {
      await query("UPDATE Rooms SET status = 'AVAILABLE' WHERE id = ?", [roomId]);
    }
    res.json({ message: 'Housekeeping task updated to ' + status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// GET /api/operations/maintenance - Get all maintenance tickets
router.get('/maintenance', authenticate, requireRoles(['SUPER_ADMIN', 'BRANCH_ADMIN', 'MAINTENANCE']), async (req, res) => {
  try {
    const tickets = await query(
      `SELECT m.*, r.room_number, r.floor, rt.name as room_type_name, b.name as branch_name 
       FROM MaintenanceRequests m 
       JOIN Rooms r ON m.room_id = r.id 
       JOIN RoomTypes rt ON r.room_type_id = rt.id 
       JOIN Branches b ON r.branch_id = b.id 
       ORDER BY CASE WHEN m.priority = 'EMERGENCY' THEN 1 WHEN m.priority = 'URGENT' THEN 2 ELSE 3 END, m.created_at DESC`
    );
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch maintenance requests.' });
  }
});

// POST /api/operations/maintenance - Report issue
router.post('/maintenance', authenticate, requireRoles(['SUPER_ADMIN', 'BRANCH_ADMIN', 'HOUSEKEEPING', 'MAINTENANCE', 'RECEPTIONIST']), async (req, res) => {
  try {
    const { room_id, issue_title, description, priority } = req.body;
    await query(
      'INSERT INTO MaintenanceRequests (room_id, reported_by, issue_title, description, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
      [room_id, req.user.name, issue_title, description || '', priority || 'NORMAL', 'PENDING']
    );
    await query("UPDATE Rooms SET status = 'MAINTENANCE' WHERE id = ?", [room_id]);
    res.status(201).json({ message: 'Maintenance ticket created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to report issue.' });
  }
});

// PATCH /api/operations/maintenance/:id - Resolve ticket
router.patch('/maintenance/:id', authenticate, requireRoles(['SUPER_ADMIN', 'BRANCH_ADMIN', 'MAINTENANCE']), async (req, res) => {
  try {
    const { status, roomId } = req.body;
    await query('UPDATE MaintenanceRequests SET status = ? WHERE id = ?', [status, req.params.id]);
    if (status === 'COMPLETED' && roomId) {
      await query("UPDATE Rooms SET status = 'AVAILABLE' WHERE id = ?", [roomId]);
    }
    res.json({ message: 'Maintenance ticket updated to ' + status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ticket.' });
  }
});

module.exports = router;
