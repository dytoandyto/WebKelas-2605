import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "classhub_session";

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "default_development_secret_do_not_use_in_production_min_32_chars";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let isValidSession = false;
  if (token) {
    try {
      const secret = getJwtSecret();
      await jwtVerify(token, secret);
      isValidSession = true;
    } catch {
      isValidSession = false;
    }
  }

  // If user is trying to access protected /admin routes without a valid session
  if (pathname.startsWith("/admin")) {
    if (!isValidSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is already logged in and visits /login, redirect to /admin
  if (pathname === "/login" && isValidSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
