import { query } from "@/lib/db-connection"
import { verifyToken } from "@/lib/auth-utils"

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { year } = await req.json()

    if (!year) {
      return Response.json({ error: "Year is required" }, { status: 400 })
    }

    // Check if return already exists for this year
    const result = await query(
      `SELECT 
         id,
         financial_year,
         total_income,
         total_spent,
         total_savings,
         total_loan,
         total_salary_paid,
         status,
         submission_date,
         approved_date,
         rejection_reason,
         created_at
       FROM annual_returns 
       WHERE user_id = $1 AND financial_year = $2`,
      [decoded.userId, year],
    )

    if (result.rows.length > 0) {
      const row = result.rows[0]
      const returnData = {
        id: row.id,
        financialYear: row.financial_year,
        totalIncome: row.total_income,
        totalSpent: row.total_spent,
        totalSavings: row.total_savings,
        totalLoan: row.total_loan,
        totalSalaryPaid: row.total_salary_paid,
        status: row.status,
        submissionDate: row.submission_date,
        approvedDate: row.approved_date,
        rejectionReason: row.rejection_reason,
        createdAt: row.created_at,
      }
      return Response.json({
        declared: true,
        data: returnData,
      })
    }

    return Response.json({
      declared: false,
      data: null,
    })
  } catch (error) {
    console.error("Check return error:", error)
    return Response.json({ error: "Check failed: " + error.message }, { status: 500 })
  }
}
