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
import { labs as labList, users } from "@/src/sample";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import z, { ZodError } from "zod";

const PAGE_LIMIT = Number.parseInt(process.env.PAGE_LIMIT ?? "10");
const logger = pino();
const getLogger = logger.child({ operation: "get labs" });
const postLogger = logger.child({ operation: "create lab" });

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(request: NextRequest) {
  try {
    const queryParams = ReadLabsQueryParams.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    // Typescript cannot infer defined value
    const lastIndex = queryParams.page * PAGE_LIMIT;
    const q = queryParams.q;
    const labs = q
        ? labList.filter(({ name }) =>
            name.toLowerCase().includes(q.toLowerCase()),
          )
        : labList,
      page = labs.slice((queryParams.page - 1) * PAGE_LIMIT, lastIndex);

    if (!page.length) {
      getLogger.info("Labs not found.");

      return NextResponse.json(
        { message: "Labs not found." } as NotFoundResponse,
        { status: 404 },
      );
    }
    const sessionId = (await decrypt((await cookies()).get("session")?.value))
      ?.id;
    const editable = users.find(({ id }) => id === sessionId)?.admin;

    getLogger.info("Success");

    return NextResponse.json(
      ReadLabsResponse.parse({
        data: page.map((value) => ({
          editable,
          ...value,
        })),
        hasNextPage: lastIndex < labs.length,
      } as z.infer<typeof ReadLabsResponse>),
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

// eslint-disable-next-line jsdoc/require-jsdoc
export async function POST(request: NextRequest) {
  try {
    const body = CreateLabBody.parse(await request.json());

    const sessionId = (await decrypt((await cookies()).get("session")?.value))
      ?.id;

    if (!users.find(({ id }) => id === sessionId)?.admin) {
      postLogger.info("Unauthorized.");

      return NextResponse.json(
        { message: "Unauthorized." } as UnauthorizedResponse,
        { status: 401 },
      );
    }

    if (labList.some(({ name }) => name === body.name)) {
      postLogger.info("Lab already exists.");

      return NextResponse.json(
        { message: "Lab already exists." } as ExistsResponse,
        { status: 409 },
      );
    }

    const id = Math.max(...labList.map(({ id }) => id)) + 1;

    labList.push({ id, ...body });
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
