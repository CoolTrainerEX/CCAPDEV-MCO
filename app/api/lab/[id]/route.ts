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
import { labs, users } from "@/src/sample";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import { ZodError } from "zod";

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
    const lab = labs.find(({ id }) => id === params.id);

    if (!lab) {
      getLogger.info("Lab not found.");

      return NextResponse.json(
        { message: "Lab not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    getLogger.info("Success");

    const sessionId = await decrypt((await cookies()).get("session")?.value);

    return NextResponse.json(
      ReadLabResponse.parse({
        editable: users.find(({ id }) => id === sessionId)?.admin,
        ...lab,
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
    const lab = labs.find(({ id }) => id === params.id);

    const sessionId = await decrypt((await cookies()).get("session")?.value);

    if (!users.find(({ id }) => id === sessionId)?.admin) {
      putLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    if (!lab) {
      putLogger.info("Lab not found.");

      return NextResponse.json(
        { message: "Lab not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    Object.assign(lab, body);
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
  context: RouteContext<"/api/lab/[id]">,
) {
  try {
    const params = DeleteLabParams.parse(await context.params);
    const lab = labs.find(({ id }) => id === params.id);

    const sessionId = await decrypt((await cookies()).get("session")?.value);

    if (!users.find(({ id }) => id === sessionId)?.admin) {
      deleteLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    if (!lab) {
      deleteLogger.info("Lab not found.");

      return NextResponse.json(
        { message: "Lab not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    labs.splice(
      labs.findIndex(({ id }) => id === lab.id),
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
