"use client"

import fs from "fs"
import path from "path"

// Initialize database files if they don't exist
export async function initializeDatabase() {
  try {
    const dbDir = path.join(process.cwd(), "data")

    // Create directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    // Initialize users database
    const usersPath = path.join(dbDir, "users.json")
    if (!fs.existsSync(usersPath)) {
      const users = {
        admin: {
          id: "admin_001",
          email: "admin@example.com",
          password: "admin123",
          role: "admin",
          name: "Admin User",
        },
        users: [],
      }
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2))
    }

    // Initialize returns database
    const returnsPath = path.join(dbDir, "returns.json")
    if (!fs.existsSync(returnsPath)) {
      fs.writeFileSync(returnsPath, JSON.stringify([], null, 2))
    }

    // Initialize OTPs database
    const otpsPath = path.join(dbDir, "otps.json")
    if (!fs.existsSync(otpsPath)) {
      fs.writeFileSync(otpsPath, JSON.stringify({}, null, 2))
    }

    return true
  } catch (error) {
    console.error("Database initialization error:", error)
    return false
  }
}
