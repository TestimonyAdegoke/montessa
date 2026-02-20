import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/apply", "/portal"]
const authPaths = ["/login", "/signup"]

const devUpgradePaths = ["/_next/webpack-hmr", "/_next/dev-server", "/_next/context"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware logic for Next.js dev websocket/upgrade routes to avoid binding errors
  if (devUpgradePaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Subdomain detection — inject tenant subdomain as header
  const hostname = request.headers.get("host") || ""
  const subdomain = hostname.split(".").length > 2 ? hostname.split(".")[0] : null
  const requestHeaders = new Headers(request.headers)
  if (subdomain && subdomain !== "www") {
    requestHeaders.set("x-tenant-subdomain", subdomain)
  }

  // Allow public paths without auth
  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith("/_next") || pathname.startsWith("/api/auth") || pathname.startsWith("/api/applications/public")
  )

  // Redirect authenticated users away from auth pages
  if (token && authPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based route protection
    const role = token.role as string

    // Super Admin only routes
    if (pathname.startsWith("/dashboard/tenants") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Admin only routes
    const adminOnlyPaths = ["/dashboard/analytics"]
    if (adminOnlyPaths.some((p) => pathname.startsWith(p)) && !["SUPER_ADMIN", "TENANT_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Admin + specific role routes
    if (pathname.startsWith("/dashboard/admissions") && !["SUPER_ADMIN", "TENANT_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    if (pathname.startsWith("/dashboard/reports") && !["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    if (pathname.startsWith("/dashboard/teachers") && !["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Guardian-specific routes
    if (pathname.startsWith("/dashboard/children") && role !== "GUARDIAN") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Student-specific routes
    if (pathname.startsWith("/dashboard/my-learning") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
