// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getDashboardPath, type UserRole } from '@/lib/auth';

export default function LoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login for:', login);

      const result = await signIn('credentials', {
        login,
        password,
        redirect: false,
      });

      console.log('Sign in result:', result);

      if (result?.error) {
        console.error('Sign in error:', result.error);
        setError('Email/Username atau password salah');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        console.log('Sign in successful');

        await new Promise(resolve => setTimeout(resolve, 500));

        const session = await getSession();
        console.log('Session after login:', session);

        if (session?.user) {
          const userRole = (session.user as any).role as UserRole;
          const dashboardRoute = getDashboardPath(userRole);

          console.log('Redirecting to:', dashboardRoute, 'for role:', userRole);

          router.push(dashboardRoute);
          router.refresh();
        } else {
          console.error('No session found after successful login');
          setError('Terjadi kesalahan sistem. Silakan coba lagi.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan sistem. Silakan coba lagi.');
    }

    setIsLoading(false);
  };

  const availableAccounts = [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Dokter Spesialis', username: 'dokter', password: 'dokter123' },
    { role: 'Perawat Ruangan', username: 'perawat_ruangan', password: 'perawat123' },
    { role: 'Perawat Poli', username: 'perawat_poli', password: 'perawat123' },
    { role: 'laboratorium', username: 'laboratorium', password: 'lab123' },
    { role: 'Ahli Gizi', username: 'ahli_gizi', password: 'gizi123' },
    { role: 'Administrasi pasien', username: 'administrasi', password: 'administrasi123' },
    { role: 'Manajer', username: 'manajer', password: 'manajer123' },
    { role: 'Farmasi', username: 'farmasi', password: 'farmasi123' }
  ];

  const handleQuickFill = (username: string, pwd: string) => {
    setLogin(username);
    setPassword(pwd);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden py-8 px-4">
      
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      {/* Subtle Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200 rounded-full blur-3xl"></div>
      </div>

      {/* Medical Icons Decorations */}
      <div className="absolute top-20 left-16 opacity-5 hidden xl:block">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="3"/>
          <path d="M50 30V70M30 50H70" stroke="#10b981" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="absolute bottom-24 right-16 opacity-5 hidden xl:block">
        <svg width="100" height="100" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 10L45 30H65L50 45L55 65L40 52L25 65L30 45L15 30H35L40 10Z" fill="#059669"/>
        </svg>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl w-full mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Photo Grid & Motivation */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              
              {/* Healthcare Photo Grid - RAPI & SIMETRIS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden h-48 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <img 
                    src="/doctorwithpatient.jpg" 
                    alt="Konsultasi Dokter" 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="relative rounded-2xl overflow-hidden h-48 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <img 
                    src="/medical checkup.jpg" 
                    alt="Perawatan Pasien" 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="relative rounded-2xl overflow-hidden h-48 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <img 
                    src="/animasistaf.jpg" 
                    alt="Tim Medis" 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="relative rounded-2xl overflow-hidden h-48 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <img 
                    src="/patient smiling.jpg" 
                    alt="Pelayanan Rumah Sakit" 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Inspirational Quote Card */}
              <div className="bg-gradient-to-br from-white to-emerald-50/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-emerald-100/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-900 font-semibold text-base leading-relaxed mb-2">
                      "Setiap langkah menuju kesehatan adalah langkah menuju kebahagiaan"
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Percayakan kesehatan Anda kepada kami. Kami siap mendampingi perjalanan hidup sehat Anda dengan layanan terbaik.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Logo KD - Premium Style */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 transform hover:scale-105 transition-transform duration-300">
                  <span className="text-white text-3xl font-bold tracking-tight">KD</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              </div>
            </div>

            {/* Login Card - Premium */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-100/50 p-8 lg:p-10 border border-gray-100">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-emerald-700 mb-2">
                  Kawan Diabetes
                </h1>
                <p className="text-emerald-600 font-semibold text-base">RS Panti Nugroho</p>
                <p className="text-gray-500 text-sm mt-2">Portal Sistem Informasi Kesehatan</p>
              </div>

              {/* Welcome Message */}
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Selamat Datang Kembali</h2>
                <p className="text-sm text-gray-500">Silakan masuk ke akun Anda</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="login" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email atau Username
                  </label>
                  <input
                    id="login"
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                    placeholder="Masukkan email atau username"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                    placeholder="Masukkan password"
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3.5 px-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30 disabled:scale-100 disabled:shadow-none shadow-lg">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Memproses...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Masuk
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Forgot Password */}
              <div className="text-end mt-4">
                <button
                  type="button"
                  onClick={() => router.push('/reset-password?mode=forgot')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors font-semibold hover:underline"
                  disabled={isLoading}
                >
                  Lupa Password?
                </button>
              </div>

              {/* Demo Accounts */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium py-2 rounded-lg hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <svg className={`w-4 h-4 transition-transform ${showCredentials ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {showCredentials ? 'Sembunyikan contoh akun' : 'Lihat contoh akun untuk testing'}
                </button>

                {showCredentials && (
                  <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Klik untuk mengisi otomatis
                    </p>
                    {availableAccounts.map((account, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleQuickFill(account.username, account.password)}
                        className="w-full p-3 text-left bg-gradient-to-r from-gray-50 to-emerald-50/30 hover:from-emerald-50 hover:to-green-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all duration-200 text-xs group"
                        disabled={isLoading}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-800 group-hover:text-emerald-700">{account.role}</div>
                            <div className="text-gray-500 mt-0.5">@{account.username}</div>
                          </div>
                          <div className="text-gray-400 font-mono bg-white px-2 py-1 rounded border border-gray-200 group-hover:border-emerald-300 group-hover:text-emerald-600">
                            {account.password}
                          </div>
                        </div>
                      </button>
                    ))}
                    <p className="text-xs text-gray-400 mt-3 italic text-center">
                      Untuk keperluan testing dan development
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Message */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-xs text-emerald-800 text-center font-semibold flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Kesehatan Anda adalah prioritas kami
                  </p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center mt-6 text-xs text-gray-500 flex items-center justify-center gap-1">
              © 2025 Kawan Diabetes. Semua hak dilindungi.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}