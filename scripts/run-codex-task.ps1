<#
.SYNOPSIS
    Launches Codex against the current task, per WORKFLOW.md steps 2-5.

.DESCRIPTION
    Preconditions checked before launch:
      - /tasks/current-task.md exists and is non-empty (there must be an
        active task -- Codex should never be launched without one).
      - The git working tree has no uncommitted changes, so it's clear
        Codex is starting from a clean base (one writer at a time).

    On success, prints the exact instruction Codex is being given: read
    AGENTS.md, then /docs, then /tasks/current-task.md, implement only
    that task, run scripts/verify.ps1, and write /handoff/CODEX_SUMMARY.md.

.PARAMETER CodexCommand
    The Codex CLI executable/command to invoke. Defaults to "codex".
    Override if your local Codex CLI is installed under a different name
    or invoked via npx (e.g. "npx @openai/codex").

.PARAMETER Sandbox
    Sandbox policy passed to `codex exec -s`. Defaults to "workspace-write"
    so Codex can create/edit files inside the repo but not touch anything
    outside it or reach the network. See `codex exec --help` for the full
    set of options.

.PARAMETER DryRun
    If set, prints the command and prompt that would be run without
    actually launching Codex. Use this to sanity-check the setup.

.PARAMETER AllowDirtyTree
    If set, skips the clean-working-tree precondition. Use only when you
    know what you're doing -- this exists for the one-writer-at-a-time
    rule in WORKFLOW.md, not as a convenience toggle.

.NOTES
    Written for Windows PowerShell 5.1. Run from anywhere; it resolves
    paths relative to the repository root.

    Uses `codex exec`, Codex's non-interactive subcommand, because a
    bare `codex` invocation requires an attached TTY and this script is
    meant to be run from other automation as well as a normal shell.
#>

param(
    [string]$CodexCommand = "codex",
    [string]$Sandbox = "workspace-write",
    [switch]$DryRun,
    [switch]$AllowDirtyTree
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$taskPath = Join-Path $repoRoot "tasks\current-task.md"
$handoffDir = Join-Path $repoRoot "handoff"

# --- Precondition: an active task must exist and be non-empty ---
if (-not (Test-Path $taskPath)) {
    Write-Host "No /tasks/current-task.md found. Claude must write a task before Codex can run." -ForegroundColor Red
    exit 1
}

$taskContent = Get-Content -Path $taskPath -Raw -ErrorAction SilentlyContinue
if ([string]::IsNullOrWhiteSpace($taskContent)) {
    Write-Host "/tasks/current-task.md is empty. Claude must write a task before Codex can run." -ForegroundColor Red
    exit 1
}

# --- Precondition: one writer at a time -- start from a clean tree ---
# Only checked if this is actually a git repository; if not, there is no
# tree state to protect and the check is skipped rather than failing.
if (-not $AllowDirtyTree -and (Test-Path (Join-Path $repoRoot ".git"))) {
    $priorPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $gitStatus = git status --porcelain 2>$null
    $gitExitCode = $LASTEXITCODE
    $ErrorActionPreference = $priorPreference

    if ($gitExitCode -eq 0 -and -not [string]::IsNullOrWhiteSpace($gitStatus)) {
        Write-Host "Working tree has uncommitted changes. Commit, stash, or review them before starting a new Codex run." -ForegroundColor Red
        Write-Host "(Pass -AllowDirtyTree to override if this is intentional.)" -ForegroundColor Yellow
        git status --short
        exit 1
    }
}
elseif (-not (Test-Path (Join-Path $repoRoot ".git"))) {
    Write-Host "Note: this directory is not a git repository yet -- skipping the clean-tree check." -ForegroundColor Yellow
}

if (-not (Test-Path $handoffDir)) {
    New-Item -ItemType Directory -Path $handoffDir -Force | Out-Null
}

$prompt = @"
Read AGENTS.md in full, then read every file in /docs, then read
/tasks/current-task.md. Implement only the task described there --
its stated scope and acceptance criteria, nothing adjacent.

Follow every rule in AGENTS.md, including: /docs is read-only unless the
task explicitly says otherwise; the user_id naming rule (profiles.id is
the only exception, profile_id must never appear); no database migrations
or RLS/contact-reveal logic without the task showing explicit human
approval; and the permanent product boundaries (no public marketplace, no
public people browsing, no public contact reveal, no AI winner selection,
no public negative scoring, no sponsor access to raw participant data
without explicit opt-in).

When implementation is complete, run:
    powershell -File scripts/verify.ps1
and resolve any failures you can. Then write /handoff/CODEX_SUMMARY.md
describing what changed, files touched, verification results, any
deviations from the task and why, and open questions for review.

Then stop. Do not start another task.
"@

Write-Host "Task file: $taskPath" -ForegroundColor Cyan
Write-Host "---"
Write-Host $taskContent
Write-Host "---"

if ($DryRun) {
    Write-Host "[DryRun] Would launch: $CodexCommand exec -s $Sandbox <prompt>" -ForegroundColor Yellow
    Write-Host "[DryRun] Prompt:" -ForegroundColor Yellow
    Write-Host $prompt
    exit 0
}

Write-Host "Launching Codex ($CodexCommand exec -s $Sandbox)..." -ForegroundColor Cyan

& $CodexCommand exec -s $Sandbox $prompt
$exitCode = $LASTEXITCODE

if ($exitCode -ne 0) {
    Write-Host "Codex exited with code $exitCode." -ForegroundColor Red
    exit $exitCode
}

$summaryPath = Join-Path $handoffDir "CODEX_SUMMARY.md"
if (Test-Path $summaryPath) {
    Write-Host "Codex run complete. Handoff summary written to $summaryPath" -ForegroundColor Green
    Write-Host "Next: Claude reviews the git diff and CODEX_SUMMARY.md, then writes /handoff/CLAUDE_REVIEW.md." -ForegroundColor Cyan
}
else {
    Write-Host "Codex run finished but /handoff/CODEX_SUMMARY.md was not written. Check the session output above." -ForegroundColor Yellow
}
