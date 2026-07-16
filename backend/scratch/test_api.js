const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = '4cf869a84a6c6e7f7bb7c24f6a9e1e2d7e8b9c2a3d4f5e6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6';

async function runTests() {
  console.log('--- STARTING BACKEND VALIDATION TESTS (WITH JWT) ---');

  const testUser = { id: 2, role: 'CUSTOMER', name: 'Test Customer', email: 'test@customer.com' };
  const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1h' });

  // Test 1: Calculate pricing with past check-in date
  try {
    console.log('\nTest 1: Calculate pricing with a past check-in date...');
    const res = await fetch(`${API_BASE}/bookings/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomTypeId: 1,
        checkIn: '2020-01-01',
        checkOut: '2020-01-03',
        roomsCount: 1
      })
    });
    if (res.status === 400) {
      const data = await res.json();
      console.log('✅ Test 1 Passed: Correctly rejected past check-in date. Message:', data.error);
    } else {
      console.error('❌ Test 1 Failed: Expected status 400, got:', res.status);
    }
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
  }

  // Test 2: Calculate pricing with check-out <= check-in date
  try {
    console.log('\nTest 2: Calculate pricing with check-out before check-in...');
    const res = await fetch(`${API_BASE}/bookings/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomTypeId: 1,
        checkIn: '2026-08-20',
        checkOut: '2026-08-18',
        roomsCount: 1
      })
    });
    if (res.status === 400) {
      const data = await res.json();
      console.log('✅ Test 2 Passed: Correctly rejected invalid date range. Message:', data.error);
    } else {
      console.error('❌ Test 2 Failed: Expected status 400, got:', res.status);
    }
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
  }

  // Test 3: Calculate pricing with valid dates
  try {
    console.log('\nTest 3: Calculate pricing with valid dates...');
    const res = await fetch(`${API_BASE}/bookings/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomTypeId: 1,
        checkIn: '2026-08-20',
        checkOut: '2026-08-23',
        roomsCount: 1
      })
    });
    if (res.status === 200) {
      const data = await res.json();
      if (data.nights === 3) {
        console.log('✅ Test 3 Passed: Correctly computed pricing for 3 nights. Total:', data.totalAmount);
      } else {
        console.error('❌ Test 3 Failed: Nights is not 3:', data);
      }
    } else {
      console.error('❌ Test 3 Failed: Expected status 200, got:', res.status);
    }
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
  }

  // Test 4: Create booking with valid dates and full payment option
  try {
    console.log('\nTest 4: Create booking with full payment...');
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        branchId: 1,
        roomTypeId: 1,
        checkIn: '2026-08-20',
        checkOut: '2026-08-23',
        roomsCount: 1,
        guestDetails: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '9876543210' },
        paymentMethod: 'UPI',
        upiId: 'john@okaxis',
        paymentOption: 'FULL'
      })
    });
    if (res.status === 201) {
      const data = await res.json();
      if (data.paidAmount === data.totalAmount) {
        console.log('✅ Test 4 Passed: Booking created. Total Amount:', data.totalAmount, 'Paid Amount:', data.paidAmount);
      } else {
        console.error('❌ Test 4 Failed: Paid amount mismatch:', data);
      }
    } else {
      const text = await res.text();
      console.error('❌ Test 4 Failed: Expected status 201, got:', res.status, text);
    }
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
  }

  // Test 5: Create booking with valid dates and partial payment option
  try {
    console.log('\nTest 5: Create booking with partial payment (20% to hold)...');
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        branchId: 1,
        roomTypeId: 1,
        checkIn: '2026-08-25',
        checkOut: '2026-08-28',
        roomsCount: 1,
        guestDetails: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', phone: '9876543211' },
        paymentMethod: 'UPI',
        upiId: 'jane@okaxis',
        paymentOption: 'PARTIAL'
      })
    });
    if (res.status === 201) {
      const data = await res.json();
      const expectedPartial = Number((data.totalAmount * 0.20).toFixed(2));
      if (data.paidAmount === expectedPartial) {
        console.log('✅ Test 5 Passed: Booking created with partial payment. Total Stay Amount:', data.totalAmount, 'Paid today (20%):', data.paidAmount);
      } else {
        console.error('❌ Test 5 Failed: Paid amount is not 20% of total. Response:', data);
      }
    } else {
      const text = await res.text();
      console.error('❌ Test 5 Failed: Expected status 201, got:', res.status, text);
    }
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
  }

  console.log('\n--- BACKEND VALIDATION TESTS COMPLETE ---');
}

runTests();
