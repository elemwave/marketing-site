export type BookingErrorCode =
  | "INVALID_INPUT"
  | "INVALID_EMAIL"
  | "INVALID_CODE_FORMAT"
  | "NO_ACTIVE_CODE"
  | "CODE_INCORRECT"
  | "CODE_EXPIRED"
  | "TOO_MANY_ATTEMPTS";

export interface BookingError {
  code: BookingErrorCode;
  message: string;
}

export type RequestCodeResult =
  | { ok: true; code: string }
  | { ok: false; error: BookingError };

export type VerifyCodeResult =
  | { ok: true }
  | { ok: false; error: BookingError };
