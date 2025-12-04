/**
 * Utility functions
 * Re-export from components/ui/utils for @/lib/utils alias compatibility
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
