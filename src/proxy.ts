import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = ["/", "/login", "/register", "/pricing", "/blog", "/share"];
const publicPathPrefixes = ["/api/auth", "/api/health", "/api/ai/health", "/share/", "/blog/"];

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET, secureCookie: req.nextUrl.protocol === "https:" });
  const isLoggedIn = !!token;
  const { nextUrl } = req;
  const isPublic = publicPaths.includes(nextUrl.pathname) || publicPathPrefixes.some((p) => nextUrl.pathname.startsWith(p));

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|api/health|api/ai/health|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
