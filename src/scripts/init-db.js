// Initialize database with sample data
// This creates mock database structure for the application

const fs = require("fs")
const path = require("path")

const dbDir = path.join(__dirname, "../data")

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Initialize users database
const users = {
  admin: {
    id: "admin_001",
    email: "admin@example.com",
    password: "$2b$10$YourHashedPasswordHere", // In production, this would be hashed
    role: "admin",
    name: "Admin User",
  },
  users: [],
}

// Initialize annual returns database
const annualReturns = []

// Initialize OTP storage
const otps = {}

fs.writeFileSync(path.join(dbDir, "users.json"), JSON.stringify(users, null, 2))
fs.writeFileSync(path.join(dbDir, "returns.json"), JSON.stringify(annualReturns, null, 2))
fs.writeFileSync(path.join(dbDir, "otps.json"), JSON.stringify(otps, null, 2))

console.log("Database initialized successfully")
