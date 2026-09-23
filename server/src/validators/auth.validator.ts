import { z } from 'zod';

export const phoneSchema = z
  .string()
  .trim()
  .transform((val) => {
    // Normalize phone to +91XXXXXXXXXX
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    }
    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      return `+${digitsOnly}`;
    }
    return val.startsWith('+') ? val : `+${val}`;
  })
  .refine((val) => /^\+91[6-9]\d{9}$/.test(val), {
    message: 'Invalid Indian phone number. Must be 10 digits (e.g., +919876543210 or 9876543210)',
  });

export const registerSchema = z.object({
  phone: phoneSchema,
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  referralCode: z.string().trim().toUpperCase().optional().or(z.literal('')),
});

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain numbers only'),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
