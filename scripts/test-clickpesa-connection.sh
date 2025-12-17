#!/bin/bash

# ClickPesa API Connection Test
# This script tests the ClickPesa API connection and token generation

echo "🔍 Testing ClickPesa API Connection..."
echo ""

# Load environment variables
if [ -f .env.local ]; then
  source .env.local
  echo "✅ Loaded .env.local"
else
  echo "❌ .env.local not found"
  exit 1
fi

echo ""
echo "📋 Configuration:"
echo "  BASE_URL: ${CLICKPESA_BASE_URL}"
echo "  CLIENT_ID: ${CLICKPESA_CLIENT_ID:0:10}..."
echo "  API_KEY: ${CLICKPESA_API_KEY:0:10}..."
echo "  CHECKSUM_KEY: ${CLICKPESA_CHECKSUM_KEY:0:10}..."
echo ""

# Test 1: Generate Token
echo "🔐 Test 1: Generate Authorization Token..."
TOKEN_RESPONSE=$(curl -s -X POST "${CLICKPESA_BASE_URL}/generate-token" \
  -H "client-id: ${CLICKPESA_CLIENT_ID}" \
  -H "api-key: ${CLICKPESA_API_KEY}" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$TOKEN_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$TOKEN_RESPONSE" | sed '/HTTP_STATUS/d')

echo "  Status: $HTTP_STATUS"
echo "  Response: $BODY"

if [ "$HTTP_STATUS" = "200" ]; then
  echo "  ✅ Token generation successful"
  TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "  Token preview: ${TOKEN:0:30}..."
else
  echo "  ❌ Token generation failed"
  exit 1
fi

echo ""
echo "✅ All tests passed!"
echo ""
echo "Next steps:"
echo "1. Restart your Next.js dev server"
echo "2. Test the payment flow from the portal"
echo "3. Check Vercel logs for detailed request/response logging"
