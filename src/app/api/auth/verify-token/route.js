import { verifyToken } from "@/lib/auth-utils"

export async function POST(req) {
  try {
    const { token } = await req.json()

    if (!token) {
      return Response.json({ error: "Token required" }, { status: 400 })
    }

    const decoded = verifyToken(token)

    return Response.json({
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    })
  } catch (error) {
    return Response.json({ error: "Invalid token" }, { status: 401 })
  }
}
