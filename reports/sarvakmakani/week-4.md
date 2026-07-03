# Week 4 — Sarvak Makani (@sarvakmakani)

## Deliverable
Implemented profile management and data privacy flows for settings page (Issue #268). 
PR #312 open for review.

## PR / Commit links
- PR: https://github.com/Trionic-Interns/trionic-ai-adalat/pull/312

## Demo


## What I built
- Wired DELETE /api/users/me in delete account confirmation dialog 
  (was a TODO stub from previous week)
- Added 3 unit tests for account deletion guard
- Settings page fully functional with:
  - Profile section (avatar, email change)
  - Preferences section (language preference)
  - Sessions section (sign out all other devices via Supabase revoke)
  - Danger zone (delete account with confirmation modal)

## Metrics
- 2 files modified/created
- 3 unit tests written for deletion guard
- All 5 acceptance criteria from Issue #268 completed

## Blockers
- next-intl locale routing added by @vrajmevawala causes 404s on 
  /en/settings and /en/auth/sign-in — pages are at correct paths per 
  UI_FLOW.md but need to be migrated into [locale] folder
- Flagged to @Sohil2085 for cross-team resolution

