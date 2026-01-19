import { NextResponse } from "next/server"
import crypto from "crypto"
import { query } from "@/lib/db-connection"
import { sendPasswordResetEmail } from "@/lib/email-service"

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000"

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex")
}

export async function POST(request) {
  try {
    const { email, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
    }

    // Always respond 200 to avoid account enumeration (but still do the work if user exists)
    const userResult = await query("SELECT id, name, email FROM users WHERE email = $1 AND role = $2", [email, role])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." })
    }

    const user = userResult.rows[0]

    const rawToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = sha256(rawToken)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // Invalidate previous unused tokens
    await query("UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE", [user.id])

    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt],
    )

    const resetUrl = `${API_BASE_URL}/reset-password?token=${rawToken}&role=${encodeURIComponent(role)}`

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl)
    } catch (e) {
      // Don't leak email errors to client
      console.error("Password reset email failed:", e)
    }

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Request failed" }, { status: 500 })
  }
}
