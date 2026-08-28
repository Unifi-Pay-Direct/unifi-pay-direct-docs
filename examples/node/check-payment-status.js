#!/usr/bin/env node
// Check the status of a Unifi Pay Direct payment.
//
// Usage:
//   UNIFI_API_KEY=... UNIFI_API_SECRET=... node check-payment-status.js <transactionId>
//
// Optional:
//   UNIFI_BASE_URL   defaults to the Preview (Kairos Testnet) environment

const https = require('https');
const { request } = require('./sign');

const BASE_URL = process.env.UNIFI_BASE_URL || 'https://app-api-pay.unifi.me';
const API_KEY = process.env.UNIFI_API_KEY;
const API_SECRET = process.env.UNIFI_API_SECRET;
const transactionId = process.argv[2];

if (!API_KEY || !API_SECRET) {
  console.error('Set UNIFI_API_KEY and UNIFI_API_SECRET environment variables.');
  process.exit(1);
}
if (!transactionId) {
  console.error('Usage: node check-payment-status.js <transactionId>');
  process.exit(1);
}

request(https, BASE_URL, API_KEY, API_SECRET, 'GET', `/api/seller/v1/payment/${transactionId}`)
  .then((status) => {
    console.log('Payment status:');
    console.log(status);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
