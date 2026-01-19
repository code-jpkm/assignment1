"use client"

import { useMemo, useState } from "react"
import OTPVerification from "./OTPVerification"
import { apiClient } from "@/lib/api-client"
import { fileUtils } from "@/lib/file-utils"
import { validation } from "@/lib/validation"

function CurrencyInput({ label, name, value, onChange, required = true }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-slate-200">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          className="input pl-9"
          placeholder="0"
          min="0"
          required={required}
          inputMode="numeric"
        />
      </div>
    </div>
  )
}

function Stepper({ step }) {
  const items = [
    { k: 1, t: "Details" },
    { k: 2, t: "OTP Verify" },
  ]
  return (
    <div className="flex items-center gap-3">
      {items.map((x, idx) => {
        const done = step > x.k
        const active = step === x.k
        return (
          <div key={x.k} className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold
                ${done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-white/10 text-slate-300"}`}
              title={x.t}
            >
              {done ? "✓" : x.k}
            </div>
            <div className="hidden sm:block">
              <p className={`text-sm font-bold ${active ? "text-white" : "text-slate-300"}`}>{x.t}</p>
              <p className="text-xs text-slate-400">{active ? "In progress" : done ? "Completed" : "Pending"}</p>
            </div>
            {idx !== items.length - 1 && <div className="w-10 sm:w-14 h-px bg-white/10" />}
          </div>
        )
      })}
    </div>
  )
}

export default function DeclarationForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    financialYear: new Date().getFullYear(),
    totalIncome: "",
    totalSpent: "",
    totalSavings: "",
    totalLoan: "",
    totalSalaryPaid: "",
  })
  const [files, setFiles] = useState({ signatureFile: null, declarationPdf: null })
  const [fileNames, setFileNames] = useState({ signatureFile: "", declarationPdf: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [returnId, setReturnId] = useState(null)

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear()
    return [...Array(6)].map((_, i) => now - i)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e) => {
    const { name, files: fileList } = e.target
    if (!fileList || !fileList[0]) return
    const file = fileList[0]

    if (!fileUtils.validateFileSize(file, 5)) {
      setError("File size too large. Maximum 5MB allowed.")
      return
    }

    if (name === "signatureFile" && !["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setError("Signature must be PNG or JPG image.")
      return
    }
    if (name === "declarationPdf" && file.type !== "application/pdf") {
      setError("Declaration must be a PDF file.")
      return
    }

    try {
      const base64 = await fileUtils.fileToBase64(file)
      setFiles((prev) => ({ ...prev, [name]: base64 }))
      setFileNames((prev) => ({ ...prev, [name]: file.name }))
      setError("")
    } catch {
      setError("Failed to read file.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!files.signatureFile || !files.declarationPdf) {
      setError("Please upload both signature and declaration PDF.")
      setLoading(false)
      return
    }

    if (!validation.year.validate(formData.financialYear)) {
      setError(validation.year.message)
      setLoading(false)
      return
    }

    try {
      const data = await apiClient.submitReturn({
        financialYear: formData.financialYear,
        totalIncome: Number.parseFloat(formData.totalIncome),
        totalSpent: Number.parseFloat(formData.totalSpent),
        totalSavings: Number.parseFloat(formData.totalSavings),
        totalLoan: Number.parseFloat(formData.totalLoan),
        totalSalaryPaid: Number.parseFloat(formData.totalSalaryPaid),
        signatureFile: files.signatureFile,
        declarationPdf: files.declarationPdf,
      })
      setReturnId(data.returnId)
      setStep(2)
    } catch (err) {
      setError(err.message || "Submission failed.")
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) return <OTPVerification returnId={returnId} />

  return (
    <div className="max-w-3xl mx-auto">
      <div className="app-bg rounded-3xl p-[1px]">
        <div className="glass p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-extrabold text-white">Declare Annual Return</h3>
              <p className="text-slate-400 text-sm mt-1">Fill details, upload documents, then verify OTP.</p>
            </div>
            <Stepper step={step} />
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-2xl border border-red-500/25 bg-red-500/10 text-red-200 text-sm fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Year */}
            <div className="dropzone">
              <label className="field-label">Financial Year</label>
              <select name="financialYear" value={formData.financialYear} onChange={handleChange} className="input">
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr} className="text-slate-900">
                    {yr}-{yr + 1}
                  </option>
                ))}
              </select>
              <p className="help-text">Choose the year for which you are filing the declaration.</p>
            </div>

            <div className="dropzone">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h4 className="text-white font-extrabold">Income & Expenditure</h4>
                <span className="pill pill-blue">Auto-validated</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CurrencyInput label="Total Income" name="totalIncome" value={formData.totalIncome} onChange={handleChange} />
                <CurrencyInput label="Total Amount Spent" name="totalSpent" value={formData.totalSpent} onChange={handleChange} />
                <CurrencyInput label="Total Amount Savings" name="totalSavings" value={formData.totalSavings} onChange={handleChange} />
                <CurrencyInput label="Total Amount Loan" name="totalLoan" value={formData.totalLoan} onChange={handleChange} />
                <div className="sm:col-span-2">
                  <CurrencyInput
                    label="Total Salary Paid"
                    name="totalSalaryPaid"
                    value={formData.totalSalaryPaid}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="dropzone">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h4 className="text-white font-extrabold">Upload Documents</h4>
                <span className="pill bg-white/10 text-slate-200 border border-white/10">Max 5MB each</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="field-label">Signature (PNG/JPG)</label>
                  <input
                    type="file"
                    name="signatureFile"
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/jpg"
                    className="input"
                    required
                  />
                  {fileNames.signatureFile ? (
                    <p className="text-xs text-green-300 fade-in">✓ {fileNames.signatureFile}</p>
                  ) : (
                    <p className="help-text">Upload a clear signature image.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="field-label">Declaration Letter (PDF)</label>
                  <input
                    type="file"
                    name="declarationPdf"
                    onChange={handleFileChange}
                    accept=".pdf,application/pdf"
                    className="input"
                    required
                  />
                  {fileNames.declarationPdf ? (
                    <p className="text-xs text-green-300 fade-in">✓ {fileNames.declarationPdf}</p>
                  ) : (
                    <p className="help-text">Upload the signed PDF declaration.</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit & Continue to OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
