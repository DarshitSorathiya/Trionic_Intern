# Week 3 Report

**Name**: Vraj Mevawala  
**Team**: Frontend  
**Module owned**: Frontend Internationalization (i18n) & Language Switcher  
**Week of**: 2026-06-05

---

## What I shipped this week

- **Global Language Switcher**: Refactored the `<LanguageSwitcher />` component to render globally as a floating action widget (`fixed bottom-4 right-4 z-50`) in the root `LocaleLayout`. This prevents visual layout overlapping on complex pages (like the dual-pane draft editor workspace and the settings sidebar).
- **Onboarding and Auth Localizations**: Integrated client-side translations using `useTranslations` and transitioned route pathways to the locale-aware router (`@/i18n/routing`) for the `/auth/sign-in` and `/onboarding` views.
- **Synchronized Dictionaries**: Unified `en.json` and `hi.json` dictionary files to cover all key UI flows. Seeded and verified Hindi translations matching the approved `@Meghpatel2810` translation glossary.
- **Intake Form Translations**: Fully localized the draft intake form questions, document options, and text fields in both Hindi and English.

---

## Demo Checklist & Gates

- [x] Visiting `/hi/dashboard` returns a 200 and loads successfully (with English fallback for any unpopulated keys).
- [x] Language switcher is floating and visible on all pages (landing, dashboard, settings, auth, onboarding, and editor).
- [x] Switching locales preserves the current URL pathname (e.g. `/en/settings` -> `/hi/settings`) and transitions dynamically.
- [x] Onboarding page radio selectors load native language labels dynamically.
- [x] Zero console warnings or errors on locale transition.

---

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Supported Locales | 5 | en, hi, gu, mr, ta |
| Translated UI Strings | 48 | Landing, Auth, Dashboard, Onboarding, Intake Form |
| Localized Views | 5 | Landing, Dashboard, Sign-in, Onboarding, Settings |
| Global Component | 1 | Floating `<LanguageSwitcher />` |
| Build Status | Passed | Typechecking and Next.js static generation pass cleanly |

---

## Blockers & Learnings

- **Layout Interference**: Initially, having the LanguageSwitcher rendered inline inside dashboard and landing views required duplicating code and created layout issues on page routes with dynamic side-panels (like `DraftWorkspace`). Moving the switcher to a floating fixed container in `layout.tsx` resolved the layout interference across all views in one step.
- **Router Prefixes**: Standard `next/navigation` router pushes bypass the i18n route rewriting, leading to locale prefix drops. Swapping to `@/i18n/routing` router wrapper guarantees the locale is maintained across dashboard redirects.

---

## Next week
- Support W5 Indic content integration.
- Continue wiring new frontend views into the localized routing framework.
