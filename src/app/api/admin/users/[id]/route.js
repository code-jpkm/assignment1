import { query } from "@/lib/db-connection"
import { verifyToken } from "@/lib/auth-utils"

export async function PUT(req, ctx) {
  try {
    const { id } = await ctx.params

    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)

    // Admin check
    const adminCheck = await query("SELECT role FROM users WHERE id = $1", [decoded.userId])
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 })
    }

    const { name, email, phone, address } = await req.json()

    if (!name || !email || !phone) {
      return Response.json({ error: "Name, email and phone are required" }, { status: 400 })
    }

    const dup = await query("SELECT id FROM users WHERE email=$1 AND id<>$2", [email, id])
    if (dup.rows.length > 0) {
      return Response.json({ error: "Email already exists" }, { status: 409 })
    }

    const result = await query(
      `UPDATE users
       SET name=$1, email=$2, phone=$3, address=$4
       WHERE id=$5
       RETURNING id, name, email, phone, address, role, created_at`,
      [name, email, phone, address || "", id],
    )

    if (result.rows.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    const row = result.rows[0]
    return Response.json({
      message: "User updated",
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        createdAt: row.created_at,
      },
    })
  } catch (error) {
    console.error("Update user error:", error)
    return Response.json({ error: "Failed to update user: " + error.message }, { status: 500 })
  }
}

export async function DELETE(req, ctx) {
  try {
    const { id } = await ctx.params

    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)

    // Admin check
    const adminCheck = await query("SELECT role FROM users WHERE id = $1", [decoded.userId])
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 })
    }

    const result = await query("DELETE FROM users WHERE id=$1 RETURNING id", [id])
    if (result.rows.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    return Response.json({ message: "User deleted" })
  } catch (error) {
    console.error("Delete user error:", error)
    return Response.json({ error: "Failed to delete user: " + error.message }, { status: 500 })
  }
}
