"use client"

import { useState, useEffect } from "react"
import ReviewModal from "./ReviewModal"
import { apiClient } from "@/lib/api-client"

export default function SubmissionsList() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await apiClient.getSubmissions()
      setSubmissions(data.data || [])
    } catch (err) {
      setError(err.message || "Failed to fetch submissions")
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  const handleReviewComplete = () => {
    setSelectedSubmission(null)
    fetchSubmissions()
  }

  const filtered = filterStatus === "all" ? submissions : submissions.filter((s) => s.status === filterStatus)

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-slate-600">Loading submissions...</p>
      </div>
    )
  }

  return (
    <div>
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      <div className="tabbar mb-6">
        {["all", "submitted", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`tab ${filterStatus === status ? "tab-active" : "tab-inactive"}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} (
            {submissions.filter((s) => (status === "all" ? true : s.status === status)).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-600">No submissions found</div>
      ) : (
        <div className="overflow-x-auto surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">User Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Year</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Income</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((submission) => (
                <tr key={submission.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-sm text-slate-900">{submission.userName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{submission.userEmail}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{submission.financialYear}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    ₹{Number.parseFloat(submission.totalIncome).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        submission.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : submission.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {submission.status === "submitted" && (
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubmission && (
        <ReviewModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onComplete={handleReviewComplete}
        />
      )}
    </div>
  )
}
