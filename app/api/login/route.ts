import { createSession, decrypt, deleteSession } from "@/lib/session";
import { LoginBody, LoginResponse } from "@/src/api/endpoints/user/user.zod";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnauthorizedResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { users } from "@/src/sample";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { pino } from "pino";
import { ZodError } from "zod";

const logger = pino();
const loginLogger = logger.child({ operation: "login" });
const logoutLogger = logger.child({ operation: "logout" });

export async function POST(request: NextRequest) {
  try {
    const body = LoginBody.parse(await request.json());
    const user = users.find(({ email }) => email === body.email);

    if (user?.password !== body.password) {
      loginLogger.info("User not found.");

      return NextResponse.json(
        { message: "User not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    await createSession(user.id);
    loginLogger.info("Success");

    return NextResponse.json(LoginResponse.parse(user.id));
  } catch (e) {
    if (e instanceof ZodError) {
      loginLogger.info({ issues: e.issues });

      return NextResponse.json(
        { message: "Bad request." } as BadRequestResponse,
        { status: 400 },
      );
    }

    loginLogger.error(e);

    return NextResponse.json(
      {
        message: "Unexpected error.",
      } as UnexpectedResponse,
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await decrypt((await cookies()).get("session")?.value);

    if (!session?.id)
      return NextResponse.json(
        {
          message: "Unauthorized.",
        } as UnauthorizedResponse,
        { status: 401 },
      );

    await deleteSession();
    logoutLogger.info("Success");

    return NextResponse.json(undefined, { status: 204 });
  } catch (e) {
    logoutLogger.error(e);

    return NextResponse.json({ message: "Unexpected error." }, { status: 500 });
  }
}
