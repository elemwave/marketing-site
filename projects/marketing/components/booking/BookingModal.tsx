"use client";

import { useEffect, useRef } from "react";
import { CodeStep, EmailStep, LinkStep } from "./steps";
import { useBookingFlow } from "./useBookingFlow";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Booking dialog shell: native <dialog>, close affordances and the active
 * step. Flow logic lives in useBookingFlow; step markup in steps.tsx.
 * Styling follows the imported Claude Design reference (Elemwave Home).
 */
export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const flow = useBookingFlow({
    onComplete: () => dialogRef.current?.close(),
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleClose = () => {
    flow.reset();
    onClose();
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

        {flow.step === "email" && (
          <EmailStep
            email={flow.email}
            onEmailChange={flow.setEmail}
            error={flow.error}
            pending={flow.pending}
            onSubmit={flow.submitEmail}
          />
        )}
        {flow.step === "code" && (
          <CodeStep
            email={flow.email}
            code={flow.code}
            onCodeChange={flow.setCode}
            mockCode={flow.mockCode}
            error={flow.error}
            pending={flow.pending}
            onSubmit={flow.submitCode}
            onBack={flow.backToEmail}
          />
        )}
        {flow.step === "link" && <LinkStep />}
      </div>
    </dialog>
  );
}
