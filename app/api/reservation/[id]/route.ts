import { decrypt } from "@/lib/session";
import {
  DeleteReservationParams,
  UpdateReservationBody,
  UpdateReservationParams,
} from "@/src/api/endpoints/reservation/reservation.zod";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnauthorizedResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { labs, reservations, users } from "@/src/sample";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import { ZodError } from "zod";

const logger = pino();
const putLogger = logger.child({ operation: "update user" });
const deleteLogger = logger.child({ operation: "delete user" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/reservation/[id]">,
) {
  try {
    const params = UpdateReservationParams.parse(await context.params);
    const body = UpdateReservationBody.parse(await request.json());
    const reservation = reservations.find(({ id }) => id === params.id);

    const sessionId = (await decrypt((await cookies()).get("session")?.value))
      ?.id;

    if (
      !sessionId ||
      (sessionId !== reservation?.userId &&
        !users.find(({ id }) => id === sessionId)?.admin)
    ) {
      putLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }
    if (!reservation) {
      putLogger.info("Reservation not found.");

      return NextResponse.json(
        { message: "Reservation not found." } as NotFoundResponse,
        { status: 404 },
      );
    }
    const lab = labs.find(({ id }) => id === reservation.labId);

    for (const slotId of body.slotIds)
      if (!lab?.slots.map(({ id }) => id).includes(slotId)) {
        putLogger.info("Invalid slots.");

        return NextResponse.json(
          { message: "Invalid slots." } as BadRequestResponse,
          { status: 400 },
        );
      }

    Object.assign(reservation, body);
    putLogger.info("Success");

    return new NextResponse(undefined, { status: 204 });
  } catch (e) {
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
  context: RouteContext<"/api/reservation/[id]">,
) {
  try {
    const params = DeleteReservationParams.parse(await context.params);
    const reservation = reservations.find(({ id }) => id === params.id);

    const sessionId = (await decrypt((await cookies()).get("session")?.value))
      ?.id;

    if (
      !sessionId ||
      (sessionId !== reservation?.userId &&
        !users.find(({ id }) => id === sessionId)?.admin)
    ) {
      deleteLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    if (!reservation) {
      deleteLogger.info("Reservation not found.");

      return NextResponse.json(
        { message: "Reservation not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    reservations.splice(
      reservations.findIndex(({ id }) => id === reservation.id),
      1,
    );

    deleteLogger.info("Success");

    return new NextResponse(undefined, { status: 204 });
  } catch (e) {
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
