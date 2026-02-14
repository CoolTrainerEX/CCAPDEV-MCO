import { LoginBody } from "@/src/api/endpoints/user/user.zod";
import { NextRequest, NextResponse } from "next/server";
import { pino } from "pino";

const logger = pino();

export async function GET(request: NextRequest) {
  try {
    const body = LoginBody.parse(await request.json());
    logger.info(body);
  } catch (e) {
    logger.error(e);
  }
  return NextResponse.json(1);
}
