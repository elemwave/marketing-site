import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SITE_URL } from "@/lib/site-content";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  // Resolves the preview image and every other relative metadata address
  // against production. Canonical addresses are set per page, never here, so
  // the not-found page does not inherit one.
  metadataBase: new URL(SITE_URL),
  title: {
    // Pages without a title of their own (the not-found page sets one).
    default: "Elemwave - Advanced electromagnetics simulations",
    template: "%s | Elemwave",
  },
  description:
    "Innovative solutions for advanced electromagnetics simulations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const calendlyUrl = process.env.CALENDLY_URL;

  if (!calendlyUrl) {
    throw new Error(
      "CALENDLY_URL is not set; the booking modal has no scheduling page to open.",
    );
  }

  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body>
        <BookingModalProvider calendlyUrl={calendlyUrl}>
          <Header />
          <main id="main-content">
            {children}
          </main>
          <Footer />
        </BookingModalProvider>
      </body>
    </html>
  );
}
