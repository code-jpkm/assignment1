// Client-side API calls with JWT token handling
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    }

    if (token) headers.Authorization = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      headers,
    })

    // If unauthorized, clear token and kick user out.
    // IMPORTANT: Do NOT auto-redirect for the login endpoint itself,
    // otherwise wrong-password attempts will bounce users to the homepage.
    const isAuthEndpoint = endpoint.startsWith("/auth/")
    const isLoginAttempt = endpoint === "/auth/login"

    if (response.status === 401 && typeof window !== "undefined" && !isLoginAttempt) {
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")
      window.location.href = isAuthEndpoint ? "/" : "/"
      return
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`)
    }

    return data
  },

  // Auth endpoints
  login(email, password, role) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    })
  },

  forgotPassword(email, role) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    })
  },

  resetPassword(token, role, newPassword) {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, role, newPassword }),
    })
  },

  verifyToken(token) {
    return this.request("/auth/verify-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  },

  // Admin endpoints
  createUser(name, email, phone, address) {
    return this.request("/auth/create-user", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, address }),
    })
  },

  // ✅ Users (Admin CRUD)
  getUsers() {
    return this.request("/admin/get-users", { method: "GET" })
  },

  updateUser(id, payload) {
    return this.request(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },

  deleteUser(id) {
    return this.request(`/admin/users/${id}`, { method: "DELETE" })
  },

  // Submissions
  getSubmissions() {
    return this.request("/admin/get-submissions", { method: "GET" })
  },

  getSubmissionDetail(id) {
    return this.request(`/admin/submission/${id}`, { method: "GET" })
  },

  reviewSubmission(returnId, action, reason) {
    return this.request("/admin/review-submission", {
      method: "POST",
      body: JSON.stringify({ returnId, action, reason }),
    })
  },

  // User endpoints
  checkReturnStatus(year) {
    return this.request("/returns/check", {
      method: "POST",
      body: JSON.stringify({ year }),
    })
  },

  submitReturn(returnData) {
    return this.request("/returns/submit", {
      method: "POST",
      body: JSON.stringify(returnData),
    })
  },

  verifyOTP(returnId, otp) {
    return this.request("/returns/verify-otp", {
      method: "POST",
      body: JSON.stringify({ returnId, otp }),
    })
  },

  getUserReturns() {
    return this.request("/returns/get-user-returns", { method: "GET" })
  },
}

// Token management
export const tokenManager = {
  setToken(token, user) {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token)
      localStorage.setItem("user", JSON.stringify(user))
    }
  },

  getToken() {
    if (typeof window !== "undefined") return localStorage.getItem("authToken")
    return null
  },

  getUser() {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      return user ? JSON.parse(user) : null
    }
    return null
  },

  clear() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")
    }
  },

  isAuthenticated() {
    return this.getToken() !== null
  },
}
