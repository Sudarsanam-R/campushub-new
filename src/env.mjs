import { z } from 'zod';

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Application
  APP_URL: z.string().url().default('http://localhost:3000'),
  APP_NAME: z.string().default('CampusHub'),
  
  // Next.js
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  
  // Database (PostgreSQL)
  DATABASE_URL: z.string().url(),
  
  // NextAuth.js
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  
  // Authentication Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Email Provider (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional().default('noreply@campushub.app'),
  
  // File Storage (AWS S3 or similar)
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  STORAGE_ENDPOINT: z.string().optional(),
  
  // Feature Flags
  ENABLE_ANALYTICS: z.string().default('false').transform(v => v === 'true'),
  ENABLE_EMAIL_VERIFICATION: z.string().default('false').transform(v => v === 'true'),
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: z.string().default('true').transform(v => v === 'true'),
  RATE_LIMIT_REQUESTS: z.string().default('100').transform(Number),
  RATE_LIMIT_DURATION: z.string().default('1m'),
  
  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001').transform(v => v.split(',')),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Deployment
  DEPLOYMENT_ENV: z.enum(['local', 'staging', 'production']).default('local'),
  
  // API Keys (external services)
  MAPBOX_ACCESS_TOKEN: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  
  // Cache
  REDIS_URL: z.string().optional(),
  
  // API Security
  API_KEY: z.string().optional(),
});

// Runtime validation
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  throw new Error('Invalid environment variables');
}

// Export validated environment variables
export const env = _env.data;

// Type for TypeScript
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

// Make sure this file is treated as a module
export {};
