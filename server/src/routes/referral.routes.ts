import { Router } from 'express';
import { ReferralController } from '../controllers/referral.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Member referral dashboard
router.get('/me', requireAuth, asyncHandler(ReferralController.getMyReferral));

// Admin referral overview
router.get('/', requireAuth, requireRole('owner'), asyncHandler(ReferralController.getAdminSummary));

export default router;
