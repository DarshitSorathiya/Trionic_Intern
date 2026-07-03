# UI Flow — Trionic Adalat (Week 2 baseline)

> **Owner of this document:** Repo managers. Changes require a +1 from a frontend team member AND a repo manager.
>
> **Status:** Locked for Week 2. Iteration welcome via PRs; major changes need an RFC.

This document gives the Frontend team a shared mental model of every screen and state in the v1 product. ASCII wireframes are deliberate — they're version-controllable and easy to change in PRs. Real Figma can come in Week 3 if needed.

---

## Routing map

```
/                          Landing (public)
/auth/sign-in              Sign in / sign up (Supabase Auth)
/onboarding                First-run: language + name
/dashboard                 List of user's drafts
/new                       Create new draft (intake form)
/draft/[id]                Editor + citation drawer for one draft
/draft/[id]/export         Export modal (overlay)
/settings                  Profile, language default, account
/audit/[id]                Audit log for one draft (admin/owner only)
```

Locale-prefixed routes (handled by `next-intl`): `/hi/dashboard`, `/gu/draft/123`, etc.

---

## 1. Landing (`/`)

```
┌───────────────────────────────────────────────────────────────────┐
│  Trionic Adalat                                  [Sign in] [Hi▼]  │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│           Indian legal drafts. Grounded in real law.              │
│                                                                   │
│       RTI applications · Legal notices · NDAs · Consumer          │
│              complaints · Cheque-bounce notices                   │
│                                                                   │
│                       [Get started — free]                        │
│                                                                   │
│                                                                   │
│  • Cites every claim to a real section of an Indian Act           │
│  • Available in English, Hindi, Gujarati, Marathi, Tamil          │
│  • AI-assisted drafting — not legal advice                        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

- "Not legal advice" banner is **always visible** on every page.
- Language switcher (top-right `Hi▼`) is global.

## 2. Sign-in / Sign-up (`/auth/sign-in`)

Supabase Auth, email-password to start. OAuth providers come later.

```
┌──────────────────────────────────────┐
│        Sign in to Trionic            │
│                                      │
│  Email   [______________________]    │
│  Pass    [______________________]    │
│  [Sign in]    [Forgot password?]     │
│                                      │
│  ─────────  or  ─────────            │
│  [Create a new account]              │
└──────────────────────────────────────┘
```

States: idle / submitting / error (inline) / success-redirecting.

## 3. First-run onboarding (`/onboarding`)

Triggered only on first sign-in (`users.onboarded_at` is null).

```
┌──────────────────────────────────────────────┐
│   Welcome to Trionic Adalat                  │
│                                              │
│   What should we call you?                   │
│   [_____________________]                    │
│                                              │
│   What language do you prefer for drafts?    │
│   ( ) English                                │
│   ( ) हिन्दी                                 │
│   ( ) ગુજરાતી                                │
│   ( ) मराठी                                  │
│   ( ) தமிழ்                                  │
│                                              │
│                  [Continue →]                │
└──────────────────────────────────────────────┘
```

On submit: `PATCH /api/users/me` with `display_name` + `default_language`, redirect to `/dashboard`.

## 4. Dashboard (`/dashboard`)

```
┌───────────────────────────────────────────────────────────────────┐
│  Trionic Adalat                            [+ New draft]  [Hi▼]   │
├───────────────────────────────────────────────────────────────────┤
│  Your drafts                                                      │
│                                                                   │
│  [Search...]         All ▼   English ▼   Status ▼                 │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ RTI – Municipal records                  [Draft]   2h ago   │  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │ Legal notice – Tenant deposit            [Final]   3d ago   │  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │ NDA – Freelance contract                 [Exported] 1w ago  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Empty state: "No drafts yet — start one with [+ New draft]"      │
└───────────────────────────────────────────────────────────────────┘
```

Calls `GET /api/documents`. Status badges: `draft` · `generating` · `final` · `exported`.

## 5. New draft intake (`/new`)

```
┌───────────────────────────────────────────────────────────────────┐
│  ← Back        New draft                                          │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  What kind of document do you need?                               │
│  ( ) Let our AI decide based on what you describe                 │
│  ( ) RTI application                                              │
│  ( ) Legal notice                                                 │
│  ( ) NDA                                                          │
│  ( ) Consumer complaint                                           │
│  ( ) Cheque-bounce notice                                         │
│                                                                   │
│  What's the situation?                                            │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Describe your issue in your own words. The more context,    │  │
│  │ the better the draft. Names and identifying details stay    │  │
│  │ on your device until you export.                            │  │
│  │                                                             │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Draft language                                                   │
│  English ▼                                                        │
│                                                                   │
│                                            [Generate draft →]     │
└───────────────────────────────────────────────────────────────────┘
```

On submit:
1. `POST /api/documents` → returns `{ document_id }`
2. `POST /api/draft` with `{ document_id, intake_text, target_language, doc_type }` → SSE stream
3. Redirect immediately to `/draft/[id]` and start consuming the stream there.

## 6. Generation in-progress (`/draft/[id]`, status = `generating`)

```
┌───────────────────────────────────────────────────────────────────┐
│  ← Back        RTI – Municipal records                            │
├───────────────────────────────────────────────────────────────────┤
│  Generating your draft...                                         │
│                                                                   │
│  ✓ Classifying your issue                                         │
│  ✓ Identifying applicable Acts (RTI Act, 2005)                    │
│  ⟳ Retrieving legal sections                                      │
│  ◌ Drafting                                                       │
│  ◌ Verifying citations                                            │
│  ◌ Final review                                                   │
│                                                                   │
│  ⏱ Usually takes ~30 seconds                                      │
│                                                                   │
│  [Cancel]                                                         │
└───────────────────────────────────────────────────────────────────┘
```

Drives off SSE events `step.start` and `step.done` from `/api/draft`. See `API_CONTRACTS.md`.

## 7. Editor with citation drawer (`/draft/[id]`, status = `final`)

This is **the** screen. Two-pane: markdown editor left, citation drawer right.

```
┌───────────────────────────────────────────────────────────────────┐
│  ← Back   RTI – Municipal records      [Translate]  [Export ↓]    │
├───────────────────────────────────────────────────────────────────┤
│  ⚠ AI-generated draft — not legal advice. Review before filing.   │
├──────────────────────────────────────┬────────────────────────────┤
│                                      │  Citations (12)            │
│  # Application under the Right       │                            │
│  to Information Act, 2005            │  RTI Act, 2005             │
│                                      │  ▸ Sec. 6: Request for     │
│  To,                                 │    information      [pin]  │
│  The Public Information Officer      │  ▸ Sec. 7: Disposal of     │
│  ...                                 │    request          [pin]  │
│                                      │  ▸ Sec. 8: Exemption       │
│  Under §6 of the RTI Act, 2005 [1],  │    from disclosure  [pin]  │
│  I hereby request the following...   │                            │
│                                      │  Hover any [n] to preview  │
│  [accept all] [reject all]           │                            │
└──────────────────────────────────────┴────────────────────────────┘
```

- Inline markers `[1]` `[2]` are clickable; clicking scrolls the citation drawer.
- Hover on a citation tile shows the full text of that PageIndex node in a popover.
- Edits trigger autosave via `PATCH /api/documents/{id}` → creates a new `DocumentVersion`.
- `[Translate]` triggers `POST /api/draft` with a new `target_language` (re-runs Translator agent only).

## 8. Export modal (overlay)

```
┌──────────────────────────────────────────────────────┐
│   Export draft                                  [×]  │
│                                                      │
│   Format    (•) PDF    ( ) DOCX                      │
│                                                      │
│   Include   [✓] Citation appendix                    │
│             [✓] "Not legal advice" banner            │
│             [ ] Audit trail (advanced)               │
│                                                      │
│                   [Cancel]   [Export]                │
└──────────────────────────────────────────────────────┘
```

Calls `POST /api/documents/{id}/export?format=pdf|docx`. Returns a signed Supabase Storage URL.

## 9. Settings / Profile (`/settings`)

```
┌───────────────────────────────────────────────────────────────────┐
│  Settings                                                         │
├───────────────────────────────────────────────────────────────────┤
│  Profile                                                          │
│    Display name   [______________________]                        │
│    Email          you@example.com                                 │
│                                                                   │
│  Preferences                                                      │
│    Default language    English ▼                                  │
│    Notification email  [✓] Draft completed                        │
│                        [ ] Weekly digest                          │
│                                                                   │
│  Sessions                                                         │
│    Current device — last active just now                          │
│    [Sign out of all other devices]                                │
│                                                                   │
│  Danger zone                                                      │
│    [Delete my account]                                            │
└───────────────────────────────────────────────────────────────────┘
```

## 10. Audit log (`/audit/[id]`)

For one document, show the full trace: every agent step, model used, tokens, latency, citations emitted.

```
┌───────────────────────────────────────────────────────────────────┐
│  Audit log — RTI – Municipal records                              │
├───────────────────────────────────────────────────────────────────┤
│  2026-06-10  10:42:01  classifier   claude-opus-4-6   1.2s  0.04¢ │
│                          → legal=yes, domain=admin, acts=[RTI]    │
│  2026-06-10  10:42:03  planner      claude-opus-4-6   2.1s  0.08¢ │
│                          → 4 sections to retrieve                 │
│  2026-06-10  10:42:05  pageindex    -                  0.3s  free │
│                          → 4 nodes returned                       │
│  2026-06-10  10:42:06  drafter      claude-opus-4-6   8.4s  0.32¢ │
│                          → 12 citations emitted                   │
│  ...                                                              │
└───────────────────────────────────────────────────────────────────┘
```

---

## State semantics (frontend should respect everywhere)

| State | Meaning | UI signal |
|---|---|---|
| `draft` | User created but not yet generated | Pencil icon, "Continue" |
| `generating` | Agent chain in flight | Spinner, step list |
| `final` | Generated, citations valid, awaiting user edits/export | Green check |
| `failed` | Citator-gatekeeper rejected; needs regen | Red icon, "Regenerate" |
| `exported` | At least one export performed | File-check icon |
| `archived` | User-archived | Greyed out |

## Accessibility minimums (every screen)

- All controls reachable by keyboard
- Color is never the only signal (icon + text)
- Indic fonts loaded with `font-display: swap`
- Minimum 16px body text; 1.5 line-height
- Focus rings visible on all interactive elements

## What's NOT in Week-2 scope (deliberately)

- Real-time collaborative editing
- Mobile-optimized layouts (responsive is W4 stretch)
- Voice intake
- Real export (PDF appendix can be simplified for W2)
- Real Indic translation (W2 stubs OK; W5 is real Indic)
