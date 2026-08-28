#!/usr/bin/env bash
# Check the status of a Unifi Pay Direct payment using curl + openssl for HMAC signing.
#
# Usage:
#   UNIFI_API_KEY=... UNIFI_API_SECRET=... ./check-payment-status.sh <transactionId>
#
# Optional:
#   UNIFI_BASE_URL   defaults to the Preview (Kairos Testnet) environment

set -euo pipefail

BASE_URL="${UNIFI_BASE_URL:-https://app-api-pay.unifi.me}"
API_KEY="${UNIFI_API_KEY:?Set UNIFI_API_KEY}"
API_SECRET="${UNIFI_API_SECRET:?Set UNIFI_API_SECRET}"
TRANSACTION_ID="${1:?Usage: ./check-payment-status.sh <transactionId>}"

METHOD="GET"
URI="/api/seller/v1/payment/${TRANSACTION_ID}"
TIMESTAMP=$(($(date +%s%N)/1000000))
BODY=""

PAYLOAD="${METHOD}${URI}${API_KEY}${TIMESTAMP}${BODY}"
SIGNATURE=$(printf '%s' "$PAYLOAD" | openssl dgst -sha256 -hmac "$API_SECRET" -binary | base64)

curl -sS -X "$METHOD" "${BASE_URL}${URI}" \
  -H "X-API-Key: ${API_KEY}" \
  -H "X-Timestamp: ${TIMESTAMP}" \
  -H "X-Authorization-Hmac: ${SIGNATURE}"
