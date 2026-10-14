# Allow inbound TCP 3000 on Private/Domain networks so phones on the same Wi-Fi
# can reach the app. Run PowerShell as Administrator.

$ErrorActionPreference = "Stop"
$ruleName = "Quiz Platform Dev (TCP 3000)"

$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Firewall rule already exists: $ruleName"
  exit 0
}

try {
  New-NetFirewallRule `
    -DisplayName $ruleName `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 3000 `
    -Action Allow `
    -Profile Private, Domain | Out-Null
} catch {
  Write-Error @"
Failed to add firewall rule (Access denied).

Run PowerShell as Administrator, then run:
  powershell -ExecutionPolicy Bypass -File .\scripts\allow-lan-firewall.ps1
"@
  exit 1
}

Write-Host "Added firewall rule: $ruleName"
Write-Host "Students can now reach http://YOUR_LAN_IP:3000/join from the same Wi-Fi."
