"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { requestCode, verifyCode } from "@/lib/booking/client";
import { CALENDLY_URL } from "@/lib/booking/constants";

const inputClass =
  "w-full rounded-[10px] border border-dot-idle bg-white px-4 py-[13px] font-body text-[15px] text-navy-800 outline-none placeholder:text-ink-muted focus:border-navy-700";
const primaryButtonClass =
  "cursor-pointer rounded-[10px] border-none bg-navy-800 px-6 py-[14px] font-body text-[15px] font-semibold text-white transition-colors hover:bg-navy-700";
const errorClass = "m-0 font-body text-[13px] text-error";

type Step = "email" | "code" | "link";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Two-step booking dialog: email → confirmation code → Calendly in a new
 * tab. The "link" step only appears when the browser blocks the popup.
 * Styling follows the imported Claude Design reference (Elemwave Home).
 */
export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [mockCode, setMockCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setCode("");
    setMockCode(null);
    setError(null);
    setPending(false);
    onClose();
  };

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await requestCode(email);
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setMockCode(result.mockCode ?? null);
    setCode("");
    setStep("code");
  };

  const submitCode = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await verifyCode(email, code);
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    const tab = window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
    if (tab) {
      dialogRef.current?.close();
    } else {
      setStep("link");
    }
  };

  const backToEmail = () => {
    setStep("email");
    setCode("");
    setError(null);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-labelledby="booking-dialog-title"
      className="m-auto w-[min(440px,calc(100%-40px))] rounded-[20px] border-none bg-transparent p-0 backdrop:bg-navy-950/72 backdrop:backdrop-blur-[4px]"
    >
      <div className="relative flex flex-col gap-[18px] rounded-[20px] bg-white p-[clamp(28px,5vw,40px)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
          className="absolute right-[14px] top-[14px] h-[34px] w-[34px] cursor-pointer rounded-full border-none bg-surface text-base text-navy-800 transition-colors hover:bg-pill-hover"
        >
          ✕
        </button>

        <h2
          id="booking-dialog-title"
          className="m-0 font-heading text-[22px] font-semibold uppercase tracking-[1px] text-navy-800"
        >
          Schedule a meeting
        </h2>

        {step === "email" && (
          <form onSubmit={submitEmail} className="flex flex-col gap-[18px]">
            <p className="m-0 font-body text-sm leading-[1.6] text-ink-muted">
              Enter your email address and we will send you a confirmation
              code to access the scheduling page.
            </p>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              aria-label="Email address"
              className={inputClass}
            />
            {error && <p className={errorClass}>{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className={primaryButtonClass}
            >
              {pending ? "Sending…" : "Send confirmation code"}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={submitCode} className="flex flex-col gap-[18px]">
            <p className="m-0 font-body text-sm leading-[1.6] text-ink-muted">
              We sent a confirmation code to{" "}
              <strong className="text-navy-800">{email}</strong>. Enter it
              below to open the scheduling page.
            </p>
            {mockCode && (
              <p className="m-0 rounded-[8px] bg-surface px-[14px] py-[10px] font-body text-[13px] text-ink-muted">
                Demo mode — your code is{" "}
                <strong className="tracking-[2px] text-navy-800">
                  {mockCode}
                </strong>
              </p>
            )}
            <input
              type="text"
              required
              autoFocus
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="6-digit code"
              aria-label="Confirmation code"
              className={`${inputClass} text-[17px] tracking-[4px]`}
            />
            {error && <p className={errorClass}>{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className={primaryButtonClass}
            >
              {pending ? "Verifying…" : "Verify & open scheduling"}
            </button>
            <button
              type="button"
              onClick={backToEmail}
              className="cursor-pointer self-center border-none bg-transparent p-0 font-body text-[13px] text-ink-muted transition-colors hover:text-navy-800"
            >
              Use a different email
            </button>
          </form>
        )}

        {step === "link" && (
          <div className="flex flex-col gap-[18px]">
            <p className="m-0 font-body text-sm leading-[1.6] text-ink-muted">
              Email verified. If the scheduling page didn’t open, click below to continue:
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${primaryButtonClass} text-center`}
            >
              Open scheduling page
            </a>
          </div>
        )}
      </div>
    </dialog>
  );
}
