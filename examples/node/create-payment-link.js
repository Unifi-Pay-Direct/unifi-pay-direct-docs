#!/usr/bin/env node
// Create a Unifi Pay Direct payment link.
//
// Usage:
//   UNIFI_API_KEY=... UNIFI_API_SECRET=... node create-payment-link.js
//
// Optional:
//   UNIFI_BASE_URL   defaults to the Preview (Kairos Testnet) environment
//   UNIFI_STORE_ID   defaults to "123"

const https = require('https');
const { request } = require('./sign');

const BASE_URL = process.env.UNIFI_BASE_URL || 'https://app-api-pay.unifi.me';
const API_KEY = process.env.UNIFI_API_KEY;
const API_SECRET = process.env.UNIFI_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error('Set UNIFI_API_KEY and UNIFI_API_SECRET environment variables.');
  process.exit(1);
}

async function main() {
  const link = await request(https, BASE_URL, API_KEY, API_SECRET, 'POST', '/api/seller/v1/payment/link', {
    requestId: `REQ-${Date.now()}`,
    storeId: process.env.UNIFI_STORE_ID || '123',
    serviceName: 'MyShop',
    itemName: 'Premium Plan',
    itemPrice: 12.34,
    orderCurrencyCode: 'USD',
    returnUrl: 'https://myshop.com/payment/return',
    callbackUrl: 'https://myshop.com/payment/callback',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  console.log('Payment link created:');
  console.log(link);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
