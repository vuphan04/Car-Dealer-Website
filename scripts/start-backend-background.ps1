$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$logDir = Join-Path $projectRoot "logs"
$defaultDbPath = Join-Path $projectRoot "data\rentals.db"
$dataRoot = $null
$sqlitePath = $defaultDbPath

if ($env:OKXE_DATA_DIR -and -not [string]::IsNullOrWhiteSpace($env:OKXE_DATA_DIR)) {
    $dataRoot = Join-Path $env:OKXE_DATA_DIR "okxe\data"
    New-Item -ItemType Directory -Path $dataRoot -Force | Out-Null
    $sqlitePath = Join-Path $dataRoot "rentals.db"
}

New-Item -ItemType Directory -Path $logDir -Force | Out-Null

$stdoutLog = Join-Path $logDir "backend.stdout.log"
$stderrLog = Join-Path $logDir "backend.stderr.log"

$existing = Get-NetTCPConnection -State Listen -LocalPort 3000 -ErrorAction SilentlyContinue |
    Select-Object -First 1

if ($existing) {
    Write-Host "Port 3000 is already in use by PID $($existing.OwningProcess)."
    exit 0
}

$process = Start-Process `
    -FilePath node `
    -ArgumentList "server.js" `
    -WorkingDirectory $projectRoot `
    -RedirectStandardOutput $stdoutLog `
    -RedirectStandardError $stderrLog `
    -PassThru

Write-Host "Backend started in background."
Write-Host "PID: $($process.Id)"
Write-Host "URL: http://localhost:3000"
Write-Host "SQLite path: $sqlitePath"
Write-Host "STDOUT: $stdoutLog"
Write-Host "STDERR: $stderrLog"
