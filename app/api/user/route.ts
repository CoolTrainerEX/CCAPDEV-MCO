import { createSession, decrypt } from "@/lib/session";
import {
  CreateUserBody,
  ReadCurrentUserResponse,
} from "@/src/api/endpoints/user/user.zod";
import {
  BadRequestResponse,
  ExistsResponse,
  NotFoundResponse,
  UnauthorizedResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { users } from "@/src/sample";
import { hash } from "argon2";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import { ZodError } from "zod";

const logger = pino();
const getLogger = logger.child({ operation: "get current user" });
const postLogger = logger.child({ operation: "create user" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET() {
  try {
    const sessionId = (await decrypt((await cookies()).get("session")?.value))
      ?.id;

    if (!sessionId) {
      getLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    if (sessionId === null) {
      getLogger.info("User not found.");

      return NextResponse.json(
        {
          message: "User not found.",
        } as NotFoundResponse,
        { status: 404 },
      );
    }

    getLogger.info("Success");

    return NextResponse.json(ReadCurrentUserResponse.parse(sessionId));
  } catch (e) {
    getLogger.error(e);

    return NextResponse.json(
      { message: "Unexpexted error." } as UnexpectedResponse,
      { status: 500 },
    );
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
export async function POST(request: NextRequest) {
  try {
    const body = CreateUserBody.parse(await request.json());

    if (users.some(({ email }) => email === body.email)) {
      postLogger.info("User already exists.");

      return NextResponse.json(
        { message: "User already exists." } as ExistsResponse,
        { status: 409 },
      );
    }

    const id = Math.max(...users.map(({ id }) => id)) + 1;

    users.push({
      id,
      description: "",
      ...body,
      password: await hash(body.password),
    });
    await createSession(id);
    postLogger.info("Success");

    return NextResponse.json(id, { status: 201 });
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
