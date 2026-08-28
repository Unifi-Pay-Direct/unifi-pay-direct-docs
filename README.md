# Unifi Pay Direct

Accept **stablecoin payments** (USDT, JPYC) with **zero pre-screening**, using a single HMAC-signed REST API - no SDK required.

Unifi Pay Direct is a smart-contract-based payment product from Unifi Pay. Unlike traditional payment gateways, merchants can self-register through the Unifi Pay Console and start accepting payments immediately, without a manual business review process. Payments are never held by Unifi Pay - funds move directly from the buyer's wallet to the seller's registered settlement wallet through a smart contract.

## Why Unifi Pay Direct

- **No pre-screening** - sign up and start integrating the same day; there is no manual merchant review process before you can create payment links.
- **Smart-contract settlement** - payment funds are not custodied by Unifi Pay. They are distributed directly to the seller's registered wallet by the smart contract itself.
- **Simple integration** - a REST API with HMAC request signing. No SDK installation, no client library dependency.
- **Multi-asset, multi-currency** - buyers pay in USDT or JPYC; sellers can price orders in USD or JPY (support for IDRP is planned).
- **Low, transparent fee** - a flat 1% Protocol Fee, deducted automatically at settlement.
- **Safe to test** - A Preview environment is available on Kaia's Kairos Testnet for integration testing, while Production runs on Kaia Mainnet.

## Unifi Pay Direct vs. Unifi Pay Classic

Unifi Pay also offers **Classic**, a separate product for merchants who want to keep an existing PG-style integration while still accepting stablecoin payments and settling in fiat. The two products are aimed at different integration styles:

| | Direct | Classic |
|---|---|---|
| Integration style | New REST API, payment-link based | Existing PG-style integration |
| Onboarding | Self-serve, no pre-screening | Separate onboarding required |
| Settlement | Stablecoin, direct to seller wallet | Fiat, no crypto wallet required |
| Typical fit | Merchants using self-serve payment-link or API integration | Merchants using an existing PG-style integration |

