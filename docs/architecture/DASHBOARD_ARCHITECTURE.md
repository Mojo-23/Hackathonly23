# Dashboard Architecture — PHASE-AUTH-000

**Status: architecture specification, not implemented.** Companion to `DECISIONS.md` AD-5. No UI code exists yet for either dashboard beyond the existing placeholder `/dashboard` route noted in the prior phase's review.

---

## 1. Two products, one platform

Per the phase brief's Product Vision and `DECISIONS.md` AD-5: the Participant Dashboard and Organizer Dashboard are designed and built as **two independent experiences**, not one component with a role flag. They share:
- One design system (`docs/DESIGN_SYSTEM.md`), one motion system (`docs/MOTION_SYSTEM.md`).
- One auth provider and session (a dual-role user does not re-authenticate to switch).
- One deployment (`docs/ARCHITECTURE.md` §7 — Vercel + Supabase, unchanged).
- Common primitives (`StatusBadge`, `MetricCard`, `EmptyState`, skeletons — already specified in `docs/ARCHITECTURE.md` §Phase 2).

They do **not** share:
- A route group (`(participant)` vs `(organizer)`, already established in `docs/ROUTES.md`).
- A layout, nav component, or top-level page component.
- A mental model — the participant dashboard is single-tenant ("my stuff"); the organizer dashboard is inherently multi-tenant (org → events → per-event command center), a structurally different information architecture, not just a different color scheme.

## 2. Participant Dashboard

Single-tenant: everything on this dashboard is scoped to "me," never to an organization. Structure (ratifying `docs/ROUTES.md` §Participant, unchanged by this phase):

- **Home (`/dashboard`):** my events, active proposals awaiting my response, my teams, "next actions" (e.g., "submission due in 6 hours," "you have a pending proposal").
- **My Events (`/my-events`):** registrations + statuses + QR per event.
- **Proposals (`/proposals`):** matching proposals across all my events.
- **Teams (`/teams/[teamId]`):** roster, revealed contacts (post-reveal only), submission.
- **Profile (`/profile`):** identity, matching preferences, talent opt-in, consent history.

**Organizer-workspace switch:** if (and only if) the signed-in user has ≥1 `organization_members` row, a persistent, clearly-labeled affordance (e.g., in the dashboard header, not buried in a menu) offers "Switch to Organizer" — navigating to `/organizer`. This is the entire mechanism for a dual-role participant to reach their organizer capability; there is no merged view.

## 3. Organizer Dashboard

Multi-tenant: everything is scoped first to an organization, then to an event within it. Structure (ratifying `docs/ROUTES.md` §Organizer, unchanged by this phase):

- **Org home (`/organizer`):** which organization (switcher if ≥2), events list, org settings, org members.
- **Command center (`/organizer/events/[eventId]`):** the existing, already-specified metric-grid + warnings-feed surface (`docs/ARCHITECTURE.md` §6, `docs/ROUTES.md` §Organizer) — unchanged by this phase.
- All of the existing organizer sub-routes (participants, matching, check-in, submissions, judging, mentor-requests, reports, sponsor-report, talent, exports, settings) — unchanged.

**Participant-workspace switch:** symmetric to §2 — a persistent affordance ("Switch to Participant view" or similar) is always available to a signed-in user, since every organizer is *also* implicitly capable of participating (participation needs no role). This is not conditional on any membership check — anyone can always reach `/dashboard`.

**Organization switcher:** appears only when the user belongs to ≥2 organizations (`organization_members` count ≥2). Selecting an org sets the active org context for the rest of the organizer session (client-side state, re-validated server-side on every request per `RLS_STRATEGY.md` §1 — the switcher is a convenience, not a trust boundary).

## 4. Why not "one dashboard with modes" — concrete failure modes rejected

Restating `DECISIONS.md` AD-5's rejection with the specific failure modes this would cause in *this* product, for implementers who might be tempted to merge them later for perceived code reuse:

- **Command-center metrics vs. "my next actions" are different shapes of information entirely** — one is an aggregate across potentially hundreds of participants, the other is a personal to-do list. Forcing them through one layout produces a component that has to internally branch on almost every piece of content, which is a worse form of duplication than two separate, individually-simple page trees.
- **RLS-gating a single route is harder to reason about than gating two.** `/dashboard` (participant) needs no organization check at all; `/organizer` needs an organization-membership check on every sub-route. A merged route would need to run the organizer check even for pure-participant users just to know which "mode" to render, adding a query and a branch to the common case for the benefit of the uncommon (dual-role) case — backwards.
- **The product vision explicitly frames these as two products.** Building them as one component with an if-statement quietly contradicts that framing at the code level even if the UI momentarily looks fine — it will resist future divergence (e.g., if the organizer dashboard later needs a completely different nav paradigm, like a left rail vs. the participant dashboard's top nav) because everything is coupled through one shared component.

## 5. What is explicitly out of scope for this document

No visual design, layout, component tree, or copy is specified here — that is Design Authority work (per `CLAUDE.md`'s role split), to happen in a future, separately-approved design pass once this architecture is approved and the backend groundwork (`PHASE-AUTH-001`, migrations, RLS) exists to build against. This document specifies the **information architecture and route ownership boundary** only.
