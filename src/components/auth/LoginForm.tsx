// File: src/components/auth/LoginForm.tsx

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../app/providers';
import { ROLE_NAMES, getRoleTheme, type UserRole } from '@/lib/auth';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    login: '', 
    password: '',
    selectedRole: 'SUPER_ADMIN' as UserRole
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  // Role definitions sesuai RS Pantinugroho
  const roles: Array<{
    value: UserRole;
    label: string;
    icon: string;
    color: string;
    description: string;
  }> = [
    { 
      value: 'SUPER_ADMIN', 
      label: 'Super Admin', 
      icon: '👑', 
      color: 'from-purple-400 to-purple-600',
      description: 'Manajerial & Sistem'
    },
    { 
      value: 'DOKTER_SPESIALIS', 
      label: 'Dokter Spesialis', 
      icon: '🩺', 
      color: 'from-blue-400 to-blue-600',
      description: 'Penyakit Dalam'
    },
    { 
      value: 'PERAWAT_RUANGAN', 
      label: 'Perawat Ruangan', 
      icon: '👩‍⚕️', 
      color: 'from-teal-400 to-teal-600',
      description: 'Monitoring Pasien'
    },
    { 
      value: 'PERAWAT_POLI', 
      label: 'Perawat Poli', 
      icon: '💉', 
      color: 'from-cyan-400 to-cyan-600',
      description: 'Poliklinik Diabetes'
    },
    { 
      value: 'AHLI_GIZI', 
      label: 'Ahli Gizi', 
      icon: '🥗', 
      color: 'from-green-400 to-green-600',
      description: 'Nutrisi & Diet'
    },
    { 
      value: 'FARMASI', 
      label: 'Farmasi', 
      icon: '💊', 
      color: 'from-emerald-400 to-emerald-600',
      description: 'Obat & Interaksi'
    },
  ];

  // Demo accounts sesuai dengan yang ada di NextAuth route
  const demoAccounts = [
    { role: 'SUPER_ADMIN', email: 'admin@pantinugroho.com', username: 'admin', name: 'Dr. Bambang Sutrisno' },
    { role: 'DOKTER_SPESIALIS', email: 'dokter@pantinugroho.com', username: 'dokter', name: 'Dr. Sarah Wijayanti, Sp.PD' },
    { role: 'PERAWAT_RUANGAN', email: 'perawat.ruangan@pantinugroho.com', username: 'perawat_ruangan', name: 'Sari Indrawati, S.Kep' },
    { role: 'PERAWAT_POLI', email: 'perawat.poli@pantinugroho.com', username: 'perawat_poli', name: 'Rina Kartika, S.Kep' },
    { role: 'AHLI_GIZI', email: 'ahligizi@pantinugroho.com', username: 'ahli_gizi', name: 'Dewi Sartika, S.Gz' },
    { role: 'FARMASI', email: 'farmasi@pantinugroho.com', username: 'farmasi', name: 'Budi Santoso, S.Farm, Apt' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔄 Attempting login with:', {
        login: credentials.login,
        password: credentials.password
      });

      const result = await signIn('credentials', {
        login: credentials.login,
        password: credentials.password,
        redirect: false,
      });

      console.log('🔍 Login result:', result);

      if (result?.error) {
        console.error('❌ Login error:', result.error);
        addToast({
          message: `Login gagal: Periksa kembali email/username dan password`,
          type: 'error'
        });
      } else if (result?.ok) {
        console.log('✅ Login successful');
        addToast({
          message: 'Login berhasil! Selamat datang di sistem RS Pantinugroho! 🎉',
          type: 'success'
        });
        
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('💥 Login exception:', error);
      addToast({
        message: 'Terjadi kesalahan sistem. Silakan hubungi IT Support.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (role: UserRole) => {
    const account = demoAccounts.find(acc => acc.role === role);
    if (account) {
      setCredentials({
        login: account.username, // Use username instead of email for quicker login
        password: account.role === 'SUPER_ADMIN' ? 'admin123' : 
                 account.role === 'DOKTER_SPESIALIS' ? 'dokter123' :
                 account.role.includes('PERAWAT') ? 'perawat123' :
                 account.role === 'AHLI_GIZI' ? 'gizi123' : 'farmasi123',
        selectedRole: role
      });
    }
  };

  const selectedRoleTheme = getRoleTheme(credentials.selectedRole);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${selectedRoleTheme.gradient}`}>
      {/* Decorative elements with role-based colors */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-${selectedRoleTheme.primary}-400/20 to-${selectedRoleTheme.primary}-500/20 rounded-full blur-xl animate-pulse`}></div>
        <div className={`absolute top-1/4 -left-20 w-60 h-60 bg-gradient-to-br from-${selectedRoleTheme.primary}-300/10 to-${selectedRoleTheme.primary}-400/10 rounded-full blur-2xl animate-pulse delay-1000`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-${selectedRoleTheme.primary}-400/15 to-${selectedRoleTheme.primary}-500/15 rounded-full blur-xl animate-pulse delay-500`}></div>
      </div>

      <div className="relative min-h-screen flex">
        {/* Left side - Hospital & Role information */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="text-center space-y-8 max-w-lg">
            {/* Hospital branding */}
            <div className="space-y-4">
              <div className={`w-20 h-20 mx-auto bg-gradient-to-br from-${selectedRoleTheme.primary}-500 to-${selectedRoleTheme.primary}-600 rounded-full flex items-center justify-center shadow-lg`}>
                <span className="text-3xl text-white">🏥</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                RS Pantinugroho
              </h1>
              <p className="text-xl text-gray-600">
                Sistem Manajemen Diabetes Internal
              </p>
            </div>

            {/* Role-based motivational messages */}
            <div className="space-y-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="text-4xl mb-3">{selectedRoleTheme.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Selamat Datang, {ROLE_NAMES[credentials.selectedRole]}
                </h3>
                <p className="text-gray-600">
                  {credentials.selectedRole === 'SUPER_ADMIN' && 'Kelola sistem dan pantau kinerja pelayanan rumah sakit'}
                  {credentials.selectedRole === 'DOKTER_SPESIALIS' && 'Berikan diagnosis terbaik dan edukasi untuk pasien diabetes'}
                  {credentials.selectedRole === 'PERAWAT_RUANGAN' && 'Monitor kondisi pasien dan koordinasi perawatan terpadu'}
                  {credentials.selectedRole === 'PERAWAT_POLI' && 'Berikan pelayanan interaktif dan reminder untuk pasien'}
                  {credentials.selectedRole === 'AHLI_GIZI' && 'Susun rencana nutrisi dan monitor pola makan pasien'}
                  {credentials.selectedRole === 'FARMASI' && 'Pastikan keamanan obat dan cegah interaksi berbahaya'}
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-2">Teknologi Terintegrasi</h3>
                <p className="text-gray-600">
                  Sistem ERM terintegrasi untuk pelayanan diabetes yang terkoordinasi dan berkualitas
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="font-semibold text-gray-800 mb-2">Efisiensi & Akurasi</h3>
                <p className="text-gray-600">
                  Input data yang sederhana, notifikasi real-time, dan pelaporan otomatis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile hospital branding */}
            <div className="lg:hidden text-center mb-8">
              <div className={`w-16 h-16 mx-auto bg-gradient-to-br from-${selectedRoleTheme.primary}-500 to-${selectedRoleTheme.primary}-600 rounded-full flex items-center justify-center shadow-lg mb-4`}>
                <span className="text-2xl text-white">🏥</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">RS Pantinugroho</h1>
              <p className="text-gray-600">Sistem Internal Diabetes Care</p>
            </div>

            {/* Login form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="text-3xl mb-3">{selectedRoleTheme.icon}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Staff Medis</h2>
                <p className="text-gray-600">Akses sistem manajemen diabetes RS Pantinugroho</p>
              </div>

              {/* Role selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Pilih Role Anda:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setCredentials(prev => ({ ...prev, selectedRole: role.value }))}
                      className={`
                        p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium
                        ${credentials.selectedRole === role.value 
                          ? `bg-gradient-to-r ${role.color} text-white border-transparent shadow-lg transform scale-105`
                          : 'bg-white/60 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-white/80'
                        }
                      `}
                    >
                      <div className="text-lg mb-1">{role.icon}</div>
                      <div className="font-semibold">{role.label}</div>
                      <div className="text-xs opacity-75 mt-1">{role.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick demo login */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quick Login Demo:
                </label>
                <button
                  type="button"
                  onClick={() => quickLogin(credentials.selectedRole)}
                  className={`w-full p-3 rounded-xl bg-gradient-to-r ${getRoleTheme(credentials.selectedRole).primary === 'purple' ? 'from-purple-100 to-purple-200 text-purple-800 border-purple-300' : `from-${getRoleTheme(credentials.selectedRole).primary}-100 to-${getRoleTheme(credentials.selectedRole).primary}-200 text-${getRoleTheme(credentials.selectedRole).primary}-800 border-${getRoleTheme(credentials.selectedRole).primary}-300`} border font-medium hover:shadow-md transition-all`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{selectedRoleTheme.icon}</span>
                    <span>Login sebagai {ROLE_NAMES[credentials.selectedRole]}</span>
                  </div>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username/Email input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username / Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <span className="text-gray-400">👤</span>
                    </div>
                    <input
                      type="text"
                      value={credentials.login}
                      onChange={(e) => setCredentials(prev => ({ ...prev, login: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200"
                      placeholder="Masukkan username atau email"
                      required
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <span className="text-gray-400">🔒</span>
                    </div>
                    <input
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200"
                      placeholder="Masukkan password"
                      required
                    />
                  </div>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    w-full py-4 px-6 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 transform
                    ${isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : `bg-gradient-to-r from-${selectedRoleTheme.primary}-500 to-${selectedRoleTheme.primary}-600 hover:from-${selectedRoleTheme.primary}-600 hover:to-${selectedRoleTheme.primary}-700 hover:shadow-xl hover:scale-105`
                    }
                  `}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Memverifikasi...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>{selectedRoleTheme.icon}</span>
                      <span>Masuk ke Sistem</span>
                    </div>
                  )}
                </button>

                {/* Demo credentials info */}
                <div className={`bg-${selectedRoleTheme.primary}-50 rounded-xl p-4 border border-${selectedRoleTheme.primary}-200`}>
                  <p className={`text-xs text-${selectedRoleTheme.primary}-700 font-medium mb-2`}>
                    Demo Account - {ROLE_NAMES[credentials.selectedRole]}:
                  </p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className={`text-${selectedRoleTheme.primary}-600 font-mono bg-white/50 rounded px-2 py-1`}>
                      <span className="font-medium">Username:</span> {demoAccounts.find(acc => acc.role === credentials.selectedRole)?.username}
                    </div>
                    <div className={`text-${selectedRoleTheme.primary}-600 font-mono bg-white/50 rounded px-2 py-1`}>
                      <span className="font-medium">Password:</span> {
                        credentials.selectedRole === 'SUPER_ADMIN' ? 'admin123' : 
                        credentials.selectedRole === 'DOKTER_SPESIALIS' ? 'dokter123' :
                        credentials.selectedRole.includes('PERAWAT') ? 'perawat123' :
                        credentials.selectedRole === 'AHLI_GIZI' ? 'gizi123' : 'farmasi123'
                      }
                    </div>
                  </div>
                  <p className={`text-xs text-${selectedRoleTheme.primary}-500 mt-2 italic`}>
                    💡 Klik "Quick Login Demo" untuk mengisi otomatis
                  </p>
                </div>
              </form>

              {/* Security notice */}
              <div className="text-center mt-6 space-y-2">
                <p className="text-xs text-gray-500">
                  🔒 Sistem diamankan dengan enkripsi end-to-end
                </p>
                <p className="text-xs text-gray-400">
                  Untuk bantuan teknis, hubungi IT Support: ext. 1234
                </p>
              </div>
            </div>

            {/* Additional info for mobile */}
            <div className="lg:hidden mt-6 text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Sistem Internal RS Pantinugroho</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Platform terintegrasi untuk manajemen diabetes care dengan teknologi terdepan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;