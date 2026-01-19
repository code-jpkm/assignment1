import { query } from "@/lib/db-connection"
import { verifyToken } from "@/lib/auth-utils"
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email-service"

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { returnId, action, reason } = await req.json()

    if (!returnId || !action || (action === "reject" && !reason)) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["approve", "reject"].includes(action)) {
      return Response.json({ error: "Invalid action" }, { status: 400 })
    }

    const adminCheck = await query("SELECT role FROM users WHERE id = $1", [decoded.userId])
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 })
    }

    const returnResult = await query("SELECT user_id, financial_year, status FROM annual_returns WHERE id = $1", [
      returnId,
    ])

    if (returnResult.rows.length === 0) {
      return Response.json({ error: "Return not found" }, { status: 404 })
    }

    const returnRecord = returnResult.rows[0]

    if (returnRecord.status === "approved" || returnRecord.status === "rejected") {
      return Response.json({ error: "Return already reviewed" }, { status: 400 })
    }
    const newStatus = action === "approve" ? "approved" : "rejected"
    const updateQuery =
      action === "approve"
        ? `UPDATE annual_returns SET status = $1, approved_date = CURRENT_TIMESTAMP WHERE id = $2`
        : `UPDATE annual_returns SET status = $1, rejection_reason = $2, approved_date = CURRENT_TIMESTAMP WHERE id = $3`

    const params = action === "approve" ? [newStatus, returnId] : [newStatus, reason, returnId]
    await query(updateQuery, params)

    const userResult = await query("SELECT name, email FROM users WHERE id = $1", [returnRecord.user_id])
    const user = userResult.rows[0]

    try {
      if (action === "approve") {
        await sendApprovalEmail(user.email, user.name, returnRecord.financial_year)
      } else {
        await sendRejectionEmail(user.email, user.name, returnRecord.financial_year, reason)
      }
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError)
    }

    return Response.json({
      message: `Return ${action === "approve" ? "approved" : "rejected"} successfully`,
    })
  } catch (error) {
    console.error("Review submission error:", error)
    return Response.json({ error: "Review failed: " + error.message }, { status: 500 })
  }
}
