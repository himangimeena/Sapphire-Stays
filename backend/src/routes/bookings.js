const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const { authenticate, requireRoles } = require('../middleware/auth');

// POST /api/bookings/calculate - Calculate Indian GST and Total Amount
router.post('/calculate', async (req, res) => {
  try {
    const { roomTypeId, checkIn, checkOut, roomsCount = 1, couponCode } = req.body;
    if (!roomTypeId || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Missing calculation parameters.' });
    }

    const rt = await query('SELECT * FROM RoomTypes WHERE id = ?', [roomTypeId]);
    if (rt.length === 0) {
      return res.status(404).json({ error: 'Room type not found.' });
    }
    const roomType = rt[0];

    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));

    let baseAmount = Number(roomType.base_price) * nights * Number(roomsCount);
    let discountAmount = 0;

    // Apply coupon if valid
    if (couponCode) {
      const coupons = await query('SELECT * FROM Coupons WHERE code = ? AND is_active = 1', [couponCode.trim().toUpperCase()]);
      if (coupons.length > 0) {
        const c = coupons[0];
        if (baseAmount >= Number(c.min_booking_amount)) {
          if (c.discount_type === 'PERCENTAGE') {
            discountAmount = Math.min((baseAmount * Number(c.discount_value)) / 100, Number(c.max_discount_amount || baseAmount));
          } else {
            discountAmount = Number(c.discount_value);
          }
        }
      }
    }

    const discountedBase = Math.max(0, baseAmount - discountAmount);
    // India GST for luxury hotels (>₹7,500 is 18% total: 9% CGST + 9% SGST)
    const cgstAmount = Number((discountedBase * 0.09).toFixed(2));
    const sgstAmount = Number((discountedBase * 0.09).toFixed(2));
    const totalAmount = Number((discountedBase + cgstAmount + sgstAmount).toFixed(2));

    res.json({
      nights,
      roomsCount,
      nightlyRate: Number(roomType.base_price),
      baseAmount,
      discountAmount,
      cgstAmount,
      sgstAmount,
      totalAmount,
      currency: 'INR'
    });
  } catch (err) {
    console.error('Calculate error:', err);
    res.status(500).json({ error: 'Failed to calculate pricing.' });
  }
});

// POST /api/bookings - Create new luxury booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { branchId, roomTypeId, checkIn, checkOut, adults = 2, children = 0, roomsCount = 1, couponCode, specialRequests, guestDetails, paymentMethod = 'UPI', upiId, assignedRoomId } = req.body;

    // Validate that the assigned room is neither locked nor occupied if checking in immediately
    if (assignedRoomId) {
      const roomCheck = await query('SELECT status, is_locked FROM Rooms WHERE id = ?', [assignedRoomId]);
      if (roomCheck.length === 0 || roomCheck[0].is_locked === 1 || roomCheck[0].status !== 'AVAILABLE') {
        return res.status(409).json({ error: 'Selected room is locked or unavailable. Refresh and pick another suite.' });
      }
    }

    // Calculate totals
    const rt = await query('SELECT * FROM RoomTypes WHERE id = ?', [roomTypeId]);
    if (rt.length === 0) return res.status(404).json({ error: 'Room type not found' });
    const roomType = rt[0];

    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
    let baseAmount = Number(roomType.base_price) * nights * Number(roomsCount);
    let discountAmount = 0;

    if (couponCode) {
      const coupons = await query('SELECT * FROM Coupons WHERE code = ? AND is_active = 1', [couponCode.trim().toUpperCase()]);
      if (coupons.length > 0) {
        const c = coupons[0];
        if (baseAmount >= Number(c.min_booking_amount)) {
          if (c.discount_type === 'PERCENTAGE') {
            discountAmount = Math.min((baseAmount * Number(c.discount_value)) / 100, Number(c.max_discount_amount || baseAmount));
          } else {
            discountAmount = Number(c.discount_value);
          }
        }
      }
    }

    const discountedBase = Math.max(0, baseAmount - discountAmount);
    const cgstAmount = Number((discountedBase * 0.09).toFixed(2));
    const sgstAmount = Number((discountedBase * 0.09).toFixed(2));
    const totalAmount = Number((discountedBase + cgstAmount + sgstAmount).toFixed(2));

    const bookingRef = `IND-SPH-${Math.floor(10000 + Math.random() * 90000)}`;

    const resBooking = await query(
      `INSERT INTO Bookings (booking_ref, user_id, branch_id, room_type_id, check_in_date, check_out_date, adults, children, rooms_count, base_amount, cgst_amount, sgst_amount, discount_amount, total_amount, coupon_code, status, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)`,
      [bookingRef, req.user.id, branchId || roomType.branch_id, roomTypeId, checkIn, checkOut, adults, children, roomsCount, baseAmount, cgstAmount, sgstAmount, discountAmount, totalAmount, couponCode || null, specialRequests || '']
    );

    const bookingId = resBooking.insertId;

    if (guestDetails) {
      await query(
        'INSERT INTO BookingGuests (booking_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)',
        [bookingId, guestDetails.firstName || req.user.name || '', guestDetails.lastName || '', guestDetails.email || req.user.email || '', guestDetails.phone || req.user.phone || '']
      );
    }

    // Payment record
    const txnRef = `TXN-${Date.now()}-INR`;
    await query(
      'INSERT INTO Payments (booking_id, amount, payment_method, upi_id, transaction_ref, status) VALUES (?, ?, ?, ?, ?, ?)',
      [bookingId, totalAmount, paymentMethod, upiId || null, txnRef, 'SUCCESS']
    );

    // GST Invoice record
    const invNum = `INV-2026-IN${Math.floor(1000 + Math.random() * 9000)}`;
    await query(
      'INSERT INTO Invoices (invoice_number, booking_id, gstin) VALUES (?, ?, ?)',
      [invNum, bookingId, '08AAACS9988H1Z5']
    );

    if (req.body.assignedRoomId) {
      await query("UPDATE Bookings SET status='CHECKED_IN', assigned_room_id=? WHERE id=?", [req.body.assignedRoomId, bookingId]);
      await query("UPDATE Rooms SET status='OCCUPIED' WHERE id=?", [req.body.assignedRoomId]);
    }

    res.status(201).json({
      message: 'Luxury reservation confirmed successfully!',
      bookingRef,
      bookingId,
      totalAmount,
      currency: 'INR'
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to process luxury reservation.' });
  }
});

