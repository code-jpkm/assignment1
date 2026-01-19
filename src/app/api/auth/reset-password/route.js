import { NextResponse } from "next/server"
import crypto from "crypto"
import { query } from "@/lib/db-connection"
import { hashPassword } from "@/lib/auth-utils"

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex")
}

export async function POST(request) {
  try {
    const { token, role, newPassword } = await request.json()

    if (!token || !role || !newPassword) {
      return NextResponse.json({ error: "Token, role, and new password are required" }, { status: 400 })
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const tokenHash = sha256(token)

    const pr = await query(
      `SELECT pr.id, pr.user_id, pr.expires_at, pr.used
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.token_hash = $1 AND u.role = $2
       ORDER BY pr.created_at DESC
       LIMIT 1`,
      [tokenHash, role],
    )

    if (pr.rows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
    }

    const rec = pr.rows[0]
    if (rec.used) {
      return NextResponse.json({ error: "Reset link already used" }, { status: 400 })
    }

    if (new Date(rec.expires_at) < new Date()) {
      return NextResponse.json({ error: "Reset link expired" }, { status: 400 })
    }

    const pwHash = await hashPassword(newPassword)

    await query("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [pwHash, rec.user_id])
    await query("UPDATE password_resets SET used = TRUE WHERE id = $1", [rec.id])

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Reset failed" }, { status: 500 })
  }
}