This repository documents **Direct** only. See [the Unifi Pay website](https://pay.unifi.me/) for more information about Unifi Pay Direct and Classic.

## Key Features

- API integration without an SDK
- HMAC authentication for server-to-server requests
- Payment link creation
- Payment status API
- Payment history API
- Webhook support for payment results
- USDT and JPYC payments
- USD and JPY order currencies
- Immediate settlement to a registered Kaia Mainnet wallet
- Preview environment on Kairos Testnet
- 1% Protocol Fee

## Integration Flow

1. Sign up for the Unifi Pay Console.
2. Register seller and store information.
3. Register a Kaia Mainnet settlement wallet.
4. Issue an API Key and API Secret.
5. Create an HMAC signature for the API request.
6. Request a payment link through the API.
7. Redirect or share the returned payment URL with the customer.
8. Receive payment results through Webhook when a `callbackUrl` is registered, and use the Payment Status API to retrieve detailed payment information when needed.
9. The payment amount, excluding the Protocol Fee, is settled to the registered wallet.

## API Environments

| Environment | Network | Base URL |
|---|---|---|
| Preview | Kairos Testnet | `https://app-api-pay.unifi.me` |
| Production | Kaia Mainnet | `https://api-pay.unifi.me` |

## Authentication

Server-to-server API requests use **HMAC authentication**.

Required request headers:

```text
X-API-Key
X-Timestamp
X-Authorization-Hmac
```

HMAC signature:

```text
BASE64(
  HMACSHA256(
    apiSecret,
    HTTP_METHOD
    + URI
    + X-API-Key
    + X-Timestamp
    + REQUEST_BODY
  )
)
```

`X-Timestamp` must be within five minutes of the current server time; requests outside that window are rejected to prevent replay attacks.

## Create a Payment Link

```http
POST /api/seller/v1/payment/link
```

Example request body:

```json
{
  "requestId": "REQ-20260304-0001",
  "storeId": "123",
  "serviceName": "MyShop",
  "itemName": "Premium Plan",
  "itemPrice": 12.34,
  "orderCurrencyCode": "USD",
  "returnUrl": "https://myshop.com/payment/return",
  "callbackUrl": "https://myshop.com/payment/callback",
  "expiresAt": "2026-08-31T00:00:00Z"
}
```

The response includes:

```json
{
  "linkUrl": "<payment-link-url>",
  "linkId": "<payment-link-id>"
}
```

Send the returned `linkUrl` to the customer to start the payment. `requestId` is an idempotency key - resubmitting the same value is rejected as a duplicate issuance.

## Check Payment Status

```http
GET /api/seller/v1/payment/{transactionId}
```

Payment status can include:

- `CREATED` - Payment created
- `PENDING` - Payment in progress
- `CONFIRMED` - Payment completed
- `FAILED` - Payment failed
- `CANCELED` - Payment canceled

## Webhook

If a `callbackUrl` is provided when creating a payment link, Unifi Pay sends the final payment result asynchronously.

Example:

```json
{
  "transactionId": "<transaction-id>",
  "orderId": "<order-id>",
  "status": "CONFIRMED",
  "type": "PURCHASE"
}
```

The receiving server must return:

```http
HTTP 200 OK
```

If Webhook delivery fails because of a `5xx` response or no response, Unifi Pay retries delivery on a backoff schedule:

| Retry | Delay |
|---|---|
| 1st | 3 seconds |
| 2nd | 30 seconds |
| 3rd | 10 minutes |
| 4th | 1 hour |
| 5th | 3 hours |

When a `callbackUrl` is registered, payment results are delivered via Webhook. For detailed payment information, use the Payment Status API after receiving the Webhook.

## Payment History

Payment and refund records can be retrieved using:

```http
GET /api/seller/v1/payment/settlement/transaction
```

Results can be filtered by date, payment type, transaction ID, or settlement ID.

## Supported Payment Options

| Item | Supported |
|---|---|
| Payment assets | USDT, JPYC |
| Order currencies | USD, JPY |
| Production network | Kaia Mainnet |
| Preview network | Kairos Testnet |
| Protocol Fee | 1% |

IDRP is planned for future support.

## Refunds

Refunds are **not provided through the API**.

Refund transfers are handled through the Unifi Pay Console: the seller reviews the request, then signs and sends the refund on-chain using a Unifi Wallet from the Console's Refund menu. Because refunds are a new on-chain transfer rather than a reversal of the original payment, the 1% Protocol Fee from the original payment is not returned. Refund history can be retrieved from the Payment History API by filtering on `paymentType=REFUND`.

## FAQ

More detail is available on the [Unifi Pay Help Center](https://pay.unifi.me/help/); a few integration-relevant highlights:

- **Is there a signup or setup fee?** No. The only cost is the 1% Protocol Fee, deducted automatically at the time of payment.
- **Can a store's App ID be changed later?** No - once saved, the App ID is permanently locked and cannot be changed from the Console or by support.
- **How is the settlement wallet registered?** Either by entering an existing external/exchange wallet address on Kaia Mainnet, or by connecting a Unifi Wallet. Refund transfers always require a Unifi Wallet, regardless of which method was used to register the settlement wallet.
- **Is there a payment amount limit?** Yes. The supported amount ranges are 0.01-999,999 USD / 1-999,999,999 JPY for order currencies, and 0.01-9,999,999 USDT / 1-999,999,999 JPYC for payment currencies. Very low-priced items may not be payable in a currency whose minimum exceeds the item price.
- **Is a test environment available?** Yes - the Preview environment is available on Kairos Testnet for integration testing before going live on Kaia Mainnet.
- **What happens when an API key is reissued?** The previous key immediately loses access for new payment links and history queries, but payment links already created with it continue to work normally.

## Documentation

- Unifi Pay Direct
  https://pay.unifi.me/direct/

- Unifi Pay Direct Guide
  https://pay.unifi.me/guides/

- API Reference
  https://pay.unifi.me/api-reference-direct/

- Unifi Pay Console
  https://console.unifi.me/

- Preview Console
  https://app-console.unifi.me/

- Help Center / FAQ
  https://pay.unifi.me/help/
