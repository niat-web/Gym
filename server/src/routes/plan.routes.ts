import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createPlanSchema,
  updatePlanSchema,
  planIdParamSchema,
} from '../validators/plan.validator.js';

const router = Router();

// Active plans for store (any authenticated user)
router.get('/', requireAuth, asyncHandler(PlanController.getActivePlans));

// All plans for Admin
router.get('/all', requireAuth, requireRole('owner'), asyncHandler(PlanController.getAllPlans));

// Plan CRUD
router.post('/', requireAuth, requireRole('owner'), validate(createPlanSchema), asyncHandler(PlanController.createPlan));
router.get('/:id', requireAuth, validate({ params: planIdParamSchema }), asyncHandler(PlanController.getPlanById));
router.patch('/:id', requireAuth, requireRole('owner'), validate({ params: planIdParamSchema, body: updatePlanSchema }), asyncHandler(PlanController.updatePlan));
router.patch('/:id/activate', requireAuth, requireRole('owner'), validate({ params: planIdParamSchema }), asyncHandler(PlanController.activatePlan));
router.patch('/:id/deactivate', requireAuth, requireRole('owner'), validate({ params: planIdParamSchema }), asyncHandler(PlanController.deactivatePlan));

export default router;
