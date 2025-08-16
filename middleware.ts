import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, allow access to all routes
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase not configured - authentication disabled")
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is not signed in and the current path is not /login, redirect to /login
    if (!session && req.nextUrl.pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // If user is signed in and the current path is /login, redirect to dashboard
    if (session && req.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return res
  } catch (error) {
    console.error("[v0] Supabase middleware error:", error)
    return res
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
