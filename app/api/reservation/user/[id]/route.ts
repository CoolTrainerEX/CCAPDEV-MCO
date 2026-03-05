import {
  ReadReservationUserParams,
  ReadReservationUserQueryParams,
  ReadReservationUserResponse,
} from "@/src/api/endpoints/reservation/reservation.zod";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { reservations as reservationList } from "@/src/sample";
import { isAfter } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import z, { ZodError } from "zod";

const PAGE_LIMIT = Number.parseInt(process.env.PAGE_LIMIT ?? "10");
const getLogger = pino().child({ operation: "get reservations from user" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/reservation/user/[id]">,
) {
  const now = new Date();

  try {
    const queryParams = ReadReservationUserQueryParams.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const params = ReadReservationUserParams.parse(await context.params);
    const lastIndex = queryParams.page * PAGE_LIMIT;
    const reservations = reservationList.filter(
        ({ userId, schedule: { end } }) =>
          userId === params.id && isAfter(end, now),
      ),
      page = reservations.slice((queryParams.page - 1) * PAGE_LIMIT, lastIndex);

    if (!page.length) {
      getLogger.info("Reservations not found.");

      return NextResponse.json(
        { message: "Reservations not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    getLogger.info("Success");

    return NextResponse.json(
      ReadReservationUserResponse.parse({
        data: page,
        hasNextPage: lastIndex < reservations.length,
      } as z.infer<typeof ReadReservationUserResponse>),
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
