import { decrypt } from "@/lib/session";
import {
  CreateLabBody,
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
import { labs as labList, labs, users } from "@/src/sample";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { pino } from "pino";
import { ZodError } from "zod";

const PAGE_LIMIT = Number.parseInt(process.env.PAGE_LIMIT ?? "10");
const logger = pino();
const getLogger = logger.child({ operation: "get labs" });
const postLogger = logger.child({ operation: "create lab" });

export function GET(request: NextRequest) {
  try {
    const queryParams = ReadLabsQueryParams.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    // Typescript cannot infer defined value
    const q = queryParams.q;
    const labs = (
      q
        ? labList.filter(({ name }) =>
            name.toLowerCase().includes(q.toLowerCase()),
          )
        : labList
    ).slice((queryParams.page - 1) * PAGE_LIMIT, queryParams.page * PAGE_LIMIT);

    if (!labs.length) {
      getLogger.info("Labs not found.");

      return NextResponse.json(
        { message: "Labs not found." } as NotFoundResponse,
        { status: 404 },
      );
    }

    getLogger.info("Success");

    return NextResponse.json(ReadLabsResponse.parse(labs));
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

export async function POST(request: NextRequest) {
  try {
    const body = CreateLabBody.parse(await request.json());

    const sessionId = await decrypt((await cookies()).get("session")?.value);

    if (!users.find(({ id }) => id === sessionId)?.admin) {
      postLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    if (labs.some(({ name }) => name === body.name)) {
      postLogger.info("Lab already exists.");

      return NextResponse.json(
        { message: "Lab already exists." } as ExistsResponse,
        { status: 409 },
      );
    }

    const id = Math.max(...labs.map(({ id }) => id)) + 1;

    labs.push({ id, ...body });
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
