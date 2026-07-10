# Task Template

Copy this shape into `/tasks/current-task.md` for every new task. Fill every section — an empty section is an ambiguity Codex will have to guess at, and guessing is explicitly against the rules in `AGENTS.md`.

---

## Task ID
`PHASE-<n>-<short-slug>` (e.g. `PHASE-3-profile-form`)

## Phase reference
Which `/docs/PHASES.md` phase and bullet this task implements. One task should map to a slice of one phase, not a whole phase.

## Objective
One or two sentences: what this task accomplishes and why, in plain language.

## In scope
Explicit, exhaustive bullet list of what to build/change. If it's not listed here, it's not in scope — even if it seems obviously related.

## Out of scope
Explicit bullet list of adjacent things Codex must NOT touch. Use this to pre-empt scope creep on anything that could plausibly seem related (other routes, other tables, styling unrelated components, etc).

## Relevant docs
Point at the specific `/docs/*.md` sections this task must be consistent with (e.g. "`DATABASE.md` §3 `matching_preferences`", "`RLS_ACCESS_MATRIX.md` participant row"). Codex should not need to re-derive architecture decisions — they're already made; link to them.

## Approvals on record
State explicitly, or write "None required for this task":
- [ ] Database migration approved by human — [quote or reference where/when]
- [ ] RLS / contact-reveal logic approved by human — [quote or reference where/when]

If a task needs either and this section doesn't show approval, Codex must stop rather than proceed.

## Files expected to change
Best-guess list of files/directories this task should touch. Not exhaustive/binding, but a sanity check — if Codex's diff is wildly different from this list, that's worth flagging in the handoff.

## Acceptance criteria
Concrete, checkable conditions. Prefer "renders X", "returns Y", "table has column Z with constraint W" over vague adjectives like "clean" or "robust".
- [ ]
- [ ]
- [ ]

## Constraints (standing, copied from AGENTS.md — do not remove)
- `user_id` naming rule; `profiles.id` is the only exception; `profile_id` must not appear anywhere.
- No public marketplace, no public people browsing, no public contact reveal.
- No AI winner selection, no public negative scoring.
- No sponsor access to raw participant data without explicit opt-in.
- No new dependencies unless explicitly listed above.
- `/docs` is read-only unless this task says otherwise.

## Verification steps
What Codex must run before writing the handoff (default: `powershell -File scripts/verify.ps1`; add task-specific checks here if needed, e.g. "manually hit `/events/[slug]` and confirm the new section renders").

## Handoff notes expected
Anything specific Claude should look for in review beyond the standard `CODEX_SUMMARY.md` shape — e.g. "flag if the scoring weights felt arbitrary" or "note any RLS policy you were tempted to add but didn't."
