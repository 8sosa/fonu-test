import { Request, Response } from 'express';
import prisma from '../db';

export const createSubscription = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { plan, amount } = req.body;
  
    // 1. Check if the user already has an unexpired/active sub
    const existingSub = await prisma.subscription.findFirst({
      where: {
        userId: id,
        status: { in: ['ACTIVE', 'INACTIVE'] }
      }
    });
  
    if (existingSub) {
      return res.status(400).json({ 
        error: "User already has an active or pending subscription. Please cancel or upgrade the existing one." 
      });
    }
  
    // 2. Proceed with creation if no sub exists
    const newSub = await prisma.subscription.create({
      data: { userId: id, plan, amount, status: 'INACTIVE' }
    });
  
    res.status(201).json(newSub);
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