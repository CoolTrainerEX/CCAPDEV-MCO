import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/session";
import {
  DeleteUserImageParams,
  ReadUserImageParams,
  UpdateUserImageParams,
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
import sharp from "sharp";
import { ZodError } from "zod";

const logger = pino();
const getLogger = logger.child({ operation: "get user image" });
const putLogger = logger.child({ operation: "update user image" });
const deleteLogger = logger.child({ operation: "delete user image" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
  _: NextRequest,
  context: RouteContext<"/api/user/[id]/image">,
) {
  try {
    const params = ReadUserImageParams.parse(await context.params);
    const image = (
      await prisma.user.findUnique({
        select: { image: true },
        where: { id: params.id },
      })
    )?.image;

    if (!image) {
      getLogger.info("Image not found.");

      return NextResponse.json(
        { message: "Image not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    getLogger.info("Success");

    return new NextResponse(image, {
      headers: { "Content-Type": "image/webp" },
    });
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
  context: RouteContext<"/api/user/[id]/image">,
) {
  try {
    const params = UpdateUserImageParams.parse(await context.params);
    const body = await sharp(await request.arrayBuffer())
      .resize(64, 64)
      .webp()
      .toBuffer();

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

    await prisma.user.update({
      data: { image: new Uint8Array(body) },
      where: { id: params.id },
    });

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
  context: RouteContext<"/api/user/[id]/image">,
) {
  try {
    const params = DeleteUserImageParams.parse(await context.params);
    const sessionId = (await decrypt((await cookies()).get("session")?.value))
      ?.id;

    if (
      !sessionId ||
      (sessionId !== params.id &&
        !(await prisma.user.findUnique({ where: { id: sessionId } })))
    ) {
      deleteLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    await prisma.user.update({
      data: { image: null },
      where: { id: params.id },
    });

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
