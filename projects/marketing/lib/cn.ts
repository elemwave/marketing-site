import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Builds a className from strings, arrays, and conditional objects, then drops
 * Tailwind classes overridden by a later one (last wins).
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
