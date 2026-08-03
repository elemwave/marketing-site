import type { BookingError } from "./types";

export type RequestCodeResponse =
  | { ok: true; mockCode?: string }
  | { ok: false; error: BookingError };

export type VerifyCodeResponse =
  | { ok: true }
  | { ok: false; error: BookingError };

const NETWORK_ERROR: BookingError = {
  code: "INVALID_INPUT",
  message: "Something went wrong. Please try again.",
};

async function post<T>(url: string, body: object): Promise<T> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as T;
  } catch {
    return { ok: false, error: NETWORK_ERROR } as T;
  }
}

export const requestCode = (email: string) =>
  post<RequestCodeResponse>("/api/booking/request-code", { email });

export const verifyCode = (email: string, code: string) =>
  post<VerifyCodeResponse>("/api/booking/verify-code", { email, code });
