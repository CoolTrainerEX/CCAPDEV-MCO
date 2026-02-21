import {
  ReadUserParams,
  ReadUserResponse,
} from "@/src/api/endpoints/user/user.zod";
import { BadRequestResponse, NotFoundResponse } from "@/src/api/models";
import { users } from "@/src/sample";
import { NextRequest, NextResponse } from "next/server";
import { pino } from "pino";
import { ZodError } from "zod";

const logger = pino().child({ operation: "user" });

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/user/[id]">,
) {
  try {
    const params = ReadUserParams.parse({
      id: Number.parseInt((await ctx.params).id),
    });
    const user = users.find(({ id }) => id === params.id);

    if (!user) {
      logger.info("User not found.");

      return NextResponse.json(
        { message: "User not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    const { email, password, ...filtered } = user;

    logger.info("Success");

    return NextResponse.json(ReadUserResponse.parse(filtered));
  } catch (e) {
    if (e instanceof ZodError) logger.info({ issues: e.issues });

    return NextResponse.json(
      { message: "Bad request." } as BadRequestResponse,
      { status: 400 },
    );
  }
}
