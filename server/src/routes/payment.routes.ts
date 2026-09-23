import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  initiatePaymentSchema,
  verifyPaymentSchema,
  manualPaymentSchema,
  listPaymentsQuerySchema,
} from '../validators/payment.validator.js';

const router = Router();

// Member checkout
router.post('/initiate', requireAuth, validate(initiatePaymentSchema), asyncHandler(PaymentController.initiate));
router.post('/verify', requireAuth, validate(verifyPaymentSchema), asyncHandler(PaymentController.verify));
router.get('/me', requireAuth, asyncHandler(PaymentController.getMyPayments));

// Admin manual payments and ledger
router.post('/manual', requireAuth, requireRole('owner'), validate(manualPaymentSchema), asyncHandler(PaymentController.manualPayment));
router.get('/', requireAuth, requireRole('owner'), validate({ query: listPaymentsQuerySchema }), asyncHandler(PaymentController.listPayments));

export default router;
