import { query } from "@/lib/db-connection"

export async function GET() {
  try {
    const result = await query(
      `SELECT id, name, email, phone, address, role, created_at AS "createdAt"
       FROM users
       WHERE role = 'user'
       ORDER BY created_at DESC`
    )

    return Response.json({ data: result.rows })
  } catch (error) {
    console.error("GET users error:", error)
    return Response.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
