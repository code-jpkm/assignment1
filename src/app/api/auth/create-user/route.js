import { query } from "@/lib/db-connection"
import { hashPassword, generateAutoPassword } from "@/lib/auth-utils"
import { sendWelcomeEmail } from "@/lib/email-service"

export async function POST(req) {
  try {
    const { name, email, phone, address } = await req.json()


    if (!name || !email || !phone) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existingUser = await query("SELECT * FROM users WHERE email = $1", [email])
    if (existingUser.rows.length > 0) {
      return Response.json({ error: "User already exists with this email" }, { status: 409 })
    }

    const autoPassword = generateAutoPassword()
    const passwordHash = await hashPassword(autoPassword)


    const result = await query(
      `INSERT INTO users (email, name, phone, address, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, name, phone, address, role`,
      [email, name, phone, address || "", passwordHash, "user"],
    )

    const newUser = result.rows[0]

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const loginUrl = `${origin}/user/login`

    try {
      await sendWelcomeEmail(email, name, loginUrl, email, autoPassword)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
    }

    return Response.json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        role: newUser.role,
        autoPassword,
        loginUrl,
      },
    })
  } catch (error) {
    console.error("User creation error:", error)
    return Response.json({ error: "User creation failed: " + error.message }, { status: 500 })
  }
}
