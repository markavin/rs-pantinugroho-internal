// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Demo users untuk testing
const DEMO_USERS = [
  {
    id: '1',
    email: 'patient@demo.com',
    username: 'patient',
    password: 'demo123',
    name: 'Ahmad Santoso',
    role: 'PATIENT'
  },
  {
    id: '2',
    email: 'doctor@demo.com',
    username: 'doctor',
    password: 'demo123',
    name: 'Dr. Sarah Wijaya',
    role: 'DOCTOR'
  },
  {
    id: '3',
    email: 'admin@demo.com',
    username: 'admin',
    password: 'demo123',
    name: 'Admin System',
    role: 'ADMIN'
  }
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Email/Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔍 Authorization attempt for:', credentials?.login);
        
        if (!credentials?.login || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        // Cari di demo users
        const user = DEMO_USERS.find(u => 
          (u.email === credentials.login || u.username === credentials.login) &&
          u.password === credentials.password
        );

        if (user) {
          console.log('✅ User authenticated:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            username: user.username
          };
        }

        console.log('❌ Authentication failed');
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };