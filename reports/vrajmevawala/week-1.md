# Week 1 — Vraj Mevawala

**Team:** Team A — Frontend
**Module owned:** i18n shell + language switcher
**Week of:** 2026-05-19

---

## What I shipped this week

- Authored `docs/RFC-i18n-infrastructure.md` detailing the architecture, library selection (`next-intl`), sub-path routing schema, and design specs for the dynamic language switcher component. (Commit: `73dda64`)
- Coordinated with the Frontend Lead (Sohil) and Indic Lead (Megh) to align on translation keys, localization routing, and design guidelines.

## Demo

Defined the typography fallbacks, A11y attributes, and UI behavior for the interactive language switcher:
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

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Supported languages | 5 | English, Hindi, Gujarati, Marathi, Tamil |
| RFC Status | Ready for Review | Under review by Frontend/Indic leads |

## Blockers

- None.

## Next week

- Initialize `next-intl` in the Next.js `apps/web` workspace.
- Scaffold dynamic sub-path routing (`/[locale]/...`).
- Implement the language switcher UI component with `@radix-ui/react-dropdown-menu` and Framer Motion.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> 
