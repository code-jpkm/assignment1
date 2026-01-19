import ForgotPasswordClient from "./ForgetPasswordClient.js"

export default function ForgotPasswordPage({ searchParams }) {
  const role = searchParams?.role === "admin" ? "admin" : "user"
  return <ForgotPasswordClient initialRole={role} />
}
