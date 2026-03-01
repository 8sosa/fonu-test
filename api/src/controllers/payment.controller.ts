// api/src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';

export const simulatePayment = async (req: Request, res: Response) => {
  const { subscriptionId } = req.body;
  const secret = process.env.WEBHOOK_SECRET || 'fonu_secret_123';

  // 1. Prepare the payload
  const payload = {
    event: 'payment.success',
    data: { subscriptionId }
  };

  // 2. Generate the signature (so the webhook receiver accepts it)
  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  try {
    // 3. Send the webhook to our own receiver endpoint
    // We use the container name 'api' if inside Docker, or localhost if not
    await axios.post('http://localhost:3000/webhooks/payments', payload, {
      headers: { 'x-fonu-signature': signature }
    });

    res.json({ message: 'Simulated payment successful!' });
  } catch (error) {
    res.status(500).json({ error: 'Simulation failed' });
  }
};