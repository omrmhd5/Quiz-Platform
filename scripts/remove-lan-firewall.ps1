# Remove the dev firewall rule added by allow-lan-firewall.ps1.
# Run PowerShell as Administrator.

$ErrorActionPreference = "Stop"
$ruleName = "Quiz Platform Dev (TCP 3000)"

$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if (-not $existing) {
  Write-Host "No firewall rule to remove: $ruleName"
  exit 0
}

try {
  Remove-NetFirewallRule -DisplayName $ruleName
} catch {
  Write-Error "Failed to remove firewall rule. Run PowerShell as Administrator."
  exit 1
}

Write-Host "Removed firewall rule: $ruleName"
