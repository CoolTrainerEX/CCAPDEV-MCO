import {
  ReadReservationLabParams,
  ReadReservationLabQueryParams,
  ReadReservationLabResponse,
} from "@/src/api/endpoints/reservation/reservation.zod";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { reservations as reservationList } from "@/src/sample";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import { ZodError } from "zod";

const PAGE_LIMIT = Number.parseInt(process.env.PAGE_LIMIT ?? "10");
const getLogger = pino().child({ operation: "get reservations from lab" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/reservation/lab/[id]">,
) {
  try {
    const queryParams = ReadReservationLabQueryParams.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const params = ReadReservationLabParams.parse(await context.params);
    const reservations = reservationList
      .filter(({ labId }) => labId === params.id)
      .slice(
        (queryParams.page - 1) * PAGE_LIMIT,
        queryParams.page * PAGE_LIMIT,
      );

    if (!reservations.length) {
      getLogger.info("Reservations not found.");

      return NextResponse.json(
        { message: "Reservations not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    getLogger.info("Success");

    return NextResponse.json(ReadReservationLabResponse.parse(reservations));
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
