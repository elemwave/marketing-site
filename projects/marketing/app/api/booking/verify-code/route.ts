import { NextResponse } from "next/server";
import { bookingService } from "@/lib/booking/instance";
import type { BookingErrorCode } from "@/lib/booking/types";

const BAD_REQUEST_CODES: BookingErrorCode[] = [
  "INVALID_INPUT",
  "INVALID_CODE_FORMAT",
];

export async function POST(request: Request) {
  let email: unknown;
  let code: unknown;
  try {
    ({ email, code } = await request.json());
  } catch {
    email = undefined;
  }
  if (typeof email !== "string" || typeof code !== "string") {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: "Enter your email and code.",
        },
      },
      { status: 400 },
    );
  }

  const result = await bookingService.verifyCode(email, code);
  if (!result.ok) {
    const status = BAD_REQUEST_CODES.includes(result.error.code) ? 400 : 401;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json({ ok: true });
}
