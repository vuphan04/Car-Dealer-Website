$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$defaultDbPath = Join-Path $projectRoot "data\rentals.db"
$dataRoot = $null
$sqlitePath = $defaultDbPath

if ($env:OKXE_DATA_DIR -and -not [string]::IsNullOrWhiteSpace($env:OKXE_DATA_DIR)) {
    $dataRoot = Join-Path $env:OKXE_DATA_DIR "okxe\data"
    New-Item -ItemType Directory -Path $dataRoot -Force | Out-Null
    $sqlitePath = Join-Path $dataRoot "rentals.db"
}

Write-Host "OKXE_DATA_DIR=$($env:OKXE_DATA_DIR)"
Write-Host "SQLite path: $sqlitePath"
Write-Host "Starting backend on http://localhost:3000"

node server.js
