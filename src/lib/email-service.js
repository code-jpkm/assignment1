const nodemailer = require("nodemailer")

// Configure Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD, // Use app-specific password
  },
})

// Send OTP email
const sendOTPEmail = async (email, otp, userName) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your OTP for Annual Return Declaration",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #1e40af; margin-bottom: 20px;">Annual Return Declaration</h2>
              <p style="color: #333; font-size: 16px;">Dear ${userName},</p>
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Your OTP for verifying the annual return declaration submission is:</p>
              <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: #1e40af; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
              <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
              <p style="color: #333; font-size: 16px;">If you didn't request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">© 2026 Annual Return Declaration System</p>
            </div>
          </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("OTP Email sent:", info.response)
    return true
  } catch (error) {
    console.error("Failed to send OTP email:", error)
    throw new Error("Email sending failed: " + error.message)
  }
}

// Send approval email
const sendApprovalEmail = async (email, userName, financialYear) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Annual Return Approved",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #15803d; margin-bottom: 20px;">Annual Return Approved</h2>
              <p style="color: #333; font-size: 16px;">Dear ${userName},</p>
              <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Your annual return declaration for the financial year <strong>${financialYear}</strong> has been <strong style="color: #15803d;">APPROVED</strong>.</p>
              <p style="color: #666; font-size: 14px;">You can now proceed with your next steps. If you have any questions, please contact the administration.</p>
              <div style="background-color: #f0fdf4; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #15803d;">
                <p style="margin: 0; color: #15803d;">Status: Approved</p>
              </div>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">© 2026 Annual Return Declaration System</p>
            </div>
          </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Approval Email sent:", info.response)
    return true
  } catch (error) {
    console.error("Failed to send approval email:", error)
    throw new Error("Email sending failed: " + error.message)
  }
}

// Send rejection email
const sendRejectionEmail = async (email, userName, financialYear, reason) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Annual Return Requires Revision",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #dc2626; margin-bottom: 20px;">Annual Return Requires Revision</h2>
              <p style="color: #333; font-size: 16px;">Dear ${userName},</p>
              <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Your annual return declaration for the financial year <strong>${financialYear}</strong> requires revision.</p>
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 0; color: #dc2626;"><strong>Reason:</strong></p>
                <p style="margin: 5px 0 0 0; color: #333;">${reason}</p>
              </div>
              <p style="color: #666; font-size: 14px;">Please review the feedback above and submit a revised return. You can login to your dashboard to make corrections.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">© 2026 Annual Return Declaration System</p>
            </div>
          </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Rejection Email sent:", info.response)
    return true
  } catch (error) {
    console.error("Failed to send rejection email:", error)
    throw new Error("Email sending failed: " + error.message)
  }
}

// Send submission confirmation email
const sendSubmissionEmail = async (email, userName, financialYear) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Annual Return Submitted Successfully",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #1e40af; margin-bottom: 20px;">Annual Return Submitted</h2>
              <p style="color: #333; font-size: 16px;">Dear ${userName},</p>
              <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Your annual return declaration for the financial year <strong>${financialYear}</strong> has been submitted successfully.</p>
              <div style="background-color: #eff6ff; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #1e40af;">
                <p style="margin: 0; color: #1e40af;">Your submission is now under review by the administration.</p>
              </div>
              <p style="color: #666; font-size: 14px;">You will receive a notification once the administration reviews your submission.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">© 2026 Annual Return Declaration System</p>
            </div>
          </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Submission Email sent:", info.response)
    return true
  } catch (error) {
    console.error("Failed to send submission email:", error)
    throw new Error("Email sending failed: " + error.message)
  }
}

// Send welcome / credentials email to a newly created user
// Note: In production you should avoid sending passwords via email.
// For this assignment/demo, we do so to meet the requirement.
const sendWelcomeEmail = async (email, userName, loginUrl, loginId, tempPassword) => {
  try {
    const safeName = userName || "User"
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your Annual Return Account Details",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
              <h2 style="color: #1e40af; margin: 0 0 14px;">Welcome to Annual Return Declaration</h2>
              <p style="color: #333; font-size: 16px;">Dear ${safeName},</p>
              <p style="color: #333; font-size: 16px; margin-bottom: 18px;">
                Your account has been created by the administrator. Use the credentials below to log in.
              </p>

              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 18px;">
                <p style="margin: 0 0 8px; color: #0f172a; font-weight: 700;">Login details</p>
                <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #1e40af;">${loginUrl}</a></p>
                <p style="margin: 8px 0 0; color: #334155; font-size: 14px;"><strong>User ID:</strong> ${loginId}</p>
                <p style="margin: 8px 0 0; color: #334155; font-size: 14px;"><strong>Temporary Password:</strong> ${tempPassword}</p>
              </div>

              <p style="color: #666; font-size: 14px; margin-bottom: 18px;">
                For security, please change your password after your first login.
              </p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">© 2026 Annual Return Declaration System</p>
            </div>
          </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Welcome Email sent:", info.response)
    return true
  } catch (error) {
    console.error("Failed to send welcome email:", error)
    throw new Error("Email sending failed: " + error.message)
  }
}

// Send password reset email
const sendPasswordResetEmail = async (email, userName, resetUrl) => {
  try {
    const safeName = userName || "User"
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
              <h2 style="color: #1e40af; margin: 0 0 14px;">Password Reset Request</h2>
              <p style="color: #333; font-size: 16px;">Dear ${safeName},</p>
              <p style="color: #333; font-size: 16px; margin-bottom: 18px;">We received a request to reset your password.</p>
              <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #1e40af; margin-bottom: 18px;">
                <p style="margin: 0; color: #1e40af; font-weight: 700;">Reset link</p>
                <p style="margin: 10px 0 0; color: #334155; font-size: 14px;">Click the button below to set a new password. This link will expire in 30 minutes.</p>
                <p style="margin: 14px 0 0;">
                  <a href="${resetUrl}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 16px; border-radius: 8px; text-decoration: none; font-weight: 700;">Reset Password</a>
                </p>
              </div>
              <p style="color: #666; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">© 2026 Annual Return Declaration System</p>
            </div>
          </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Password reset email sent:", info.response)
    return true
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    throw new Error("Email sending failed: " + error.message)
  }
}


module.exports = {
  sendOTPEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendSubmissionEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
}
