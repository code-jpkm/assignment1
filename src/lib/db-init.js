"use client"

import fs from "fs"
import path from "path"

export async function initializeDatabase() {
  try {
    const dbDir = path.join(process.cwd(), "data")

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

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

    const returnsPath = path.join(dbDir, "returns.json")
    if (!fs.existsSync(returnsPath)) {
      fs.writeFileSync(returnsPath, JSON.stringify([], null, 2))
    }

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
