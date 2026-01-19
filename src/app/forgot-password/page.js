import ForgotPasswordClient from "./ForgotPasswordClient"

export default function ForgotPasswordPage({ searchParams }) {
  const role = searchParams?.role === "admin" ? "admin" : "user"
  return <ForgotPasswordClient initialRole={role} />
}
