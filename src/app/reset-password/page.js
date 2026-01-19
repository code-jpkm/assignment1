import ResetPasswordClient from "./ResetPasswordClient.js"

export default function ResetPasswordPage({ searchParams }) {
  const token = searchParams?.token || ""
  return <ResetPasswordClient token={token} />
}
