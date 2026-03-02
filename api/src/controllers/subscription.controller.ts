import { Request, Response } from 'express';
import prisma from '../db';

  export const createSubscription = async (req: Request, res: Response) => {
    const userId = req.params.id as string;
    const { plan, amount } = req.body;

    try {
      // 1. CHECK KYC STATUS (Requirement 3)
      const kyc = await prisma.kycRecord.findUnique({
        where: { userId }
      });

      if (!kyc || kyc.status !== 'APPROVED') {
        return res.status(400).json({ 
          error: "KYC approved status required." 
        });
      }

      // 2. Check if the user already has an active sub
      const existingSub = await prisma.subscription.findFirst({
        where: {
          userId,
          status: { in: ['ACTIVE', 'INACTIVE'] }
        }
      });

      if (existingSub) {
        return res.status(400).json({ 
          error: "User already has an active or pending subscription." 
        });
      }

      // 3. Proceed with creation
      const newSub = await prisma.subscription.create({
        data: { userId, plan, amount, status: 'INACTIVE' }
      });

      return res.status(201).json(newSub);

    } catch (error) {
      console.error("Subscription Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  export const cancelSubscription = async (req: Request, res: Response) => {
      const { id } = req.params; // This is the SUBSCRIPTION ID, not user ID
  
      try {
      const subscription = await prisma.subscription.update({
          where: { id: id as string },
          data: { status: 'CANCELED' }
      });
  
      res.json({ message: 'Subscription canceled', subscription });
      } catch (error) {
      res.status(500).json({ error: 'Failed to cancel subscription' });
      }
  };