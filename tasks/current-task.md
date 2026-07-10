# Task Template

Copy this shape into `/tasks/current-task.md` for every new task. Fill every section — an empty section is an ambiguity Codex will have to guess at, and guessing is explicitly against the rules in `AGENTS.md`.

---

## Task ID
`PHASE3A-001`

## Phase reference
`/docs/PHASES.md` Phase 3 ("Auth, profiles, organizations") — this task covers only the dependency/environment scaffolding prerequisite, not any of Phase 3's actual features (auth, profiles, orgs, tables, RLS). Those are separate, later tasks.

## Objective
Prepare the project to talk to Supabase — dependencies, env var scaffolding, and typed client helpers — without creating any database schema, migrations, RLS, or real authentication flow. Purely plumbing that later Phase 3 tasks will build on.

## In scope
- Add `@supabase/supabase-js` and `@supabase/ssr` to `package.json` if not already present (and the resulting `package-lock.json` update).
- Create or update `.env.example` and/or `.env.local.example` listing the required environment variable **names only** (e.g. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) with placeholder/empty values — no real values, no real project references.
- Create `src/lib/env.ts` (or equivalent) that reads and validates these env vars are present at runtime, without hardcoding any real value.
- Create Supabase client scaffolding:
  - `src/lib/supabase/client.ts` — browser client, safe to import from client components, uses only the public URL/anon key.
  - `src/lib/supabase/server.ts` — server client for use in server components/actions/route handlers, using `@supabase/ssr` cookie handling, uses only the public URL/anon key.
  - `src/lib/supabase/admin.ts` — service-role client. Must be clearly marked server-only (e.g. a top-of-file guard/comment and no `"use client"` path can reach it) and must not be imported by any client component. Uses the service role key from `src/lib/env.ts`, never a literal.
- These files may compile and export typed client factories, but must not be called anywhere yet — no page, layout, or component in this task should actually invoke them to hit a live Supabase project.

## Out of scope
- Any `supabase/migrations/*` file or any SQL.
- Any actual connection to a live Supabase database or project.
- Any login/signup/auth UI (no `/auth` route, no forms, no session handling in layouts).
- Any profile form or profile page changes.
- Any RLS policy of any kind.
- Any contact-reveal logic.
- Any sponsor/talent access logic.
- Any change under `/docs`.
- Any redesign or restyling of existing public pages or components.
- Any change to `AGENTS.md`, `CLAUDE.md`, `WORKFLOW.md`, or the `scripts/*.ps1` workflow guards.
- Any file not listed in "Files expected to change" below, unless it is the standard `handoff/CODEX_SUMMARY.md` write.

## Relevant docs
- `/docs/ARCHITECTURE.md` §3 (tech stack decision — confirms `@supabase/ssr`, two-client pattern: user client vs. service-role client confined to a named admin module).
- `/docs/DATABASE.md` header (naming rule: `profiles.id` is the only exception to `user_id`; not directly exercised by this task since no schema is touched, but the env/client scaffolding must not embed any column/identifier naming that violates it).
- `/docs/PRIVACY_MODEL.md` §7 mentions the service-role confinement pattern this task is scaffolding (`src/lib/supabase/admin.ts` as the sole service-role entry point, reviewed and named).

## Approvals on record
- [ ] Database migration approved by human — not applicable, none requested, none permitted in this task.
- [ ] RLS / contact-reveal logic approved by human — not applicable, none requested, none permitted in this task.

## Files expected to change
- `package.json`, `package-lock.json` (Supabase deps only)
- `.env.example` and/or `.env.local.example` (new or updated)
- `src/lib/env.ts` (new)
- `src/lib/supabase/client.ts` (new)
- `src/lib/supabase/server.ts` (new)
- `src/lib/supabase/admin.ts` (new)
- `handoff/CODEX_SUMMARY.md` (standard handoff write)

If the diff touches files outside this list (other than the standard handoff write), treat that as a deviation to flag, not a silent addition.

## Acceptance criteria
- [ ] `npm run build` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx eslint .` passes.
- [ ] `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` passes (all four steps).
- [ ] No forbidden `profile` + `_` + `id` identifier appears anywhere in the diff.
- [ ] No real Supabase URL, anon key, or service-role key is committed anywhere — only placeholder/example values in the `.env.example`/`.env.local.example` files, and env-var reads (never literals) in the client/admin modules.
- [ ] `src/lib/supabase/admin.ts` is not imported by any file under a client-component boundary (no `"use client"` file imports it, directly or transitively).
- [ ] No `supabase/migrations` directory or SQL file created.
- [ ] No existing page, layout, or component's behavior or visual output changes.
- [ ] Codex writes `handoff/CODEX_SUMMARY.md`.

## Constraints (standing, copied from AGENTS.md — do not remove)
- `user_id` naming rule; `profiles.id` is the only exception; the forbidden identifier must not appear anywhere.
- No public marketplace, no public people browsing, no public contact reveal.
- No AI winner selection, no public negative scoring.
- No sponsor access to raw participant data without explicit opt-in.
- No new dependencies unless explicitly listed above (only `@supabase/supabase-js` and `@supabase/ssr` are authorized by this task).
- `/docs` is read-only unless this task says otherwise (it does not).
- Do not weaken, remove, or bypass any workflow guard in `scripts/verify.ps1` or `scripts/run-codex-task.ps1`.

## Verification steps
1. `npm run build`
2. `npx tsc --noEmit`
3. `npx eslint .`
4. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` (runs the above three plus the forbidden-identifier scan)
5. Manually confirm (and state in the summary) that `src/lib/supabase/admin.ts` has no import path from any client component.

## Handoff notes expected
- Confirm explicitly which env var names were used and that no real values were entered anywhere (including `.env.local.example`).
- Confirm explicitly that `admin.ts` cannot be reached from client-rendered code, and describe how that was verified (e.g. grep for its import, or an explicit server-only guard used).
- Flag anything that felt like it was creeping toward real auth/schema work so it can be deferred to a proper follow-up task instead.
