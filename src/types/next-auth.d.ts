// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import type { UserRole } from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      username: string;
      employeeId?: string;  
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    username: string;
    employeeId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: UserRole;
    username: string;
    employeeId?: string;
  }
}