import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  updateProfileSchema,
  createUserSchema,
  listUsersQuerySchema,
  assignTrainerSchema,
  updateUserStatusSchema,
} from '../validators/user.validator.js';

const router = Router();

// Current logged in user
router.get('/me', requireAuth, asyncHandler(UserController.getMe));
router.patch('/me', requireAuth, validate(updateProfileSchema), asyncHandler(UserController.updateMe));

// Trainers list (Admin/Trainers)
router.get('/trainers', requireAuth, requireRole('owner', 'trainer'), asyncHandler(UserController.listTrainers));

// Member QR pass
router.get('/:id/qr', requireAuth, asyncHandler(UserController.getQrPass));

// User management (Admin/Trainer)
router.get('/', requireAuth, requireRole('owner', 'trainer'), validate({ query: listUsersQuerySchema }), asyncHandler(UserController.listUsers));
router.post('/', requireAuth, requireRole('owner'), validate(createUserSchema), asyncHandler(UserController.createUser));
router.get('/:id', requireAuth, requireRole('owner', 'trainer'), asyncHandler(UserController.getUserById));
router.patch('/:id/status', requireAuth, requireRole('owner'), validate(updateUserStatusSchema), asyncHandler(UserController.updateStatus));
router.post('/:id/assign-trainer', requireAuth, requireRole('owner'), validate(assignTrainerSchema), asyncHandler(UserController.assignTrainer));

export default router;
