import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { pillButtonClassName } from "@/components/site/PillButton";

export const metadata: Metadata = {
  // The root layout's title template appends the brand.
  title: "Page not found",
};

/**
 * The static export writes this out as 404.html, which the distribution serves
 * for any path with no page document. It has no navigation entry, so no
 * `currentPath`.
 */
export default function NotFound() {
  return (
    <>
      {/* The band clips the header glow, which is wider than the viewport. */}
      <div className="overflow-hidden bg-navy-950">
        <Header />
        <main className="mx-auto flex min-h-[50vh] max-w-[760px] flex-col items-center justify-center gap-6 px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,110px)] pt-[clamp(40px,6vw,72px)] text-center">
          <h1 className="m-0 font-heading text-[clamp(32px,5vw,60px)] font-semibold leading-[1.2] tracking-[1px] text-white">
            Page not found
          </h1>
          <p className="m-0 max-w-[640px] text-[clamp(16px,1.5vw,18px)] font-light leading-[1.7] text-white/85">
            The page you were looking for does not exist or has moved.
          </p>
          <Link href="/" className={pillButtonClassName}>
            Back to the home page
          </Link>
        </main>
      </div>
      <Footer />
    </>
  );
}
