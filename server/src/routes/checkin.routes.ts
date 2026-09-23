import { Router } from 'express';
import { CheckInController } from '../controllers/checkin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  checkInSchema,
  checkInHistoryQuerySchema,
} from '../validators/checkin.validator.js';

const router = Router();

// Front desk check-in (Trainers & Admin only)
router.post(
  '/',
  requireAuth,
  requireRole('owner', 'trainer'),
  validate(checkInSchema),
  asyncHandler(CheckInController.checkIn)
);

// Today's check-ins feed (Trainers & Admin)
router.get(
  '/today',
  requireAuth,
  requireRole('owner', 'trainer'),
  asyncHandler(CheckInController.getToday)
);

// Attendance history (Member self, or Trainer/Admin for specific member)
router.get(
  '/history',
  requireAuth,
  validate({ query: checkInHistoryQuerySchema }),
  asyncHandler(CheckInController.getHistory)
);

export default router;
