import { NextResponse } from "next/server";

const COOKIE_NAME = "rpt_session";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    const cookie = request.cookies.get(COOKIE_NAME)?.value;
    if (!cookie) {
      const url = new URL("/login", request.url);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
