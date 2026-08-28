# Quickstart Examples

Runnable examples for integrating with Unifi Pay Direct. Each one signs the
request with HMAC-SHA256 exactly as described in the [main README](../README.md#authentication)
and calls the Preview environment (Kairos Testnet) by default.

## Prerequisites

- An API Key and API Secret issued from the [Unifi Pay Console](https://console.unifi.me/)
  (or the [Preview Console](https://app-console.unifi.me/) for testing)
- Node.js 18+ (for the `node/` examples) or `curl` + `openssl` (for the `curl/` examples)

Set these environment variables before running any example:

```bash
export UNIFI_API_KEY="..."
export UNIFI_API_SECRET="..."
# Optional, defaults to Preview:
export UNIFI_BASE_URL="https://app-api-pay.unifi.me"   # Production: https://api-pay.unifi.me
```

## Node.js

```bash
node node/create-payment-link.js
node node/check-payment-status.js <transactionId>
```

## curl

```bash
./curl/create-payment-link.sh
./curl/check-payment-status.sh <transactionId>
```

## Notes

- These examples default to the **Preview** environment. Switch `UNIFI_BASE_URL` to
  `https://api-pay.unifi.me` only once you're ready to process real payments on Production.
- `requestId` is an idempotency key — each example generates a fresh one per run.
- Refunds are not available via the API; see the [Refunds](../README.md#refunds) section
  of the main README.
