import NextAuth, { type AuthOptions, type User, type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
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

// Extend built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      isFirstLogin?: boolean;
      // Add other custom fields here
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    isFirstLogin?: boolean;
    // Add other custom fields here
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    isFirstLogin?: boolean;
    // Add other custom fields here
  }
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
  
  // Use Prisma as the database adapter
  adapter: PrismaAdapter(prisma),
  
  // Security configurations
  session: {
    strategy: 'jwt', // Use JWT for session management
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Configure JWT
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
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
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password');
        }

        // Check rate limiting
        const identifier = `login:${credentials.email}`;
        const { success } = await authRateLimit.limit(identifier);
        if (!success) {
          throw new Error('Too many login attempts. Please try again later.');
        }

        // Check if user exists in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            isFirstLogin: true,
          },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Your account has been deactivated. Please contact support.');
        }

        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
        };
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
      async profile(profile) {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        // Create user if doesn't exist
        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: profile.email,
              firstName: profile.given_name,
              lastName: profile.family_name,
              isActive: true,
              role: 'STUDENT', // Default role for new users
              isFirstLogin: true,
              Profile: {
                create: {
                  profilePicture: profile.picture,
                },
              },
            },
          });
          
          return {
            id: newUser.id,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            role: newUser.role,
            isFirstLogin: newUser.isFirstLogin,
          };
        }

        // Update last login time for existing user
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: existingUser.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: existingUser.role,
          isFirstLogin: existingUser.isFirstLogin,
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
      // Check if user is allowed to sign in
      if (!user) {
        return false;
      }

      // Check rate limiting for sign-in attempts
      const identifier = `signin:${user.email}`;
      const { success } = await authRateLimit.limit(identifier);
      if (!success) {
        console.warn('Rate limit exceeded for sign-in:', user.email);
        return false;
      }

      // Check if user is active
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { isActive: true },
        });
        
        if (dbUser && !dbUser.isActive) {
          return '/auth/error?error=account-deactivated';
        }
      }

      return true;
    },
    
    async jwt({ token, user, account, profile, isNewUser }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'STUDENT';
        token.isFirstLogin = (user as any).isFirstLogin || false;
        
        // For OAuth providers, ensure we have the user in our database
        if (account?.provider !== 'credentials' && user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true, isFirstLogin: true },
          });
          
          if (existingUser) {
            token.role = existingUser.role;
            token.isFirstLogin = existingUser.isFirstLogin;
          }
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Add user ID and role to the session
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).isFirstLogin = token.isFirstLogin;
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Handle redirects after sign in
      if (url.startsWith('/auth/')) return url;
      
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      
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
