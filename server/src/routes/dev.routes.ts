import { Router } from 'express';
import { DevController } from '../controllers/dev.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Dev cron manual triggers
router.post(
  '/run-job/:name',
  requireAuth,
  requireRole('owner'),
  asyncHandler(DevController.runJob)
);

export default router;
