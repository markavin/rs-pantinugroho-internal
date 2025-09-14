// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import type { UserRole } from '@/lib/auth';

const prisma = new PrismaClient();

// Enhanced function to track login activity with better error handling
// Update bagian trackLoginActivity di src/app/api/auth/[...nextauth]/route.ts
async function trackLoginActivity(userId: string, sessionId: string, req: any) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'localhost';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log('ðŸ”„ Tracking login for userId:', userId, 'sessionId:', sessionId);

    const loginLog = await prisma.loginLog.create({
      data: {
        userId,
        sessionId,
        loginTime: new Date(),
        ipAddress,
        userAgent
      }
    });

    console.log('âœ… Login tracked successfully:', loginLog.id);
    return loginLog;
  } catch (error: any) {
    console.error('âŒ Error tracking login activity:', error);
    
    // Log detailed error information
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      userId,
      sessionId
    });
    
    return null;
  }
}

// Enhanced function to track logout activity
async function trackLogoutActivity(sessionId: string, userId?: string) {
  try {
    console.log('ðŸ”„ Attempting to track logout for sessionId:', sessionId);

    const result = await prisma.loginLog.updateMany({
      where: {
        sessionId: sessionId,
        logoutTime: null
      },
      data: {
        logoutTime: new Date()
      }
    });

    console.log('âœ… Logout tracked successfully. Records updated:', result.count);
    return result;
  } catch (error: any) {
    console.error('âŒ Error tracking logout activity:', error);
    return null;
  }
}



export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Email/Username", type: "text", placeholder: "Masukkan email atau username" },
        password: { label: "Password", type: "password", placeholder: "Masukkan password" }
      },
      async authorize(credentials, req) {
        console.log('ðŸ” Authorization attempt for:', credentials?.login);
        
        if (!credentials?.login || !credentials?.password) {
          console.log('âŒ Missing credentials');
          return null;
        }

        try {
          // Query database untuk user berdasarkan email atau username
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.login },
                { username: credentials.login }
              ],
              isActive: true
            }
          });

          if (!user) {
            console.log('âŒ User not found:', credentials.login);
            return null;
          }

          console.log('ðŸ” User found:', user.username, 'checking password...');

          // Use bcrypt to compare hashed password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            console.log('âŒ Invalid password for:', credentials.login);
            return null;
          }

          console.log('âœ… User authenticated:', user.name, '-', user.role);

          // Generate unique session ID for tracking
          const sessionId = `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Track login activity (non-blocking)
          trackLoginActivity(user.id, sessionId, req)
            .then((result) => {
              if (result) {
                console.log('âœ… Login activity tracked in background');
              }
            })
            .catch((error) => {
              console.error('âŒ Background login tracking failed:', error);
            });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            username: user.username,
            employeeId: user.employeeId,
            department: user.department,
            sessionId 
          };

        } catch (error) {
          console.error('âŒ Database error during authentication:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.employeeId = (user as any).employeeId;
        token.department = (user as any).department;
        token.sessionId = (user as any).sessionId;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).employeeId = token.employeeId;
        (session.user as any).department = token.department;
        (session.user as any).sessionId = token.sessionId;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log('ðŸ“ SignIn callback triggered for:', user?.name);
      return true;
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('ðŸŽ‰ SignIn event triggered for:', user?.name);
    },
    async signOut({ token, session }) {
      console.log('ðŸ‘‹ SignOut event triggered for sessionId:', token?.sessionId);
      
      // Track logout activity - this is critical for accurate active user count
      if (token?.sessionId) {
        try {
          const result = await trackLogoutActivity(token.sessionId as string, token.userId as string);
          if (result && result.count > 0) {
            console.log('âœ… Logout tracked successfully, sessions closed:', result.count);
          } else {
            console.log('âš ï¸ No active sessions found to close for sessionId:', token.sessionId);
          }
        } catch (error) {
          console.error('âŒ Logout tracking failed:', error);
        }
      } else {
        console.log('âš ï¸ No sessionId found in token for logout tracking');
      }
    }
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };