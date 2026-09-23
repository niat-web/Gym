import { z } from 'zod';
import { phoneSchema } from './auth.validator.js';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().optional(),
  dob: z.coerce.date().optional(),
  bloodGroup: z.string().trim().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say', '']).optional(),
  avatarUrl: z.string().trim().url().optional().or(z.literal('')),
  address: z
    .object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      pincode: z.string().trim().optional(),
    })
    .optional(),
});

export const createUserSchema = z.object({
  phone: phoneSchema,
  fullName: z.string().trim().min(2).max(100),
  password: z.string().min(6),
  email: z.string().trim().email().optional().or(z.literal('')),
  role: z.enum(['trainer', 'member']),
  assignedTrainer: z.string().optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  role: z.enum(['owner', 'trainer', 'member']).optional(),
  status: z.enum(['active', 'inactive', 'expired', 'suspended']).optional(),
  assignedTrainer: z.string().optional(),
});

export const assignTrainerSchema = z.object({
  trainerId: z.string().min(1, 'Trainer ID is required'),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended']),
});
