import { Request, Response } from 'express';
import prisma from '../db';
import crypto from 'crypto';

export const handlePaymentWebhook = async (req: Request, res: Response) => {
  const secret = process.env.WEBHOOK_SECRET || 'fonu_secret_123';
  const signature = req.headers['x-fonu-signature'];

  // 1. Validate Signature (Requirement 5: Security)
  const hash = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

    console.log("Calculated:", hash)
    console.log("Received:", signature)
  if (signature !== hash) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, data } = req.body;

  try {
    // 2. Persist the event (Requirement 5: Auditing)
    await prisma.webhookEvent.create({
      data: {
        type: event,
        payload: req.body,
        processed: true
      }
    });

    // 3. Process Logic based on Event Type
    const subscriptionId = data.subscriptionId;

    if (event === 'payment.success') {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { 
          status: 'ACTIVE',
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
        }
      });
    } 
    else if (event === 'payment.failed') {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'PAST_DUE' }
      });
    }
    else if (event === 'subscription.canceled') {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'CANCELED' }
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const getWebhookEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 events for performance
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch webhook events' });
  }
};

export const getEnhancedAuditLog = async (req: Request, res: Response) => {
  try {
    const events = await prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const enhancedEvents = await Promise.all(events.map(async (event) => {
      const payload = event.payload as any;
      const subId = payload.data?.subscriptionId;
      
      // FIX: Changed 'customer' to 'user' to match typical Prisma schema relations
      const subDetail = subId ? await prisma.subscription.findUnique({
        where: { id: subId },
        include: { user: true } // Pointing to the 'user' relation
      }) : null;

      return {
        ...event,
        // Mapping to a flat object for the frontend
        userEmail: subDetail?.user?.email || 'System/Unknown',
        amount: subDetail?.amount || 0, // Keep in kobo here
        plan: subDetail?.plan || 'N/A'
      };
    }));

    res.json(enhancedEvents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enhanced audit log' });
  }
};