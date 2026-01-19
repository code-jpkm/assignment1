"use client"

import Link from "next/link"

export default function AdminNavbar({ user, onLogout }) {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container-page">
        <div className="flex justify-between items-center h-16">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-600 shadow-[0_14px_40px_-24px_rgba(37,99,235,0.95)]">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-slate-900 hidden sm:inline tracking-tight">Admin Dashboard</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <button onClick={onLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
