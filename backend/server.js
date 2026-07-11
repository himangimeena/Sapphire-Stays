require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./src/db/index');
const { seedDatabase } = require('./src/db/seed');

const authRoutes = require('./src/routes/auth');
const branchRoutes = require('./src/routes/branches');
const roomRoutes = require('./src/routes/rooms');
const bookingRoutes = require('./src/routes/bookings');
const operationRoutes = require('./src/routes/operations');
const analyticsRoutes = require('./src/routes/analytics');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', brand: 'Sapphire Stays India Luxury Chain', timestamp: new Date() });
});

async function startServer() {
  try {
    // Automatically initialize database and seed on start if empty
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`\n👑 Sapphire Stays India Backend Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
