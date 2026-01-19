import { query } from "@/lib/db-connection"
import { verifyToken } from "@/lib/auth-utils"
import { sendSubmissionEmail } from "@/lib/email-service"

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { returnId, otp } = await req.json()

    if (!returnId || !otp) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find OTP
    const otpResult = await query(
      `SELECT id, is_verified, expires_at FROM otps 
       WHERE return_id = $1 AND user_id = $2 AND otp_code = $3`,
      [returnId, decoded.userId, otp],
    )

    if (otpResult.rows.length === 0) {
      return Response.json({ error: "Invalid OTP" }, { status: 400 })
    }

    const otpRecord = otpResult.rows[0]

    // Check if OTP is already verified
    if (otpRecord.is_verified) {
      return Response.json({ error: "OTP already verified" }, { status: 400 })
    }

    // Check if OTP expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return Response.json({ error: "OTP expired" }, { status: 400 })
    }

    // Mark OTP as verified
    await query("UPDATE otps SET is_verified = TRUE WHERE id = $1", [otpRecord.id])

    // OTP verified => NOW we consider the return officially submitted (pending admin review)
    await query(
      `UPDATE annual_returns SET status = $1, submission_date = CURRENT_TIMESTAMP WHERE id = $2`,
      ["submitted", returnId],
    )

    // Send submission confirmation email (under review)
    try {
      const userResult = await query("SELECT email, name FROM users WHERE id = $1", [decoded.userId])
      const user = userResult.rows[0]

      const yrResult = await query("SELECT financial_year FROM annual_returns WHERE id = $1", [returnId])
      const financialYear = yrResult.rows[0]?.financial_year

      if (user?.email) await sendSubmissionEmail(user.email, user.name, financialYear)
    } catch (emailError) {
      console.error("Failed to send submission email:", emailError)
    }

    return Response.json({
      message: "OTP verified successfully. Your return has been submitted for admin review.",
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return Response.json({ error: "OTP verification failed: " + error.message }, { status: 500 })
  }
}
