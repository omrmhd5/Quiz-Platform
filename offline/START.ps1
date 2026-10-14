# Quiz Platform offline — double-click or: powershell -ExecutionPolicy Bypass -File START.ps1
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker is not installed. Install Docker Desktop first."
  exit 1
}

Write-Host "Loading images (first run may take a few minutes)..."
docker load -i "$Root\images\postgres-18.tar"
docker load -i "$Root\images\quiz-platform-web.tar"

Write-Host "Starting Quiz Platform..."
Set-Location $Root
docker compose --env-file .env up -d

Write-Host "Firewall rule (approve the Administrator window)..."
$firewallScript = Join-Path $Root "scripts\allow-lan-firewall.ps1"
try {
  $p = Start-Process powershell.exe -Verb RunAs -Wait -PassThru -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", $firewallScript
  )
  if ($p.ExitCode -ne 0) {
    Write-Host "Firewall script exited with code $($p.ExitCode)."
  }
} catch {
  Write-Host "Firewall step skipped (Administrator was not approved)."
}

Write-Host ""
Write-Host "Teacher login: teacher / teacher123"
Write-Host "App: http://localhost:3000"
Write-Host ""

Start-Process "http://localhost:3000"
