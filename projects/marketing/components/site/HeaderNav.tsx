"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { LOGO, NAV_ITEMS } from "@/lib/site-content";

/**
 * Idle, hover, and current-page states in one string. `aria-current` is the
 * styling hook as well as the assistive-tech one, so the two cannot drift.
 */
const navLink = cn(
  "text-[14px] font-medium text-white/75 transition-colors hover:text-white",
  "aria-[current=page]:text-white aria-[current=page]:hover:text-blue-200",
);

/**
 * The logo link and the wide-viewport primary-navigation row, as their own
 * client island: both need the current route, which only the router knows
 * once no page passes it in. `Header` stays a server component around this.
 * See specs/ui/style-guide.md → HeaderNav.
 */
export function HeaderNav() {
  const currentPath = usePathname();
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
    <>
      {/*
       * On the home page the logo scrolls to the top, which is an anchor and
       * so a plain `<a>`; from anywhere else it navigates home, which is a
       * route and so must be a `<Link>`. No element carries the `top` id:
       * browsers scroll a `#top` fragment to the top of the document.
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
    </>
  );
}
