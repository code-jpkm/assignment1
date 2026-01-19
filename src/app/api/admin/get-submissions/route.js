import { query } from "@/lib/db-connection"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)

    // Check if user is admin
    const adminCheck = await query("SELECT role FROM users WHERE id = $1", [decoded.userId])
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get all submissions with user details
    const result = await query(
      `SELECT 
        ar.id, ar.user_id, ar.financial_year, ar.total_income, ar.total_spent, 
        ar.total_savings, ar.total_loan, ar.total_salary_paid, ar.status, 
        ar.submission_date, ar.approved_date, ar.rejection_reason, ar.created_at,
        u.name, u.email, u.phone, u.address
       FROM annual_returns ar
       JOIN users u ON ar.user_id = u.id
       WHERE ar.status IN ('submitted','approved','rejected')
       ORDER BY ar.submission_date DESC`,
    )

    const submissions = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
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
      userName: row.name,
      userEmail: row.email,
      userPhone: row.phone,
      userAddress: row.address,
    }))

    return Response.json({ data: submissions })
  } catch (error) {
    console.error("Get submissions error:", error)
    return Response.json({ error: "Failed to fetch submissions: " + error.message }, { status: 500 })
  }
}
