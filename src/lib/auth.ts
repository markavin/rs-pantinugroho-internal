// src/lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export type UserRole =
  | 'SUPER_ADMIN'
  | 'DOKTER_SPESIALIS'
  | 'PERAWAT_RUANGAN'
  | 'PERAWAT_POLI'
  | 'AHLI_GIZI'
  | 'ADMINISTRASI'
  | 'LABORATORIUM'
  | 'MANAJER'
  | 'FARMASI';


export const ROLE_NAMES: Record<UserRole, string> = {
  SUPER_ADMIN: 'Admin',
  DOKTER_SPESIALIS: 'Dokter Spesialis Penyakit Dalam',
  PERAWAT_RUANGAN: 'Perawat Ruangan',
  PERAWAT_POLI: 'Perawat Poli',
  LABORATORIUM: 'Laboratorium',
  AHLI_GIZI: 'Ahli Gizi',
  ADMINISTRASI: 'Administrasi Pasien',
  MANAJER: 'Manajer',
  FARMASI: 'Farmasi'
};

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['all'],
  DOKTER_SPESIALIS: ['patients', 'appointments', 'prescriptions', 'medical_records', 'education'],
  PERAWAT_RUANGAN: ['patients', 'medications', 'vital_signs', 'lab_results', 'education'],
  PERAWAT_POLI: ['patients', 'blood_sugar_trends', 'education', 'reminders', 'appointments'],
  LABORATORIUM: ['patients', 'blood_sugar_trends', 'education', 'reminders', 'appointments'],
  AHLI_GIZI: ['nutrition', 'diet_monitoring', 'food_recall', 'patient_metrics', 'allergies'],
  ADMINISTRASI: ['patients', 'blood_sugar_trends', 'education', 'reminders', 'appointments'],
  MANAJER: ['all'],
  FARMASI: ['prescriptions', 'medications', 'drug_interactions', 'patient_conditions', 'inventory']
};

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth(allowedRoles: UserRole[] = []) {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes((session.user as any).role)) {
    return null;
  }

  return session;
}

export function hasRole(session: any, role: UserRole): boolean {
  return session?.user?.role === role;
}

export function hasAnyRole(session: any, roles: UserRole[]): boolean {
  return session?.user?.role && roles.includes(session.user.role);
}

export function hasPermission(session: any, permission: string): boolean {
  const userRole = session?.user?.role as UserRole;
  if (!userRole) return false;

  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.includes('all') || permissions.includes(permission);
}

export function isAuthenticated(session: any): session is {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    username: string
  }
} {
  return session?.user?.id && session?.user?.role;
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN': return '/dashboard/admin';
    case 'DOKTER_SPESIALIS': return '/dashboard/doctor';
    case 'PERAWAT_RUANGAN': return '/dashboard/nurse';
    case 'PERAWAT_POLI': return '/dashboard/nurse-poli';
    case "LABORATORIUM": return '/dashboard/laboratory'
    case 'AHLI_GIZI': return '/dashboard/nutritionist';
    case 'FARMASI': return '/dashboard/pharmacy';
    case 'ADMINISTRASI': return '/dashboard/administrasi';
    case 'MANAJER': return '/dashboard/manajer';
    default: return '/dashboard';
  }
}

// Helper to get role-based color theme
export function getRoleTheme(role: UserRole): { primary: string; linear: string; icon: string } {
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        primary: 'purple',
        linear: 'from-green-50 via-emerald-50 to-teal-50',
        icon: '🔧'
      };
    case 'DOKTER_SPESIALIS':
      return {
        primary: 'blue',
        linear: 'from-green-50 via-emerald-50 to-teal-50',
        icon: '🩺'
      };
    case 'PERAWAT_RUANGAN':
      return {
        primary: 'teal',
        linear: 'from-green-50 via-emerald-50 to-teal-50',
        icon: '👩‍⚕️'
      };
    case 'PERAWAT_POLI':
      return {
        primary: 'cyan',
        linear: 'from-green-50 via-emerald-50 to-teal-50',
        icon: '💉'
      };
    case 'LABORATORIUM':
      return {
        primary: 'cyan',
        linear: 'from-green-50 via-emerald-50 to-teal-50',
        icon: '💉'
      };
    case 'AHLI_GIZI':
      return {
        primary: 'green',
        linear: 'from-green-50 via-emerald-50 to-teal-50',
        icon: '🥗'
      };
    case 'FARMASI':
      return {
        primary: 'emerald',
        linear: 'from-green-50 via-emerald-50 to-teal-50',
        icon: '💊'
      };
    case 'ADMINISTRASI':
      return {
        primary: 'gray',
        linear: 'from-green-50 via-emerald-50 to-teal-50',
        icon: '👩‍⚕️'
      };
    case 'MANAJER':
      return {
        primary: 'amber',
        linear: 'from-green-50 via-emerald-50 to-teal-50',
        icon: '📊'
      };

  }
}