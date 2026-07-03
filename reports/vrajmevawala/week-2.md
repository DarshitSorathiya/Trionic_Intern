# Week 2 Report

**Name**: Vraj Mevawala  
**Team**: Frontend  
**Module owned**: Frontend Internationalization (i18n) & Language Switcher  
**Week of**: 2026-05-28

---

## What I shipped this week

- **next-intl Configuration**: Set up compilation integration via the Next.js wrapper and initialized routing, requests, and middleware modules.
- **Dynamic Localized Routing**: Configured `/en/`, `/hi/`, `/gu/`, `/mr/`, and `/ta/` route paths. Moved all page layouts and views (`/`, `/dashboard`, `/settings`, `/sign-in`, `/admin`) into a dynamic `[locale]` segment while keeping `api/` at the root.
- **Translation Fallbacks**: Implemented a deep-merge request configuration that automatically falls back to default English (`en`) messages when target Indic translation keys are missing.
- **Language Switcher Component**: Created a keyboard-accessible, screen-reader friendly `<LanguageSwitcher />` component in the top-right header utilizing `@radix-ui/react-dropdown-menu` and Next-intl client router wrappers (ensuring path preservation across transitions).
- **Indic Font Fallbacks**: Loaded Google Noto Sans fonts (Devanagari, Gujarati, Tamil) with `swap` fallback configuration and added them to the Tailwind `--font-sans` theme stack.
- **Baseline Dictionaries**: Translated the first 20 UI strings (landing page, auth, and dashboard nav) into all 5 target languages inside `apps/web/messages/`.

---

## Demo Checklist & Gates

- [x] Visiting `http://localhost:3000/` automatically redirects to `/en/`.
- [x] Swapping language to Hindi (`hi`) changes the URL prefix, updates header/content translation, and renders correctly.
- [x] Swapping language to Tamil (`ta`) updates translation immediately.
- [x] Focus states, keyboard control (Arrows + Space/Enter), and screen reader accessibility are fully verified.
- [x] Zero tofu (□) glyph boxes or Cumulative Layout Shift (CLS) on language change.
- [x] No console errors or warnings in development.

---

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Supported Locales | 5 | en, hi, gu, mr, ta |
| Translated UI Strings | 20 | Landing, Auth, Dashboard Nav |
| Components Created | 1 | `<LanguageSwitcher />` |
| Route Folder Restructures | 6 | layout, page, admin, dashboard, settings, sign-in |
| CI Build Status | Passed | Local compiler checks successful |

---

## Blockers & Learnings

- **TypeScript CSS Warning**: Encountered warnings about side-effect imports of `globals.css` in the new subfolder layout, which was resolved by mapping type declarations inside `globals.d.ts` and using `@/app` absolute path aliases.
- **Strict Scope Separation**: Reverted helper adjustments on other team modules (API endpoints) to keep the PR strictly bounded to frontend tasks, leaving compile adjustments on other team routes to their respective assignees.

---

## Next week
- Assist the Indic team with filling in the translation message keys.
- Integrate the real Intakes form page and editor sections with the localized routes.
