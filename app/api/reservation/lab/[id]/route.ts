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
import { reservations as reservationList, users } from "@/src/sample";
import { isAfter } from "date-fns";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import z, { ZodError } from "zod";

const getLogger = pino().child({ operation: "get reservations from lab" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/reservation/lab/[id]">,
) {
  const now = new Date();

  try {
    const params = ReadReservationLabParams.parse(await context.params);
    const reservations = reservationList.filter(
      ({ labId, schedule: { end } }) =>
        labId === params.id && isAfter(end, now),
    );

    if (!reservations.length) {
      getLogger.info("Reservations not found.");

      return NextResponse.json(
        { message: "Reservations not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    const sessionId = await decrypt((await cookies()).get("session")?.value);
    const isAdmin = users.find(({ id }) => id === sessionId)?.admin;

    getLogger.info("Success");

    return NextResponse.json(
      ReadReservationLabResponse.parse(
        reservations.map(
          (value) =>
            ({
              editable: value.userId === sessionId || isAdmin,
              ...value,
              userId: value.anonymous && !isAdmin ? undefined : value.userId,
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
