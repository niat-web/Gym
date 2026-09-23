import { z } from 'zod';

export const createPlanSchema = z.object({
  planName: z.string().trim().min(2, 'Plan name must be at least 2 characters').max(100),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(500),
  category: z.enum(['basic', 'standard', 'premium']),
  pricePaise: z.number().int().min(0, 'Price cannot be negative'),
  calendarDays: z.number().int().min(1, 'Calendar days must be at least 1'),
  allocatedDays: z.number().int().min(1, 'Allocated days must be at least 1'),
  features: z.array(z.string().trim()).default([]),
  isActive: z.boolean().default(true),
});

export const updatePlanSchema = createPlanSchema.partial();

export const planIdParamSchema = z.object({
  id: z.string().min(1, 'Plan ID is required'),
});
