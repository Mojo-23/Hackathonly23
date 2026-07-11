# Task Template

Copy this shape into `/tasks/current-task.md` for every new task. Fill every section — an empty section is an ambiguity Codex will have to guess at, and guessing is explicitly against the rules in `AGENTS.md`.

---

## Task ID
`TOOLING-001`

## Phase reference
Not a `/docs/PHASES.md` feature slice — this is a tooling/infra maintenance task (same category as prior workflow-maintenance tasks). No phase or design doc is affected.

## Objective
Stop ESLint from reporting warnings against installed agent-skill vendor directories (`.agents/skills/impeccable/**`, `.claude/skills/impeccable/**`) so lint output reflects only Hackathonly app source, without touching the skills themselves or any app code.

## Context
- `scripts/verify.ps1` currently passes end-to-end, but running `npx eslint .` directly surfaces many warnings originating from `.agents/skills/impeccable/**` and `.claude/skills/impeccable/**`.
- These directories are installed agent-skill vendor files, not Hackathonly application source, and must not be edited, linted, or removed.
- This is a lint-configuration-only fix.

## In scope
- Update ESLint configuration (e.g. `eslint.config.*` or equivalent flat-config `ignores` entry) to exclude `.agents/**` and `.claude/**` from linting.
- Keep all existing lint behavior for `src/`, `scripts/`, `supabase/`, and any other currently-linted app paths unchanged.
- Update `handoff/CODEX_SUMMARY.md` with the standard handoff write.

## Out of scope
- Any change to `src/`.
- Any change to `docs/`.
- Any change to Supabase files, migrations, or tests.
- Any change to `package.json` or `package-lock.json` unless strictly unavoidable to express the ignore rule — if so, the handoff must explain exactly why no config-only alternative existed.
- Removing, disabling, editing, or renaming any file inside `.agents/skills/**` or `.claude/skills/**`.
- Any UI creation or modification.
- Any change to `docs/DESIGN_SYSTEM.md` or any other design doc.
- Any change to `scripts/verify.ps1` or `scripts/run-codex-task.ps1`.
- Any change to lint rules/severity for app code — this task only adds an exclusion, it does not retune existing rules.

## Relevant docs
None — this is a tooling-only task with no product/architecture surface. Do not consult or edit `/docs`.

## Approvals on record
- [ ] Database migration approved by human — None required for this task.
- [ ] RLS / contact-reveal logic approved by human — None required for this task.

## Files expected to change
- ESLint config file (e.g. `eslint.config.mjs`/`eslint.config.js` or equivalent, whatever currently exists in the repo).
- `handoff/CODEX_SUMMARY.md` (standard handoff write).
- `package.json` only if strictly unavoidable — see Out of scope.

If the diff touches anything else, that is a deviation to flag, not a silent addition.

## Acceptance criteria
- [ ] `npx eslint .` no longer reports any warnings or errors originating from `.agents/**` or `.claude/**`.
- [ ] `npx eslint .` still lints app source (`src/`, `scripts/`, etc.) exactly as before — no new suppressions beyond the vendor-skill exclusion.
- [ ] No file inside `.agents/skills/**` or `.claude/skills/**` is modified, renamed, or deleted.
- [ ] `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` passes (all steps).
- [ ] `git diff` is limited to ESLint config (+ `handoff/CODEX_SUMMARY.md`), with `package.json` touched only if justified in the handoff.
- [ ] Codex writes `handoff/CODEX_SUMMARY.md`.

## Constraints (standing, copied from AGENTS.md — do not remove)
- `user_id` naming rule; `profiles.id` is the only exception; the forbidden identifier (the string formed by `profile` + `_` + `id`) must not appear anywhere.
- No public marketplace, no public people browsing, no public contact reveal.
- No AI winner selection, no public negative scoring.
- No sponsor access to raw participant data without explicit opt-in.
- No new dependencies unless explicitly listed above (none are).
- `/docs` is read-only unless this task says otherwise (it does not).

## Verification steps
1. `npx eslint .` — confirm zero output referencing `.agents/**` or `.claude/**`.
2. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` — must pass.

## Handoff notes expected
- Quote the exact ESLint config change (ignore pattern(s) added).
- Confirm explicitly that no file under `.agents/skills/**` or `.claude/skills/**` was touched.
- If `package.json` needed any change, explain precisely why a config-only exclusion was insufficient.
- Confirm `npx eslint .` output before/after (warning count from vendor dirs going to zero; app-path warning/error count unchanged).
