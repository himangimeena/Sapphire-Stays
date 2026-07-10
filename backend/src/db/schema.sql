-- Sapphire Stays Luxury Hotel Management System - India
-- Relational Normalized Schema (MySQL / ANSI SQL compatible)

CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'CUSTOMER', -- CUSTOMER, SUPER_ADMIN, BRANCH_ADMIN, RECEPTIONIST, HOUSEKEEPING, MAINTENANCE
  avatar_url VARCHAR(500),
  loyalty_points INT DEFAULT 500,
  address TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(50) DEFAULT 'India',
  address TEXT NOT NULL,
  description TEXT,
  hero_image VARCHAR(500),
  rating DECIMAL(3,2) DEFAULT 4.90,
  starting_price DECIMAL(10,2) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  map_coordinates VARCHAR(100),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'GENERAL' -- GENERAL, WELLNESS, DINING, BUSINESS
);

CREATE TABLE IF NOT EXISTS BranchAmenities (
  branch_id INT NOT NULL,
  amenity_id INT NOT NULL,
  PRIMARY KEY (branch_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS RoomTypes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  name VARCHAR(255) NOT NULL, -- Standard, Deluxe, Executive, Suite, Presidential Suite, Family Suite
  tier VARCHAR(100) DEFAULT 'Luxury',
  base_price DECIMAL(10,2) NOT NULL,
  discount_percentage INT DEFAULT 0,
  capacity_adults INT DEFAULT 2,
  capacity_children INT DEFAULT 1,
  size_sqm INT DEFAULT 45,
  bed_type VARCHAR(100) DEFAULT 'King Bed',
  has_balcony BOOLEAN DEFAULT 1,
  has_breakfast BOOLEAN DEFAULT 1,
  description TEXT
);

CREATE TABLE IF NOT EXISTS RoomImages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_type_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  is_primary BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  room_type_id INT NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  floor VARCHAR(50),
  status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE, BLOCKED
  is_locked BOOLEAN DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS Coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  discount_type VARCHAR(50) DEFAULT 'PERCENTAGE', -- FLAT, PERCENTAGE
  discount_value DECIMAL(10,2) NOT NULL,
  min_booking_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2) DEFAULT 10000,
  expiry_date DATETIME,
  is_active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS Bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_ref VARCHAR(100) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  branch_id INT NOT NULL,
  room_type_id INT NOT NULL,
  assigned_room_id INT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  adults INT DEFAULT 2,
  children INT DEFAULT 0,
  rooms_count INT DEFAULT 1,
  base_amount DECIMAL(10,2) NOT NULL,
  cgst_amount DECIMAL(10,2) NOT NULL,
  sgst_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  coupon_code VARCHAR(100),
  status VARCHAR(50) DEFAULT 'CONFIRMED', -- PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
  special_requests TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS BookingGuests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  first_name VARCHAR(150) NOT NULL,
  last_name VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  id_proof_type VARCHAR(100) DEFAULT 'Aadhaar / Passport',
  id_proof_number VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(100) NOT NULL, -- UPI, Credit Card, Debit Card, Net Banking, Pay at Hotel
  upi_id VARCHAR(150),
  transaction_ref VARCHAR(150) NOT NULL,
  status VARCHAR(50) DEFAULT 'SUCCESS',
  paid_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  booking_id INT NOT NULL,
  gstin VARCHAR(50) DEFAULT '27AAACS1234F1Z8',
  issued_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  pdf_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS Reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  branch_id INT NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  comment TEXT NOT NULL,
  admin_reply TEXT,
  is_hidden BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  branch_id INT NOT NULL,
  employee_id VARCHAR(100) NOT NULL UNIQUE,
  department VARCHAR(100), -- Management, Reception, Housekeeping, Maintenance
  shift VARCHAR(100) DEFAULT 'Morning (08:00 AM - 04:00 PM)'
);

CREATE TABLE IF NOT EXISTS HousekeepingTasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  assigned_staff_id INT,
  task_type VARCHAR(100) DEFAULT 'Standard Cleaning', -- Standard Cleaning, Turn-down Service, Deep Clean, VIP Setup
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED
  priority VARCHAR(50) DEFAULT 'NORMAL', -- NORMAL, URGENT, VIP
  notes TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS MaintenanceRequests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  reported_by VARCHAR(150),
  issue_title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'NORMAL', -- NORMAL, URGENT, EMERGENCY
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(100) DEFAULT 'BOOKING', -- BOOKING, OFFER, ALERT
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
