import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/profile", "/onboarding"]
// Routes that require admin access
const adminRoutes = ["/admin", "/posts/new", "/events/new"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  // Redirect unauthenticated users from protected routes to /login
  if (isProtectedRoute || isAdminRoute) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If user is authenticated
  if (session?.user) {
    // Redirect users without onboarding to /onboarding (unless already there)
    if (!session.user.hasCompletedOnboarding && pathname !== "/onboarding") {
      const onboardingUrl = new URL("/onboarding", req.url)
      onboardingUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(onboardingUrl)
    }

    // Redirect onboarded users away from /onboarding
    if (session.user.hasCompletedOnboarding && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Redirect non-admins from admin routes to /
    if (isAdminRoute && !session.user.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/posts/new",
    "/events/new",
    "/profile",
    "/profile/:path*",
    "/admin/:path*",
    "/onboarding",
  ],
}
