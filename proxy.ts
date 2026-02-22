import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const publicRoutes = new Set(["/login", "/register"]);

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.has(path);
  const sessionRaw = (await cookies()).get("session")?.value;
  const session = await decrypt(sessionRaw);

  if (!isPublicRoute && !session?.id)
    return NextResponse.redirect(new URL("/login", request.nextUrl));

  if (isPublicRoute && session?.id)
    return NextResponse.redirect(new URL("/", request.nextUrl));

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
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
