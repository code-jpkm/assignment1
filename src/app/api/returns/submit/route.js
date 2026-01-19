import { query } from "@/lib/db-connection"
import { verifyToken, generateOTP } from "@/lib/auth-utils"
import { sendOTPEmail } from "@/lib/email-service"

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const body = await req.json()
    const {
      financialYear,
      totalIncome,
      totalSpent,
      totalSavings,
      totalLoan,
      totalSalaryPaid,
      signatureFile,
      declarationPdf,
    } = body

    const isNil = (v) => v === null || v === undefined || v === ""
    if (
      isNil(financialYear) ||
      isNil(totalIncome) ||
      isNil(totalSpent) ||
      isNil(totalSavings) ||
      isNil(totalLoan) ||
      isNil(totalSalaryPaid) ||
      isNil(signatureFile) ||
      isNil(declarationPdf)
    ) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existingReturn = await query(`SELECT id FROM annual_returns WHERE user_id = $1 AND financial_year = $2`, [
      decoded.userId,
      financialYear,
    ])

    if (existingReturn.rows.length > 0) {
      return Response.json({ error: "Return already exists for this year" }, { status: 409 })
    }

    const returnResult = await query(
      `INSERT INTO annual_returns 
       (user_id, financial_year, total_income, total_spent, total_savings, total_loan, total_salary_paid, signature_file, declaration_pdf, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        decoded.userId,
        financialYear,
        totalIncome,
        totalSpent,
        totalSavings,
        totalLoan,
        totalSalaryPaid,
        signatureFile,
        declarationPdf,
        "draft",
      ],
    )

    const returnId = returnResult.rows[0].id

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await query(
      `INSERT INTO otps (user_id, return_id, otp_code, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [decoded.userId, returnId, otp, expiresAt],
    )

    const userResult = await query("SELECT email, name FROM users WHERE id = $1", [decoded.userId])
    const user = userResult.rows[0]

    try {
      await sendOTPEmail(user.email, otp, user.name)
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError)
    }

    return Response.json({
      message: "OTP sent to your email. Please verify to submit your return.",
      returnId: returnId,
      otp: otp,
    })
  } catch (error) {
    console.error("Submit return error:", error)
    return Response.json({ error: "Submission failed: " + error.message }, { status: 500 })
  }
}
