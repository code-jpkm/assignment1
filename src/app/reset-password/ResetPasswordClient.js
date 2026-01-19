"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function ResetPasswordClient({ token }) {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await apiClient.resetPassword(token, password)
      setSuccess(true)
    } catch (err) {
      setError(err.message || "Reset failed")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return <div className="text-green-300">Password reset successful.</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
        required
      />

      <button className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      {error && <div className="text-red-400">{error}</div>}
    </form>
  )
}
