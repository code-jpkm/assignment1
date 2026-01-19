"use client"
export const dynamic = "force-dynamic"
import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = useMemo(() => searchParams.get("token") || "", [searchParams])
  const role = useMemo(() => {
    const r = searchParams.get("role")
    return r === "admin" ? "admin" : "user"
  }, [searchParams])

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!token) return setError("Invalid reset link. Please request a new one.")
    if (password.length < 6) return setError("Password must be at least 6 characters.")
    if (password !== confirm) return setError("Passwords do not match.")

    setLoading(true)
    try {
      await apiClient.resetPassword(token, role, password)
      setDone(true)
      setTimeout(() => router.push(role === "admin" ? "/admin/login" : "/user/login"), 1200)
    } catch (err) {
      setError(err.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md glass p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-slate-400 text-sm">Choose a new password for your {role} account.</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {done ? (
          <div className="p-4 rounded-2xl border border-green-500/25 bg-green-500/10 text-green-100 text-sm">
            Password updated successfully. Redirecting to login…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
                placeholder="Re-enter new password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-slate-400 text-sm">
          <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300">
            Need a new reset link?
          </Link>
        </div>
      </div>
    </div>
  )
}
