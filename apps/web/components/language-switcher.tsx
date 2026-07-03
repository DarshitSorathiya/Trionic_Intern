"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Globe, Check, ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", nativeLabel: "English" },
  { code: "hi", nativeLabel: "हिन्दी" },
  { code: "gu", nativeLabel: "ગુજરાતી" },
  { code: "mr", nativeLabel: "मराठी" },
  { code: "ta", nativeLabel: "தமிழ்" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Router transition preserving current path structure
    router.replace(pathname, { locale: newLocale });
  };

  const currentLanguage = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        role="button"
        aria-haspopup="listbox"
        aria-label="Select Language"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer text-foreground select-none"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="font-sans leading-none">{currentLanguage.nativeLabel}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          role="listbox"
          align="end"
          sideOffset={5}
          className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80"
        >
          {LANGUAGES.map((lang) => (
            <DropdownMenu.Item
              key={lang.code}
              role="option"
              aria-selected={lang.code === locale}
              onClick={() => handleLanguageChange(lang.code)}
              className="relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer font-sans"
            >
              {lang.code === locale && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </span>
              )}
              {lang.nativeLabel}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}