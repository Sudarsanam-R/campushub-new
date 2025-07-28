import NextAuth, { type AuthOptions, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RateLimitTier } from '@/utils/rateLimit';

// Initialize Redis for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limiter for auth endpoints
const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

import type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isFirstLogin?: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    id: string;
    isFirstLogin?: boolean;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

// CSRF token generation and validation
const generateCSRFToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const authOptions: AuthOptions = {
  // Enable debug logs in development
  debug: process.env.NODE_ENV === 'development',
  
  // Security configurations
  session: {
    strategy: 'jwt', // Use JWT for session management
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Enable CSRF protection
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  events: {
    async createUser({ user }) {
      try {
        // Only send if user has an email
        if (user?.email) {
          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': process.env.BREVO_API_KEY || '',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sender: { name: 'CampusHub', email: 'noreply@campushub.com' },
              to: [{ email: user.email }],
              subject: 'Signup Successful - Welcome to CampusHub!',
              htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Welcome to CampusHub, ${user.name || 'there'}! 👋</h2>
                  <p>Your account has been successfully created. You can now sign in using your credentials.</p>
                  <p>If you didn't create this account, please contact our support team immediately.</p>
                  <hr>
                  <p style="font-size: 0.9em; color: #666;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                </div>
              `
            })
          });
        }
      } catch (e) {
        console.error('Error sending signup success email:', e);
      }
    }
  },

  providers: [
    // Credentials Provider (Email/Password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        csrfToken: { type: "hidden" }, // For CSRF protection
      },
      async authorize(credentials) {
        // TODO: Integrate with Django backend for authentication, or implement your own logic here
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }
        // Example placeholder:
        if (credentials.email === process.env.DEMO_EMAIL && credentials.password === process.env.DEMO_PASSWORD) {
          return {
            id: "1",
            name: "Demo User",
            email: credentials.email,
            isFirstLogin: false,
          };
        }
        return null;
      },
    }),
    // Google OAuth Provider with enhanced security
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: 'openid email profile',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      httpOptions: {
        timeout: 10000, // 10 second timeout
      },
      allowDangerousEmailAccountLinking: false, // Prevent account linking via email
    }),
    // GitHub OAuth Provider with enhanced security
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email', // Minimal required scopes
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
      httpOptions: {
        timeout: 10000, // 10 second timeout
      },
      allowDangerousEmailAccountLinking: false, // Prevent account linking via email
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Check if user is allowed to sign in
        if (account?.provider === 'google' || account?.provider === 'github') {
          // Additional OAuth provider specific checks can be added here
          if (!user.email) {
            throw new Error('No email found from OAuth provider');
          }
          
          // Check if the email domain is allowed (example: only allow university emails)
          // const allowedDomains = ['university.edu'];
          // const emailDomain = user.email.split('@')[1];
          // if (!allowedDomains.includes(emailDomain)) {
          //   throw new Error('Only university email addresses are allowed');
          // }
        }
        
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        // Redirect to error page with error message
        return `/auth/error?error=${encodeURIComponent(error instanceof Error ? error.message : 'Authentication failed')}`;
      }
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      // Add custom JWT claims here if needed
      if (user) {
        token.id = user.id;
        token.isFirstLogin = user.isFirstLogin;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom session properties here
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isFirstLogin = token.isFirstLogin as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirects are to the same origin
      if (url.startsWith(baseUrl)) return url;
      // Allows relative callback URLs
      if (url.startsWith('/')) return new URL(url, baseUrl).toString();
      return baseUrl;
    },
  },
  
  // Custom pages
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  // Security configurations
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
};
