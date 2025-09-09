// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import type { UserRole } from '@/lib/auth';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Email/Username", type: "text", placeholder: "Masukkan email atau username" },
        password: { label: "Password", type: "password", placeholder: "Masukkan password" }
      },
      async authorize(credentials) {
        console.log('🔍 Authorization attempt for:', credentials?.login);
        
        if (!credentials?.login || !credentials?.password) {
          console.log('❌ Missing credentials');
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
            console.log('❌ User not found:', credentials.login);
            return null;
          }

          console.log('🔍 User found:', user.username, 'checking password...');

          // FIXED: Use bcrypt to compare hashed password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            console.log('❌ Invalid password for:', credentials.login);
            return null;
          }

          console.log('✅ User authenticated:', user.name, '-', user.role);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            username: user.username,
            employeeId: user.employeeId,
            department: user.department
          };

        } catch (error) {
          console.error('❌ Database error during authentication:', error);
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
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 jam
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };