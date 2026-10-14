# Full build + zip:
#   powershell -ExecutionPolicy Bypass -File offline\build-client-zip.ps1
# Re-zip existing images only (no docker build):
#   powershell -ExecutionPolicy Bypass -File offline\build-client-zip.ps1 -PackageOnly
param([switch]$PackageOnly)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$KitName = "Quiz-Platform-Offline"
$KitDir = Join-Path $env:USERPROFILE "Downloads\$KitName"
$ZipPath = Join-Path $env:USERPROFILE "Downloads\$KitName.zip"

Set-Location $RepoRoot

if (-not $PackageOnly) {
  Write-Host "==> Reset dev stack + fresh DB volume"
  cmd /c "docker compose -f docker/docker-compose.yml --project-directory . down -v 2>nul"

  Write-Host "==> Build app image (Node runs inside Docker; host Node not required)"
  docker compose -f docker/docker-compose.yml --project-directory . build web
  docker pull postgres:18
} else {
  Write-Host "==> PackageOnly: skipping build (using existing images)"
  docker image inspect quiz-platform-web:offline | Out-Null
  docker image inspect postgres:18 | Out-Null
}

Write-Host "==> Assemble kit in Downloads"
if (Test-Path $KitDir) {
  cmd /c "rmdir /s /q `"$KitDir`"" 2>$null
  Start-Sleep -Seconds 1
}
if (Test-Path $KitDir) {
  Write-Error "Close anything using $KitDir (Explorer, running START.bat), then run this script again."
  exit 1
}
New-Item -ItemType Directory -Force -Path (Join-Path $KitDir "images") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $KitDir "scripts") | Out-Null

Copy-Item "$PSScriptRoot\docker-compose.yml" $KitDir
Copy-Item "$PSScriptRoot\START.ps1" $KitDir
Copy-Item "$PSScriptRoot\START.bat" $KitDir
Copy-Item "$PSScriptRoot\STOP.ps1" $KitDir
Copy-Item "$PSScriptRoot\README-CLIENT.txt" $KitDir
Copy-Item "$PSScriptRoot\scripts\allow-lan-firewall.ps1" (Join-Path $KitDir "scripts")
Copy-Item (Join-Path $RepoRoot ".env") $KitDir

Write-Host "==> docker save (large; wait)"
docker save -o (Join-Path $KitDir "images\quiz-platform-web.tar") quiz-platform-web:offline
docker save -o (Join-Path $KitDir "images\postgres-18.tar") postgres:18

if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }
Write-Host "==> Zip"
Compress-Archive -Path $KitDir -DestinationPath $ZipPath -CompressionLevel Optimal

Write-Host ""
Write-Host "Done."
Write-Host "Folder: $KitDir"
Write-Host "Zip:    $ZipPath"
