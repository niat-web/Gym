import { z } from 'zod';
import { phoneSchema } from './auth.validator.js';

export const checkInSchema = z
  .object({
    memberId: z.string().trim().optional(),
    phone: phoneSchema.optional(),
  })
  .refine((data) => !!data.memberId || !!data.phone, {
    message: 'Either memberId or phone must be provided for check-in',
  });

export const checkInHistoryQuerySchema = z.object({
  memberId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(30),
});
