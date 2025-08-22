// File: src/components/auth/LoginForm.tsx

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../app/providers';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    login: '', 
    password: '',
    selectedRole: 'PATIENT' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  const roles = [
    { value: 'PATIENT', label: 'Pasien', icon: '👤', color: 'from-blue-400 to-blue-600' },
    { value: 'DOCTOR', label: 'Dokter', icon: '👨‍⚕️', color: 'from-green-400 to-green-600' },
    { value: 'NURSE', label: 'Perawat', icon: '👩‍⚕️', color: 'from-pink-400 to-pink-600' },
    { value: 'NUTRITIONIST', label: 'Ahli Gizi', icon: '🥗', color: 'from-orange-400 to-orange-600' },
    { value: 'PHARMACIST', label: 'Apoteker', icon: '💊', color: 'from-purple-400 to-purple-600' },
    { value: 'ADMIN', label: 'Admin', icon: '⚙️', color: 'from-gray-400 to-gray-600' },
  ];

  const demoAccounts = [
    { role: 'PATIENT', email: 'patient@demo.com', username: 'patient' },
    { role: 'DOCTOR', email: 'doctor@demo.com', username: 'doctor' },
    { role: 'NURSE', email: 'nurse@demo.com', username: 'nurse' },
    { role: 'NUTRITIONIST', email: 'nutritionist@demo.com', username: 'nutritionist' },
    { role: 'PHARMACIST', email: 'pharmacist@demo.com', username: 'pharmacist' },
    { role: 'ADMIN', email: 'admin@demo.com', username: 'admin' },
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
        login: credentials.login, // This matches our NextAuth field
        password: credentials.password,
        redirect: false,
      });

      console.log('🔍 Login result:', result);

      if (result?.error) {
        console.error('❌ Login error:', result.error);
        addToast({
          message: `Login gagal: ${result.error}`,
          type: 'error'
        });
      } else if (result?.ok) {
        console.log('✅ Login successful');
        addToast({
          message: 'Login berhasil! Selamat datang! 🎉',
          type: 'success'
        });
        
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('💥 Login exception:', error);
      addToast({
        message: 'Terjadi kesalahan. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    const account = demoAccounts.find(acc => acc.role === role);
    if (account) {
      setCredentials({
        login: account.email,
        password: 'demo123',
        selectedRole: role
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-green-400/15 to-emerald-400/15 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative min-h-screen flex">
        {/* Left side - Motivational content */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="text-center space-y-8 max-w-lg">
            {/* Hospital branding */}
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl text-white">🏥</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                RS Pantinugroho
              </h1>
              <p className="text-xl text-gray-600">
                Diabetes Care Management
              </p>
            </div>

            {/* Motivational messages */}
            <div className="space-y-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="text-4xl mb-3">💪</div>
                <h3 className="font-semibold text-gray-800 mb-2">Kelola Diabetes Dengan Percaya Diri</h3>
                <p className="text-gray-600">
                  Setiap langkah kecil menuju kesehatan adalah kemenangan besar!
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-2">Pantau & Capai Target Anda</h3>
                <p className="text-gray-600">
                  Bersama tim medis terbaik, wujudkan hidup sehat dan bahagia
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="text-4xl mb-3">❤️</div>
                <h3 className="font-semibold text-gray-800 mb-2">Perawatan Penuh Kasih</h3>
                <p className="text-gray-600">
                  Tim medis yang peduli, teknologi terdepan, pelayanan terbaik
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
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg mb-4">
                <span className="text-2xl text-white">🏥</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">RS Pantinugroho</h1>
              <p className="text-gray-600">Diabetes Care Management</p>
            </div>

            {/* Login form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang! 👋</h2>
                <p className="text-gray-600">Masuk untuk melanjutkan perawatan diabetes Anda</p>
              </div>

              {/* Quick login buttons */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quick Login (Demo):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => quickLogin(role.value)}
                      className={`
                        p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium
                        ${credentials.selectedRole === role.value 
                          ? `bg-gradient-to-r ${role.color} text-white border-transparent shadow-lg transform scale-105`
                          : 'bg-white/60 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-white/80'
                        }
                      `}
                    >
                      <div className="text-lg mb-1">{role.icon}</div>
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email/Username input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email / Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <span className="text-gray-400">📧</span>
                    </div>
                    <input
                      type="text" // Changed from email to text to allow username
                      value={credentials.login}
                      onChange={(e) => setCredentials(prev => ({ ...prev, login: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200"
                      placeholder="Email atau username"
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
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl hover:scale-105'
                    }
                  `}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Masuk...</span>
                    </div>
                  ) : (
                    <span>Masuk 🚀</span>
                  )}
                </button>

                {/* Demo credentials */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-2">Demo Accounts (password: demo123):</p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <p className="text-blue-600">• admin@demo.com / admin</p>
                    <p className="text-blue-600">• doctor@demo.com / doctor</p>
                    <p className="text-blue-600">• patient@demo.com / patient</p>
                  </div>
                  <p className="text-xs text-blue-500 mt-2 italic">
                    💡 Klik tombol role di atas untuk quick fill
                  </p>
                </div>
              </form>

              {/* Footer */}
              <div className="text-center mt-6">
                <p className="text-xs text-gray-500">
                  Dengan masuk, Anda menyetujui syarat dan ketentuan kami
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