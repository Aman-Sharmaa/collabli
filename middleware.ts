import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/campaign-board"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get("kalp_auth_token")?.value;
    if (!token) { const url = request.nextUrl.clone(); url.pathname = "/login"; return NextResponse.redirect(url); }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
