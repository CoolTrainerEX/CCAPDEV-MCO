import { decrypt } from "@/lib/session";
import { CreateReservationBody } from "@/src/api/endpoints/reservation/reservation.zod";
import {
  BadRequestResponse,
  ExistsResponse,
  UnauthorizedResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { reservations, users } from "@/src/sample";
import { areIntervalsOverlapping } from "date-fns";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import { ZodError } from "zod";

const postLogger = pino().child({ operation: "create reservation" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function POST(request: NextRequest) {
  try {
    const body = CreateReservationBody.parse(await request.json());

    const sessionId = await decrypt((await cookies()).get("session")?.value);

    if (
      sessionId !== body.userId &&
      !users.find(({ id }) => id === sessionId)?.admin
    ) {
      postLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    if (
      reservations.some(({ schedule }) =>
        areIntervalsOverlapping(schedule, body.schedule),
      )
    ) {
      postLogger.info("Reservation overlaps.");

      return NextResponse.json(
        { message: "Reservation overlaps." } as ExistsResponse,
        { status: 409 },
      );
    }

    const id = Math.max(...reservations.map(({ id }) => id)) + 1;

    reservations.push({ id, ...body });
    postLogger.info("Success");

    return NextResponse.json(id, { status: 201 });
  } catch (e) {
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
