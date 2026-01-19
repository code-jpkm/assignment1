import { query } from "@/lib/db-connection"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(req, { params }) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)

    const adminCheck = await query("SELECT role FROM users WHERE id = $1", [decoded.userId])
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 })
    }

    const id = params?.id
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 })

    const result = await query(
      `SELECT
         ar.id,
         ar.user_id,
         ar.financial_year,
         ar.total_income,
         ar.total_spent,
         ar.total_savings,
         ar.total_loan,
         ar.total_salary_paid,
         ar.signature_file,
         ar.declaration_pdf,
         ar.status,
         ar.submission_date,
         ar.approved_date,
         ar.rejection_reason,
         u.name as user_name,
         u.email as user_email,
         u.phone as user_phone,
         u.address as user_address
       FROM annual_returns ar
       JOIN users u ON ar.user_id = u.id
       WHERE ar.id = $1
       LIMIT 1`,
      [id],
    )

    if (result.rows.length === 0) {
      return Response.json({ error: "Return not found" }, { status: 404 })
    }

    const row = result.rows[0]

    const asDataUrl = (value, mime) => {
      if (!value) return null
      if (typeof value === "string" && value.startsWith("data:")) return value
      return `data:${mime};base64,${value}`
    }

    return Response.json({
      data: {
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
        // Stored values may be raw base64 OR already a data-uri.
        signatureFile: asDataUrl(row.signature_file, "image/png"),
        declarationPdf: asDataUrl(row.declaration_pdf, "application/pdf"),
        userName: row.user_name,
        userEmail: row.user_email,
        userPhone: row.user_phone,
        userAddress: row.user_address,
      },
    })
  } catch (error) {
    console.error("Get submission detail error:", error)
    return Response.json({ error: "Failed to fetch submission: " + error.message }, { status: 500 })
  }
}
