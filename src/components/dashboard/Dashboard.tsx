// File: src/components/dashboard/Dashboard.tsx


'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '../../app/providers';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import NurseDashboard from './NurseDashboard';
import PharmacistDashboard from './PharmacistDashboard';
import AdminDashboard from './AdminDashboard';
import NutritionistDashboard from './NutritionistDashboard';

const Dashboard = () => {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { addToast } = useToast();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
      addToast({
        message: 'Berhasil logout. Sampai jumpa! 👋',
        type: 'success'
      });
    } catch (error) {
      addToast({
        message: 'Terjadi kesalahan saat logout',
        type: 'error'
      });
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅 Selamat Pagi';
    if (hour < 15) return '☀️ Selamat Siang';
    if (hour < 18) return '🌤️ Selamat Sore';
    return '🌙 Selamat Malam';
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: { label: string; icon: string; color: string } } = {
      PATIENT: { label: 'Pasien', icon: '👤', color: 'text-blue-600' },
      DOCTOR: { label: 'Dokter', icon: '👨‍⚕️', color: 'text-green-600' },
      NURSE: { label: 'Perawat', icon: '👩‍⚕️', color: 'text-pink-600' },
      NUTRITIONIST: { label: 'Ahli Gizi', icon: '🥗', color: 'text-orange-600' },
      PHARMACIST: { label: 'Apoteker', icon: '💊', color: 'text-purple-600' },
      ADMIN: { label: 'Administrator', icon: '⚙️', color: 'text-gray-600' },
    };
    return roleMap[role] || roleMap.PATIENT;
  };

  const renderDashboardByRole = () => {
    if (!session?.user?.role) return <PatientDashboard />;
    
    switch (session.user.role) {
      case 'DOCTOR':
        return <DoctorDashboard />;
      case 'NURSE':
        return <NurseDashboard />;
      case 'NUTRITIONIST':
        return <NutritionistDashboard />;
      case 'PHARMACIST':
        return <PharmacistDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <PatientDashboard />;
    }
  };

  const roleInfo = getRoleDisplay(session?.user?.role || 'PATIENT');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Hospital branding */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold">🏥</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">RS Pantinugroho</h1>
                <p className="text-sm text-gray-600">Diabetes Care</p>
              </div>
            </div>

            {/* Center - Time and greeting */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  {currentTime.toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {currentTime.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <span className="text-xl">🔔</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>

              {/* User menu */}
              <div className="relative">
                <div className="flex items-center space-x-3 bg-white/60 rounded-full px-4 py-2 shadow-md border border-white/30">
                  <div className={`text-lg ${roleInfo.color}`}>
                    {roleInfo.icon}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-gray-800">
                      {getGreeting()}, {session?.user?.name}!
                    </p>
                    <p className={`text-xs font-medium ${roleInfo.color}`}>
                      {roleInfo.label}
                    </p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                    title="Logout"
                  >
                    <span className="text-lg">🚪</span>
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-blue-600"
              >
                <span className="text-xl">☰</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-64 bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 md:hidden
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">{session?.user?.name}</p>
              <p className={`text-sm ${roleInfo.color}`}>{roleInfo.label}</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700 font-medium">Waktu Saat Ini</p>
              <p className="text-lg font-bold text-blue-800">
                {currentTime.toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Logout 🚪
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboardByRole()}
      </main>

      {/* Motivational footer */}
      <footer className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-medium mb-2">
            💪 "Setiap hari adalah kesempatan baru untuk hidup lebih sehat!"
          </p>
          <p className="text-sm opacity-90">
            RS Pantinugroho - Bersama Kita Lawan Diabetes ❤️
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;