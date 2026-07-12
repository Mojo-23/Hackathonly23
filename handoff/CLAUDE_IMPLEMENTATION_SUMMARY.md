# Claude Implementation Summary — AUTH-002-PRE: Onboarding Gate and Organizer Entry

**Date:** 2026-07-12
**Author:** Claude, acting as Design/Architecture Authority (per `CLAUDE.md`'s Design Engineer role for the UI portion, and planner/architect authority for the documentation portion — both directly implemented per explicit human approval in this task's brief, not delegated to Codex).
**Scope:** architecture documentation + one real, non-visual-marketing UI route. No backend, database, migration, RLS, proxy, or package file touched.

This document replaces all prior `CLAUDE_IMPLEMENTATION_SUMMARY.md` content. It records the resolution of the two architecture gaps that blocked `AUTH-002A` from being written (see the `DECISION_REQUIRED` response in the immediately preceding turn), the three binding human decisions that resolved them, the documentation updates that record those decisions, and the one real UI route this task builds.

---

## 1. What this task covered

`AUTH-002A` (Authentication Session, Callback, and Onboarding Actions) could not be written as a task because two of its seven architecture-gate questions had no answer in the approved docs: how a first-time user is distinguished from a returning one, and whether the approved organizer landing destination (`/organizer`) actually exists. The human resolved both with three binding decisions; this task (`AUTH-002-PRE`) records those decisions in the source-of-truth architecture documents and builds the one piece of real UI (`/organizer`) that `AUTH-002A` needs to exist before it can redirect anyone to it.

## 2. Decisions recorded

