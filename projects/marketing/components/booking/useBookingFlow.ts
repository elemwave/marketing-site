"use client";

import { useState, type FormEvent } from "react";
import { requestCode, verifyCode } from "@/lib/booking/client";
import { CALENDLY_URL } from "@/lib/booking/constants";

export type BookingStep = "email" | "code" | "link";

/**
 * State machine for the booking dialog: email → code → Calendly in a new
 * tab. Reaches the "link" step only when the browser blocks the popup;
 * otherwise calls `onComplete` so the dialog can close itself.
 */
export function useBookingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<BookingStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [mockCode, setMockCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const reset = () => {
    setStep("email");
    setEmail("");
    setCode("");
    setMockCode(null);
    setError(null);
    setPending(false);
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
      onComplete();
    } else {
      setStep("link");
    }
  };

  const backToEmail = () => {
    setStep("email");
    setCode("");
    setError(null);
  };

  return {
    step,
    email,
    setEmail,
    code,
    setCode,
    mockCode,
    error,
    pending,
    reset,
    submitEmail,
    submitCode,
    backToEmail,
  };
}
