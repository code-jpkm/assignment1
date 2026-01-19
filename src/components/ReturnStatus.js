"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function ReturnStatus() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const money = (v) => {
    const n = Number(v)
    return Number.isFinite(n) ? n.toLocaleString() : "0"
  }

  const handleCheck = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await apiClient.checkReturnStatus(year)
      setStatus(data)
    } catch (err) {
      setError(err.message || "Failed to check status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="surface p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Check Return Status</h3>
            <p className="text-slate-600 text-sm mt-1">Enter a year to see submission and approval status.</p>
          </div>
          <div className="pill pill-blue">Fast lookup</div>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm fade-in">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number.parseInt(e.target.value || `${new Date().getFullYear()}`))}
            min="2000"
            max={new Date().getFullYear() + 1}
            className="w-full sm:flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
          />

          <button
            onClick={handleCheck}
            disabled={loading}
            className="btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Checking..." : "Check Status"}
          </button>
        </div>
      </div>

      {/* Result */}
      {status && (
        <div className="mt-6 surface p-6 sm:p-8 fade-in">
          {status.declared ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h4 className="text-xl font-extrabold text-slate-900">Return Declared for {year}</h4>
                <span
                  className={`pill ${
                    status.data.status === "approved"
                      ? "pill-green"
                      : status.data.status === "rejected"
                        ? "pill-red"
                        : "pill-blue"
                  }`}
                >
                  {status.data.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <p className="text-slate-500 font-semibold">Total Income</p>
                  <p className="text-lg font-extrabold text-slate-900">
                    ₹{money(status.data.totalIncome)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <p className="text-slate-500 font-semibold">Total Amount Spent</p>
                  <p className="text-lg font-extrabold text-slate-900">
                    ₹{money(status.data.totalSpent)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <p className="text-slate-500 font-semibold">Total Amount Savings</p>
                  <p className="text-lg font-extrabold text-slate-900">
                    ₹{money(status.data.totalSavings)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <p className="text-slate-500 font-semibold">Total Amount Loan</p>
                  <p className="text-lg font-extrabold text-slate-900">
                    ₹{money(status.data.totalLoan)}
                  </p>
                </div>
              </div>

              {status.data.status === "rejected" && status.data.rejectionReason && (
                <div className="p-4 rounded-2xl border border-red-200 bg-red-50">
                  <p className="font-extrabold text-red-800 mb-1">Rejection Reason</p>
                  <p className="text-red-700">{status.data.rejectionReason}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-xl font-extrabold text-slate-900">No Return Declared for {year}</h4>
                <p className="text-slate-600 mt-1">Go to “Declare Return” tab to submit your annual return.</p>
              </div>
              <span className="pill pill-amber">Not submitted</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
