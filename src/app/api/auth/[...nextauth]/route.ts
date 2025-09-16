import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import type { UserRole } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * Track login activity
 */
async function trackLoginActivity(userId: string, sessionId: string, account?: any) {
  try {
    // Ambil IP & User Agent, fallback ke "unknown"
    const ipAddress = account?.ip ?? "unknown";
    const userAgent = account?.userAgent ?? "unknown";

    const loginLog = await prisma.loginLog.create({
      data: {
        userId,
        sessionId,
        loginTime: new Date(),
        ipAddress,
        userAgent,
      },
    });

    console.log("✅ Login tracked:", loginLog.id);
    return loginLog;
  } catch (error: any) {
    console.error("❌ Error tracking login:", error.message, {
      userId,
      sessionId,
    });
    return null; // jangan blokir login walaupun tracking gagal
  }
}

/**
 * Track logout activity
 */
async function trackLogoutActivity(sessionId: string) {
  try {
    const result = await prisma.loginLog.updateMany({
      where: {
        sessionId,
        logoutTime: null,
      },
      data: {
        logoutTime: new Date(),
      },
    });

    console.log("✅ Logout tracked. Records updated:", result.count);
    return result;
  } catch (error: any) {
    console.error("❌ Error tracking logout:", error.message);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Email/Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.login },
              { username: credentials.login },
            ],
            isActive: true,
          },
        });

        if (!user) return null;

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValidPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          username: user.username,
          employeeId: user.employeeId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.employeeId = (user as any).employeeId;
        token.userId = user.id;

        // generate sessionId baru saat login
        token.sessionId = `${user.id}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).employeeId = token.employeeId;
        (session.user as any).sessionId = token.sessionId;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log("🎉 signIn event for:", user?.name);

      const sessionId = `${user.id}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Catat login
      await trackLoginActivity(user.id, sessionId, account);
    },
    async signOut({ token }) {
      console.log("👋 signOut event for sessionId:", token?.sessionId);
      if (token?.sessionId) {
        await trackLogoutActivity(token.sessionId as string);
      }
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 jam
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
