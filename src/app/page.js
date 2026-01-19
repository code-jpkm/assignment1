"use client"
import Link from "next/link"

export default function Home() {
  return (
    <div className="app-bg flex flex-col">
      <nav className="nav-surface">
        <div className="container-page py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">AR Declaration System</h1>
            <div className="flex gap-4">
              <Link href="/admin/login" className="nav-link">
                Admin
              </Link>
              <Link href="/user/login" className="nav-link">
                User
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            <span className="gradient-text">Annual Return</span>
            <br />
            Declaration System
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 mb-8">
            A secure platform for submitting and verifying annual return declarations with OTP verification and admin
            approval workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin/login" className="btn btn-primary text-center">
              Admin Login
            </Link>
            <Link href="/user/login" className="btn btn-secondary text-center">
              User Login
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto px-4">
          <div className="card card-hover">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 badge-float">
              <span className="text-white font-bold">1</span>
            </div>
            <h3 className="text-white font-bold mb-2">Secure Login</h3>
            <p className="text-slate-400 text-sm">Separate admin and user authentication systems</p>
          </div>

          <div className="card card-hover">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 badge-float">
              <span className="text-white font-bold">2</span>
            </div>
            <h3 className="text-white font-bold mb-2">Easy Submission</h3>
            <p className="text-slate-400 text-sm">Submit annual returns with comprehensive details</p>
          </div>

          <div className="card card-hover">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 badge-float">
              <span className="text-white font-bold">3</span>
            </div>
            <h3 className="text-white font-bold mb-2">OTP Verification</h3>
            <p className="text-slate-400 text-sm">Secure submission with email-based OTP</p>
          </div>
        </div>
      </main>
    </div>
  )
}