1. **Persisted first-run onboarding signal:** `profiles.initial_onboarding_completed_at timestamptz null`. `null` = has not completed the first-run workspace-choice step; a timestamp = has. **Not implemented by this task** — the column does not exist yet; it is approved for `AUTH-002A` to add, under a migration that task will need separate approval to run. It is workflow/preference state only: never authorization, never read by RLS or a `security definer` function, never a substitute for `organization_members` as the source of organizer authority. It is explicitly **not** participant profile completeness — university, major, links, skills, experience, availability, matching preferences, and consent remain a separate, later concern (`PROFILE-001`/`PROFILE-002`). A participant can complete initial onboarding and still be correctly blocked later from matching/registration until that separate profile-completeness bar is met.
2. **`/organizer` is the canonical, real organizer destination — built now, not deferred and not faked.** The architecture already named `/organizer` as the organizer landing route, but `docs/ROUTES.md` recorded it as not yet built. The human explicitly rejected the alternative (redirecting a freshly-bootstrapped organizer to `/dashboard` as a temporary fallback) because it would blur the two-separate-products framing at exactly the moment it matters most. This task builds the real route instead: `src/app/organizer/page.tsx`, an honest, minimal, production-quality workspace shell — no mock data, no dead links.
3. **Email verification policy, environment-scoped:** local development may keep `enable_confirmations = false` (already true of this repo's `supabase/config.toml` — confirmed by direct inspection, not assumed) for practical automated testing. Production requires email verification before a user may complete initial onboarding. This is a policy statement for a future hosted-configuration pass — no hosted Supabase setting was touched, no remote command was run, no production key was introduced by this task.

## 3. Documents changed, and exactly what changed in each

- **`docs/architecture/AUTH_ARCHITECTURE.md`** — §2 updated to list both identity fields (`default_workspace`, implemented; `initial_onboarding_completed_at`, approved/planned) with their implementation status stated explicitly. New §4a added: the full, three-times-stated semantics of `initial_onboarding_completed_at` (what it is, what it explicitly is not — twice: not profile completeness, not authorization — and why a persisted column was chosen over a heuristic). §4 step 3 (verification) updated with the environment-scoped policy from Decision 3. §4 step 4 updated to state the onboarding gate is now driven by `initial_onboarding_completed_at is null`, not an inferred signal. §5's routing table rewritten as a "case" table with an explicit first-run row before the deterministic default-workspace/membership rows, and the organizer-with-membership row now points at the real `/organizer` route instead of an unresolved "org home or event" note; a closing line records that the `/dashboard`-fallback alternative was explicitly rejected.
- **`docs/architecture/DECISIONS.md`** — new `AD-11` entry added (before the summary table), recording all three decisions in the same alternatives-considered/decision/consequences format as AD-1 through AD-10, with the human-approval date and the exact rejected alternatives for each (generic boolean vs. timestamp; heuristic-based vs. persisted first-run detection; `/dashboard` fallback vs. building the real route).
- **`docs/architecture/PRODUCT_FLOWS.md`** — the routing/redirect table (§4) gained the first-run-check row (evaluated before any other row, before any `next` value is honored) and the organizer-with-membership row now names `/organizer` as real, plus a note that the zero-membership organizer case never falls back to `/dashboard`.
- **`docs/architecture/DASHBOARD_ARCHITECTURE.md`** — §3's "Org home (`/organizer`)" bullet updated to state the route now has a real, minimal implementation (this task), explicitly framed as a first increment for later phases to build on, not a throwaway placeholder.
- **`docs/ROUTES.md`** — the `/organizer` row changed from "Planned... No page exists yet" to "**Built**" with an honest description of its current minimal scope. The `/auth` row gained the environment-scoped email-verification policy note from Decision 3, clearly marked as not implemented by this phase.

No other document was touched. `docs/DATABASE.md` and `docs/RLS_ACCESS_MATRIX.md` were deliberately **not** edited — `initial_onboarding_completed_at` is not yet implemented, so documenting it there now would misstate the current schema; that update belongs to `AUTH-002A`, when the column actually exists.

## 4. Exact organizer route created

**File:** `src/app/organizer/page.tsx` (new).

**Structure:** a server component (no `"use client"`, no motion — consistent with the existing `(participant)/dashboard` and `organizer/events/[eventId]` pages, both plain server components; this page follows the same "quiet, tool-register" visual register `docs/DESIGN_SYSTEM.md` specifies for authenticated tool pages, deliberately distinct from the public `/organizers` marketing page's motion-heavy register). Self-contained — includes its own `<SiteHeader />` + `<AppShell>` wrapper inline, because no `src/app/organizer/layout.tsx` exists (and none was added — see §6 for why) and the root layout provides no shell chrome.

**Content:**
- `SectionHeader` — eyebrow "Organizer," title "Your organizer workspace," a one-line description of what this space is for.
- `EmptyState` (existing primitive, reused, not redesigned) — "Workspace ready — no hackathons yet," honest description that event creation and command-center management are coming in later organizer phases, with one real, working CTA: "Browse live hackathons" → `/events` (an existing, live public route — not a dead link).
- A `Card` — "What's coming next" — three plain-language lines describing future capability (create/publish a hackathon, invite co-organizers, track the event lifecycle) as prose, not as buttons to routes that don't exist yet.

**What it deliberately does not contain:** no mock event metrics, no fake organization name/data (no data fetching is attempted at all — there is no organization-reading helper in scope for this task, and inventing one would have been schema/helper work outside this task's boundaries), no organization-creation form, no auth/onboarding form, no workspace switcher (that's `PRODUCT_FLOWS.md` §2/§3 territory, explicitly deferred to whichever phase builds the full authenticated nav), no duplication of the public `/organizers` marketing page's pitch content or motion.

**Verified by build:** `npm run build` (re-run after every edit in this task) shows `/organizer` as a genuine static (`○`) route in the route table, alongside the existing `/organizer/events/[eventId]` dynamic route — both now present and distinct.

## 5. Why no `src/app/organizer/layout.tsx` was added

Considered and rejected: a shared layout at `src/app/organizer/layout.tsx` would cascade to *every* route under `/organizer/**`, including the existing `organizer/events/[eventId]/layout.tsx` subtree — which already renders its own `<SiteHeader />` + `<AppShell>`. Adding a parent layout with the same chrome would double-render the site header for the existing event page, a real visual regression this task must not introduce (the task explicitly restricts touching the existing event-specific organizer page/layout to only a "tiny, strictly required, explicitly justified" correction — a double-header bug would not qualify, and adding the shared layout to cause one would be self-inflicted). The self-contained page approach avoids this risk entirely and required zero changes to any existing file.

## 6. Confirmation: no database, backend, or security implementation occurred

No migration file was created. No RLS policy was touched. No file under `supabase/**` was touched. No file under `src/lib/auth/**` was touched. `src/proxy.ts` was not touched — and needed no change: its existing matcher (`/organizer/:path*`) already covers the new bare `/organizer` route, confirmed by inspection (`:path*` matches zero-or-more segments) and by the unchanged proxy behavior already verified live in the `PHASE-AUTH-001` closure review. No package file was touched, no dependency added. No database write, read, or query of any kind exists anywhere in the new page — it is fully static.

## 7. Explicit next phase

**`PHASE-AUTH-002A` — Authentication Session, Callback, and Onboarding Actions.** Both blocking gaps from the earlier `DECISION_REQUIRED` response are now resolved:
- The first-run detection mechanism is decided (`initial_onboarding_completed_at`, §2 above) — `AUTH-002A` may now specify the exact migration adding it.
- The organizer landing destination is real (`/organizer`, §4 above) — `AUTH-002A`'s organizer-onboarding action may now redirect to it without inventing a fake destination or falling back to `/dashboard`.

## 8. Explicit migration approval that will apply in the next phase

The human's Decision 1 in this task constitutes advance approval for `AUTH-002A` to include, in its own scoped task and subject to that task's own explicit approval-gate confirmation (per `CLAUDE.md`'s standing migration-approval rule — this task does not itself grant blanket approval for *all* of `AUTH-002A`, only for this specific column):

```
profiles.initial_onboarding_completed_at timestamptz null
```

No other schema change is pre-approved by this task.

## 9. Explicit separation between initial onboarding and participant profile completion

Stated once here for the record, matching §4a of `AUTH_ARCHITECTURE.md`: **initial onboarding** (this task's concern) is exactly one question — has this person ever been asked participant-vs-organizer — answered by `initial_onboarding_completed_at`. **Participant profile completion** (university, major, graduation year, GitHub/LinkedIn/portfolio, primary role, skills, experience level, availability, matching preferences, privacy/contact consent) is a separate, later, richer concern belonging to `PROFILE-001`/`PROFILE-002`, gated independently at the point of matching/event-registration, not at login. Completing one does not imply completing the other.
