import { decrypt } from "@/lib/session";
import {
  ReadUserParams,
  ReadUserResponse,
} from "@/src/api/endpoints/user/user.zod";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { users } from "@/src/sample";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { pino } from "pino";
import { ZodError } from "zod";

const logger = pino().child({ operation: "user" });

export async function GET(
  _: NextRequest,
  context: RouteContext<"/api/user/[id]">,
) {
  try {
    const params = ReadUserParams.parse({
      id: Number.parseInt((await context.params).id),
    });
    const user = users.find(({ id }) => id === params.id);

    if (!user) {
      logger.info("User not found.");

      return NextResponse.json(
        { message: "User not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, ...filtered } = user;
    const sessionId = (await decrypt((await cookies()).get("session")?.value))
      ?.id;
    logger.info("Success");

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
      logger.info({ issues: e.issues });

      return NextResponse.json(
        { message: "Bad request." } as BadRequestResponse,
        { status: 400 },
      );
    }

    logger.error(e);

    return NextResponse.json(
      {
        message: "Unexpected error.",
      } as UnexpectedResponse,
      { status: 500 },
    );
  }
}
