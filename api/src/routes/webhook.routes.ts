import { Router } from 'express';
import { getEnhancedAuditLog } from '../controllers/webhook.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Only Admins should see the audit log!
router.get('/', requireAuth, authorize('ADMIN'), getEnhancedAuditLog);

export default router;