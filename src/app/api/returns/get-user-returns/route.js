import { query } from "@/lib/db-connection"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)

    // Get all returns for the user
    const result = await query(
      `SELECT 
        id, financial_year, total_income, total_spent, total_savings, 
        total_loan, total_salary_paid, status, submission_date, 
        approved_date, rejection_reason, created_at
       FROM annual_returns
       WHERE user_id = $1
       ORDER BY financial_year DESC`,
      [decoded.userId],
    )

    const returns = result.rows.map((row) => ({
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
    }))

    return Response.json({ data: returns })
  } catch (error) {
    console.error("Get user returns error:", error)
    return Response.json({ error: "Failed to fetch returns: " + error.message }, { status: 500 })
  }
}
