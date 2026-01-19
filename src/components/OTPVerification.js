"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

export default function OTPVerification({ returnId }) {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (otp.length === 6) {
      // small micro-interaction: auto blur on completion
      const el = document.getElementById("otp-input")
      el?.blur?.()
    }
  }, [otp])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await apiClient.verifyOTP(returnId, otp)
      setSuccess(true)
      setTimeout(() => router.push("/user/dashboard"), 1500)
    } catch (err) {
      setError(err.message || "OTP verification failed")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="surface p-8 text-center fade-in">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_18px_50px_-30px_rgba(22,163,74,0.9)]">
            <span className="text-white text-3xl">✓</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Submission Verified!</h3>
          <p className="text-slate-600 mb-4">Your annual return has been successfully verified and submitted.</p>
          <p className="text-sm text-slate-500">Redirecting…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="app-bg rounded-3xl p-[1px]">
        <div className="glass p-6 sm:p-8">
          <h3 className="text-2xl font-extrabold text-white mb-2">Verify OTP</h3>
          <p className="text-slate-400 text-sm mb-6">Enter the 6-digit OTP sent to your email.</p>

          {error && (
            <div className="mb-4 p-4 rounded-2xl border border-red-500/25 bg-red-500/10 text-red-200 text-sm fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">OTP Code</label>
              <input
                id="otp-input"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength="6"
                placeholder="000000"
                className="input text-center text-2xl tracking-[0.35em] font-mono"
                required
              />
              <p className="help-text">Tip: paste the OTP directly. It will auto-format.</p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
