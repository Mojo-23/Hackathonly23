# Claude Review — PHASE-AUTH-002A Task Review

Fresh, independent review of `tasks/current-task.md` (`AUTH-002A`) against the architecture docs and actual repository state. No file was modified during this review except this one. Nothing implemented, nothing run, nothing committed.

## Verdict

**APPROVE**

## Should Codex run: Yes

---

## Point-by-point verification

**1. Backend/nonvisual only.** Confirmed. The "No UI scope" section (line 203) restates this as binding, forbids every UI category by name, and requires Codex to stop and report rather than invent a page if any route handler is found to structurally need one — the exact same discipline that caught the `/organizer` gap in `AUTH-002-PRE`.

**2. Only approved schema change.** Confirmed. "Migration" section (line 26) names exactly `profiles.initial_onboarding_completed_at timestamptz null`, and binding architecture point 2 (line 15) explicitly lists every column/table this task must *not* add, matching the human's forbidden list verbatim (`profiles.role`, `is_organizer`, `account_type`, `onboarding_completed` boolean, `participant_profile_complete`, `last_active_organization_id`, invitations, skills tables, profile-completion fields).

**3. Column semantics.** Confirmed: no default (line 33, explicitly contrasted with `default_workspace`'s `default 'participant'` so Codex can't confuse the two patterns), workflow state only (binding point 4, line 17), grants no authority (same line, plus restated in §F's closing safety rule at line 127), not participant-profile completion (implicit throughout — no profile-completion field is ever named as this task's concern, and §G explicitly forbids touching one), not RLS-referenced (line 36's explicit "confirm by inspection... stop and report" instruction, plus a dedicated pgTAP test requiring this, line 221).

**4. Providers.** Confirmed exactly: "Approved: email + password, Google OAuth. Not approved, do not implement: magic links, phone authentication, any other OAuth provider" (line 24).

**5. Sign-up/sign-in server-side, normal client.** Confirmed. §B/§C both explicitly require `src/lib/supabase/server.ts` (existing SSR client) and explicitly forbid `src/lib/supabase/admin.ts` (lines 75, 85, and binding point 6). Cross-checked against the actual `admin.ts` file: it throws if imported client-side and is service-role-keyed — correctly excluded from every auth/onboarding path this task builds.

**6. Google initiation and callback.** Confirmed §D/§E cover the required behaviors: correct App Router route-handler convention (with an explicit instruction to verify the convention against the installed Next.js version rather than assume, mirroring how `AUTH-001` correctly discovered the `middleware.ts`→`src/proxy.ts` rename before assuming a path), safe code exchange via the existing SSR client, no token/code exposure (repeated in §E and in the error-contract's "never include" list, §J), and safe handling of missing/invalid codes (§E, redirect to `/auth`, never a raw 500). One good, technically well-grounded addition: §D explicitly documents that this repo's local `supabase/config.toml` has no `[auth.external.google]` block (verified true by direct inspection during task authoring) and correctly does **not** authorize adding one — a full live OAuth round trip can't be tested locally without real Google credentials, and the task states this as an expected limitation rather than asking Codex to fake around it. This is the right call, not a gap.

**7. First-run routing signal.** Confirmed, stated twice for emphasis: §E line 110 ("Does not use `created_at`, `updated_at`, or `last_sign_in_at`... the only first-run signal is `initial_onboarding_completed_at is null`") and repeated as an acceptance criterion (line 302). This directly closes the exact ambiguity `AUTH-002-PRE`'s gate caught.

**8. Participant onboarding.** Confirmed §G matches all four required behaviors exactly: sets `default_workspace = 'participant'`, sets the timestamp, creates no organization/membership, and explicitly states it "must not invent" a profile-completeness field (line 135) rather than silently claiming completeness.

**9. Organizer onboarding.** Confirmed §H: validates name/slug against the RPC's actual existing behavior (correctly grounded — cross-checked against the real `create_organization_with_owner` migration from `AUTH-001`, which does exactly `btrim`/`nullif` blank-rejection and no slug normalization, matching what this task tells Codex to assume rather than inventing stricter rules that would silently diverge from the RPC); calls the existing RPC, never a direct insert (line 144); never accepts owner `user_id` from any input (same line, and structurally true since the RPC itself has no such parameter); updates preference/timestamp only *after* bootstrap succeeds (the numbered sequencing at lines 146-150); redirects to the real `/organizer` (line 150); and the partial-failure model (lines 152-156) is exact, well-reasoned, and explicitly forbids both auto-retrying organization creation and inventing a fake distributed transaction — it correctly identifies that organizer authority already exists safely in the partial-failure state (since authority comes from the membership row, not the profile columns) and prescribes a concrete, safe recovery path.

**10. Organizer authority source.** Confirmed as a running theme, not a one-off mention: binding point 4 (line 17), §F's closing line (line 127), §H's partial-failure explanation (line 155), and a dedicated acceptance criterion (line 304) and dedicated test requirement (line 220, reusing the exact non-authority pattern already proven for `default_workspace` in `AUTH-001`'s test suite).

**11. Sign-out.** Confirmed §I: server-side `auth.signOut()`, safe no-op for an already-signed-out user, fixed redirect to `/` with **no** client-suppliable redirect input at all (a deliberately stricter, simpler rule than every other action in this task — correctly reasoned, since sign-out has no legitimate reason to accept a destination).

**12. Safe-return validation.** Confirmed §K lists exactly the six required attack categories (external URLs, protocol-relative, encoded protocol-relative variants, backslash tricks, `javascript:` URLs, malformed/empty values) and correctly instructs Codex to reuse and only *strengthen if needed* the existing `AUTH-001` validator rather than rewrite it — appropriately hedged rather than asserting the existing implementation is already complete for every listed variant (a defensible, honest position, since encoded-protocol-relative edge cases are genuinely subtle and worth an explicit executable check, which §K requires).

**13. No admin/service-role client.** Confirmed repeatedly (binding point 6, §B/§C/§E/§I individually, the "Forbidden" section, a dedicated grep-based test requirement at line 234, and a dedicated acceptance criterion at line 309).

**14. No unauthorized scope.** Confirmed against the full checklist: no auth/onboarding UI (§"No UI scope"), no dashboard redesign (Forbidden section, explicitly names `src/app/(public)/**`, participant dashboard, and both existing organizer pages/layouts), no university/GitHub/skills (Forbidden section, binding point 2), no events/matching/judging (Forbidden section, explicit list), no package additions (Forbidden section, first bullet, plus the testing-tooling section's explicit "do not add one"), no remote Supabase commands (Database approval boundary section, explicit list matching every command named in the human's brief), no RLS changes (same section, plus the migration section's explicit stop-and-report instruction if one is ever found necessary).

**15. Exact allowed files.** Confirmed narrow and exhaustive — 14 new files, 5 existing-editable files, each individually named (not a wildcard/broad grant anywhere), matching the human's explicit "do not authorize broad paths" instruction.

**16. Testing and verification completeness.** Confirmed both layers are covered: database-level pgTAP tests (new dedicated file, six specific assertions including a functional RLS self-update test and a policy-text-scan non-authority test, both reusing already-proven techniques from `AUTH-001`'s test suite rather than inventing new ones) and application-level executable runtime checks (reusing the `curl`-against-`npm run start` technique already proven in `AUTH-001`'s two closure reviews, extended with a cookie jar for multi-request authenticated sequences) covering every behavior named in the review checklist, plus all ten standard verification commands in the correct order.

---

## Minor observation (non-blocking, does not change the verdict)

Line 123 contains a dangling cross-reference: "(case 6 below is the same row, stated separately in the brief for clarity — do not implement it as a separate code path from this one)." This task's own routing table only has four numbered cases (1–4); "case 6" is a leftover artifact from the original six-case brief this task's §F condenses into four, and "below" is doubly wrong since no such case appears anywhere in this document. The *substance* of the sentence is correct and unambiguous on its own (a participant-preference user with organization memberships still defaults to `/dashboard`, not a separate code path) — this is a cosmetic editorial defect, not a functional, security, or scope ambiguity, and it does not block Codex from implementing the correct behavior. Worth a follow-up cleanup pass, not worth reissuing the task over.

## Exact problems if blocked

Not applicable — verdict is APPROVE.

## Should Codex run

**Yes.**
