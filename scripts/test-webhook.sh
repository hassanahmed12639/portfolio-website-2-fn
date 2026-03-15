#!/bin/bash
# Test webhook - replace WEBHOOK_URL with your actual URL from the dashboard
# Get the URL from: Webhooks page → copy the URL next to your webhook

WEBHOOK_URL="${1:-http://localhost:3000/api/wh/REPLACE_WITH_YOUR_TOKEN}"

echo "Sending test payload to: $WEBHOOK_URL"
echo ""

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "phone": "+15551234567",
    "value": 99.99,
    "currency": "USD"
  }'

echo ""
echo ""
echo "Check: 1) Webhooks → Recent activity (new row)  2) Lead Manager (new lead)"
