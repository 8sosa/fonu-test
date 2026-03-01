import { Router } from 'express';
import { getCustomers, getCustomerById } from '../controllers/customer.controller';
import { submitKyc, approveKyc, rejectKyc } from '../controllers/kyc.controller';
import { createSubscription } from '../controllers/subscription.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { simulatePayment } from '../controllers/payment.controller';

const router = Router();

// Apply auth to all customer routes
router.use(requireAuth);

// Admin-only routes
router.get('/', authorize('ADMIN'), getCustomers);
router.get('/:id', (req: any, res, next) => {
    // We cast req to 'any' so TypeScript doesn't complain about .user
    const isAdmin = req.user?.role === 'ADMIN';
    const isOwner = req.user?.id === req.params.id;

    if (isAdmin || isOwner) {
      return next(); 
    }

    return res.status(403).json({ 
      error: 'Forbidden: You do not have permission to view this profile' 
    });
  },
  getCustomerById 
);router.post('/:id/kyc/approve', authorize('ADMIN'), approveKyc);
router.post('/:id/kyc/reject', authorize('ADMIN'), rejectKyc);
router.post('/:id/subscriptions', authorize('ADMIN'), createSubscription);

router.post('/simulate-payment', simulatePayment);

// User-accessible routes (Self-service)
router.post('/:id/kyc/submit', submitKyc);

export default router;