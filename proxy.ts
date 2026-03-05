import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/session";

const publicRoutes = new Set(["/login", "/register", "/api/login"]);

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.has(path);
  const session = request.cookies.get("session")?.value;
  const sessionId = await decrypt(session);

  if (!isPublicRoute && !sessionId)
    return NextResponse.redirect(new URL("/login", request.nextUrl));

  if (isPublicRoute && sessionId)
    return NextResponse.redirect(new URL("/", request.nextUrl));

  const response = NextResponse.next();

  if (session)
    response.cookies.set("session", session, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
      path: "/",
    });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
