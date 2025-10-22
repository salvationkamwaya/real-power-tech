import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Server-side protection for admin routes and QoL redirect from /login
export async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuthPage = pathname === "/login";

  // If visiting /login while already authenticated, go to dashboard
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protect /admin/*
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      // Preserve original destination as callback
      loginUrl.searchParams.set("callbackUrl", pathname + (search || ""));
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
