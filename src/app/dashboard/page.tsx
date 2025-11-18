// app/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getDashboardPath } from '@/lib/auth';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      console.log('No session found, redirecting to login');
      router.push('/');
      return;
    }

    // Always redirect to role-specific dashboard
    const userRole = (session.user as any).role;
    const roleBasedPath = getDashboardPath(userRole);
    
    console.log('Redirecting from generic /dashboard to:', roleBasedPath);
    router.replace(roleBasedPath); // Use replace instead of push to avoid back button issues
    
  }, [session, status, router]);

  // Show loading while checking session
  // return (
  //   <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
  //     <div className="text-center">
  //       <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //       <p className="text-gray-600">Mengalihkan ke dashboard...</p>
  //     </div>
  //   </div>
  // );
}