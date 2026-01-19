import { query } from "@/lib/db-connection"

export async function PUT(req, { params }) {
  try {
    const { id } = params
    const { name, email, phone, address } = await req.json()

    if (!name || !email || !phone) {
      return Response.json({ error: "Name, email and phone are required" }, { status: 400 })
    }

    // Prevent duplicate email
    const dup = await query(
      "SELECT id FROM users WHERE email = $1 AND id <> $2",
      [email, id]
    )
    if (dup.rows.length > 0) {
      return Response.json({ error: "Email already exists" }, { status: 409 })
    }

    const result = await query(
      `UPDATE users
       SET name=$1, email=$2, phone=$3, address=$4
       WHERE id=$5 AND role='user'
       RETURNING id, name, email, phone, address, role, created_at AS "createdAt"`,
      [name, email, phone, address || "", id]
    )

    if (result.rows.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    return Response.json({ message: "User updated", user: result.rows[0] })
  } catch (error) {
    console.error("PUT user error:", error)
    return Response.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params

    const result = await query(
      "DELETE FROM users WHERE id=$1 AND role='user' RETURNING id",
      [id]
    )

    if (result.rows.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    return Response.json({ message: "User deleted" })
  } catch (error) {
    console.error("DELETE user error:", error)
    return Response.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
