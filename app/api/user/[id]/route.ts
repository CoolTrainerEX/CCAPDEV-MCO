import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/session";
import {
  DeleteUserParams,
  ReadUserParams,
  ReadUserResponse,
  UpdateUserBody,
  UpdateUserParams,
} from "@/src/api/endpoints/user/user.zod";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnauthorizedResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { Prisma } from "@/src/generated/prisma/client";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import z, { ZodError } from "zod";

const logger = pino();
const getLogger = logger.child({ operation: "get user" });
const putLogger = logger.child({ operation: "update user" });
const deleteLogger = logger.child({ operation: "delete user" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
  _: NextRequest,
  context: RouteContext<"/api/user/[id]">,
) {
  try {
    const params = ReadUserParams.parse(await context.params);
    const user = await prisma.user.findUnique({ where: { id: params.id } });

    if (!user) {
      getLogger.info("User not found.");

      return NextResponse.json(
        { message: "User not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, ...filtered } = user;
    const session = await decrypt((await cookies()).get("session")?.value);
    getLogger.info("Success");

    return NextResponse.json(
      ReadUserResponse.parse({
        editable: user.id === session?.id || session?.admin,
        ...filtered,
        admin: filtered.admin ?? undefined,
      } as z.infer<typeof ReadUserResponse>),
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

// eslint-disable-next-line jsdoc/require-jsdoc
export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/user/[id]">,
) {
  try {
    const params = UpdateUserParams.parse(await context.params);
    const body = UpdateUserBody.parse(await request.json());

    const sessionId = (await decrypt((await cookies()).get("session")?.value))
      ?.id;

    if (
      !sessionId ||
      (sessionId !== params.id &&
        !(await prisma.user.findUnique({ where: { id: sessionId } }))?.admin)
    ) {
      putLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    await prisma.user.update({ data: body, where: { id: params.id } });

    putLogger.info("Success");

    return new NextResponse(undefined, { status: 204 });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      putLogger.info("User not found.");

      return NextResponse.json(
        { message: "User not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

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

// eslint-disable-next-line jsdoc/require-jsdoc
export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/user/[id]">,
) {
  try {
    const params = DeleteUserParams.parse(await context.params);
    const cookieStore = await cookies();
    const sessionId = (await decrypt(cookieStore.get("session")?.value))?.id;

    const isCurrentUser = sessionId === params.id;
    if (
      !sessionId ||
      (!isCurrentUser &&
        !(await prisma.user.findUnique({ where: { id: sessionId } })))
    ) {
      deleteLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    await prisma.user.delete({ where: { id: params.id } });

    if (isCurrentUser) cookieStore.delete("session");

    deleteLogger.info("Success");

    return new NextResponse(undefined, { status: 204 });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      deleteLogger.info("User not found.");

      return NextResponse.json(
        { message: "User not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

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
