// app/reset-password/ResetPasswordForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Shield, Lock, Mail, CheckCircle, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const emailFromUrl = searchParams.get('email');

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const endpoint = mode === 'change' 
        ? '/api/auth/change-password-otp'
        : '/api/auth/forgot-password';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Kode verifikasi telah dikirim ke email Anda');
        setStep('otp');
        setCountdown(60);
      } else {
        setError(data.error || 'Gagal mengirim kode verifikasi');
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const endpoint = mode === 'change' 
        ? '/api/auth/change-password-otp'
        : '/api/auth/forgot-password';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Kode baru telah dikirim');
        setCountdown(60);
        setOtpCode('');
      } else {
        setError(data.error || 'Gagal mengirim kode');
      }
    } catch (error) {
      setError('Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Kode berhasil diverifikasi');
        setStep('password');
      } else {
        setError(data.error || 'Kode verifikasi tidak valid atau sudah kadaluarsa');
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: otpCode,
          newPassword,
          mode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
        
        if (mode === 'change') {
          setTimeout(async () => {
            await signOut({ 
              redirect: true,
              callbackUrl: '/' 
            });
          }, 2000);
        } else {
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } else {
        setError(data.error || 'Gagal reset password');
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'email', label: 'Email', icon: Mail },
      { key: 'otp', label: 'Kode OTP', icon: KeyRound },
      { key: 'password', label: 'Password Baru', icon: Lock },
    ];

    return (
      <div className="flex justify-center mb-8">
        {steps.map((stepItem, index) => {
          const StepIcon = stepItem.icon;
          const isActive = step === stepItem.key;
          const isPast = steps.findIndex(s => s.key === step) > index;

          return (
            <div key={stepItem.key} className="flex items-center">
              <div className={`flex flex-col items-center ${isActive ? 'scale-110' : ''} transition-transform`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-green-600 text-white shadow-lg' :
                  isPast ? 'bg-green-100 text-green-600' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  <StepIcon className="h-5 w-5" />
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isActive ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stepItem.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 transition-colors ${
                  isPast ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const pageTitle = mode === 'change' ? 'Ganti Password' : 'Reset Password';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">KD</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{pageTitle}</h1>
          <p className="text-gray-600">RS Panti Nugroho</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step !== 'success' && renderStepIndicator()}

          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">
                      {mode === 'change' ? 'Verifikasi email akun Anda' : 'Masukkan email terdaftar Anda'}
                    </p>
                    <p className="text-xs mt-1">Kode verifikasi 6 digit akan dikirim ke email Anda</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Terdaftar
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={emailFromUrl || 'contoh@email.com'}
                  required
                  disabled={isLoading || (mode === 'change' && !!emailFromUrl)}
                  readOnly={mode === 'change' && !!emailFromUrl}
                />
                {mode === 'change' && emailFromUrl && (
                  <p className="text-xs text-gray-500 mt-2">
                    Menggunakan email akun yang sedang login
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Mengirim Kode...
                  </span>
                ) : (
                  'Kirim Kode Verifikasi'
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800 py-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Login
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Kode telah dikirim</p>
                    <p className="text-xs mt-1">Cek inbox atau folder spam di <strong>{email}</strong></p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Masukkan Kode Verifikasi
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 border-2 border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-3xl tracking-[0.5em] font-mono font-bold"
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">
                    Kode berlaku 10 menit
                  </p>
                  {otpCode.length === 6 && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm text-center">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Memverifikasi...
                  </span>
                ) : (
                  'Verifikasi Kode'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isLoading}
                  className="text-sm text-green-600 hover:text-green-700 disabled:text-gray-400 transition-colors font-medium"
                >
                  {countdown > 0 ? (
                    `Kirim ulang dalam ${countdown}s`
                  ) : (
                    'Kirim Ulang Kode'
                  )}
                </button>
              </div>

              {mode !== 'change' && (
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtpCode('');
                    setError('');
                  }}
                  className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800 py-2 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ganti Email
                </button>
              )}
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">
                    Verifikasi berhasil. Buat password baru Anda
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Minimal 6 karakter"
                  required
                  disabled={isLoading}
                />
                {newPassword && (
                  <div className="mt-2 text-xs">
                    <div className={`flex items-center space-x-1 ${newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="h-3 w-3" />
                      <span>Minimal 6 karakter</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ketik ulang password"
                  required
                  disabled={isLoading}
                />
                {confirmPassword && (
                  <div className="mt-2 text-xs">
                    <div className={`flex items-center space-x-1 ${newPassword === confirmPassword && confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                      {newPassword === confirmPassword && confirmPassword ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          <span>Password cocok</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          <span>Password tidak cocok</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Mereset Password...
                  </span>
                ) : (
                  'Reset Password Sekarang'
                )}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Password Berhasil Direset
              </h2>
              <p className="text-gray-600 mb-6">
                Password Anda telah berhasil diubah.<br />
                {mode === 'change' ? (
                  <span className="font-medium text-gray-800">Anda akan otomatis logout...</span>
                ) : (
                  'Silakan login dengan password baru Anda.'
                )}
              </p>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>{mode === 'change' ? 'Logout dan mengalihkan...' : 'Mengalihkan ke halaman login...'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          2025 RS Panti Nugroho. Semua hak dilindungi.
        </div>
      </div>
    </div>
  );
}