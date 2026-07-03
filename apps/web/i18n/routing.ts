import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // Supported locales
  locales: ["en", "hi", "gu", "mr", "ta"],
  
  // Default locale if none detected
  defaultLocale: "en",
  
  // Always keep route prefixed with locale (en, hi, etc.)
  localePrefix: "always",
});

// Navigation APIs wrapped for locale routing
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);