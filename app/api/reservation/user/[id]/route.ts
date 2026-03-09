import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/session";
import {
  ReadReservationUserParams,
  ReadReservationUserResponse,
  ReadReservationUserResponseItem,
} from "@/src/api/endpoints/reservation/reservation.zod";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import z, { ZodError } from "zod";
import { scheduleDateToString } from "../../lab/[id]/route";

const getLogger = pino().child({ operation: "get reservations from user" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/reservation/user/[id]">,
) {
  try {
    const params = ReadReservationUserParams.parse(await context.params);
    const reservations = await prisma.reservation.findMany({
      where: {
        userId: params.id,
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
      ReadReservationUserResponse.parse(
        reservations.map(
          (value) =>
            ({
              editable: value.userId === session?.id || session?.admin,
              ...scheduleDateToString(value),
              userId:
                value.anonymous && !session?.admin ? undefined : value.userId,
              anonymous: value.anonymous ?? undefined,
            }) as z.infer<typeof ReadReservationUserResponseItem>,
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
