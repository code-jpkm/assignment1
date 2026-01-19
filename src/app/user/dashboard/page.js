"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import UserNavbar from "@/components/UserNavbar"
import ReturnStatus from "@/components/ReturnStatus"
import DeclarationForm from "@/components/DeclarationForm"
import { tokenManager } from "@/lib/api-client"

export default function UserDashboard() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("status")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = tokenManager.getUser()
    const token = tokenManager.getToken()
    if (!storedUser || !token) {
      router.push("/user/login")
      return
    }
    setUser(storedUser)
    setLoading(false)
  }, [router])

  const greeting = useMemo(() => {
    const hr = new Date().getHours()
    if (hr < 12) return "Good morning"
    if (hr < 18) return "Good afternoon"
    return "Good evening"
  }, [])

  const handleLogout = () => {
    tokenManager.clear()
    router.push("/user/login")
  }

  if (loading) {
    return (
      <div className="dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="dashboard-bg">
      <UserNavbar user={user} onLogout={handleLogout} />

      <main className="container-page py-6 sm:py-10 space-y-6 sm:space-y-8">
        <div className="surface p-6 sm:p-8">
          <p className="text-sm text-slate-500">
            {greeting}, <span className="font-semibold text-slate-800">{user?.name || "User"}</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
            Your Return Workspace
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Check your declaration status or submit a new return with OTP verification.
          </p>
        </div>

        <div className="sticky-tabs p-2">
          <div className="tabbar mb-0 border-0 pb-0 px-1">
            <button
              onClick={() => setActiveTab("status")}
              className={`tab ${activeTab === "status" ? "tab-active" : "tab-inactive"}`}
            >
              Check Status
            </button>
            <button
              onClick={() => setActiveTab("declare")}
              className={`tab ${activeTab === "declare" ? "tab-active" : "tab-inactive"}`}
            >
              Declare Return
            </button>
          </div>
        </div>

        <section key={activeTab} className="fade-in">
          {activeTab === "status" && <ReturnStatus />}
          {activeTab === "declare" && <DeclarationForm />}
        </section>
      </main>
    </div>
  )
}
