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
import { User, users } from "@/src/sample";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { pino } from "pino";
import { ZodError } from "zod";

const logger = pino();
const createLogger = logger.child({ operation: "create user" });
const getLogger = logger.child({ operation: "get current user" });

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

    if (!users.some(({ id }) => id === sessionId)) {
      getLogger.info("User not found.");

      return NextResponse.json(
        {
          message: "User not found.",
        } as NotFoundResponse,
        { status: 404 },
      );
    }

    return NextResponse.json(ReadCurrentUserResponse.parse(sessionId));
  } catch (e) {
    getLogger.error(e);

    return NextResponse.json(
      { message: "Unexpexted error." } as UnexpectedResponse,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = CreateUserBody.parse(await request.json());

    if (users.some(({ email }) => email === body.email)) {
      createLogger.info("User already exists.");

      return NextResponse.json(
        { message: "User already exists." } as ExistsResponse,
        { status: 409 },
      );
    }

    const user: User = {
      id: Math.max(...users.map(({ id }) => id)) + 1,
      description: "",
      ...body,
    };

    users.push(user);
    await createSession(user.id);
    createLogger.info("Success");

    return new NextResponse(undefined, {
      status: 201,
    });
  } catch (e) {
    if (e instanceof ZodError) {
      createLogger.info({ issues: e.issues });

      return NextResponse.json(
        { message: "Bad request." } as BadRequestResponse,
        { status: 400 },
      );
    }

    createLogger.error(e);

    return NextResponse.json(
      {
        message: "Unexpected error.",
      } as UnexpectedResponse,
      { status: 500 },
    );
  }
}
