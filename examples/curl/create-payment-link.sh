#!/usr/bin/env bash
# Create a Unifi Pay Direct payment link using curl + openssl for HMAC signing.
#
# Usage:
#   UNIFI_API_KEY=... UNIFI_API_SECRET=... ./create-payment-link.sh
#
# Optional:
#   UNIFI_BASE_URL   defaults to the Preview (Kairos Testnet) environment

set -euo pipefail

BASE_URL="${UNIFI_BASE_URL:-https://app-api-pay.unifi.me}"
API_KEY="${UNIFI_API_KEY:?Set UNIFI_API_KEY}"
API_SECRET="${UNIFI_API_SECRET:?Set UNIFI_API_SECRET}"

METHOD="POST"
URI="/api/seller/v1/payment/link"
TIMESTAMP=$(($(date +%s%N)/1000000))

BODY=$(cat <<JSON
{"requestId":"REQ-$(date +%Y%m%d%H%M%S)","storeId":"123","serviceName":"MyShop","itemName":"Premium Plan","itemPrice":12.34,"orderCurrencyCode":"USD","returnUrl":"https://myshop.com/payment/return","callbackUrl":"https://myshop.com/payment/callback","expiresAt":"2026-08-31T00:00:00Z"}
JSON
)

PAYLOAD="${METHOD}${URI}${API_KEY}${TIMESTAMP}${BODY}"
SIGNATURE=$(printf '%s' "$PAYLOAD" | openssl dgst -sha256 -hmac "$API_SECRET" -binary | base64)

curl -sS -X "$METHOD" "${BASE_URL}${URI}" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -H "X-Timestamp: ${TIMESTAMP}" \
  -H "X-Authorization-Hmac: ${SIGNATURE}" \
  -d "${BODY}"
