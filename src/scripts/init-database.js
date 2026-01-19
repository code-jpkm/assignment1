const fs = require("fs")
const path = require("path")

// This script will be run to initialize the PostgreSQL database
// Make sure you have PostgreSQL installed and running
// Update the connection details in .env.local file

const dbSchema = `
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Annual Returns table
CREATE TABLE IF NOT EXISTS annual_returns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  financial_year INTEGER NOT NULL,
  total_income DECIMAL(15, 2),
  total_spent DECIMAL(15, 2),
  total_savings DECIMAL(15, 2),
  total_loan DECIMAL(15, 2),
  total_salary_paid DECIMAL(15, 2),
  signature_file LONGTEXT, -- Base64 encoded image
  declaration_pdf LONGTEXT, -- Base64 encoded PDF
  status VARCHAR(50) CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')) DEFAULT 'draft',
  submission_date TIMESTAMP,
  approved_date TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, financial_year)
);

-- Create OTP table
CREATE TABLE IF NOT EXISTS otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  return_id INTEGER NOT NULL REFERENCES annual_returns(id) ON DELETE CASCADE,
  otp_code VARCHAR(10) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) CHECK (notification_type IN ('otp', 'approval', 'rejection', 'submission')) DEFAULT 'submission',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON annual_returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON annual_returns(status);
CREATE INDEX IF NOT EXISTS idx_otps_user_id ON otps(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
`

console.log("PostgreSQL Schema:")
console.log(dbSchema)
console.log("\nCopy and paste this schema into your PostgreSQL database to initialize it.")
console.log("\nMake sure to:")
console.log("1. Create a database (CREATE DATABASE annual_returns;)")
console.log("2. Run the schema above")
console.log("3. Set DATABASE_URL in .env.local")
