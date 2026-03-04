import {
  ReadLabsQueryParams,
  ReadLabsResponse,
} from "@/src/api/endpoints/lab/lab.zod";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnexpectedResponse,
} from "@/src/api/models";
import { labs as labList } from "@/src/sample";
import { NextRequest, NextResponse } from "next/server";
import { pino } from "pino";
import { ZodError } from "zod";

const PAGE_LIMIT = Number.parseInt(process.env.PAGE_LIMIT ?? "10");
const logger = pino();
const getLogger = logger.child({ operation: "get labs" });

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
