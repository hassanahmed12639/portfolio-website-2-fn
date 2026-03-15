# PowerShell: Test webhook
# Usage: .\scripts\test-webhook.ps1 "http://localhost:3000/api/wh/YOUR_TOKEN"
# Get the URL from: Webhooks page -> copy the URL next to your webhook

$webhookUrl = if ($args[0]) { $args[0] } else { "http://localhost:3000/api/wh/REPLACE_WITH_YOUR_TOKEN" }

$body = @{
  email      = "test@example.com"
  first_name = "Test"
  last_name  = "User"
  phone      = "+15551234567"
  value      = 99.99
  currency   = "USD"
} | ConvertTo-Json

Write-Host "Sending test payload to: $webhookUrl"
Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
Write-Host "Check: 1) Webhooks -> Recent activity  2) Lead Manager (new lead)"
