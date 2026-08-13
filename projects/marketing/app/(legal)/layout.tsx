import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

/**
 * Chrome shared by the legal prose pages. The booking provider comes from the
 * root layout; the wrapper around `Header` clips its 120%-wide glow.
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
      <div className="overflow-hidden bg-navy-950">
        <Header />
      </div>
      <main>{children}</main>
      <Footer />
    </>
  );
}
