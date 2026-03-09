import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/session";
import {
  ReadReservationLabParams,
  ReadReservationLabResponse,
  ReadReservationLabResponseItem,
} from "@/src/api/endpoints/reservation/reservation.zod";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { Reservation } from "@/src/generated/prisma/client";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import z, { ZodError } from "zod";

const getLogger = pino().child({ operation: "get reservations from lab" });

/**
 * Converts reservation schedule.
 * @param {Reservation} reservation Reservation to convert schedule
 * @returns {z.infer<typeof ReadReservationLabResponseItem>} Lab with converted schedule
 */
export function scheduleDateToString(reservation: Reservation) {
  return {
    ...reservation,
    schedule: {
      start: reservation.schedule.start.toISOString(),
      end: reservation.schedule.end.toISOString(),
    },
  };
}

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/reservation/lab/[id]">,
) {
  try {
    const params = ReadReservationLabParams.parse(await context.params);
    const reservations = await prisma.reservation.findMany({
      where: {
        labId: params.id,
        schedule: { is: { end: { gt: new Date() } } },
      },
    });

    if (!reservations.length) {
      getLogger.info("Reservations not found.");

      return NextResponse.json(
        { message: "Reservations not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    const session = await decrypt((await cookies()).get("session")?.value);

    getLogger.info("Success");

    return NextResponse.json(
      ReadReservationLabResponse.parse(
        reservations.map(
          (value) =>
            ({
              editable: value.userId === session?.id || session?.admin,
              ...scheduleDateToString(value),
              userId:
                value.anonymous && !session?.admin ? undefined : value.userId,
              anonymous: value.anonymous ?? undefined,
            }) as z.infer<typeof ReadReservationLabResponseItem>,
        ),
      ),
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
