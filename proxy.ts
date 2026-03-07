import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/session";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";

const publicRoutes = new Set(["/login", "/register", "/api/login"]);
const adminRoutes = ["/lab/create", "/lab/:id/edit"];

// eslint-disable-next-line jsdoc/require-jsdoc
export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.has(path);
  const sessionRaw = request.cookies.get("session")?.value;
  const session = await decrypt(sessionRaw);

  if (!isPublicRoute && !session)
    return NextResponse.redirect(new URL("/login", request.nextUrl));

  if (isPublicRoute && session)
    return NextResponse.redirect(new URL("/", request.nextUrl));

  if (adminRoutes.some((value) => getPathMatch(value)(path)) && !session?.admin)
    return NextResponse.redirect(new URL("/notfound", request.nextUrl));

  const response = NextResponse.next();

  if (sessionRaw)
    response.cookies.set("session", sessionRaw, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
      path: "/",
    });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|manifest.json).*)"],
};
