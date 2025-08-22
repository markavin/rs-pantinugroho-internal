// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { UserRole } from '@/lib/auth';

// Demo users untuk testing - disesuaikan dengan kebutuhan RS Pantinugroho
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@pantinugroho.com',
    username: 'admin',
    password: 'admin123',
    name: 'Dr. Bambang Sutrisno',
    role: 'SUPER_ADMIN' as UserRole,
    employeeId: 'ADM001',
    department: 'Management'
  },
  {
    id: '2',
    email: 'dokter@pantinugroho.com',
    username: 'dokter',
    password: 'dokter123',
    name: 'Dr. Sarah Wijayanti, Sp.PD',
    role: 'DOKTER_SPESIALIS' as UserRole,
    employeeId: 'DOC001',
    department: 'Penyakit Dalam'
  },
  {
    id: '3',
    email: 'perawat.ruangan@pantinugroho.com',
    username: 'perawat_ruangan',
    password: 'perawat123',
    name: 'Sari Indrawati, S.Kep',
    role: 'PERAWAT_RUANGAN' as UserRole,
    employeeId: 'NUR001',
    department: 'Keperawatan Ruangan'
  },
  {
    id: '4',
    email: 'perawat.poli@pantinugroho.com',
    username: 'perawat_poli',
    password: 'perawat123',
    name: 'Rina Kartika, S.Kep',
    role: 'PERAWAT_POLI' as UserRole,
    employeeId: 'NUR002',
    department: 'Poliklinik'
  },
  {
    id: '5',
    email: 'ahligizi@pantinugroho.com',
    username: 'ahli_gizi',
    password: 'gizi123',
    name: 'Dewi Sartika, S.Gz',
    role: 'AHLI_GIZI' as UserRole,
    employeeId: 'NUT001',
    department: 'Gizi'
  },
  {
    id: '6',
    email: 'farmasi@pantinugroho.com',
    username: 'farmasi',
    password: 'farmasi123',
    name: 'Budi Santoso, S.Farm, Apt',
    role: 'FARMASI' as UserRole,
    employeeId: 'PHA001',
    department: 'Farmasi'
  }
];

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

        // Cari di demo users berdasarkan email atau username
        const user = DEMO_USERS.find(u => 
          (u.email === credentials.login || u.username === credentials.login) &&
          u.password === credentials.password
        );

        if (user) {
          console.log('✅ User authenticated:', user.name, '-', user.role);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            username: user.username,
            employeeId: user.employeeId,
            department: user.department
          };
        }

        console.log('❌ Authentication failed for:', credentials.login);
        return null;
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
    signIn: '/', // Redirect ke splash screen dengan login
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 jam untuk shift kerja rumah sakit
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Only debug in development
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };