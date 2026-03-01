import { Request, Response } from 'express';
import prisma from '../db';

export const getCustomers = async (req: Request, res: Response) => {
  const { search } = req.query;

  try {
    const customers = await prisma.user.findMany({
      where: {
        role: 'USER', // Usually, admins don't search for other admins here
        OR: search ? [
          { name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } }
        ] : undefined
      },
      include: {
        kyc: true,
        subscriptions: true
      }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.id as string;

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: { kyc: true, subscriptions: true }
    });
    
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
};