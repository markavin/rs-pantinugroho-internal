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
        redirect: false, // Jangan auto redirect
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
    { role: 'Ahli Gizi', username: 'ahli_gizi', password: 'gizi123' },
    { role: 'Administrasi', username: 'administrasi', password: 'administrasi123' },
    { role: 'Manajer', username: 'manajer', password: 'manajer123' },
    { role: 'Farmasi', username: 'farmasi', password: 'farmasi123' }
  ];

  const handleQuickFill = (username: string, pwd: string) => {
    setLogin(username);
    setPassword(pwd);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full mx-4">
        {/* Hospital Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">KD</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kawan Diabetes</h1>
          <p className="text-gray-600">RS Panti Nugroho</p>
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
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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

          {/* Toggle for showing available credentials */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowCredentials(!showCredentials)}
              className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isLoading}
            >
              {showCredentials ? 'sembunyikan contoh akun' : ' lihat contoh akun '} 
            </button>

            {showCredentials && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-500 mb-2">Klik untuk mengisi otomatis:</p>
                {availableAccounts.map((account, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleQuickFill(account.username, account.password)}
                    className="w-full p-2 text-left bg-gray-50 hover:bg-gray-100 rounded border transition-colors text-xs"
                    disabled={isLoading}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-700">{account.role}</div>
                        <div className="text-gray-500">@{account.username}</div>
                      </div>
                      <div className="text-gray-400 font-mono">
                        {account.password}
                      </div>
                    </div>
                  </button>
                ))}
                <p className="text-xs text-gray-400 mt-2">
                  * Untuk keperluan testing dan development
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          © 2025 RS Panti Nugroho. Semua hak dilindungi.
        </div>
      </div>
    </div>
  );
}