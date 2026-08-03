"use client";

import type { ReactNode } from "react";
import { useBookingModal } from "./BookingModalProvider";

interface BookingTriggerProps {
  className?: string;
  children: ReactNode;
}

export function BookingTrigger({ className, children }: BookingTriggerProps) {
  const { open } = useBookingModal();
  return (
    <button type="button" className={className} onClick={open}>
      {children}
    </button>
  );
}
