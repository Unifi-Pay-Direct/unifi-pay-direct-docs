const crypto = require('crypto');

function sign(apiSecret, method, uri, apiKey, timestamp, body) {
  const payload = method + uri + apiKey + timestamp + body;
  return crypto.createHmac('sha256', apiSecret).update(payload).digest('base64');
}

function request(https, baseUrl, apiKey, apiSecret, method, uri, body) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now().toString();
    const bodyStr = body ? JSON.stringify(body) : '';
    const signature = sign(apiSecret, method, uri, apiKey, timestamp, bodyStr);
    const url = new URL(baseUrl + uri);

    const req = https.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'X-Timestamp': timestamp,
          'X-Authorization-Hmac': signature,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data || '{}'));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

module.exports = { sign, request };
