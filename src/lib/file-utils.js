// File handling utilities for Base64 encoding/decoding

export const fileUtils = {
  // Convert file to Base64
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  },

  // Validate file size
  validateFileSize(file, maxSizeMB = 5) {
    const maxBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxBytes
  },

  // Validate file type
  validateFileType(file, allowedTypes = []) {
    return allowedTypes.includes(file.type)
  },

  // Get file size in MB
  getFileSizeMB(file) {
    return (file.size / (1024 * 1024)).toFixed(2)
  },

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  },
}
