const crypto = require('crypto');

const secret = 'fonu_secret_123'; // Ensure this Matches your .env
const subscriptionId = process.argv[2] || 'REPLACE_WITH_SUB_ID';
const event = process.argv[3] || 'payment.success';

const payload = JSON.stringify({
  event: event,
  data: { subscriptionId: subscriptionId }
});

const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

console.log(`\nUse this CURL command to simulate a ${event}:`);
console.log(`--------------------------------------------------`);
console.log(`curl -X POST http://localhost:3000/webhooks/payments \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "x-fonu-signature: ${signature}" \\`);
console.log(`  -d '${payload}'\n`);