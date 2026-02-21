import {
  CreateUserBody,
  LoginResponse,
} from "@/src/api/endpoints/user/user.zod";
import { BadRequestResponse, ExistsResponse } from "@/src/api/models";
import { User, users } from "@/src/sample";
import { NextRequest, NextResponse } from "next/server";
import { pino } from "pino";
import { ZodError } from "zod";

const CreateUserResponse = LoginResponse;

const logger = pino().child({ operation: "create user" });

export function POST(request: NextRequest) {
  try {
    const body = CreateUserBody.parse(request.body);

    if (users.some(({ email }) => email === body.email)) {
      logger.info("User already exists.");

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
    logger.info("Success");

    return NextResponse.json(CreateUserResponse.parse(user.id), {
      status: 201,
    });
  } catch (e) {
    if (e instanceof ZodError) logger.info({ issues: e.issues });

    return NextResponse.json(
      { message: "Bad request." } as BadRequestResponse,
      { status: 400 },
    );
  }
}
