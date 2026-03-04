import { decrypt } from "@/lib/session";
import {
  ReadUserParams,
  ReadUserResponse,
  UpdateUserBody,
} from "@/src/api/endpoints/user/user.zod";
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
const getLogger = logger.child({ operation: "get user" });
const putLogger = logger.child({ operation: "update user" });
const deleteLogger = logger.child({ operation: "delete user" });

export async function GET(
  _: NextRequest,
  context: RouteContext<"/api/user/[id]">,
) {
  try {
    const params = ReadUserParams.parse(await context.params);
    const user = users.find(({ id }) => id === params.id);

    if (!user) {
      getLogger.info("User not found.");

      return NextResponse.json(
        { message: "User not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, ...filtered } = user;
    const sessionId = await decrypt((await cookies()).get("session")?.value);
    getLogger.info("Success");

    return NextResponse.json(
      ReadUserResponse.parse({
        editable:
          sessionId === user.id ||
          users.find(({ id }) => id === sessionId)?.admin,
        ...filtered,
      }),
    );
  } catch (e) {
    if (e instanceof ZodError) {
      getLogger.info({ issues: e.issues });

      return NextResponse.json(
        { message: "Bad request." } as BadRequestResponse,
        { status: 400 },
      );
    }

    getLogger.error(e);

    return NextResponse.json(
      {
        message: "Unexpected error.",
      } as UnexpectedResponse,
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/user/[id]">,
) {
  try {
    const params = ReadUserParams.parse(await context.params);
    const body = UpdateUserBody.parse(await request.json());
    const user = users.find(({ id }) => id === params.id);

    if (!user) {
      putLogger.info("User not found.");

      return NextResponse.json(
        { message: "User not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    const sessionId = await decrypt((await cookies()).get("session")?.value);
    if (
      sessionId !== user.id &&
      !users.find(({ id }) => id === sessionId)?.admin
    ) {
      putLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    Object.assign(user, body);

    putLogger.info("Success");

    return new NextResponse(undefined, { status: 204 });
  } catch (e) {
    if (e instanceof ZodError) {
      putLogger.info({ issues: e.issues });

      return NextResponse.json(
        { message: "Bad request." } as BadRequestResponse,
        { status: 400 },
      );
    }

    putLogger.error(e);

    return NextResponse.json(
      {
        message: "Unexpected error.",
      } as UnexpectedResponse,
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/user/[id]">,
) {
  try {
    const params = ReadUserParams.parse(await context.params);
    const user = users.find(({ id }) => id === params.id);

    if (!user) {
      deleteLogger.info("User not found.");

      return NextResponse.json(
        { message: "User not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    const sessionId = await decrypt((await cookies()).get("session")?.value);
    if (
      sessionId !== user.id &&
      !users.find(({ id }) => id === sessionId)?.admin
    ) {
      deleteLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    users.splice(
      users.findIndex(({ id }) => id === user.id),
      1,
    );

    deleteLogger.info("Success");

    return new NextResponse(undefined, { status: 204 });
  } catch (e) {
    if (e instanceof ZodError) {
      deleteLogger.info({ issues: e.issues });

      return NextResponse.json(
        { message: "Bad request." } as BadRequestResponse,
        { status: 400 },
      );
    }

    deleteLogger.error(e);

    return NextResponse.json(
      {
        message: "Unexpected error.",
      } as UnexpectedResponse,
      { status: 500 },
    );
  }
}
