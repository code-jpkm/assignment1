"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import AdminNavbar from "@/components/AdminNavbar"
import SubmissionsList from "@/components/SubmissionsList"
import UserManagement from "@/components/UserManagement"
import { apiClient, tokenManager } from "@/lib/api-client"

function StatCard({ title, value, subtitle }) {
  return (
    <div className="surface p-5 sm:p-6 hover:shadow-[0_18px_50px_-30px_rgba(2,6,23,0.35)] transition">
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
      {subtitle ? <p className="text-sm text-slate-500 mt-2">{subtitle}</p> : null}
    </div>
  )
}

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("submissions")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ users: 0, submissions: 0, approved: 0, pending: 0 })
  const router = useRouter()

  useEffect(() => {
    const storedUser = tokenManager.getUser()
    const token = tokenManager.getToken()
    if (!storedUser || !token) {
      router.push("/admin/login")
      return
    }
    setUser(storedUser)
    setLoading(false)
  }, [router])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [uRes, sRes] = await Promise.all([apiClient.getUsers?.(), apiClient.getSubmissions?.()])
        const users = uRes?.data?.length ?? 0
        const subs = sRes?.data ?? []
        const submissions = subs.length
        const approved = subs.filter((x) => x.status === "approved").length
        const pending = subs.filter((x) => x.status === "submitted").length
        setStats({ users, submissions, approved, pending })
      } catch {
      }
    }
    if (!loading) loadStats()
  }, [loading])

  const greeting = useMemo(() => {
    const hr = new Date().getHours()
    if (hr < 12) return "Good morning"
    if (hr < 18) return "Good afternoon"
    return "Good evening"
  }, [])

  const handleLogout = () => {
    tokenManager.clear()
    router.push("/admin/login")
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
      <AdminNavbar user={user} onLogout={handleLogout} />

      <main className="container-page py-6 sm:py-10 space-y-6 sm:space-y-8">
        <div className="surface p-6 sm:p-8 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-3 sm:gap-4">
            <p className="text-sm text-slate-500">
              {greeting}, <span className="font-semibold text-slate-800">{user?.name || "Admin"}</span>
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Admin Control Center
            </h1>
            <p className="text-slate-600 max-w-2xl">
              Review submissions faster, manage users cleanly, and keep the workflow smooth.
            </p>
          </div>

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <StatCard title="Total Users" value={stats.users} subtitle="Registered accounts" />
            <StatCard title="Total Submissions" value={stats.submissions} subtitle="All-time returns" />
            <StatCard title="Approved" value={stats.approved} subtitle="Verified & accepted" />
            <StatCard title="Pending Review" value={stats.pending} subtitle="Needs action" />
          </div>
        </div>

        <div className="sticky-tabs p-2">
          <div className="tabbar mb-0 border-0 pb-0 px-1">
            <button
              onClick={() => setActiveTab("submissions")}
              className={`tab ${activeTab === "submissions" ? "tab-active" : "tab-inactive"}`}
            >
              Review Submissions
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`tab ${activeTab === "users" ? "tab-active" : "tab-inactive"}`}
            >
              Manage Users
            </button>
          </div>
        </div>

        <section key={activeTab} className="fade-in">
          {activeTab === "submissions" && <SubmissionsList />}
          {activeTab === "users" && <UserManagement />}
        </section>
      </main>
    </div>
  )
}
