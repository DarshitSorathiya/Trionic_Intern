# Dashboard + History RFC

## Owner

Tulsi Dhameliya

---

# What

This RFC proposes the frontend structure and UX planning for the Dashboard + History module of Trionic Adalat.

The dashboard will allow users to:

* view previous legal drafts
* reopen/edit documents
* track export activity
* search/filter documents
* navigate between dashboard and editor flows

The goal is to provide a clean and scalable document management experience for users working with multiple legal drafts across sessions.

---

# Why

Users may generate multiple legal drafts across different document types and languages.

Without a proper dashboard/history system:

* document tracking becomes difficult
* editing continuity is lost
* export activity becomes unclear
* users may struggle to revisit previous drafts

This module aims to provide:

* centralized document management
* searchable history
* structured navigation
* scalable frontend architecture
* better editing continuity

The dashboard also acts as the primary entry point after authentication and therefore should remain lightweight, responsive, and easy to navigate.

---

# Layout Decision

A table-based layout is preferred for desktop screens because document history contains structured metadata such as:

* title
* status
* language
* timestamps
* export state

Tables improve scan efficiency for large document lists and provide better alignment for structured information.

For smaller screens and mobile devices, the layout may switch to stacked cards for readability and touch accessibility.

---

# Dashboard Sections

Possible dashboard sections include:

* Recent Drafts
* Recently Edited Documents
* Export History
* User Activity Overview
* Saved Drafts
* Archived Documents

Future scope may also include pinned drafts and shared documents.

---

# Document Schema

Each document item may contain:

* Title
* Document Type
* Status
* Language
* Last Modified Timestamp
* Owner
* Export State
* Draft ID
* Snapshot Version
* Citation Availability State

The schema should remain extendable for future audit and collaboration features.

---

# Status Badges

Possible status states:

* Draft
* In Review
* Exported
* Failed
* Archived

Badge states should remain visually distinct and accessible.

Example considerations:

* Draft → neutral badge
* Exported → success state
* Failed → destructive/error state
* Archived → muted state

---

# Quick Actions

Supported dashboard actions may include:

* View
* Edit
* Export PDF
* Export DOCX
* Duplicate
* Delete
* Archive
* Restore

Quick actions should remain easily accessible without cluttering the UI.

Dropdown menus may be used for secondary actions.

---

# Filtering and Sorting

The dashboard should support:

* language filter
* status filter
* document type filter
* search by title or keywords
* latest modified sorting
* alphabetical sorting

Search behavior should support partial matches and quick filtering for large document histories.

Future enhancements may include advanced filtering and saved filter presets.

---

# Empty States

The dashboard should gracefully handle:

* no documents available
* loading states
* failed fetch states
* empty search results

Possible UX considerations:

* onboarding message for first-time users
* skeleton loaders during fetch
* retry actions for failed states
* contextual empty-state messaging

---

# Responsive Design

Desktop screens will primarily use table layouts while smaller devices may use stacked card layouts.

Responsive behavior should prioritize:

* readability
* spacing consistency
* touch-friendly interactions
* simplified action menus

The dashboard should remain usable across laptops, tablets, and mobile devices.

---

# Accessibility Considerations

The dashboard should support:

* keyboard navigation
* semantic HTML structure
* accessible labels
* visible focus states
* sufficient color contrast
* screen-reader friendly actions

Interactive elements should remain reachable and understandable without relying only on color.

---

# Proposed shadcn/ui Components

Potential components include:

* Table
* Card
* Badge
* Button
* Dialog
* Dropdown Menu
* Input
* Tabs
* Skeleton Loader
* Tooltip

The component structure should remain modular and reusable across other frontend modules.

---

# Navigation Flow

Proposed navigation flow:

Dashboard
→ Document History
→ Open/Edit Draft
→ Export PDF/DOCX
→ Return to Dashboard

Future navigation enhancements may include breadcrumb support and recent-history shortcuts.

---

# Future Scope

Potential future improvements:

* draft pinning
* collaborative editing indicators
* audit history previews
* document favorites
* pagination/infinite scroll
* advanced analytics widgets

---

# How to Test

1. Open:

```text
docs/RFC-dashboard-history.md
```

2. Verify:

* dashboard UX planning exists
* filtering and sorting behavior is documented
* status badges are defined
* accessibility considerations are included
* responsive layout considerations are included

3. Confirm:

* documentation-only update
* no runtime behavior changes introduced

---

# Checklist

* [x] Dashboard/history RFC scaffold added
* [x] UX planning expanded
* [x] Filtering/sorting behavior documented
* [x] Status badge planning added
* [x] Accessibility considerations included
* [x] Responsive layout considerations included
* [x] Proposed shadcn/ui structure documented
* [ ] Runtime dashboard implementation added
* [ ] Final UI implementation completed

---

# Status

Week 1 implementation-oriented RFC scaffold for the Dashboard + History frontend module.
