import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geistSans = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "Annual Return Declaration System",
  description: "Secure platform for annual return declaration and verification",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f2937",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={_geistSans.className}>{children}</body>
    </html>
  )
}
