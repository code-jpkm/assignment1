export async function POST(req) {
  try {
    const { email, subject, message, type } = await req.json()
    console.log(`[EMAIL NOTIFICATION]
To: ${email}
Subject: ${subject}
Type: ${type}
Message: ${message}
`)
    return Response.json({
      success: true,
      message: `Email notification sent to ${email}`,
      demo: true,
    })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}
