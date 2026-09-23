import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  asyncHandler(AuthController.refresh)
);

router.post(
  '/logout',
  requireAuth,
  asyncHandler(AuthController.logout)
);

router.patch(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(AuthController.changePassword)
);

router.post(
  '/send-otp',
  otpRateLimiter,
  validate(sendOtpSchema),
  asyncHandler(AuthController.sendOtp)
);

router.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  asyncHandler(AuthController.verifyOtp)
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(AuthController.resetPassword)
);

export default router;
