import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/session";
import {
  CreateLabBody,
  ReadLabResponse,
  ReadLabsQueryParams,
  ReadLabsResponse,
} from "@/src/api/endpoints/lab/lab.zod";
import {
  BadRequestResponse,
  ExistsResponse,
  NotFoundResponse,
  UnauthorizedResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { Lab, Prisma } from "@/src/generated/prisma/client";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import z, { ZodError } from "zod";

const PAGE_LIMIT = Number.parseInt(process.env.PAGE_LIMIT ?? "10");
const logger = pino();
const getLogger = logger.child({ operation: "get labs" });
const postLogger = logger.child({ operation: "create lab" });

/**
 * Converts lab weekly schedule.
 * @param {Lab} lab Lab to convert schedule
 * @returns {z.infer<typeof ReadLabResponse>} Lab with converted schedule
 */
export function weeklyScheduleDateToString(lab: Lab) {
  return {
    ...lab,
    weeklySchedule: Object.fromEntries(
      Object.entries(lab.weeklySchedule).map(([key, value]) => [
        key,
        value
          ? {
              start: value.start.toISOString(),
              end: value.end.toISOString(),
            }
          : undefined,
      ]),
    ),
  };
}

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(request: NextRequest) {
  try {
    const queryParams = ReadLabsQueryParams.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const labs = await prisma.lab.findMany({
      where: { name: { contains: queryParams.q, mode: "insensitive" } },
      skip: (queryParams.page - 1) * PAGE_LIMIT,
      take: PAGE_LIMIT + 1,
    });

    if (!labs.length) {
      getLogger.info("Labs not found.");

      return NextResponse.json(
        { message: "Labs not found." } as NotFoundResponse,
        { status: 404 },
      );
    }
    const editable = (await decrypt((await cookies()).get("session")?.value))
      ?.admin;

    getLogger.info("Success");

    return NextResponse.json(
      ReadLabsResponse.parse({
        data: labs.slice(0, PAGE_LIMIT).map((value) => ({
          editable,
          ...weeklyScheduleDateToString(value),
        })),
        hasNextPage: labs.length > PAGE_LIMIT,
      } as z.infer<typeof ReadLabsResponse>),
    );
  } catch (e) {
    if (e instanceof ZodError) {
      getLogger.info({ issues: e.issues });

      return NextResponse.json(
        {
          message: "Bad request.",
        } as BadRequestResponse,
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
export async function POST(request: NextRequest) {
  try {
    const body = CreateLabBody.parse(await request.json());

    if (
      !(
        await prisma.user.findUnique({
          where: {
            id: (await decrypt((await cookies()).get("session")?.value))?.id,
          },
        })
      )?.admin
    ) {
      postLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    if (new Set(body.slots.map(({ id }) => id)).size !== body.slots.length) {
      postLogger.info("Duplicate slot IDs.");

      return NextResponse.json(
        { message: "Duplicate slot IDs." } as BadRequestResponse,
        { status: 400 },
      );
    }

    postLogger.info("Success");

    return NextResponse.json((await prisma.lab.create({ data: body })).id, {
      status: 201,
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      postLogger.info("Lab already exists.");

      return NextResponse.json(
        { message: "Lab already exists." } as ExistsResponse,
        { status: 409 },
      );
    }

    if (e instanceof ZodError) {
      postLogger.info({ issues: e.issues });

      return NextResponse.json(
        { message: "Bad request." } as BadRequestResponse,
        { status: 400 },
      );
    }

    postLogger.error(e);

    return NextResponse.json(
      {
        message: "Unexpected error.",
      } as UnexpectedResponse,
      { status: 500 },
    );
  }
}
