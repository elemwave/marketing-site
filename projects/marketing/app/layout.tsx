import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
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
  title: {
    // The home page sets no title of its own, so it renders the default.
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
          {children}
        </BookingModalProvider>
      </body>
    </html>
  );
}
