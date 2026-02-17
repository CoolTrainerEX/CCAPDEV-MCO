import { LoginBody } from "@/src/api/endpoints/user/user.zod";
import { BadRequestResponse, NotFoundResponse } from "@/src/api/models";
import { users } from "@/src/sample";
import { NextRequest, NextResponse } from "next/server";
import { pino } from "pino";
import { ZodError } from "zod";

const logger = pino();

export async function POST(request: NextRequest) {
  try {
    const body = LoginBody.parse(await request.json());
    const user = users.find(({ email }) => email === body.email);

    if (user?.password !== body.password)
      return NextResponse.json(
        { message: "User not found." } as NotFoundResponse,
        { status: 404 },
      );

    return NextResponse.json(user.id);
  } catch (e) {
    logger.error(e);

    return NextResponse.json(
      { message: "Bad request." } as BadRequestResponse,
      { status: 400 },
    );
  }
}
