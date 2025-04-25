import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

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

export const authOptions: AuthOptions = {
  events: {
    async createUser({ user }) {
      try {
        // Only send if user has an email
        if (user?.email) {
          const axios = (await import('axios')).default;
          await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
              sender: { name: 'CampusHub', email: 'noreply@campushub.com' },
              to: [{ email: user.email }],
              subject: 'Signup Successful - Welcome to CampusHub!',
              htmlContent: `<p>Hi ${user.name || ''},</p><p>Your registration on CampusHub was successful! If you signed up with OAuth, your account is already active. Enjoy exploring our community!</p>`
            },
            {
              headers: {
                'api-key': process.env.BREVO_API_KEY || '',
                'Content-Type': 'application/json',
              },
            }
          );
        }
      } catch (e) {
        console.error('Error sending signup success mail (OAuth or normal):', e);
      }
    }
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        // Return id as string for session typing compatibility
        return { ...user, id: user.id.toString() };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Ensure id is string and isFirstLogin is present
      session.user.id = user.id?.toString?.() ?? String(user.id);
      session.user.isFirstLogin = user.isFirstLogin;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