// GET /api/bookings/my - Get user bookings
router.get('/my', authenticate, async (req, res) => {
  try {
    const bookings = await query(
      `SELECT b.*, br.name as branch_name, br.city as branch_city, rt.name as room_type_name, rt.has_breakfast, i.invoice_number, i.gstin, p.payment_method, p.transaction_ref
       FROM Bookings b
       JOIN Branches br ON b.branch_id = br.id
       JOIN RoomTypes rt ON b.room_type_id = rt.id
       LEFT JOIN Invoices i ON b.id = i.booking_id
       LEFT JOIN Payments p ON b.id = p.booking_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your bookings.' });
  }
});

// GET /api/bookings - Admin/Staff view all reservations
router.get('/', authenticate, requireRoles(['SUPER_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST']), async (req, res) => {
  try {
    const bookings = await query(
      `SELECT b.*, br.name as branch_name, rt.name as room_type_name, u.name as guest_name, u.email as guest_email, u.phone as guest_phone, r.room_number as assigned_room_number
       FROM Bookings b
       JOIN Branches br ON b.branch_id = br.id
       JOIN RoomTypes rt ON b.room_type_id = rt.id
       JOIN Users u ON b.user_id = u.id
       LEFT JOIN Rooms r ON b.assigned_room_id = r.id
       ORDER BY b.created_at DESC`
    );
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system bookings.' });
  }
});

// PATCH /api/bookings/:id/status - Check-in / Check-out / Cancel
router.patch('/:id/status', authenticate, requireRoles(['SUPER_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST', 'CUSTOMER']), async (req, res) => {
  try {
    const { status, assigned_room_id } = req.body;

    if (status === 'CHECKED_IN') {
      let roomId = assigned_room_id;
      
      // Enforce server-side check-in validation against LOTO lockout status
      if (roomId) {
        const roomCheck = await query('SELECT status, is_locked FROM Rooms WHERE id = ?', [roomId]);
        if (roomCheck.length === 0 || roomCheck[0].is_locked === 1 || roomCheck[0].status !== 'AVAILABLE') {
          return res.status(409).json({ error: 'Selected room is locked or unavailable. Refresh and pick another suite.' });
        }
      }

      if (!roomId) {
        // Find booking room type and branch
        const bookings = await query('SELECT room_type_id, branch_id FROM Bookings WHERE id = ?', [req.params.id]);
        if (bookings.length > 0) {
          const b = bookings[0];
          // Find first available room of this type in this branch that is NOT locked (LOTO)
          const rooms = await query(
            "SELECT id FROM Rooms WHERE room_type_id = ? AND branch_id = ? AND status = 'AVAILABLE' AND is_locked = 0 LIMIT 1",
            [b.room_type_id, b.branch_id]
          );
          if (rooms.length > 0) {
            roomId = rooms[0].id;
          } else {
            return res.status(400).json({ error: 'No vacant-clean suites of this category are currently available.' });
          }
        }
      }
      
      if (roomId) {
        await query("UPDATE Bookings SET status = 'CHECKED_IN', assigned_room_id = ? WHERE id = ?", [roomId, req.params.id]);
        await query("UPDATE Rooms SET status = 'OCCUPIED' WHERE id = ?", [roomId]);
        return res.json({ message: 'Guest checked in successfully and room assigned', roomId });
      }
    } else if (status === 'CHECKED_OUT') {
      // Find the currently assigned room
      const bookings = await query('SELECT assigned_room_id FROM Bookings WHERE id = ?', [req.params.id]);
      if (bookings.length > 0 && bookings[0].assigned_room_id) {
        const roomId = bookings[0].assigned_room_id;
        await query("UPDATE Bookings SET status = 'CHECKED_OUT' WHERE id = ?", [req.params.id]);
        await query("UPDATE Rooms SET status = 'CLEANING' WHERE id = ?", [roomId]);
        
        // Auto-dispatch cleaning task to Housekeeping queue
        const existing = await query("SELECT id FROM HousekeepingTasks WHERE room_id = ? AND status != 'COMPLETED'", [roomId]);
        if (existing.length === 0) {
          await query(
            "INSERT INTO HousekeepingTasks (room_id, task_type, status, priority, notes) VALUES (?, 'Standard Cleaning', 'PENDING', 'NORMAL', 'Checkout turnaround. Sanitize all high-touch surfaces, replace linen with Egyptian cotton.')",
            [roomId]
          );
        }
        return res.json({ message: 'Guest checked out. Room flagged for cleaning turnaround.', roomId });
      }
    }

    // Default update fallback
    let sqlText = 'UPDATE Bookings SET status = ?';
    const params = [status];
    if (assigned_room_id) {
      sqlText += ', assigned_room_id = ?';
      params.push(assigned_room_id);
    }
    sqlText += ' WHERE id = ?';
    params.push(req.params.id);

    await query(sqlText, params);
    res.json({ message: `Booking status updated to ${status}` });
  } catch (err) {
    console.error('Booking status update error:', err);
    res.status(500).json({ error: 'Failed to update booking status.' });
  }
});

module.exports = router;
