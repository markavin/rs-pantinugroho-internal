// src/lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get current session
export async function getSession() {
  return await getServerSession(authOptions);
}

// Helper function for requiring authentication
export async function requireAuth(allowedRoles: string[] = []) {
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
export function hasRole(session: any, role: string): boolean {
  return session?.user?.role === role;
}

// Helper function to check if user has any of the specified roles
export function hasAnyRole(session: any, roles: string[]): boolean {
  return session?.user?.role && roles.includes(session.user.role);
}

// Type guard untuk memastikan user ada
export function isAuthenticated(session: any): session is { user: { id: string; email: string; name: string; role: string; username: string } } {
  return session?.user?.id && session?.user?.role;
}