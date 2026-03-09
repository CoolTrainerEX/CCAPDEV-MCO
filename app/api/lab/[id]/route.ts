import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/session";
import {
  DeleteLabParams,
  ReadLabParams,
  ReadLabResponse,
  UpdateLabBody,
  UpdateLabParams,
} from "@/src/api/endpoints/lab/lab.zod";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnauthorizedResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import { ZodError } from "zod";
import { weeklyScheduleDateToString } from "../route";
import { Prisma } from "@/src/generated/prisma/client";

const logger = pino();
const getLogger = logger.child({ operation: "get lab" });
const putLogger = logger.child({ operation: "update lab" });
const deleteLogger = logger.child({ operation: "delete lab" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
  _: NextRequest,
  context: RouteContext<"/api/lab/[id]">,
) {
  try {
    const params = ReadLabParams.parse(await context.params);
    const lab = await prisma.lab.findUnique({ where: { id: params.id } });

    if (!lab) {
      getLogger.info("Lab not found.");

      return NextResponse.json(
        { message: "Lab not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    getLogger.info("Success");

    return NextResponse.json(
      ReadLabResponse.parse({
        editable: (await decrypt((await cookies()).get("session")?.value))
          ?.admin,
        ...weeklyScheduleDateToString(lab),
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

// eslint-disable-next-line jsdoc/require-jsdoc
export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/lab/[id]">,
) {
  try {
    const params = UpdateLabParams.parse(await context.params);
    const body = UpdateLabBody.parse(await request.json());

    if (
      !(
        await prisma.user.findUnique({
          where: {
            id: (await decrypt((await cookies()).get("session")?.value))?.id,
          },
        })
      )?.admin
    ) {
      putLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    if (new Set(body.slots.map(({ id }) => id)).size !== body.slots.length) {
      putLogger.info("Duplicate slot IDs.");

      return NextResponse.json(
        { message: "Duplicate slot IDs." } as BadRequestResponse,
        { status: 400 },
      );
    }

    prisma.lab.update({ data: body, where: { id: params.id } });
    putLogger.info("Success");

    return new NextResponse(undefined, { status: 204 });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      putLogger.info("Lab not found.");

      return NextResponse.json(
        { message: "Lab not found." } as NotFoundResponse,
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
  context: RouteContext<"/api/lab/[id]">,
) {
  try {
    const params = DeleteLabParams.parse(await context.params);

    if (
      !(
        await prisma.user.findUnique({
          where: {
            id: (await decrypt((await cookies()).get("session")?.value))?.id,
          },
        })
      )?.admin
    ) {
      putLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    prisma.lab.delete({ where: { id: params.id } });
    deleteLogger.info("Success");

    return new NextResponse(undefined, { status: 204 });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      deleteLogger.info("Lab not found.");

      return NextResponse.json(
        { message: "Lab not found." } as NotFoundResponse,
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
