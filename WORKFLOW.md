# WORKFLOW.md — The Claude + Codex process

This describes how work actually moves through this repo. Read this if you're the human, or if you're either agent and want to see the whole loop, not just your slice of it.

## Roles

- **Claude** — planner, architect, reviewer, final judge. Writes tasks, reviews diffs, never writes product code directly. See `CLAUDE.md`.
- **Codex** — implementation worker. Reads the task, writes the code, runs verification, writes a handoff summary. Never plans ahead or reviews its own work as final. See `AGENTS.md`.
- **Human** — owns the repo. Approves migrations, approves RLS/contact-reveal work, gives the final commit go-ahead, breaks ties when Claude and Codex disagree or either is blocked.

## The loop

1. **Claude writes `/tasks/current-task.md`.**
   One task, scoped to a single slice of `/docs/PHASES.md`, using `/tasks/TASK_TEMPLATE.md`. This file is the entire implementation contract — if it's not in there, Codex shouldn't build it.

2. **Codex reads `AGENTS.md`, `/docs`, and `/tasks/current-task.md`.**
   In that order. `/docs` is the source of truth Codex must not contradict; the task is the specific thing to build right now.

3. **Codex implements only the current task.**
   No adjacent scope, no "while I'm here" fixes, no speculative future-phase work.

4. **Codex runs verification.**
   `powershell -File scripts/verify.ps1` — build, typecheck, lint, and a scan for the forbidden `profile_id` string. Failures get fixed or honestly reported, not hidden.

5. **Codex writes `/handoff/CODEX_SUMMARY.md`.**
   What changed, files touched, verification results, any deviations from the task and why, open questions.

6. **Claude reviews the actual `git diff` and `CODEX_SUMMARY.md`.**
   Not just the summary's claims — the real diff. Checks: does it match the task, does it respect the hard rules (below), did scope stay in bounds.

7. **Claude writes `/handoff/CLAUDE_REVIEW.md`.**
   Verdict — approve, needs fixes, or blocked — plus what was checked and why. Claude does not patch code during this step; see `CLAUDE.md`.

8. **Human approves the commit or asks for fixes.**
   If fixes are needed, that's a new (or revised) `/tasks/current-task.md` — the loop restarts at step 1, not a live edit bolted onto the reviewed diff.

## Standing rules (apply at every step, for everyone)

- **One active task at a time.** Don't start a second task while one is mid-review. Don't let Codex pick up "the next obvious thing."
- **One writer at a time.** Whoever is currently implementing owns the working tree; nobody else edits product code concurrently.
- **`/docs` is the source of truth.** Product/architecture decisions live there. Codex doesn't edit it unless a task explicitly says to. Claude edits it deliberately, not as a side effect of writing a task.
- **`/tasks/current-task.md` is the implementation contract.** If the task and the docs ever conflict, that's a planning bug — stop and resolve it, don't let Codex guess which one wins.
- **Codex must not modify `/docs` unless explicitly allowed** by the current task.
- **Claude must not freestyle code during review.** Findings go in `CLAUDE_REVIEW.md`; fixes go through a new task.
- **Database migrations require human approval.** No task authorizes one without the human having said so first, in this conversation, explicitly.
- **RLS and contact-reveal logic require human approval.** Same standard as migrations — these implement the platform's core privacy promise.
- **Permanent product boundaries** (not phase-specific, never relaxed by a task): no public marketplace, no public browsing of people, no public contact reveal, no AI winner selection, no public negative scoring, no sponsor access to raw participant data without explicit opt-in.
- **Naming rule:** `user_id` everywhere; `profiles.id` is the only exception. The string `profile_id` must never appear in the repo — enforced by `scripts/verify.ps1` and re-checked in every Claude review.

## File map

| Path | Owner | Purpose |
|---|---|---|
| `/docs/*.md` | Human + Claude | Source of truth: architecture, database, RLS, routes, components, phases, privacy, decisions, risks |
| `/tasks/current-task.md` | Claude writes, Codex reads | The single active implementation contract |
| `/tasks/TASK_TEMPLATE.md` | Reference | Shape every task should follow |
| `/handoff/CODEX_SUMMARY.md` | Codex writes, Claude reads | What Codex did and verified |
| `/handoff/CLAUDE_REVIEW.md` | Claude writes, human reads | Claude's verdict on the handoff |
| `AGENTS.md` | Reference for Codex | Codex's operating rules |
| `CLAUDE.md` | Reference for Claude | Claude's operating rules |
| `scripts/run-codex-task.ps1` | Tooling | Launches Codex against the current task |
| `scripts/verify.ps1` | Tooling | Build/typecheck/lint/forbidden-string gate, used by Codex before handoff and by anyone re-checking a diff |

## Why this shape

The split exists so that the agent under time pressure to "just get it working" (Codex) is never also the one deciding whether the result is good enough (Claude), and so that the one deciding what "good enough" means (Claude) never quietly rewrites the evidence it's judging. The human sits above both because migrations and privacy-critical logic are the two places a mistake stops being a bug and starts being an incident.
