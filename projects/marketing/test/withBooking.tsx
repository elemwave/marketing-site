import { BookingModalProvider } from "@/components/booking/BookingModalProvider";

export function withBooking(node: React.ReactNode) {
  return <BookingModalProvider calendlyUrl="https://calendly.test/x">{node}</BookingModalProvider>;
}
