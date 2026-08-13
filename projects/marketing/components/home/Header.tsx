import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { LOGO } from "@/lib/home-content";
import { BookingTrigger } from "@/components/booking/BookingTrigger";
import { pillButtonClassName } from "./PillButton";

/** Top navigation: logo + "Schedule a call" action, over the dark band. */
export function Header() {
  return (
    <header className="relative flex items-center justify-between gap-4 px-[clamp(20px,4vw,56px)] py-[14px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-[-10%] h-[180px] w-[120%] blur-[20px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,170,255,0.25), rgba(0,170,255,0.05), transparent 70%)",
        }}
      />
      <Link href="/#top" className="relative">
        <Image
          src={LOGO}
          alt="Elemwave"
          priority
          className="block h-[clamp(44px,7vw,64px)] w-auto"
        />
      </Link>
      <BookingTrigger className={cn(pillButtonClassName, "relative")}>
        Schedule a call
      </BookingTrigger>
    </header>
  );
}
