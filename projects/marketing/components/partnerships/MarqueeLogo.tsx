"use client";

import { useState, useSyncExternalStore } from "react";

function subscribeNever() {
  return () => {};
}

function getClientTrue() {
  return true;
}

function getServerFalse() {
  return false;
}

interface MarqueeLogoProps {
  src: string;
  alt: string;
  className: string;
}

/**
 * Partner-strip mark. The first HTML defers the fetch; after mount the mark
 * is promoted so CSS-transformed cards still have pixels as they enter view.
 */
export function MarqueeLogo({ src, alt, className }: MarqueeLogoProps) {
  const isClient = useSyncExternalStore(
    subscribeNever,
    getClientTrue,
    getServerFalse,
  );
  const [loading, setLoading] = useState<"lazy" | "eager">("lazy");

  if (isClient && loading === "lazy") {
    setLoading("eager");
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} loading={loading} />
  );
}
