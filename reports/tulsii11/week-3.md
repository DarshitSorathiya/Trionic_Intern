# Week 3 — Tulsi Dhameliya

**Team:** Team A — Frontend
**Module owned:** Dashboard + History
**Week of:** 2026-06-04

---

## What I shipped this week

* Pulled latest `main` after database migration PR #163 merged into main
* Set up `.env.local` with real Supabase project credentials
* Successfully authenticated against real Supabase project at `zawdoeusvkldgrigfbow.supabase.co`
* Confirmed dashboard loads correctly at `/dashboard` with real Supabase auth flow
* Verified sign-up and email confirmation flow works end to end
* Tested all filter dropdowns (status, language, doc type) and search bar in authenticated state
* Verified all 4 empty states render correctly under real auth
* Investigated missing `GET /api/documents` list route after pulling latest main
* Commented on issue #100 flagging the missing route and tagging repo managers
* Confirmed with repo managers that the list endpoint is tracked separately in #262 and is out of my scope
* Issue #100 closed as completed — dashboard PR #143 accepted as full evidence

## Metrics

| Metric | Value | Notes |
| --- | --- | --- |
| Auth flow tested | ✅ | Real Supabase sign-in + email confirmation working |
| Environment setup | ✅ | `.env.local` wired to live Supabase project |
| Dashboard states verified | 4 | Loading, error, empty, no-results all working |
| Blocker escalations | 1 | Issue #100 comment tagging repo managers |
| Issues closed | 1 | #100 closed as completed by repo managers |
| Remaining scope moved | 1 | `GET /api/documents` list route → #262, out of scope |

## Learnings

* Understood how `.env.local` connects the Next.js frontend to a real Supabase project
* Learned that database migration and API route implementation are separate concerns owned by different teams
* Understood how RLS (Row Level Security) scopes data per authenticated user in Supabase
* Learned how to escalate inter-team blockers correctly via GitHub issue comments
* Understood how repo managers track and close issues based on merged evidence in main

## Blockers

* `GET /api/documents` list route was missing after pulling latest main
* Escalated to repo managers via comment on issue #100
* Confirmed by repo managers — list endpoint tracked in #262, not my scope
* No remaining blockers on my end

## Next week

* Watch for Week 4 task assignment
* Wire dashboard to real document data once #262 lands if assigned to me
* Continue building on dashboard features as directed

---

### Mentor feedback

> *Pending*