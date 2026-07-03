# RFC: Auth + Onboarding Flows

**Author:** Sarvak Makani (@sarvakmakani)  
**Issue:** #4  
**Status:** Draft  
**Date:** 2026-05-20  

---

## 1. Summary

Define the sign-up, sign-in, and first-run onboarding flows for Trionic Adalat
using Supabase Auth. This RFC covers: providers for v1, session handling in 
Next.js App Router, and RLS implications for the `users` table.

---

## 2. Auth Providers

### v1 (Week 1–2 scope)
- **Email + Password** — Supabase built-in. Simple, no third-party dependency.

### v2 (deferred, Week 3+)
- **Google OAuth** — most common among Indian users, easy Supabase integration.
- **GitHub OAuth** — useful for developer-facing users.

Decision: start with email/password only. OAuth adds redirect complexity and
callback URL config; not needed for Week 1 scaffold.

---

## 3. Session Handling

Supabase Auth in Next.js 15 (App Router) uses the `@supabase/ssr` package.

### Server Components
- Use `createServerClient` from `@supabase/ssr` with `cookies()` from `next/headers`.
- Auth state is read server-side per request — no client hydration issues.

### Client Components
- Use `createBrowserClient` for interactive auth actions (sign-in form submit, sign-out).

### Middleware (`middleware.ts`)
- `updateSession` runs on every request to refresh the access token if expired.
- Protects routes: redirect unauthenticated users from `/dashboard`, `/draft/*` → `/login`.

### Protected routes
| Route | Auth required? |
|---|---|
| `/` | No (landing) |
| `/login` | No |
| `/signup` | No |
| `/onboarding` | Yes (new users only) |
| `/dashboard` | Yes |
| `/draft/*` | Yes |

---

## 4. Onboarding Flow (first-run)

After email verification → user lands on `/onboarding`:

1. **Step 1** — Name + preferred language (English / Hindi / Gujarati / Marathi / Tamil)
2. **Step 2** — Use-case selection (RTI / Legal Notice / NDA / Consumer Complaint / Contract)
3. **Step 3** — "Not legal advice" acknowledgement (required, not skippable)

After completing onboarding → redirect to `/dashboard`.

`onboarding_complete: boolean` column in the `users` table tracks this.
Middleware checks this flag; incomplete onboarding → always redirect to `/onboarding`.

---

## 5. Database: `users` Table

```sql
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  preferred_lang text default 'en',
  onboarding_complete boolean default false,
  created_at    timestamptz default now()
);
```

This is separate from `auth.users` (Supabase-managed). We write to `public.users`
via a trigger on `auth.users` insert, or via the onboarding form submit.

---

## 6. RLS Policies

```sql
-- Enable RLS
alter table public.users enable row level security;

-- Users can only read their own row
create policy "users: select own"
  on public.users for select
  using (auth.uid() = id);

-- Users can only update their own row
create policy "users: update own"
  on public.users for update
  using (auth.uid() = id);
```

No policy for insert from client — the trigger handles row creation on signup.
Service role (backend API) bypasses RLS for admin operations.

---

## 7. Pages + Components Needed

| File | What |
|---|---|
| `app/(auth)/login/page.tsx` | Sign-in form |
| `app/(auth)/signup/page.tsx` | Sign-up form |
| `app/(auth)/layout.tsx` | Centered card layout for auth pages |
| `app/onboarding/page.tsx` | 3-step onboarding wizard |
| `middleware.ts` | Session refresh + route protection |
| `lib/supabase/server.ts` | `createServerClient` helper |
| `lib/supabase/client.ts` | `createBrowserClient` helper |

---

## 8. Open Questions

- [ ] Should email verification be required before dashboard access? (Ask @Sohil2085)
- [ ] Does the `users` insert trigger live in `packages/db` migrations? (Confirm with Om Patel)
- [ ] Magic link / passwordless as a v1.5 option?

---

## 9. Out of Scope

- OAuth providers (deferred)
- Password reset flow (Week 2)
- 2FA / MFA