<#
.SYNOPSIS
    Verification gate for Hackathonly Jordan. Run before any Codex handoff,
    and re-run by Claude/human when re-checking a diff.

.DESCRIPTION
    Runs, in order:
      1. npm run build
      2. npx tsc --noEmit
      3. npx eslint .
      4. A scan for the forbidden string "profile_id" in code directories
         (src/, supabase/ if present). Docs and workflow files that describe
         the rule itself are intentionally excluded from the scan.

    Exits non-zero on the first failing step so it's safe to use as a gate
    in other scripts (e.g. run-codex-task.ps1).

.NOTES
    Written for Windows PowerShell 5.1. Run from the repository root:
        powershell -File scripts/verify.ps1
#>

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$failures = New-Object System.Collections.Generic.List[string]

function Invoke-Step {
    param(
        [string]$Name,
        [scriptblock]$Action
    )

    Write-Host ""
    Write-Host "==> $Name" -ForegroundColor Cyan

    try {
        & $Action
        if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) {
            throw "$Name exited with code $LASTEXITCODE"
        }
        Write-Host "    OK: $Name" -ForegroundColor Green
    }
    catch {
        Write-Host "    FAILED: $Name" -ForegroundColor Red
        Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
        $failures.Add($Name)
    }
}

# 1. Build
Invoke-Step -Name "npm run build" -Action {
    npm run build
}

# 2. Typecheck
Invoke-Step -Name "npx tsc --noEmit" -Action {
    npx tsc --noEmit
}

# 3. Lint
Invoke-Step -Name "npx eslint ." -Action {
    npx eslint .
}

# 4. Forbidden string scan: "profile_id" must never appear in actual code.
# Only scan real code directories -- /docs and the workflow files
# intentionally document the rule using the literal string, and must not
# trip this check.
Invoke-Step -Name "forbidden string scan (profile_id)" -Action {
    $codeDirs = @("src", "supabase", "scripts") | Where-Object { Test-Path (Join-Path $repoRoot $_) }

    if ($codeDirs.Count -eq 0) {
        Write-Host "    No code directories found yet -- nothing to scan." -ForegroundColor Yellow
        return
    }

    $matches = @()
    foreach ($dir in $codeDirs) {
        $fullDir = Join-Path $repoRoot $dir
        $files = Get-ChildItem -Path $fullDir -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\\.next\\" -and $_.Name -ne "verify.ps1" }

        foreach ($file in $files) {
            $found = Select-String -Path $file.FullName -Pattern "profile_id" -SimpleMatch -ErrorAction SilentlyContinue
            if ($found) {
                $matches += $found
            }
        }
    }

    if ($matches.Count -gt 0) {
        Write-Host "    Forbidden string 'profile_id' found:" -ForegroundColor Red
        foreach ($m in $matches) {
            Write-Host "      $($m.Path):$($m.LineNumber): $($m.Line.Trim())" -ForegroundColor Red
        }
        throw "profile_id must never appear in code. profiles.id (referencing auth.users(id)) is the only naming exception -- everywhere else use user_id."
    }
}

Write-Host ""
if ($failures.Count -eq 0) {
    Write-Host "All verification steps passed." -ForegroundColor Green
    exit 0
}
else {
    Write-Host "Verification failed on: $($failures -join ', ')" -ForegroundColor Red
    exit 1
}
