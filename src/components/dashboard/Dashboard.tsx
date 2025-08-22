// File: src/components/dashboard/Dashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '../../app/providers';
import { getRoleTheme, ROLE_NAMES, type UserRole } from '@/lib/auth';

// Import dashboard components - akan diupdate sesuai kebutuhan
import AdminDashboard from './AdminDashboard';           // → Super Admin (Manajerial)
import DoctorDashboard from './DoctorDashboard';         // → Dokter Spesialis Penyakit Dalam  
import NurseDashboard from './NurseDashboard';           // → Perawat Ruangan
import PerawatPoliDashboard from './PerawatPoliDashboard';      // → Perawat Poli (reuse component)
import NutritionistDashboard from './NutritionistDashboard'; // → Ahli Gizi
import PharmacistDashboard from './PharmacistDashboard'; // → Farmasi

const Dashboard = () => {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { addToast } = useToast();

  const userRole = session?.user?.role as UserRole;
  const roleTheme = getRoleTheme(userRole || 'SUPER_ADMIN');

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

  const getShiftInfo = () => {
    const hour = currentTime.getHours();
    if (hour >= 7 && hour < 14) return { shift: 'Shift Pagi', time: '07:00-14:00', color: 'text-orange-600' };
    if (hour >= 14 && hour < 21) return { shift: 'Shift Siang', time: '14:00-21:00', color: 'text-blue-600' };
    return { shift: 'Shift Malam', time: '21:00-07:00', color: 'text-purple-600' };
  };

  const renderDashboardByRole = () => {
    if (!session?.user?.role) return <AdminDashboard />; // Default fallback
    
    switch (userRole) {
      case 'SUPER_ADMIN':
        return <AdminDashboard />; // Manajerial dengan grafik rekapitulasi

      case 'DOKTER_SPESIALIS':
        return <DoctorDashboard />; // Dokter Spesialis Penyakit Dalam

      case 'PERAWAT_RUANGAN':
        return <NurseDashboard />; // Perawat Ruangan dengan monitoring pasien

      case 'PERAWAT_POLI':
        // Reuse PatientDashboard tapi dengan fitur khusus perawat poli
        return <PerawatPoliDashboard />; // Akan dimodifikasi untuk fitur interaktif & notifikasi

      case 'AHLI_GIZI':
        return <NutritionistDashboard />; // Ahli Gizi dengan monitoring pola makan

      case 'FARMASI':
        return <PharmacistDashboard />; // Farmasi dengan drug interaction warnings

      default:
        return <AdminDashboard />;
    }
  };

  const shiftInfo = getShiftInfo();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${roleTheme.gradient}`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Hospital branding */}
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 bg-gradient-to-br from-${roleTheme.primary}-500 to-${roleTheme.primary}-600 rounded-full flex items-center justify-center shadow-md`}>
                <span className="text-white font-bold">🏥</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">RS Pantinugroho</h1>
                <p className="text-sm text-gray-600">Diabetes Care System</p>
              </div>
            </div>

            {/* Center - Time, shift info, and greeting */}
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
                <div className="flex items-center space-x-3">
                  <p className="text-lg font-bold text-gray-800">
                    {currentTime.toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <div className={`text-xs px-2 py-1 rounded-full bg-white/60 ${shiftInfo.color} font-medium`}>
                    {shiftInfo.shift}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-4">
              {/* Quick notifications indicator */}
              <div className="flex items-center space-x-2">
                <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <span className="text-xl">🔔</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </button>
                
                {/* Employee ID display for internal staff */}
                {session?.user?.employeeId && (
                  <div className="hidden sm:block text-xs">
                    <span className="text-gray-500">ID:</span>
                    <span className="font-mono font-medium text-gray-700 ml-1">
                      {session.user.employeeId}
                    </span>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <div className="flex items-center space-x-3 bg-white/60 rounded-full px-4 py-2 shadow-md border border-white/30">
                  <div className={`text-lg`}>
                    {roleTheme.icon}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-gray-800">
                      {getGreeting()}, {session?.user?.name}!
                    </p>
                    <p className={`text-xs font-medium text-${roleTheme.primary}-600`}>
                      {userRole ? ROLE_NAMES[userRole] : 'Staff Medis'}
                    </p>
                    {session?.user?.department && (
                      <p className="text-xs text-gray-500">
                        {session.user.department}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
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
        fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 md:hidden
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`text-2xl`}>{roleTheme.icon}</div>
              <div>
                <p className="font-bold text-gray-800">{session?.user?.name}</p>
                <p className={`text-sm text-${roleTheme.primary}-600`}>
                  {userRole ? ROLE_NAMES[userRole] : 'Staff Medis'}
                </p>
                {session?.user?.department && (
                  <p className="text-xs text-gray-500">{session.user.department}</p>
                )}
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              ✕
            </button>
          </div>

          {/* Employee info */}
          {session?.user?.employeeId && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Employee ID</p>
              <p className="font-mono font-medium text-gray-800">{session.user.employeeId}</p>
            </div>
          )}
        </div>
        
        <div className="p-6 space-y-4">
          {/* Current time and shift */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium">Waktu & Shift Saat Ini</p>
            <p className="text-lg font-bold text-blue-800 mb-1">
              {currentTime.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
            <p className={`text-sm font-medium ${shiftInfo.color}`}>
              {shiftInfo.shift} ({shiftInfo.time})
            </p>
          </div>

          {/* Quick actions */}
          <div className="space-y-3">
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <p className="text-sm text-yellow-700 font-medium">Notifikasi Pending</p>
              </div>
              <p className="text-xs text-yellow-600 mt-1">3 tugas menunggu perhatian</p>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboardByRole()}
      </main>

      {/* Motivational footer - disesuaikan dengan role */}
      <footer className={`bg-gradient-to-r from-${roleTheme.primary}-500 to-${roleTheme.primary}-600 text-white py-6 mt-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-medium mb-2">
            💪 "Bersama kita berikan pelayanan diabetes terbaik untuk Indonesia!"
          </p>
          <p className="text-sm opacity-90">
            RS Pantinugroho - Tim Medis Profesional untuk Perawatan Diabetes Berkualitas ❤️
          </p>
          <p className="text-xs mt-2 opacity-75">
            {userRole ? ROLE_NAMES[userRole] : 'Staff Medis'} | {shiftInfo.shift} | Sistem Internal RS Pantinugroho
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;