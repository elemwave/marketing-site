import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

/**
 * Chrome shared by the legal prose pages. The booking provider comes from the
 * root layout; Header owns the navy surface and clips its own glow.
 *
 * No `currentPath`: these pages are reached from the footer and have no entry
 * in the primary navigation, so none of the entries is the current one.
 */
export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
