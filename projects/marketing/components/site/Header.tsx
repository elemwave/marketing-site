import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { LOGO, NAV_ITEMS, type SitePath } from "@/lib/site-content";
import { BookingTrigger } from "@/components/booking/BookingTrigger";
import { pillButtonClassName } from "./PillButton";
import { NavToggle } from "./NavToggle";

/**
 * Idle, hover, and current-page states in one string. `aria-current` is the
 * styling hook as well as the assistive-tech one, so the two cannot drift.
 */
const navLink = cn(
  "text-[14px] font-medium text-white/75 transition-colors hover:text-white",
  "aria-[current=page]:text-white aria-[current=page]:hover:text-blue-200",
);

interface HeaderProps {
  currentPath: SitePath;
}

/**
 * Top navigation: logo + primary nav + "Schedule a call", over the dark band.
 *
 * Below 761px the entry row gives way to `NavToggle`, which opens a drawer
 * holding the same entries. Exactly one form is rendered at a time, so the
 * entries are never announced twice. The call to action stays in the header at
 * every width, wrapping to a second row when it must. See
 * specs/ui/style-guide.md → HeaderNav.
 */
export function Header({ currentPath }: HeaderProps) {
  const isHome = currentPath === "/";
  const logo = (
    <Image
      src={LOGO}
      alt="Elemwave"
      priority
      className="block h-[clamp(44px,7vw,64px)] w-auto"
    />
  );

  return (
    <header className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-[clamp(20px,4vw,56px)] py-[14px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-[-10%] h-[180px] w-[120%] blur-[20px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,170,255,0.25), rgba(0,170,255,0.05), transparent 70%)",
        }}
      />
      {/*
       * On the home page the logo scrolls to the top, which is an anchor and
       * so a plain `<a>`; from anywhere else it navigates home, which is a
       * route and so must be a `<Link>`.
       */}
      {isHome ? (
        <a href="#top" className="relative">
          {logo}
        </a>
      ) : (
        <Link href="/" className="relative">
          {logo}
        </Link>
      )}

      {/*
       * `flex-1` makes the nav absorb the space between logo and call to
       * action, so `justify-center` centres it there — the arrangement the
       * design asks for, and the one `justify-between` would give if the two
       * flanking elements were the same width.
       */}
      <nav
        aria-label="Primary"
        className="relative hidden flex-1 items-center justify-center gap-[clamp(18px,3vw,36px)] min-[761px]:flex"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.href === currentPath ? "page" : undefined}
            className={navLink}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <BookingTrigger className={cn(pillButtonClassName, "relative ml-auto")}>
        Schedule a call
      </BookingTrigger>

      <NavToggle currentPath={currentPath} />
    </header>
  );
}
