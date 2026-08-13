import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";

/**
 * Chrome shared by the legal prose pages.
 *
 * The provider is required: both `Header` and `Footer` render `BookingTrigger`,
 * which throws without one. The wrapper around `Header` clips its 120%-wide glow.
 */
export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BookingModalProvider>
      <div className="overflow-hidden bg-navy-950">
        <Header />
      </div>
      <main>{children}</main>
      <Footer />
    </BookingModalProvider>
  );
}
