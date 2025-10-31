// src/components/auth/AuthHandler.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthHandlerProps {
  children: React.ReactNode;
}

export default function AuthHandler({ children }: AuthHandlerProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 Auth status:', status);
    console.log('🔍 Session:', session);

    if (status === 'authenticated' && session) {
      console.log('  User authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}