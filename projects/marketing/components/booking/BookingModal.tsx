"use client";

import { useEffect } from "react";
import { PopupModal } from "react-calendly";
import { CALENDLY_PRIMARY_COLOUR } from "@/lib/booking/constants";

interface BookingModalProps {
  calendlyUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Booking dialog: Calendly's own popup modal, portalled into <body>.
 * Nothing renders while closed, so no iframe loads until the visitor opens it
 * and every open gets a fresh scheduler.
 */
export function BookingModal({
  calendlyUrl,
  isOpen,
  onClose,
}: BookingModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const previousState = {
      overflow: body.style.overflow,
    };

    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousState.overflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <PopupModal
      url={calendlyUrl}
      pageSettings={{ primaryColor: CALENDLY_PRIMARY_COLOUR }}
      iframeTitle="Schedule a meeting with Elemwave"
      open
      onModalClose={onClose}
      rootElement={document.body}
    />
  );
}
