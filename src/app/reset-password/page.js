import ResetPasswordClient from "./ResetPasswordClient"

export default function ResetPasswordPage({ searchParams }) {
  const token = searchParams?.token || ""
  return <ResetPasswordClient token={token} />
}
