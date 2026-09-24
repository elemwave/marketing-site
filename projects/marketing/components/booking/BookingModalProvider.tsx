"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { BookingModal } from "./BookingModal";

interface OpenOptions {
    returnFocusTo?: HTMLElement | null;
}

const BookingModalContext = createContext<{
    open: (options?: OpenOptions) => void;
} | null>(null);

export function useBookingModal() {
    const context = useContext(BookingModalContext);
    if (!context) {
        throw new Error("useBookingModal requires a BookingModalProvider");
    }
    return context;
}

/** Holds the booking dialog and lets any descendant trigger open it. */
export function BookingModalProvider({
    calendlyUrl,
    children,
}: {
    calendlyUrl: string;
    children: ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const returnFocusRef = useRef<HTMLElement | null>(null);

    const open = (options?: OpenOptions) => {
        returnFocusRef.current = options?.returnFocusTo ?? null;
        setIsOpen(true);
    };

    const onClose = () => {
        setIsOpen(false);
        if (returnFocusRef.current) {
            returnFocusRef.current.focus();
            returnFocusRef.current = null;
        }
    };

    return (
        <BookingModalContext.Provider value={{ open }}>
            {children}
            <BookingModal
                calendlyUrl={calendlyUrl}
                isOpen={isOpen}
                onClose={onClose}
            />
        </BookingModalContext.Provider>
    );
}
