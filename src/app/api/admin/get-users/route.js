import { query } from "@/lib/db-connection"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)

    const adminCheck = await query("SELECT role FROM users WHERE id = $1", [decoded.userId])
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 })
    }

    const result = await query(
      `SELECT id, name, email, phone, address, role, created_at 
       FROM users 
       WHERE role = 'user'
       ORDER BY created_at DESC`,
    )

    const users = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      createdAt: row.created_at,
    }))

    return Response.json({ data: users })
  } catch (error) {
    console.error("Get users error:", error)
    return Response.json({ error: "Failed to fetch users: " + error.message }, { status: 500 })
  }
}
