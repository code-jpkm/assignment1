"use client"

export default function ErrorAlert({ message, onClose }) {
  return (
    <div className="fixed top-4 right-4 max-w-sm bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 animate-slide-in">
      <div className="flex gap-3">
        <svg
          className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">{message}</p>
        </div>
        <button onClick={onClose} className="text-red-400 hover:text-red-600">
          ×
        </button>
      </div>
    </div>
  )
}
