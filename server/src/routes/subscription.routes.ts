import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  expiringSubsQuerySchema,
  subIdParamSchema,
} from '../validators/subscription.validator.js';

const router = Router();

// Member subscription views
router.get('/me', requireAuth, asyncHandler(SubscriptionController.getMyActive));
router.get('/me/history', requireAuth, asyncHandler(SubscriptionController.getMyHistory));

// Expiring subscriptions (Admin & Trainer)
router.get('/expiring', requireAuth, requireRole('owner', 'trainer'), validate({ query: expiringSubsQuerySchema }), asyncHandler(SubscriptionController.getExpiring));

// Subscription details & actions (Admin)
router.get('/:id', requireAuth, validate({ params: subIdParamSchema }), asyncHandler(SubscriptionController.getById));
router.post('/:id/pause', requireAuth, requireRole('owner'), validate({ params: subIdParamSchema }), asyncHandler(SubscriptionController.pause));
router.post('/:id/resume', requireAuth, requireRole('owner'), validate({ params: subIdParamSchema }), asyncHandler(SubscriptionController.resume));
router.post('/:id/cancel', requireAuth, requireRole('owner'), validate({ params: subIdParamSchema }), asyncHandler(SubscriptionController.cancel));

export default router;
