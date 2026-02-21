import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const publicRoutes = new Set(["/login", "/register"]);

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.has(path);
  const session = await decrypt((await cookies()).get("session")?.value);

  if (!isPublicRoute && !session?.id)
    return NextResponse.redirect(new URL("/login", request.nextUrl));

  if (isPublicRoute && session?.id)
    return NextResponse.redirect(new URL("/", request.nextUrl));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
