"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { BookingModal } from "./BookingModal";

const BookingModalContext = createContext<{ open: () => void } | null>(null);

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

    return (
        <BookingModalContext.Provider value={{ open: () => setIsOpen(true) }}>
            {children}
            <BookingModal
                calendlyUrl={calendlyUrl}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </BookingModalContext.Provider>
    );
}
