import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const publicRoutes = new Set(["/login", "/register"]);

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = await decrypt((await cookies()).get("session")?.value);

  if (!session?.id)
    return NextResponse.redirect(new URL("/login", request.nextUrl));

  if (publicRoutes.has(path) && session?.userId)
    return NextResponse.redirect(new URL("/", request.nextUrl));

  return NextResponse.next();
}

export const config = {
  matcher: [String.raw`/((?!api|_next/static|_next/image|.*\.png$).*)`],
};
