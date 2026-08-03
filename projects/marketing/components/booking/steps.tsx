"use client";

import type { FormEvent, ReactNode } from "react";
import { CALENDLY_URL } from "@/lib/booking/constants";

const inputClass =
  "w-full rounded-[10px] border border-dot-idle bg-white px-4 py-[13px] font-body text-[15px] text-navy-800 outline-none placeholder:text-ink-muted focus:border-navy-700";
const descriptionClass = "m-0 font-body text-sm leading-[1.6] text-ink-muted";

function PrimaryButton({
  children,
  pending,
}: {
  children: ReactNode;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="cursor-pointer rounded-[10px] border-none bg-navy-800 px-6 py-[14px] font-body text-[15px] font-semibold text-white transition-colors hover:bg-navy-700"
    >
      {children}
    </button>
  );
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="m-0 font-body text-[13px] text-error">{message}</p>;
}

interface EmailStepProps {
  email: string;
  onEmailChange: (email: string) => void;
  error: string | null;
  pending: boolean;
  onSubmit: (event: FormEvent) => void;
}

export function EmailStep({
  email,
  onEmailChange,
  error,
  pending,
  onSubmit,
}: EmailStepProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <p className={descriptionClass}>
        Enter your email address and we will send you a confirmation code to
        access the scheduling page.
      </p>
      <input
        type="email"
        required
        autoFocus
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="you@company.com"
        aria-label="Email address"
        className={inputClass}
      />
      <FormError message={error} />
      <PrimaryButton pending={pending}>
        {pending ? "Sending…" : "Send confirmation code"}
      </PrimaryButton>
    </form>
  );
}

interface CodeStepProps {
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  mockCode: string | null;
  error: string | null;
  pending: boolean;
  onSubmit: (event: FormEvent) => void;
  onBack: () => void;
}

export function CodeStep({
  email,
  code,
  onCodeChange,
  mockCode,
  error,
  pending,
  onSubmit,
  onBack,
}: CodeStepProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <p className={descriptionClass}>
        We sent a confirmation code to{" "}
        <strong className="text-navy-800">{email}</strong>. Enter it below to
        open the scheduling page.
      </p>
      {mockCode && (
        <p className="m-0 rounded-[8px] bg-surface px-[14px] py-[10px] font-body text-[13px] text-ink-muted">
          Demo mode — your code is{" "}
          <strong className="tracking-[2px] text-navy-800">{mockCode}</strong>
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
        onChange={(event) => onCodeChange(event.target.value)}
        placeholder="6-digit code"
        aria-label="Confirmation code"
        className={`${inputClass} text-[17px] tracking-[4px]`}
      />
      <FormError message={error} />
      <PrimaryButton pending={pending}>
        {pending ? "Verifying…" : "Verify & open scheduling"}
      </PrimaryButton>
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer self-center border-none bg-transparent p-0 font-body text-[13px] text-ink-muted transition-colors hover:text-navy-800"
      >
        Use a different email
      </button>
    </form>
  );
}

export function LinkStep() {
  return (
    <div className="flex flex-col gap-[18px]">
      <p className={descriptionClass}>
        Email verified. If the scheduling page didn’t open, click below to
        continue:
      </p>
      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer rounded-[10px] border-none bg-navy-800 px-6 py-[14px] text-center font-body text-[15px] font-semibold text-white transition-colors hover:bg-navy-700"
      >
        Open scheduling page
      </a>
    </div>
  );
}
