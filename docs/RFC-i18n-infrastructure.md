# RFC: i18n Infrastructure & Dynamic Language Switcher Spec

**Author:** Vraj Mevawala (@vrajmevawala) — Frontend Team  
**Status:** Draft → Ready for Review  
**Created:** Week 1 — May 2026  
**Coordinated with:** Sohil Kareliya (Frontend Lead), Megh Patel (Indic Lead)  
**Issue:** [#6](https://github.com/Trionic-Interns/trionic-ai-adalat/issues/6)

---

## 1. Purpose

This document details the architectural design and implementation strategy for the **Internationalization (i18n) Infrastructure** and **Language Switcher Component** in Trionic Adalat.

Our primary objective (aligned with project goal **G3**) is to support **5 language pairs**:
*   **English (Baseline)**
*   **Hindi (हिन्दी)**
*   **Gujarati (ગુજરાતી)**
*   **Marathi (मराठी)**
*   **Tamil (தமிழ்)**

This RFC addresses framework selection, dynamic routing URL strategy, font fallback mappings for Indic scripts, RTL safety, and language switcher UX design.

---

## 2. Core Design Goals

1.  **React Server Components (RSC) Support**: Ensure translations render server-side with zero client-side JavaScript overhead.
2.  **SEO-Friendly Localized Routing**: Enforce dynamic locale path segments (e.g. `/hi/dashboard`) to allow bookmarking and search engine crawling.
3.  **Perfect Typography & Layout Fidelity**: Eliminate "tofu" glyph boxes and layout shifts when rendering Indic scripts.
4.  **Accessible UX (A11y)**: Make the switcher fully keyboard-navigable and screen-reader friendly using standard accessibility specs.
5.  **RTL Safety**: Ensure core styles support Right-to-Left formatting in case of future expansion.

---

## 3. Technology Selection

We evaluated two leading options for Next.js App Router i18n support:

| Feature | `next-intl` (Recommended) | `react-i18next` + custom middleware |
| :--- | :--- | :--- |
| **Next.js 15 App Router Compatibility** | Built natively for layouts and nested routing. | Requires manual custom boilerplate & route wrapping. |
| **Server Components (RSC)** | Provides simple `getTranslations` async function. | Difficult to synchronise locale state across server/client boundary. |
| **Routing / Middleware** | Built-in middleware handles auto-redirection. | Needs manual path extraction, cookie setting, and redirection logic. |
| **Typing Support** | Type-safe translation keys checkable at build time. | Requires custom script setup to compile translation keys. |

### Decision
We will use **`next-intl`** as our primary internationalization framework. It is highly optimized for React 19 and Next.js 15, allowing us to keep translations highly performant while maintaining standard routing behaviors.

---

## 4. URL & Routing Strategy

We will adopt a **sub-path routing strategy** where the locale is the first segment in the path:
*   English: `/en/dashboard`
*   Hindi: `/hi/dashboard`
*   Gujarati: `/gu/dashboard`
*   Marathi: `/mr/dashboard`
*   Tamil: `/ta/dashboard`

### 4.1 Folder Structure

We will rename the file structure in `apps/web/app/` to wrap routes inside a dynamic `[locale]` segment:

```
apps/web/app/
├── [locale]/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── sign-in/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── favicon.ico
├── globals.css
└── middleware.ts  <-- Standard Next.js middleware (outside [locale])
```

### 4.2 Middleware Routing Logic
A Next.js middleware file (`apps/web/middleware.ts`) will intercept all incoming requests:

```mermaid
graph TD
    Request([Incoming User Request]) --> MatchRoute{Is route static asset or API?}
    MatchRoute -- Yes --> Serve[Serve asset directly]
    MatchRoute -- No --> CheckCookie{Is NEXT_LOCALE cookie set?}
    CheckCookie -- Yes --> UseCookie[Set locale = cookie value]
    CheckCookie -- No --> CheckHeader{Is Accept-Language header set?}
    CheckHeader -- Yes --> ParseHeader[Set locale = best matching header language]
    CheckHeader -- No --> Default[Set locale = 'en']
    UseCookie --> Redirect{Is current URL prefix matching locale?}
    ParseHeader --> Redirect
    Default --> Redirect
    Redirect -- Yes --> Render[Render requested localized page]
    Redirect -- No --> Rewrite[Redirect/Rewrite to /[locale]/requested-path]
```

*Note: With `localePrefix: 'always'`, a root visit to `/` will automatically redirect to the localized equivalent path `/en/` (or the user's preferred language path).*

#### Middleware Configuration:
```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Supported locales
  locales: ['en', 'hi', 'gu', 'mr', 'ta'],
  // Default locale if none detected
  defaultLocale: 'en',
  // Keep prefix even for default locale for routing consistency
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames (omitting stray locales like 'de')
  matcher: ['/', '/(en|hi|gu|mr|ta)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
```

---

## 5. Indic Font Fallbacks & Typography

Indic scripts have varying heights and widths compared to standard Latin characters. Default system fonts often distort typography layouts.

### 5.1 Google Fonts Configuration
We will use Google Fonts loaded via `next/font/google` with `swap` fallback to prevent layout shifts.

```typescript
// apps/web/app/[locale]/layout.tsx
import { Geist, Noto_Sans_Devanagari, Noto_Sans_Gujarati, Noto_Sans_Tamil } from 'next/font/google';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  weight: ['300', '400', '500', '700'],
});

const gujarati = Noto_Sans_Gujarati({
  subsets: ['gujarati'],
  variable: '--font-gujarati',
  weight: ['300', '400', '500', '700'],
});

const tamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  variable: '--font-tamil',
  weight: ['300', '400', '500', '700'],
});
```

### 5.2 Dynamic Font Injection (Next.js 15 Asynchronous Layout Params)
In Next.js 15, route parameters are loaded asynchronously and must be awaited as a Promise before destructuring.

```typescript
const fontMap: Record<string, string> = {
  en: geist.variable,
  hi: devanagari.variable,
  mr: devanagari.variable, // Marathi and Hindi share Devanagari font structures
  gu: gujarati.variable,
  ta: tamil.variable,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const fontVariable = fontMap[locale] || geist.variable;

  return (
    <html lang={locale} className={`${fontVariable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
```

### 5.3 Tailwind Config Adaptation (Tailwind v4)
In `globals.css` (Tailwind v4), we map `--font-sans` to fallback correctly:

```css
@theme inline {
  --font-sans: var(--font-sans), var(--font-devanagari), var(--font-gujarati), var(--font-tamil), system-ui, sans-serif;
}
```
This guarantees that if the browser encounters a Gujarati character on an English page (or vice versa), it falls back gracefully to the optimized Indic font without showing block character glyphs.

---

## 6. RTL Safety (Right-to-Left)

Although all 5 initial languages are LTR, we enforce RTL safety rules to future-proof the codebase:

1.  **Use Logical Properties**:
    *   Use `ms-*` (margin-inline-start) and `me-*` (margin-inline-end) instead of `ml-*` and `mr-*`.
    *   Use `ps-*` (padding-inline-start) and `pe-*` (padding-inline-end) instead of `pl-*` and `pr-*`.
    *   Use `border-s-*` and `border-e-*` instead of `border-l-*` and `border-r-*`.
2.  **Dynamic Direction attribute**:
    The main layout will set the `dir` attribute on the `<html>` root using a defined set of RTL-locales:
    ```typescript
    const RTL_LOCALES = ['ar', 'he', 'ur', 'fa'];
    
    // Within RootLayout component:
    <html lang={locale} dir={RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'}>
    ```
3.  **Positioning**:
    *   Use `start-0` / `end-0` instead of `left-0` / `right-0` for absolute placement of sidebars and modals.

---

## 7. Language Switcher UX/UI Design

The language switcher will reside in the **Topbar** header to ensure high visibility.

### 7.1 UX Requirements
*   **Native Labels**: Always render language names in their native script so that a non-English speaker can easily find their language (e.g. "ગુજરાતી" instead of "Gujarati").
*   **Instant Update**: State updates should replace the locale route immediately, using client-side transition to avoid full page hard refreshes.
*   **Cookie Sync**: The switcher must write the chosen language value to the `NEXT_LOCALE` cookie (default name used by `next-intl` configuration) to ensure future visits default to the user's preference.

### 7.2 UI Blueprint
*   **Visual Style**: Standard button with a subtle Globe icon (`lucide-react`) next to the current active language name.
*   **Glassmorphism Dropdown Menu**: A sleek, dark/light theme-adaptive menu showing options with hover highlights.
*   **Animations**: Built using Framer Motion (or simple CSS transitions) for smooth dropdown opening.

```
+------------------------------------+
|                                    |
|  [Logo]            (🌐 English ▾ ) | <--- Topbar header
|                     | हिन्दी          |
|                     | ગુજરાતી       |
|                     | मराठी         |
|                     | தமிழ்        |
+------------------------------------+
```

### 7.3 Accessibility Specs (A11y)
We will build the component using the `@radix-ui/react-dropdown-menu` primitives (via shadcn/ui) to ensure proper keyboard navigation and element roles:
*   **Trigger button**: `role="button"`, `aria-haspopup="listbox"`, and `aria-expanded` attributes.
*   **Dropdown menu container**: `role="listbox"`.
*   **Language menu item**: `role="option"`.
*   Standard keyboard controls: Arrow Up/Down to navigate list items, Enter/Space to select, and Escape to close.
*   `aria-label="Select Language"` for screen readers.

### 7.4 Reference Implementation Snippet
Below is a reference implementation using `next-intl/navigation` and Radix Dropdown Menu primitives:

```tsx
'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next-intl/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Globe, Check, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', nativeLabel: 'English' },
  { code: 'hi', nativeLabel: 'हिन्दी' },
  { code: 'gu', nativeLabel: 'ગુજરાતી' },
  { code: 'mr', nativeLabel: 'मराठी' },
  { code: 'ta', nativeLabel: 'தமிழ்' }
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const currentLanguage = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        role="button"
        aria-haspopup="listbox"
        aria-label="Select Language"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span>{currentLanguage.nativeLabel}</span>
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
              className="relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer"
            >
              {lang.code === locale && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Check className="h-4 w-4" />
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
```

---

## 8. Coordination with Team E (Indic Translator Team)

While Team A (Frontend) provides the UI and routing shell, we must coordinate with **Team E (Indic Team)** on the format and file structure of translations:

### 8.1 Message Directory Structure
Translation files will live under the `apps/web/messages/` path, structured as flat JSON files:
*   `apps/web/messages/en.json` (English)
*   `apps/web/messages/hi.json` (Hindi)
*   `apps/web/messages/gu.json` (Gujarati)
*   `apps/web/messages/mr.json` (Marathi)
*   `apps/web/messages/ta.json` (Tamil)

### 8.2 JSON Format Design
Both teams will utilize a uniform JSON schema layout:
```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "myQuests": "My Quests",
    "leaderboard": "Leaderboard",
    "profile": "Profile"
  },
  "dashboard": {
    "activeQuests": "Active Quests",
    "questsAvailable": "{count} quests available",
    "xpEarned": "{points} XP earned"
  }
}
```

---

## 9. What "Done" Looks Like (Acceptance Criteria)

- [ ] Folder structure renamed to wrap files inside `[locale]`.
- [ ] Middleware handles language auto-detection, cookie writes, and redirects.
- [ ] Indic Google Fonts successfully configure and load.
- [ ] Language switcher component successfully integrates into the header topbar.
- [ ] Screen readers read language switcher list correctly, and keyboard controls work.
- [ ] Locale cookie persists selection across browser restarts.
- [ ] Zero "tofu" (□) glyph boxes visible when rendering Hindi, Gujarati, Marathi, and Tamil strings.
- [ ] No Cumulative Layout Shift (CLS) observed on locale change (verifiable via Lighthouse).
