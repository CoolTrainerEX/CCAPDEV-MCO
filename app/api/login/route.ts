import { createSession, decrypt } from "@/lib/session";
import { LoginBody } from "@/src/api/endpoints/user/user.zod";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnauthorizedResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { users } from "@/src/sample";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import { ZodError } from "zod";

const logger = pino();
const postLogger = logger.child({ operation: "login" });
const deleteLogger = logger.child({ operation: "logout" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function POST(request: NextRequest) {
  try {
    const body = LoginBody.parse(await request.json());
    const user = users.find(({ email }) => email === body.email);

    if (user?.password !== body.password) {
      postLogger.info("User not found.");

      return NextResponse.json(
        { message: "User not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    await createSession(user.id);
    postLogger.info("Success");

    return new NextResponse(undefined, { status: 204 });
  } catch (e) {
    if (e instanceof ZodError) {
      postLogger.info({ issues: e.issues });

      return NextResponse.json(
        { message: "Bad request." } as BadRequestResponse,
        { status: 400 },
      );
    }

    postLogger.error(e);

    return NextResponse.json(
      {
        message: "Unexpected error.",
      } as UnexpectedResponse,
      { status: 500 },
    );
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionId = await decrypt(cookieStore.get("session")?.value);

    if (!sessionId) {
      deleteLogger.info("Unauthorized.");

      return NextResponse.json(
        {
          message: "Unauthorized.",
        } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    cookieStore.delete("session");
    deleteLogger.info("Success");

    return new NextResponse(undefined, { status: 204 });
  } catch (e) {
    deleteLogger.error(e);

    return NextResponse.json({ message: "Unexpected error." }, { status: 500 });
  }
}
