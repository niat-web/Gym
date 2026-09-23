import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/fitcore'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('30d'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_mockkey12345'),
  RAZORPAY_KEY_SECRET: z.string().default('mock_secret_987654321'),
  PAYMENTS_MODE: z.enum(['mock', 'live']).default('mock'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173'),
});

export type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  try {
    return envSchema.parse(process.env);
  } catch (error: any) {
    console.error('❌ Invalid environment variables:');
    if (error instanceof z.ZodError) {
      console.error(JSON.stringify(error.format(), null, 2));
    }
    process.exit(1);
  }
};

export const env: Env = parseEnv();
