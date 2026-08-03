import { CODE_LENGTH, CODE_TTL_MS, MAX_ATTEMPTS } from "./constants";
import type { CodeSender } from "./code-sender";
import type { CodeStore } from "./store";
import type { RequestCodeResult, VerifyCodeResult } from "./types";
import { isValidCode, isValidEmail } from "./validation";

const randomCode = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(CODE_LENGTH)))
    .map((byte) => byte % 10)
    .join("");

interface ServiceOptions {
  now?: () => number;
  generateCode?: () => string;
}

/**
 * Issues and verifies single-use email confirmation codes. Codes expire after
 * CODE_TTL_MS and are discarded after MAX_ATTEMPTS failed verifications.
 */
export class BookingService {
  private readonly now: () => number;
  private readonly generateCode: () => string;

  constructor(
    private readonly store: CodeStore,
    private readonly sender: CodeSender,
    options: ServiceOptions = {},
  ) {
    this.now = options.now ?? Date.now;
    this.generateCode = options.generateCode ?? randomCode;
  }

  async requestCode(email: string): Promise<RequestCodeResult> {
    const normalised = email.trim().toLowerCase();
    if (!isValidEmail(normalised)) {
      return {
        ok: false,
        error: {
          code: "INVALID_EMAIL",
          message: "Enter a valid email address.",
        },
      };
    }

    const code = this.generateCode();
    this.store.set(normalised, {
      code,
      expiresAt: this.now() + CODE_TTL_MS,
      attempts: 0,
    });
    await this.sender.send(normalised, code);
    return { ok: true, code };
  }

  async verifyCode(email: string, code: string): Promise<VerifyCodeResult> {
    const normalised = email.trim().toLowerCase();
    if (!isValidCode(code)) {
      return {
        ok: false,
        error: {
          code: "INVALID_CODE_FORMAT",
          message: `Enter the ${CODE_LENGTH}-digit code.`,
        },
      };
    }

    const entry = this.store.get(normalised);
    if (!entry) {
      return {
        ok: false,
        error: {
          code: "NO_ACTIVE_CODE",
          message: "No active code for this email. Request a new one.",
        },
      };
    }

    if (this.now() > entry.expiresAt) {
      this.store.delete(normalised);
      return {
        ok: false,
        error: {
          code: "CODE_EXPIRED",
          message: "The code has expired. Request a new one.",
        },
      };
    }

    if (entry.code !== code) {
      entry.attempts += 1;
      if (entry.attempts >= MAX_ATTEMPTS) {
        this.store.delete(normalised);
        return {
          ok: false,
          error: {
            code: "TOO_MANY_ATTEMPTS",
            message: "Too many attempts. Request a new code.",
          },
        };
      }
      this.store.set(normalised, entry);
      return {
        ok: false,
        error: {
          code: "CODE_INCORRECT",
          message: "That code is not correct.",
        },
      };
    }

    this.store.delete(normalised);
    return { ok: true };
  }
}
