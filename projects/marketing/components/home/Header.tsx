import Image from "next/image";
import { LOGO } from "@/lib/home-content";
import { PillButton } from "./PillButton";

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
      <a href="#top" className="relative">
        <Image
          src={LOGO}
          alt="Elemwave"
          priority
          className="block h-[clamp(44px,7vw,64px)] w-auto"
        />
      </a>
      <PillButton href="#book" className="relative">
        Schedule a call
      </PillButton>
    </header>
  );
}
