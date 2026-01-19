"use client"

import { useEffect, useMemo, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { validation } from "@/lib/validation"

function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const save = async () => {
    setError("")

    if (!validation.email.validate(form.email)) return setError(validation.email.message)
    if (!validation.phone.validate(form.phone)) return setError(validation.phone.message)
    if (!form.name?.trim()) return setError("Name is required")

    setSaving(true)
    try {
      const res = await apiClient.updateUser(user.id, form)
      onSaved(res.user)
      onClose()
    } catch (e) {
      setError(e.message || "Failed to update user")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-panel max-w-lg">
        <div className="modal-header">
          <h3 className="text-white font-bold text-lg">Edit User</h3>
          <button onClick={onClose} className="icon-btn" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-900/40 border border-red-700 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="field-label">Name</label>
            <input name="name" value={form.name} onChange={onChange} className="input" />
          </div>

          <div>
            <label className="field-label">Email (User ID)</label>
            <input name="email" value={form.email} onChange={onChange} className="input" />
          </div>

          <div>
            <label className="field-label">Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} className="input" />
          </div>

          <div>
            <label className="field-label">Address</label>
            <textarea name="address" value={form.address} onChange={onChange} className="input" rows={3} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={onClose} className="btn btn-ghost w-full sm:w-auto">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="btn btn-primary w-full sm:flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UserManagement() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const [createdUser, setCreatedUser] = useState(null)

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState("")
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchUsers = async () => {
    setUsersLoading(true)
    setUsersError("")
    try {
      const data = await apiClient.getUsers()
      setUsers(data.data || [])
    } catch (err) {
      setUsersError(err.message || "Failed to load users")
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q))
  }, [users, search])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (!validation.email.validate(formData.email)) {
      setMessageType("error")
      setMessage(validation.email.message)
      setLoading(false)
      return
    }

    if (!validation.phone.validate(formData.phone)) {
      setMessageType("error")
      setMessage(validation.phone.message)
      setLoading(false)
      return
    }

    try {
      const data = await apiClient.createUser(formData.name, formData.email, formData.phone, formData.address)
      setCreatedUser(data.user)
      setMessageType("success")
      setMessage("User created successfully!")
      setFormData({ name: "", email: "", phone: "", address: "" })
      fetchUsers()
    } catch (err) {
      setMessageType("error")
      setMessage(err.message || "Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id) => {
    const ok = confirm("Delete this user? This action cannot be undone.")
    if (!ok) return

    setDeletingId(id)
    try {
      await apiClient.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (e) {
      alert(e.message || "Failed to delete user")
    } finally {
      setDeletingId(null)
    }
  }

  const onSaved = (updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Create form */}
      <div className="surface p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Create New User</h3>

        {message && (
          <div
            className={`mb-4 p-4 rounded text-sm ${
              messageType === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="+91 9876543210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Full address"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>

        {createdUser && (
          <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-blue-900">Credentials sent</p>
                <p className="text-sm text-blue-700">
                  Login: <a className="underline break-all" href={createdUser.loginUrl}>{createdUser.loginUrl}</a>
                </p>
                <p className="text-sm text-blue-700">User ID: {createdUser.email}</p>
                <p className="text-sm text-blue-700">Temp Password: <span className="font-mono">{createdUser.autoPassword}</span></p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const txt = `Login URL: ${createdUser.loginUrl}\nUser ID: ${createdUser.email}\nPassword: ${createdUser.autoPassword}`
                  navigator.clipboard?.writeText(txt)
                }}
                className="px-3 py-2 text-sm font-semibold rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users list */}
      <div className="surface p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xl font-bold text-slate-900">Users</h3>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name/email/phone..."
              className="px-3 py-2 rounded-lg border border-slate-300 w-full sm:w-64"
            />
            <button onClick={fetchUsers} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold">
              Refresh
            </button>
          </div>
        </div>

        {usersError && <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">{usersError}</div>}

        {usersLoading ? (
          <div className="space-y-3">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-600">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => setEditing(u)}
                          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          disabled={deletingId === u.id}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-semibold disabled:opacity-60"
                        >
                          {deletingId === u.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} onSaved={onSaved} />}
    </div>
  )
}
