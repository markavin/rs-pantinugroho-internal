// app/dashboard/[role]/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole, getDashboardPath } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

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
  }, [session, status, router, role]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
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