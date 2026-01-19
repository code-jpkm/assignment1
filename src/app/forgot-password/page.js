"use client"
export const dynamic = "force-dynamic"
import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const initialRole = useMemo(() => {
    const r = searchParams.get("role")
    return r === "admin" ? "admin" : "user"
  }, [searchParams])

  const [role, setRole] = useState(initialRole)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await apiClient.forgotPassword(email, role)
      setSent(true)
    } catch (err) {
      setError(err.message || "Failed to request reset")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md glass p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
          <p className="text-slate-400 text-sm">We’ll email you a reset link (valid for 30 minutes).</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {sent ? (
          <div className="p-4 rounded-2xl border border-green-500/25 bg-green-500/10 text-green-100 text-sm">
            If an account exists, a reset link has been sent to your email.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Account Type</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
                <option value="user" className="text-slate-900">User</option>
                <option value="admin" className="text-slate-900">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-slate-400 text-sm">
          <Link href={role === "admin" ? "/admin/login" : "/user/login"} className="text-blue-400 hover:text-blue-300">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
