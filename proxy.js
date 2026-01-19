import { NextResponse } from "next/server"

export function proxy(request) {
  const { pathname } = request.nextUrl

  // Check if user is authenticated for protected routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/user")) {
    // Allow login pages without authentication
    if (pathname.includes("/login")) {
      return NextResponse.next()
    }

    // For other routes, check if user exists in cookies/session
    // In a production app, you'd validate the session properly
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
}
