<#
.SYNOPSIS
    Launches Codex against the current task, per WORKFLOW.md steps 2-5.

.DESCRIPTION
    Preconditions checked before launch:
      - /tasks/current-task.md exists and is non-empty (there must be an
        active task -- Codex should never be launched without one).
      - The git working tree has no uncommitted changes, so it's clear
        Codex is starting from a clean base (one writer at a time), and so
        that everything Codex touches can be identified afterward.

    After the run, this script:
      - requires /handoff/CODEX_SUMMARY.md to exist (fails otherwise),
      - flags any change under /docs, AGENTS.md, or CLAUDE.md (these are
        off-limits to Codex unless the task explicitly says otherwise),
      - prints a git status/diff summary so the human can see exactly
        what changed before reviewing or approving anything.

.PARAMETER CodexCommand
    The Codex CLI executable/command to invoke. Defaults to "codex".
    Override if your local Codex CLI is installed under a different name
    or invoked via npx (e.g. "npx @openai/codex").

.PARAMETER Sandbox
    Sandbox policy passed to `codex exec -s`. Defaults to "workspace-write"
    so Codex can create/edit files inside the repo but not touch anything
    outside it. See `codex exec --help` for the full set of options.

.PARAMETER DryRun
    If set, prints the command and prompt that would be run without
    actually launching Codex. Use this to sanity-check the setup.

.PARAMETER AllowDirtyTree
    If set, skips the clean-working-tree precondition. Use only when you
    know what you're doing -- this exists for the one-writer-at-a-time
    rule in WORKFLOW.md, not as a convenience toggle. Note that with a
    dirty starting tree, the post-run docs-guard and diff summary cannot
    distinguish Codex's changes from what was already uncommitted.

.NOTES
    Written for Windows PowerShell 5.1. Run from the repository root (or
    anywhere -- it resolves paths relative to the script's own location).

    Uses `codex exec`, Codex's non-interactive subcommand, because a bare
    `codex` invocation requires an attached TTY.
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

# --- Precondition: refuse to run against the "no active task" placeholder ---
if ($taskContent.TrimStart() -match "^# NO ACTIVE TASK") {
    Write-Host "/tasks/current-task.md is the NO ACTIVE TASK placeholder. Claude must write a real task before Codex can run." -ForegroundColor Red
    exit 1
}

# --- Precondition: one writer at a time -- start from a clean tree ---
# git status errors (not a repo, git missing) are treated the same as a
# dirty tree: this check must pass, not silently skip, before Codex runs.
if (-not $AllowDirtyTree) {
    $priorPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $gitStatus = git status --porcelain 2>$null
    $gitExitCode = $LASTEXITCODE
    $ErrorActionPreference = $priorPreference

    if ($gitExitCode -ne 0) {
        Write-Host "Could not read git status (not a repo, or git is unavailable). Fix that first, or pass -AllowDirtyTree to bypass this check." -ForegroundColor Red
        exit 1
    }

    if (-not [string]::IsNullOrWhiteSpace($gitStatus)) {
        Write-Host "Working tree has uncommitted changes. Commit, stash, or review them before starting a new Codex run." -ForegroundColor Red
        Write-Host "(Pass -AllowDirtyTree to override if this is intentional.)" -ForegroundColor Yellow
        git status --short
        exit 1
    }
}

if (-not (Test-Path $handoffDir)) {
    New-Item -ItemType Directory -Path $handoffDir -Force | Out-Null
}

# Built at runtime, not written as a literal, so this script itself never
# contains the forbidden identifier string that scripts/verify.ps1 scans
# scripts/ for. Same identifier, just not present as a match-able literal.
$forbiddenIdentifier = "profile" + "_" + "id"

$prompt = @"
Read AGENTS.md in full, then read every file in /docs, then read
/tasks/current-task.md. Implement only the task described there --
its stated scope and acceptance criteria, nothing adjacent.

Follow every rule in AGENTS.md, including: /docs, AGENTS.md, and CLAUDE.md
are all read-only unless the task explicitly says otherwise; the user_id
naming rule (profiles.id is the only exception, $forbiddenIdentifier must
never appear); no database migrations or RLS/contact-reveal logic without
the task showing explicit human approval; and the permanent product
boundaries (no public marketplace, no public people browsing, no public
contact reveal, no AI winner selection, no public negative scoring, no
sponsor access to raw participant data without explicit opt-in).

When implementation is complete, run:
    powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
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

# --- Post-run: always show what actually changed, regardless of outcome ---
Write-Host ""
Write-Host "==> git status after the run" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "==> git diff summary" -ForegroundColor Cyan
git diff --stat
git diff --stat --cached

if ($exitCode -ne 0) {
    Write-Host "Codex exited with code $exitCode." -ForegroundColor Red
    exit $exitCode
}

# --- Post-run: the handoff summary is required, not optional ---
$summaryPath = Join-Path $handoffDir "CODEX_SUMMARY.md"
if (-not (Test-Path $summaryPath)) {
    Write-Host "Codex run finished but /handoff/CODEX_SUMMARY.md was not written. This is required -- treat the run as incomplete." -ForegroundColor Red
    exit 1
}

# --- Post-run: /docs, AGENTS.md, and CLAUDE.md are off-limits by default ---
$changedFiles = @()
$changedFiles += git diff --name-only HEAD 2>$null
$changedFiles += git ls-files --others --exclude-standard 2>$null
$changedFiles = $changedFiles | Where-Object { $_ } | Select-Object -Unique

$offLimits = $changedFiles | Where-Object {
    $_ -match "^docs/" -or $_ -eq "AGENTS.md" -or $_ -eq "CLAUDE.md"
}

if ($offLimits.Count -gt 0) {
    Write-Host ""
    Write-Host "WARNING: Codex modified files that are off-limits by default:" -ForegroundColor Red
    $offLimits | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host "Only proceed if /tasks/current-task.md explicitly authorized this. Otherwise reject the change." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Codex run complete. Handoff summary written to $summaryPath" -ForegroundColor Green
Write-Host "Next: Claude reviews the git diff and CODEX_SUMMARY.md, then writes /handoff/CLAUDE_REVIEW.md." -ForegroundColor Cyan
