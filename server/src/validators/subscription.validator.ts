import { z } from 'zod';

export const expiringSubsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
});

export const subIdParamSchema = z.object({
  id: z.string().min(1, 'Subscription ID is required'),
});
