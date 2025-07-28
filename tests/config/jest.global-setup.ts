// This file runs before all tests
import { config } from 'dotenv';

// Load environment variables from .env.test file
config({ path: '.env.test' });

// Create a copy of process.env to avoid modifying the original
const env = { ...process.env };

// Set test environment variables if not already set
if (!env.NODE_ENV) env.NODE_ENV = 'test';
if (!env.NEXTAUTH_URL) env.NEXTAUTH_URL = 'http://localhost:3000';
if (!env.NEXTAUTH_SECRET) env.NEXTAUTH_SECRET = 'test-secret';

// Apply the environment variables
Object.assign(process.env, env);

// Add any other global test setup here
export default async () => {
  // Global test setup code if needed
};
