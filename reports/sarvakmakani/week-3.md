# Week 3 — Sarvak Makani (@sarvakmakani)

## Deliverable
Wired auth flow to real Supabase users table (Issue #177). PR #237 open for review.

## PR / Commit links
- PR: https://github.com/Trionic-Interns/trionic-ai-adalat/pull/237

## Demo
[Add Loom link here]

## What I built
- Fixed onboarding page to properly handle PATCH /api/users/me response
- Sign-in now checks real onboarded_at from DB — skips onboarding on return visits
- Added sign-out button to dashboard — clears session cleanly
- Full flow tested end-to-end: sign-up → onboarding → dashboard → sign-out → sign-in again → dashboard directly

## Metrics
- All 5 acceptance criteria from Issue #177 completed
- Auth flow works end-to-end against real Supabase (zawdoeusvkldgrigfbow)
- 2 files modified, sign-out + onboarding error handling added

## Blockers
- Language strings still waiting on Vraj Mevawala (next-intl) — not blocking demo

## Plan for Week 4
- Wire language switcher once Vraj's next-intl strings land
- Add password reset flow
- Polish auth error states