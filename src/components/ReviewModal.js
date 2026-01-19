"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function ReviewModal({ submission, onClose, onComplete }) {
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [action, setAction] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [detailError, setDetailError] = useState("")

  const toDataUrl = (value, mime) => {
    if (!value) return ""
    if (typeof value === "string" && (value.startsWith("data:") || value.startsWith("http"))) return value
    return `data:${mime};base64,${value}`
  }
  const money = (v) => {
    const n = Number(v)
    return Number.isFinite(n) ? n.toLocaleString() : "0"
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    window.addEventListener("keydown", onKey)

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setDetailLoading(true)
      setDetailError("")
      try {
        const res = await apiClient.getSubmissionDetail(submission.id)
        if (alive) setDetail(res.data)
      } catch (e) {
        console.error("Failed to load submission detail", e)
        if (alive) setDetailError(e?.message || "Failed to load attachments")
      } finally {
        if (alive) setDetailLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [submission.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!action) return setError("Please select an action (Approve or Reject).")
    if (action === "reject" && !reason.trim()) return setError("Please provide a reason for rejection.")

    setLoading(true)
    try {
      await apiClient.reviewSubmission(submission.id, action, reason)
      onComplete(submission.id)
    } catch (err) {
      setError(err.message || "Failed to process review")
    } finally {
      setLoading(false)
    }
  }

  const s = detail || submission
  const signatureSrc = toDataUrl(s.signatureFile, "image/png")
  const pdfSrc = toDataUrl(s.declarationPdf, "application/pdf")
  const statusPill =
    s.status === "approved"
      ? "pill-green"
      : s.status === "rejected"
        ? "pill-red"
        : "pill-blue"

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-panel" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <h3 className="text-lg sm:text-xl font-extrabold text-white">Review Submission</h3>
            <span className={`pill ${statusPill}`}>{s.status.toUpperCase()}</span>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="dropzone">
            <h4 className="text-white font-extrabold mb-3">User Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Name</p>
                <p className="text-white font-semibold">{s.userName}</p>
              </div>
              <div>
                <p className="text-slate-400">Email</p>
                <p className="text-white font-semibold break-all">{s.userEmail}</p>
              </div>
              <div>
                <p className="text-slate-400">Phone</p>
                <p className="text-white font-semibold">{s.userPhone}</p>
              </div>
              <div>
                <p className="text-slate-400">Address</p>
                <p className="text-white font-semibold">{s.userAddress}</p>
              </div>
            </div>
          </div>

          <div className="dropzone">
            <h4 className="text-white font-extrabold mb-3">Return Details ({s.financialYear})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Total Income</p>
                <p className="text-white font-semibold">₹{money(s.totalIncome)}</p>
              </div>
              <div>
                <p className="text-slate-400">Total Spent</p>
                <p className="text-white font-semibold">₹{money(s.totalSpent)}</p>
              </div>
              <div>
                <p className="text-slate-400">Total Savings</p>
                <p className="text-white font-semibold">₹{money(s.totalSavings)}</p>
              </div>
              <div>
                <p className="text-slate-400">Total Loan</p>
                <p className="text-white font-semibold">₹{money(s.totalLoan)}</p>
              </div>
              <div>
                <p className="text-slate-400">Salary Paid</p>
                <p className="text-white font-semibold">
                  ₹{money(s.totalSalaryPaid)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Submitted</p>
                <p className="text-white font-semibold">
                  {s.submissionDate ? new Date(s.submissionDate).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="dropzone">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h4 className="text-white font-extrabold">Documents</h4>
              {detailLoading ? <span className="pill pill-blue">Loading…</span> : <span className="pill bg-white/10 text-slate-200 border border-white/10">Preview</span>}
            </div>

            {detailError ? (
              <div className="mb-4 p-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-200 text-sm fade-in">
                {detailError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-2">Signature</p>
                {signatureSrc ? (
                  <img src={signatureSrc} alt="Signature preview" className="w-full max-h-64 object-contain rounded-2xl border border-white/10 bg-white/5" />
                ) : (
                  <div className="text-slate-400 text-sm">No signature found.</div>
                )}
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-2">Declaration PDF</p>
                {pdfSrc ? (
                  <iframe
                    title="Declaration PDF"
                    src={pdfSrc}
                    className="w-full h-64 rounded-2xl border border-white/10 bg-white/5"
                  />
                ) : (
                  <div className="text-slate-400 text-sm">No PDF found.</div>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="dropzone">
            <h4 className="text-white font-extrabold mb-3">Decision</h4>

            {error && (
              <div className="mb-4 p-4 rounded-2xl border border-red-500/25 bg-red-500/10 text-red-200 text-sm fade-in">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="field-label">Action</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAction("approve")}
                    className={`btn w-full ${action === "approve" ? "btn-primary" : "btn-ghost"}`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction("reject")}
                    className={`btn w-full ${action === "reject" ? "btn-danger" : "btn-ghost"}`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {action === "reject" && (
                <div>
                  <label className="field-label">Rejection Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows="3"
                    className="input"
                    placeholder="Explain why you're rejecting this submission..."
                    required
                  />
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
                {loading ? "Processing..." : action === "approve" ? "Approve Submission" : "Submit Decision"}
              </button>

              <p className="help-text">Tip: Press ESC to close. Click outside modal to dismiss.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
