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
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Attempting login for:', login);
      
      const result = await signIn('credentials', {
        login,
        password,
        redirect: false, // Jangan auto redirect
      });

      console.log('🔍 Sign in result:', result);

      if (result?.error) {
        console.error('❌ Sign in error:', result.error);
        setError('Email/Username atau password salah');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        console.log('✅ Sign in successful');
        
        // Tunggu sebentar untuk memastikan session ter-update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get fresh session to get user role
        const session = await getSession();
        console.log('🔍 Session after login:', session);
        
        if (session?.user) {
          const userRole = (session.user as any).role as UserRole;
          // Gunakan getDashboardPath dari auth.ts untuk mendapatkan route yang benar
          const dashboardRoute = getDashboardPath(userRole);
          
          console.log('✅ Redirecting to:', dashboardRoute, 'for role:', userRole);
          
          // Redirect ke dashboard sesuai role
          router.push(dashboardRoute);
          router.refresh(); // Refresh untuk memastikan state terbaru
        } else {
          console.error('❌ No session found after successful login');
          setError('Terjadi kesalahan sistem. Silakan coba lagi.');
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Terjadi kesalahan sistem. Silakan coba lagi.');
    }
    
    setIsLoading(false);
  };

  // Demo accounts - update routes sesuai dengan getDashboardPath
  const demoAccounts = [
    { label: 'Super Admin', login: 'admin', password: 'admin123', role: 'SUPER_ADMIN' },
    { label: 'Dokter', login: 'dokter', password: 'dokter123', role: 'DOKTER_SPESIALIS' },
    { label: 'Perawat Ruangan', login: 'perawat_ruangan', password: 'perawat123', role: 'PERAWAT_RUANGAN' },
    { label: 'Perawat Poli', login: 'perawat_poli', password: 'perawat123', role: 'PERAWAT_POLI' },
    { label: 'Ahli Gizi', login: 'ahli_gizi', password: 'gizi123', role: 'AHLI_GIZI' },
    { label: 'Farmasi', login: 'farmasi', password: 'farmasi123', role: 'FARMASI' }
  ];

  const handleDemoLogin = (demoLogin: string, demoPassword: string) => {
    setLogin(demoLogin);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full mx-4">
        {/* Hospital Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">RS Panti Nugroho</h1>
          <p className="text-gray-600">Sistem Informasi Manajemen Diabetes</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">
                Email atau Username
              </label>
              <input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Masukkan email atau username"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Masukkan password"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Masuk...
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Akun Demo - Klik untuk Preview Dashboard</h3>
            <div className="space-y-2 text-xs">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDemoLogin(account.login, account.password)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                  disabled={isLoading}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-700">{account.label}</div>
                      <div className="text-gray-500">{account.login}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-mono text-xs">
                        {getDashboardPath(account.role as UserRole)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          © 2024 RS Panti Nugroho. Semua hak dilindungi.
        </div>
      </div>
    </div>
  );
}