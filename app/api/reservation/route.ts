import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/session";
import { CreateReservationBody } from "@/src/api/endpoints/reservation/reservation.zod";
import {
  BadRequestResponse,
  ExistsResponse,
  NotFoundResponse,
  UnauthorizedResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { Lab, Prisma } from "@/src/generated/prisma/client";
import { areIntervalsOverlapping } from "date-fns";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import z, { ZodError } from "zod";

const postLogger = pino().child({ operation: "create reservation" });

/**
 * Checks the request body.
 * @param {z.infer<typeof CreateReservationBody>} body Request body
 * @param {Lab} lab Lab to check slots
 * @returns {NextResponse | undefined} Response
 */
function checkRequests(body: z.infer<typeof CreateReservationBody>, lab: Lab) {
  if (new Set(body.slotIds).size !== body.slotIds.length) {
    postLogger.info("Duplicate slot IDs.");

    return NextResponse.json(
      { message: "Duplicate slot IDs." } as BadRequestResponse,
      { status: 400 },
    );
  }

  for (const slotId of body.slotIds)
    if (!lab.slots.map(({ id }) => id).includes(slotId)) {
      postLogger.info("Invalid slots.");

      return NextResponse.json(
        { message: "Invalid slots." } as BadRequestResponse,
        { status: 400 },
      );
    }
}

// eslint-disable-next-line jsdoc/require-jsdoc
export async function POST(request: NextRequest) {
  try {
    const body = CreateReservationBody.parse(await request.json());

    const sessionId = (await decrypt((await cookies()).get("session")?.value))
      ?.id;

    if (!sessionId) {
      postLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    const lab = await prisma.lab.findUnique({ where: { id: body.labId } });

    if (!lab) {
      postLogger.info("Lab not found.");

      return NextResponse.json(
        { message: "Lab not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    const checks = checkRequests(body, lab);

    if (checks) return checks;

    if (
      (
        await prisma.reservation.findMany({
          where: { slotIds: { hasSome: body.slotIds } },
        })
      ).some(({ schedule }) => areIntervalsOverlapping(schedule, body.schedule))
    ) {
      postLogger.info("Reservation overlaps.");

      return NextResponse.json(
        { message: "Reservation overlaps." } as ExistsResponse,
        { status: 409 },
      );
    }

    postLogger.info("Success");

    return NextResponse.json(
      (
        await prisma.reservation.create({
          data: { userId: sessionId, ...body },
        })
      ).id,
      { status: 201 },
    );
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      postLogger.info("User or lab not found.");

      return NextResponse.json(
        { message: "User or lab not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2023"
    ) {
      postLogger.info("Bad request.");

      return NextResponse.json(
        { message: "Bad request." } as BadRequestResponse,
        { status: 400 },
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
