"use client"

import { useState } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

export default function ForgotPasswordClient({ initialRole }) {
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
        <h2 className="text-3xl font-bold text-white mb-2">
          Forgot Password
        </h2>

        {error && <div className="text-red-400 mb-4">{error}</div>}

        {sent ? (
          <div className="text-green-300">
            Reset link sent if account exists.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />

            <button className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <Link
          href={role === "admin" ? "/admin/login" : "/user/login"}
          className="text-blue-400 block mt-6 text-center"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}
