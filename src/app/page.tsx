// File: app/page.tsx
// Halaman utama aplikasi dengan splash screen

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SplashScreen from '../components/SplashScreen';
import LoginForm from '@/components/auth/LoginForm';
import Dashboard from '@/components/dashboard/Dashboard';
import AuthHandler from '@/components/auth/AuthHandler';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
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

  // Show dashboard if authenticated, otherwise show login
  if (session) {
    return <Dashboard />;
  }

  return <LoginForm />;
}