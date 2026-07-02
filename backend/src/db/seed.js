const bcrypt = require('bcryptjs');
const { initDB, query } = require('./index');

async function seedDatabase() {
  console.log('🌱 Seeding Sapphire Stays Database with Indian Luxury Heritage data...');
  await initDB();

  // 1. Seed Users (All 6 RBAC Roles)
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const users = [
    ['superadmin@sapphirestays.in', adminHash, 'Julian Sterling', '+91 98200 11223', 'SUPER_ADMIN', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 15000, 'Malabar Hill, Mumbai'],
    ['udaipur.admin@sapphirestays.in', adminHash, 'Vikramaditya Rathore', '+91 94140 55667', 'BRANCH_ADMIN', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 5000, 'City Palace Road, Udaipur'],
    ['reception@sapphirestays.in', passwordHash, 'Ananya Sharma', '+91 98110 33445', 'RECEPTIONIST', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 1200, 'Connaught Place, New Delhi'],
    ['housekeeping@sapphirestays.in', passwordHash, 'Julian D.', '+91 98330 77889', 'HOUSEKEEPING', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', 800, 'Bandra West, Mumbai'],
    ['maintenance@sapphirestays.in', passwordHash, 'Rajesh Kumar', '+91 98440 99001', 'MAINTENANCE', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', 600, 'Panaji, Goa'],
    ['guest@sapphirestays.in', passwordHash, 'Julian Thorne', '+91 99220 44556', 'CUSTOMER', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80', 8500, 'Jubilee Hills, Hyderabad']
  ];

  for (const u of users) {
    // Check if user exists
    const existing = await query('SELECT id FROM Users WHERE email = ?', [u[0]]);
    if (existing.length === 0) {
      await query(
        'INSERT INTO Users (email, password_hash, name, phone, role, avatar_url, loyalty_points, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        u
      );
    }
  }

  // 2. Seed Luxury Indian Branches
  const branches = [
    [
      'Sapphire Palace Udaipur',
      'Udaipur',
      'Rajasthan',
      'Lake Pichola Heritage Esplanade, Udaipur 313001',
      'A poetic dialogue between Rajput royal opulence and modern serenity overlooking the glistening waters of Lake Pichola. Experience private courtyard fountains, hand-painted frescoes, and world-class culinary art.',
      'https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80',
      4.98,
      45000.00,
      'udaipur@sapphirestays.in',
      '+91 294 252 8800'
    ],
    [
      'Sapphire Grand Colaba',
      'Mumbai',
      'Maharashtra',
      'Apollo Bunder, Seafront Promenade, Mumbai 400001',
      'Ascend above the neon pulse of Mumbai. A vertical sanctuary of classical grandeur overlooking the Gateway of India and the Arabian Sea, featuring Michelin-celebrated coastal dining and 24/7 concierge service.',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      4.95,
      35000.00,
      'mumbai@sapphirestays.in',
      '+91 22 6632 1234'
    ],
    [
      'Sapphire Serenity Beach Resort',
      'South Goa',
      'Goa',
      'Cavelossim Beach Sanctuary, Salcete, Goa 403731',
      'Ultra-minimalist serenity where private pool villas meet pristine white sands. Designed for reflection and renewal surrounded by tropical palms and the rhythmic silver mist of the Arabian Sea.',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      4.93,
      28000.00,
      'goa@sapphirestays.in',
      '+91 832 240 5500'
    ],
    [
      'Sapphire Imperial Enclave',
      'New Delhi',
      'Delhi',
      'Chanakyapuri Diplomatic Enclave, New Delhi 110021',
      'An oasis of diplomatic calm amidst the vibrant energy of the capital. Featuring expansive manicured lawns, high-security executive suites, and authentic royal Awadhi gastronomy.',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      4.91,
      32000.00,
      'delhi@sapphirestays.in',
      '+91 11 2611 2233'
    ],
    [
      'Sapphire Heritage Fort',
      'Jaipur',
      'Rajasthan',
      'Amer Ridge, Pink City Sanctuary, Jaipur 302002',
      'Carved into the majestic Aravali hills, this fortified sanctuary blends centuries of regal heritage with infinity wellness pools and rooftop stargazing pavilions.',
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=80',
      4.96,
      38000.00,
      'jaipur@sapphirestays.in',
      '+91 141 267 0000'
    ],
    [
      'Sapphire Cloud Retreat',
      'Munnar',
      'Kerala',
      'Kannan Devan Hills Plantation, Munnar 685612',
      'Floating wooden pavilions suspended above emerald tea estates and mountain mist. Experience holistic Ayurvedic wellness and farm-to-table organic dining.',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      4.89,
      24000.00,
      'munnar@sapphirestays.in',
      '+91 4865 230 111'
    ]
  ];

  const existingBranches = await query('SELECT id FROM Branches');
  if (existingBranches.length === 0) {
    for (const b of branches) {
      await query(
        'INSERT INTO Branches (name, city, state, address, description, hero_image, rating, starting_price, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        b
      );
    }
  }

  // 3. Seed Amenities
  const amenitiesList = [
    ['Private Infinity Pool', 'waves', 'WELLNESS'],
    ['Michelin-Star Heritage Dining', 'utensils', 'DINING'],
    ['Sapphire Holistic Spa', 'sparkles', 'WELLNESS'],
    ['Chauffeur Luxury Fleet (Maybach/Rolls Royce)', 'car', 'GENERAL'],
    ['24/7 Butler & Concierge Care', 'bell', 'GENERAL'],
    ['Global Fiber Wi-Fi & Work Suite', 'wifi', 'BUSINESS'],
    ['Rooftop Sunset Bar & Lounge', 'wine', 'DINING'],
    ['Ayurvedic Wellness Center', 'heart', 'WELLNESS']
  ];

  const existingAmenities = await query('SELECT id FROM Amenities');
  if (existingAmenities.length === 0) {
    for (const a of amenitiesList) {
      await query('INSERT INTO Amenities (name, icon, category) VALUES (?, ?, ?)', a);
    }
  }

  // Assign amenities to branches
  const allBranches = await query('SELECT id FROM Branches');
  const allAmenities = await query('SELECT id FROM Amenities');
  const existingBranchAmenities = await query('SELECT * FROM BranchAmenities');
  if (existingBranchAmenities.length === 0 && allBranches.length > 0 && allAmenities.length > 0) {
    for (const br of allBranches) {
      for (const am of allAmenities) {
        await query('INSERT INTO BranchAmenities (branch_id, amenity_id) VALUES (?, ?)', [br.id, am.id]);
      }
    }
  }

  // 4. Seed Room Types & Rooms for Udaipur (Branch 1) & Mumbai (Branch 2)
  const existingRoomTypes = await query('SELECT id FROM RoomTypes');
  if (existingRoomTypes.length === 0 && allBranches.length > 0) {
    const b1 = allBranches[0].id; // Udaipur
    const b2 = allBranches[1] ? allBranches[1].id : b1; // Mumbai

    const types = [
      // Branch 1 - Udaipur
      [b1, 'Lakeview Standard Haven', 'Essential Luxury', 45000.00, 10, 2, 1, 48, 'King Bed', 1, 1, 'Refined comfort with private jharokha balcony views over Lake Pichola and artisanal marble bath.'],
      [b1, 'Royal Courtyard Suite', 'Most Popular', 68000.00, 15, 3, 2, 75, 'Grand King Bed', 1, 1, 'Expansive suite featuring sunken soaking tub, carved archways, and private butler service.'],
      [b1, 'Maharaja Imperial Pavilion', 'The Signature', 125000.00, 0, 4, 2, 140, 'Imperial Master Bed', 1, 1, 'Panoramic heritage pavilion with private plunge pool, dining parlor, and direct boat dock access.'],
      // Branch 2 - Mumbai
      [b2, 'Marine Skyline King', 'Essential Luxury', 35000.00, 5, 2, 1, 42, 'King Bed', 0, 1, 'Overlooking Mumbai skyline and Arabian Sea promenade with acoustic glass and rainfall shower.'],
      [b2, 'Gateway Grand Suite', 'Most Popular', 58000.00, 10, 3, 1, 68, 'King Bed', 1, 1, 'Corner suite offering dual vistas of the Gateway of India and harbor sunsets.'],
      [b2, 'Presidential Penthouse Sanctuary', 'The Signature', 140000.00, 0, 4, 2, 180, 'Custom King Bed', 1, 1, 'Top-floor sanctuary with private elevator access, private chef kitchen, and jacuzzi terrace.']
    ];

    for (const rt of types) {
      const res = await query(
        'INSERT INTO RoomTypes (branch_id, name, tier, base_price, discount_percentage, capacity_adults, capacity_children, size_sqm, bed_type, has_balcony, has_breakfast, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        rt
      );
      const rtId = res.insertId || 1;

      // Add rooms for each type
      const statusList = ['AVAILABLE', 'AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'];
      for (let i = 101; i <= 104; i++) {
        const st = statusList[(i + rtId) % statusList.length];
        await query(
          'INSERT INTO Rooms (branch_id, room_type_id, room_number, floor, status) VALUES (?, ?, ?, ?, ?)',
          [rt[0], rtId, `${rt[0] === b1 ? 'PALACE-' : 'GRAND-'}${i}`, `Floor ${Math.floor(i/100)}`, st]
        );
      }
    }
  }

  // 5. Seed Coupons
  const existingCoupons = await query('SELECT id FROM Coupons');
  if (existingCoupons.length === 0) {
    await query("INSERT INTO Coupons (code, discount_type, discount_value, min_booking_amount, max_discount_amount) VALUES ('ROYALINDIA20', 'PERCENTAGE', 20.00, 30000.00, 15000.00)");
    await query("INSERT INTO Coupons (code, discount_type, discount_value, min_booking_amount, max_discount_amount) VALUES ('SAPPHIRE5000', 'FLAT', 5000.00, 40000.00, 5000.00)");
  }

  // 6. Seed Sample Bookings & GST Invoices
  const existingBookings = await query('SELECT id FROM Bookings');
  if (existingBookings.length === 0 && allBranches.length > 0) {
    const guestUser = await query("SELECT id FROM Users WHERE email = 'guest@sapphirestays.in'");
    const gId = guestUser[0] ? guestUser[0].id : 6;
    const bId = allBranches[0].id;
    const rt = await query('SELECT id, base_price FROM RoomTypes WHERE branch_id = ? LIMIT 1', [bId]);
    const rtId = rt[0] ? rt[0].id : 1;
    const baseAmount = 135000.00; // 3 nights @ 45,000
    const cgst = baseAmount * 0.09; // 12,150
    const sgst = baseAmount * 0.09; // 12,150
    const totalAmount = baseAmount + cgst + sgst; // 1,59,300

    const bRes = await query(
      "INSERT INTO Bookings (booking_ref, user_id, branch_id, room_type_id, check_in_date, check_out_date, adults, children, rooms_count, base_amount, cgst_amount, sgst_amount, total_amount, status, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ['IND-SPH-88219', gId, bId, rtId, '2026-07-15', '2026-07-18', 2, 1, 1, baseAmount, cgst, sgst, totalAmount, 'CONFIRMED', 'Airport luxury pickup required. Chilled champagne welcome setup.']
    );
    const bookingId = bRes.insertId || 1;

    await query("INSERT INTO BookingGuests (booking_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)",
      [bookingId, 'Julian', 'Thorne', 'guest@sapphirestays.in', '+91 99220 44556']);

    await query("INSERT INTO Payments (booking_id, amount, payment_method, upi_id, transaction_ref, status) VALUES (?, ?, ?, ?, ?, ?)",
      [bookingId, totalAmount, 'UPI', 'julian.thorne@okaxis', 'TXN9988271654INR', 'SUCCESS']);

    await query("INSERT INTO Invoices (invoice_number, booking_id, gstin) VALUES (?, ?, ?)",
      ['INV-2026-IN0091', bookingId, '08AAACS9988H1Z5']);
  }

  // 7. Seed Operational Tasks (Screenshot 1 parity: Leaking Faucet, Turn-down, VIP Welcome)
  const existingTasks = await query('SELECT id FROM HousekeepingTasks');
  if (existingTasks.length === 0) {
    const rooms = await query('SELECT id, room_number FROM Rooms LIMIT 4');
    if (rooms.length >= 3) {
      await query("INSERT INTO HousekeepingTasks (room_id, task_type, status, priority, notes) VALUES (?, ?, ?, ?, ?)",
        [rooms[0].id, 'Standard Cleaning', 'PENDING', 'NORMAL', 'Departure: 11:00 AM • Next Check-in: 03:00 PM']);
      await query("INSERT INTO HousekeepingTasks (room_id, task_type, status, priority, notes) VALUES (?, ?, ?, ?, ?)",
        [rooms[1].id, 'Turn-down Service', 'PENDING', 'NORMAL', 'Evening Service • Request: Extra Pillows']);
      await query("INSERT INTO HousekeepingTasks (room_id, task_type, status, priority, notes) VALUES (?, ?, ?, ?, ?)",
        [rooms[2].id, 'VIP Welcome Setup', 'COMPLETED', 'VIP', 'Arrival: 02:30 PM • 3 Guests • Complimentary Champagne & Tropical Fruit Platter']);

      await query("INSERT INTO MaintenanceRequests (room_id, reported_by, issue_title, description, priority, status) VALUES (?, ?, ?, ?, ?, ?)",
        [rooms[0].id, 'Julian D.', 'Plumbing: Leaking Faucet', 'Water pooling near the vanity area. Guest reported 10 mins ago.', 'URGENT', 'COMPLETED']);
      await query("INSERT INTO MaintenanceRequests (room_id, reported_by, issue_title, description, priority, status) VALUES (?, ?, ?, ?, ?, ?)",
        [rooms[1].id, 'Housekeeping', 'AC Filter Change Required', 'Scheduled Monthly Service • Low Priority (HEPA Filter Model XJ-2)', 'NORMAL', 'COMPLETED']);
    }
  }

  console.log('✅ Sapphire Stays Indian Luxury seed data successfully loaded!');
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
