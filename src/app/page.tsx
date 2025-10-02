// app/page.tsx - Updated with login splash
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SplashScreen from '../components/SplashScreen';
import LoginForm from '@/components/auth/LoginForm';

export default function HomePage() {
  const [showInitialSplash, setShowInitialSplash] = useState(true);
  const [showLoginSplash, setShowLoginSplash] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleInitialSplashFinish = () => {
    setShowInitialSplash(false);
  };

  const handleLoginSplashFinish = () => {
    setShowLoginSplash(false);
    // After splash finishes, redirect to dashboard
    router.push('/dashboard');
  };

  // When user becomes authenticated, show login splash
  useEffect(() => {
    if (session && !showInitialSplash) {
      setShowLoginSplash(true);
    }
  }, [session, showInitialSplash]);

  // Show initial splash screen first (on first load)
  if (showInitialSplash) {
    return <SplashScreen onFinish={handleInitialSplashFinish} message="Memuat aplikasi..." />;
  }

  // Show login splash after successful authentication
  if (showLoginSplash) {
    return <SplashScreen onFinish={handleLoginSplashFinish} message="Mengalihkan ke dashboard..." />;
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!session) {
    return <LoginForm />;
  }

  // Fallback (shouldn't reach here)
  return null;
}