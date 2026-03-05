// ─── VanJet · NextAuth Configuration ──────────────────────────
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { bootstrapAdmin } from "@/lib/dev/bootstrapAdmin";
import { serverEnv } from "@/lib/env";
import { checkLoginRateLimit } from "@/lib/ratelimit";
import { verifyTwoFactorToken } from "@/lib/twoFactor";

export const authOptions: NextAuthOptions = {
  secret: serverEnv.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        // Rate limit login attempts per email
        const rateLimit = await checkLoginRateLimit(credentials.email);
        if (!rateLimit.success) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        // Ensure admin user exists in dev
        await bootstrapAdmin();

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password.");
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) {
          throw new Error("Invalid email or password.");
        }

        // Two-factor verification when enabled
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          const token = credentials.totp?.trim();
          if (!token) {
            throw new Error("Two-factor code required.");
          }
          const verified = await verifyTwoFactorToken(user.twoFactorSecret, token);
          if (!verified) {
            throw new Error("Invalid two-factor code.");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
