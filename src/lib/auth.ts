// src/lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Define the new role types for RS Pantinugroho
export type UserRole = 
  | 'SUPER_ADMIN'       // Manajerial
  | 'DOKTER_SPESIALIS'  // Dokter Spesialis Penyakit Dalam
  | 'PERAWAT_RUANGAN'   // Perawat Ruangan
  | 'PERAWAT_POLI'      // Perawat Poli
  | 'AHLI_GIZI'         // Ahli Gizi
  | 'FARMASI';          // Farmasi

// Role display names in Indonesian
export const ROLE_NAMES: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  DOKTER_SPESIALIS: 'Dokter Spesialis Penyakit Dalam',
  PERAWAT_RUANGAN: 'Perawat Ruangan',
  PERAWAT_POLI: 'Perawat Poli',
  AHLI_GIZI: 'Ahli Gizi',
  FARMASI: 'Farmasi'
};

// Role permissions for different access levels
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['all'], // Full system access
  DOKTER_SPESIALIS: ['patients', 'appointments', 'prescriptions', 'medical_records', 'education'],
  PERAWAT_RUANGAN: ['patients', 'medications', 'vital_signs', 'lab_results', 'education'],
  PERAWAT_POLI: ['patients', 'blood_sugar_trends', 'education', 'reminders', 'appointments'],
  AHLI_GIZI: ['nutrition', 'diet_monitoring', 'food_recall', 'patient_metrics', 'allergies'],
  FARMASI: ['prescriptions', 'medications', 'drug_interactions', 'patient_conditions', 'inventory']
};

// Get current session
export async function getSession() {
  return await getServerSession(authOptions);
}

// Helper function for requiring authentication
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

// Helper function to check if user has specific role
export function hasRole(session: any, role: UserRole): boolean {
  return session?.user?.role === role;
}

// Helper function to check if user has any of the specified roles
export function hasAnyRole(session: any, roles: UserRole[]): boolean {
  return session?.user?.role && roles.includes(session.user.role);
}

// Helper function to check if user has specific permission
export function hasPermission(session: any, permission: string): boolean {
  const userRole = session?.user?.role as UserRole;
  if (!userRole) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.includes('all') || permissions.includes(permission);
}

// Type guard untuk memastikan user ada
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

// Helper to get role-based dashboard path
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN': return '/dashboard/admin';
    case 'DOKTER_SPESIALIS': return '/dashboard/doctor';
    case 'PERAWAT_RUANGAN': return '/dashboard/nurse-ward';
    case 'PERAWAT_POLI': return '/dashboard/nurse-poli';
    case 'AHLI_GIZI': return '/dashboard/nutritionist';
    case 'FARMASI': return '/dashboard/pharmacy';
    default: return '/dashboard';
  }
}

// Helper to get role-based color theme
export function getRoleTheme(role: UserRole): { primary: string; gradient: string; icon: string } {
  switch (role) {
    case 'SUPER_ADMIN':
      return { 
        primary: 'purple', 
        gradient: 'from-purple-50 via-blue-50 to-indigo-100',
        icon: '👑'
      };
    case 'DOKTER_SPESIALIS':
      return { 
        primary: 'blue', 
        gradient: 'from-blue-50 via-indigo-50 to-purple-50',
        icon: '🩺'
      };
    case 'PERAWAT_RUANGAN':
      return { 
        primary: 'teal', 
        gradient: 'from-teal-50 via-cyan-50 to-blue-50',
        icon: '👩‍⚕️'
      };
    case 'PERAWAT_POLI':
      return { 
        primary: 'cyan', 
        gradient: 'from-cyan-50 via-blue-50 to-indigo-50',
        icon: '💉'
      };
    case 'AHLI_GIZI':
      return { 
        primary: 'green', 
        gradient: 'from-green-50 via-emerald-50 to-teal-50',
        icon: '🥗'
      };
    case 'FARMASI':
      return { 
        primary: 'emerald', 
        gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
        icon: '💊'
      };
    default:
      return { 
        primary: 'gray', 
        gradient: 'from-gray-50 via-slate-50 to-zinc-50',
        icon: '👤'
      };
  }
}