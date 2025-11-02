'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '../../app/providers';
import { getRoleTheme, ROLE_NAMES, type UserRole } from '@/lib/auth';
import { Bell, LogOut, Menu, X, Clock, User, Shield, Heart, AlertCircle, KeyRound, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Alert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  patientId?: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  createdAt: string;
  patient?: {
    name: string;
    mrNumber: string;
  };
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPreview, setShowNotificationPreview] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const router = useRouter();
  const userRole = session?.user?.role as UserRole;
  const roleTheme = getRoleTheme(userRole || 'SUPER_ADMIN');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (session?.user?.role) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationPreview(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAlerts = async () => {
    try {
      const userRole = session?.user?.role || 'SUPER_ADMIN';
      const params = new URLSearchParams({
        role: userRole,
        unreadOnly: 'false'
      });

      const response = await fetch(`/api/alerts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json() as Alert[];
        const uniqueData = Array.from(new Map(data.map((item: Alert) => [item.id, item])).values());
        setAlerts(uniqueData);
        setUnreadCount(uniqueData.filter((a: Alert) => !a.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
      addToast({
        message: 'Berhasil logout. Sampai jumpa!',
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
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getShiftInfo = () => {
    const hour = currentTime.getHours();
    if (hour >= 7 && hour < 14) return { shift: 'Shift Pagi', time: '07:00-19:00', color: 'text-orange-600 bg-orange-100' };
    return { shift: 'Shift Malam', time: '19:00-07:00', color: 'text-purple-600 bg-purple-100' };
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'bg-red-100 border-red-200 text-red-700';
      case 'WARNING': return 'bg-yellow-100 border-yellow-200 text-yellow-700';
      default: return 'bg-blue-100 border-blue-200 text-blue-700';
    }
  };

  const shiftInfo = getShiftInfo();
  const unreadAlerts = alerts.filter(a => !a.isRead);
  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${roleTheme.gradient}`}>
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-30">
        <div className="w-full max-w-none px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">

            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 shadow-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">KD</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">KAWAN DIABETES</h1>
                  <h2 className='text-xs sm:text-sm text-gray-500 truncate'>RS Panti Nugroho</h2>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium hidden xs:block">Diabetes Care System</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-1 justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 xl:text-base">
                  {currentTime.toLocaleDateString('id-ID', {
                    weekday: window.innerWidth > 1280 ? 'long' : 'short',
                    year: 'numeric',
                    month: window.innerWidth > 1280 ? 'long' : 'short',
                    day: 'numeric'
                  })}
                </p>
                <div className="flex items-center justify-center space-x-3 mt-1">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-lg xl:text-xl font-bold text-gray-900">
                      {currentTime.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className={`px-2 xl:px-3 py-1 rounded-full text-xs font-medium ${shiftInfo.color}`}>
                    <span className="hidden xl:inline">{shiftInfo.shift}</span>
                    <span className="xl:hidden">{shiftInfo.shift.split(' ')[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">

              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotificationPreview(!showNotificationPreview)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  {unreadAlerts.length > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{unreadAlerts.length > 99 ? '99+' : unreadAlerts.length}</span>
                    </div>
                  )}
                </button>

                {showNotificationPreview && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col" style={{ maxHeight: '500px' }}>
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifikasi Terbaru</h3>
                        <div className="flex items-center gap-3">
                          {unreadAlerts.length > 0 && (
                            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                              {unreadAlerts.length} Belum Dibaca
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setShowNotificationPreview(false);
                              router.push('/notifications');
                            }}
                            className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors flex items-center gap-1"
                          >
                            Lihat Semua
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-y-auto flex-1" style={{ maxHeight: '350px' }}>
                      {recentAlerts.length > 0 ? (
                        recentAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!alert.isRead ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-1.5 rounded-lg ${getAlertColor(alert.type)} flex-shrink-0`}>
                                <AlertCircle className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getAlertColor(alert.type)}`}>
                                    {alert.type}
                                  </span>
                                  {!alert.isRead && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                      Baru
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-900 line-clamp-2 mb-1">
                                  {alert.message}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(alert.createdAt).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Belum ada notifikasi</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {session?.user?.employeeId && (
                <div className="hidden md:flex lg:hidden xl:flex items-center space-x-2 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  <span className="text-xs text-gray-600 hidden lg:inline xl:inline">ID:</span>
                  <span className="font-mono font-medium text-gray-800 text-xs">
                    {session.user.employeeId}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2 sm:space-x-3 bg-white/80 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 shadow-sm border border-white/30">
                <div className="hidden sm:block lg:hidden xl:block text-right min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    <span className="hidden lg:inline xl:inline">{getGreeting()}, </span>
                    <span className="lg:hidden xl:hidden">Hi, </span>
                    {session?.user?.name}
                  </p>
                  <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                    <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-700 truncate">
                      <span className="hidden lg:inline xl:inline">
                        {userRole ? ROLE_NAMES[userRole] : 'Staff Medis'}
                      </span>
                      <span className="lg:hidden xl:hidden">
                        {userRole ? ROLE_NAMES[userRole].split(' ')[0] : 'Staff'}
                      </span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const userEmail = session?.user?.email || '';
                    router.push(`/reset-password?mode=change&email=${encodeURIComponent(userEmail)}`);
                  }}
                  className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                  title="Ganti Password"
                >
                  <KeyRound className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors group"
                  title="Logout"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="lg:hidden bg-white/70 backdrop-blur-sm border-b border-white/20 px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <span className="text-lg font-bold text-gray-900">
                {currentTime.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="text-sm text-gray-600 ml-2">
                {currentTime.toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            </div>
          </div>
          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${shiftInfo.color}`}>
            {shiftInfo.shift}
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed top-0 right-0 h-full bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 lg:hidden w-full max-w-sm sm:max-w-md md:max-w-lg ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 sm:p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white text-base sm:text-lg truncate">{session?.user?.name}</p>
                <p className="text-sm text-green-100 truncate">
                  {userRole ? ROLE_NAMES[userRole] : 'Staff Medis'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {session?.user?.employeeId && (
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-white" />
                <span className="text-sm text-white">Employee ID</span>
              </div>
              <p className="font-mono font-bold text-white text-lg mt-1">
                {session.user.employeeId}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto h-[calc(100%-150px)] pb-20">
          <div className="bg-white rounded-lg p-3 border border-green-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Waktu & Shift</span>
            </div>
            <p className="text-lg font-bold text-gray-900 mb-1">
              {currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="flex items-center justify-between">
              <div className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
                {shiftInfo.shift}
              </div>
              <span className="text-xs text-gray-500">{shiftInfo.time}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <p className="text-sm font-medium text-gray-600 mb-1">Tanggal</p>
            <p className="text-base font-bold text-gray-900">
              {currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <button
            onClick={() => {
              router.push('/notifications');
              setSidebarOpen(false);
            }}
            className="w-full bg-white rounded-lg p-3 border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-800">Notifikasi</span>
              </div>
              {unreadAlerts.length > 0 && (
                <div className="bg-red-100 text-red-800 px-2 py-1 rounded-md">
                  <span className="text-sm font-bold">{unreadAlerts.length}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 text-left">
              {unreadAlerts.length > 0 ? `${unreadAlerts.length} tugas menunggu` : 'Tidak ada tugas baru'}
            </p>
          </button>

          <div className="pt-2 flex space-x-2">
            <button
              onClick={() => {
                const userEmail = session?.user?.email || '';
                router.push(`/reset-password?mode=change&email=${encodeURIComponent(userEmail)}`);
              }}
              className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 group"
            >
              <KeyRound className="h-4 w-4 text-gray-500 group-hover:text-gray-600" />
              <span className='text-sm'>Ganti Password</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 group"
            >
              <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-600" />
              <span className='text-sm'>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8">
        <div className="max-w-none mx-auto">
          {children}
        </div>
      </main>

      <footer className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 sm:py-8 mt-8 sm:mt-12 lg:mt-16">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              <h3 className="text-lg sm:text-xl font-bold">RS Panti Nugroho</h3>
            </div>
            <p className="text-base sm:text-lg font-medium max-w-2xl mx-auto px-4">
              Bersama kita berikan pelayanan diabetes terbaik untuk Indonesia
            </p>
            <p className="text-sm text-green-100 max-w-xl mx-auto px-4">
              2025 RS Panti Nugroho. Semua hak dilindungi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs text-green-200 pt-4 border-t border-green-500/30">
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>{userRole ? ROLE_NAMES[userRole] : 'Staff Medis'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{shiftInfo.shift}</span>
              </div>
              <span className="text-center">Sistem Internal RS Panti Nugroho</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;