// Form validation utilities

export const validation = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    validate: (email) => {
      return validation.email.pattern.test(email)
    },
    message: "Please enter a valid email address",
  },

  phone: {
    pattern: /^[0-9\-+$$$$\s]{10,}$/,
    validate: (phone) => {
      return validation.phone.pattern.test(phone)
    },
    message: "Please enter a valid phone number",
  },

  password: {
    validate: (password) => {
      return password && password.length >= 6
    },
    message: "Password must be at least 6 characters",
  },

  otp: {
    pattern: /^[0-9]{6}$/,
    validate: (otp) => {
      return validation.otp.pattern.test(otp)
    },
    message: "OTP must be 6 digits",
  },

  year: {
    validate: (year) => {
      const y = Number.parseInt(year)
      return y >= 2000 && y <= new Date().getFullYear()
    },
    message: "Please enter a valid financial year",
  },

  amount: {
    validate: (amount) => {
      return !isNaN(amount) && Number.parseFloat(amount) >= 0
    },
    message: "Please enter a valid amount",
  },

  required: (value) => {
    return value && value.toString().trim().length > 0
  },
}
