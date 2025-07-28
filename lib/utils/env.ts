/**
 * Environment variable validation utility
 * Throws errors if required environment variables are missing
 */

interface EnvConfig {
  [key: string]: {
    required: boolean;
    description: string;
  };
}

// Define required environment variables
const envConfig: EnvConfig = {
  // Database
  DATABASE_URL: {
    required: true,
    description: 'Database connection URL',
  },
  
  // NextAuth
  NEXTAUTH_URL: {
    required: true,
    description: 'Base URL of the application',
  },
  NEXTAUTH_SECRET: {
    required: true,
    description: 'Secret key for NextAuth.js',
  },
  
  // OAuth Providers (at least one required)
  GOOGLE_CLIENT_ID: {
    required: false,
    description: 'Google OAuth Client ID',
  },
  GOOGLE_CLIENT_SECRET: {
    required: false,
    description: 'Google OAuth Client Secret',
  },
  GITHUB_CLIENT_ID: {
    required: false,
    description: 'GitHub OAuth Client ID',
  },
  GITHUB_CLIENT_SECRET: {
    required: false,
    description: 'GitHub OAuth Client Secret',
  },
  FACEBOOK_CLIENT_ID: {
    required: false,
    description: 'Facebook OAuth Client ID',
  },
  FACEBOOK_CLIENT_SECRET: {
    required: false,
    description: 'Facebook OAuth Client Secret',
  },
  
  // Security
  NODE_ENV: {
    required: true,
    description: 'Node environment (development, production, test)',
  },
  
  // Turnstile CAPTCHA
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: {
    required: process.env.NODE_ENV === 'production',
    description: 'Turnstile site key for CAPTCHA verification',
  },
  TURNSTILE_SECRET_KEY: {
    required: process.env.NODE_ENV === 'production',
    description: 'Turnstile secret key for server-side verification',
  },
};

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required environment variables are missing
 */
export function validateEnv() {
  if (typeof window !== 'undefined') {
    // Skip validation in browser environment
    return;
  }

  const missingVars: string[] = [];
  const misconfiguredVars: string[] = [];

  // Check for missing required variables
  Object.entries(envConfig).forEach(([key, config]) => {
    if (config.required && !process.env[key]) {
      missingVars.push(`${key} (${config.description})`);
    }
  });

  // Check for OAuth provider configuration
  const hasGoogle = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  const hasGithub = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;
  const hasFacebook = process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET;
  
  if (!hasGoogle && !hasGithub && !hasFacebook) {
    misconfiguredVars.push('At least one OAuth provider (Google, GitHub, or Facebook) must be configured');
  } else {
    // Check for partial OAuth configurations
    if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_SECRET) {
      misconfiguredVars.push('GOOGLE_CLIENT_SECRET is required when GOOGLE_CLIENT_ID is set');
    }
    if (!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      misconfiguredVars.push('GOOGLE_CLIENT_ID is required when GOOGLE_CLIENT_SECRET is set');
    }
    if (process.env.GITHUB_CLIENT_ID && !process.env.GITHUB_CLIENT_SECRET) {
      misconfiguredVars.push('GITHUB_CLIENT_SECRET is required when GITHUB_CLIENT_ID is set');
    }
    if (!process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      misconfiguredVars.push('GITHUB_CLIENT_ID is required when GITHUB_CLIENT_SECRET is set');
    }
    if (process.env.FACEBOOK_CLIENT_ID && !process.env.FACEBOOK_CLIENT_SECRET) {
      misconfiguredVars.push('FACEBOOK_CLIENT_SECRET is required when FACEBOOK_CLIENT_ID is set');
    }
    if (!process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
      misconfiguredVars.push('FACEBOOK_CLIENT_ID is required when FACEBOOK_CLIENT_SECRET is set');
    }
  }

  // Throw errors if any issues found
  if (missingVars.length > 0 || misconfiguredVars.length > 0) {
    let errorMessage = '❌ Environment configuration error:\n\n';
    
    if (missingVars.length > 0) {
      errorMessage += 'Missing required environment variables:\n';
      errorMessage += missingVars.map(v => `- ${v}`).join('\n') + '\n\n';
    }
    
    if (misconfiguredVars.length > 0) {
      errorMessage += 'Configuration issues found:\n';
      errorMessage += misconfiguredVars.map(v => `- ${v}`).join('\n') + '\n';
    }
    
    errorMessage += '\nPlease check your .env file and ensure all required variables are set correctly.';
    
    if (process.env.NODE_ENV === 'production') {
      console.error(errorMessage);
      throw new Error('Invalid environment configuration. Check server logs for details.');
    } else {
      console.warn('⚠️ ' + errorMessage);
    }
  } else {
    console.log('✅ Environment variables validated successfully');
  }
}

// Validate environment on module import
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}

// Export validated environment variables
export const env = {
  // NextAuth
  nextAuthUrl: process.env.NEXTAUTH_URL || '',
  nextAuthSecret: process.env.NEXTAUTH_SECRET || '',
  
  // OAuth Providers
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  },
  
  // Security
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Turnstile CAPTCHA
  turnstile: {
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    secretKey: process.env.TURNSTILE_SECRET_KEY || '',
  },
} as const;
