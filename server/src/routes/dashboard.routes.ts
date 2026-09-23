import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Owner / Admin Dashboard
router.get(
  '/owner',
  requireAuth,
  requireRole('owner'),
  asyncHandler(DashboardController.getOwnerDashboard)
);

// Trainer Dashboard
router.get(
  '/trainer',
  requireAuth,
  requireRole('owner', 'trainer'),
  asyncHandler(DashboardController.getTrainerDashboard)
);

export default router;
