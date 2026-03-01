import { Request, Response } from 'express';
import prisma from '../db';

// POST /customers/:id/kyc/submit
export const submitKyc = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { documentType, documentNumber, notes } = req.body;

  try {
    const customerId = req.params.id as string;

    const kyc = await prisma.kycRecord.upsert({
      where: { userId: customerId },
      update: { documentType, documentNumber, notes, status: 'PENDING' },
      create: { userId: customerId, documentType, documentNumber, notes, status: 'PENDING' }
    });
    res.status(201).json(kyc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit KYC' });
  }
};

// POST /customers/:id/kyc/approve (Admin Only)
export const approveKyc = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.id as string;

    await prisma.kycRecord.update({
      where: { userId: customerId },
      data: { status: 'APPROVED' }
    });
    res.json({ message: 'KYC Approved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve KYC' });
  }
};

// POST /customers/:id/kyc/reject (Admin Only)
export const rejectKyc = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body; // The assessment requires a rejection reason
  
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
  
    try {
      const customerId = id as string;
  
      const updatedKyc = await prisma.kycRecord.update({
        where: { userId: customerId },
        data: { 
          status: 'REJECTED',
          rejectionReason: reason // Storing why it failed
        }
      });
  
      res.json({ 
        message: 'KYC Rejected successfully', 
        data: updatedKyc 
      });
    } catch (error) {
      console.error('KYC Reject Error:', error);
      res.status(500).json({ error: 'Failed to reject KYC. Ensure the record exists.' });
    }
  };