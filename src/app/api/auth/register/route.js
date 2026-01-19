import { query } from "@/lib/db-connection"
import { hashPassword, generateAutoPassword } from "@/lib/auth-utils"

export async function POST(req) {
  try {
    const { email, name, phone, address } = await req.json()

    // Validation
    if (!email || !name || !phone) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [email])
    if (existingUser.rows.length > 0) {
      return Response.json({ error: "User already exists" }, { status: 409 })
    }

    // Generate auto password
    const autoPassword = generateAutoPassword()
    const passwordHash = await hashPassword(autoPassword)

    // Create user
    const result = await query(
      `INSERT INTO users (email, name, phone, address, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, phone, role`,
      [email, name, phone, address || "", passwordHash, "user"],
    )

    return Response.json({
      message: "User created successfully",
      user: result.rows[0],
      autoPassword: autoPassword, // Share only with admin during creation
    })
  } catch (error) {
    console.error("Registration error:", error)
    return Response.json({ error: "Registration failed: " + error.message }, { status: 500 })
  }
}
