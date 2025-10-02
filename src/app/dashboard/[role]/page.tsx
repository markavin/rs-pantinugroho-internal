// app/dashboard/[role]/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserRole, getDashboardPath } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SplashScreen from '@/components/SplashScreen';

// Import semua dashboard components
import AdminDashboard from '@/components/dashboard/admin/page';
import DoctorDashboard from '@/components/dashboard/doctor/page';
import NurseDashboard from '@/components/dashboard/nurse/page';
import NursePoliDashboard from '@/components/dashboard/nursePoli/page';
import NutritionistDashboard from '@/components/dashboard/nutritionist/page';
import PharmacyDashboard from '@/components/dashboard/pharmacy/page';
import ManajerDashboard from '@/components/dashboard/manajer/page';
import AdministrasiDashboard from '@/components/dashboard/administrasi/page';

const roleMapping = {
  'admin': 'SUPER_ADMIN',
  'doctor': 'DOKTER_SPESIALIS', 
  'nurse': 'PERAWAT_RUANGAN',
  'nurse-poli': 'PERAWAT_POLI',
  'nutritionist': 'AHLI_GIZI',
  'pharmacy': 'FARMASI',
  'administrasi': 'ADMINISTRASI',
  'manajer': 'MANAJER'
};

export default function RoleBasedDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const role = params.role as string;
  const [showSplash, setShowSplash] = useState(true);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    // Cek apakah role URL cocok dengan role user
    const expectedRole = roleMapping[role as keyof typeof roleMapping];
    const userRole = (session.user as any).role;
    
    if (!expectedRole || userRole !== expectedRole) {
      // Redirect ke dashboard yang sesuai role user
      const correctPath = getDashboardPath(userRole);
      router.replace(correctPath); // Use replace to avoid back button issues
      return;
    }

    // Role valid, selesai validasi
    setIsValidating(false);
  }, [session, status, router, role]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash screen while loading or validating
  if (status === 'loading' || isValidating || showSplash) {
    return (
      <SplashScreen 
        onFinish={handleSplashFinish} 
        message="Memuat dashboard..."
        duration={1500}
      />
    );
  }

  if (!session) return null;

  // Function to render dashboard content based on role
  const renderDashboardContent = () => {
    switch (role) {
      case 'admin': return <AdminDashboard />;
      case 'doctor': return <DoctorDashboard />;
      case 'nurse': return <NurseDashboard />;
      case 'nurse-poli': return <NursePoliDashboard />;
      case 'nutritionist': return <NutritionistDashboard />;
      case 'pharmacy': return <PharmacyDashboard />;
      case 'manajer': return <ManajerDashboard/>;
      case 'administrasi' : return <AdministrasiDashboard/>;
      default: 
        router.push('/dashboard');
        return null;
    }
  };

  // Wrap dashboard content in layout
  return (
    <DashboardLayout>
      {renderDashboardContent()}
    </DashboardLayout>
  );
}