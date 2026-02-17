import { CreateUserBody } from "@/src/api/endpoints/user/user.zod";
import { BadRequestResponse, ExistsResponse } from "@/src/api/models";
import { User, users } from "@/src/sample";
import { NextRequest, NextResponse } from "next/server";
import { pino } from "pino";

const logger = pino();

export function POST(request: NextRequest) {
  try {
    const body = CreateUserBody.parse(request.body);

    if (users.some(({ email }) => email === body.email))
      return NextResponse.json(
        { message: "User already exists." } as ExistsResponse,
        { status: 409 },
      );

    const user: User = {
      id: Math.max(...users.map(({ id }) => id)) + 1,
      description: "",
      ...body,
    };

    users.push(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...filtered } = user;

    return NextResponse.json(filtered, { status: 201 });
  } catch (e) {
    logger.error(e);

    return NextResponse.json(
      { message: "Bad request." } as BadRequestResponse,
      { status: 400 },
    );
  }
}
