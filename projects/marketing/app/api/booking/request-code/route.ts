import { NextResponse } from "next/server";
import { bookingService } from "@/lib/booking/instance";

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    email = undefined;
  }
  if (typeof email !== "string") {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INVALID_INPUT", message: "Enter an email address." },
      },
      { status: 400 },
    );
  }

  const result = await bookingService.requestCode(email);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  // The mock flow surfaces the code so the dialog can show it as a hint.
  // A real mailer drops this field; the contract keeps it optional.
  return NextResponse.json({ ok: true, mockCode: result.code });
}
