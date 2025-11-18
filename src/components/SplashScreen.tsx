// File: src/components/SplashScreen.tsx

'use client';

import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  message?: string;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish, 
  message = "Memuat aplikasi...",
  duration = 2000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 700);
    }, duration);

    return () => clearTimeout(timer);
  }, [onFinish, duration]);

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-linear-to-br from-emerald-50 via-white to-green-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border border-green-200 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-emerald-300 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-green-100 rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">

        {/* Hospital Logo - Modern Medical Cross */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-green-100 flex items-center justify-center transform transition-transform duration-500 hover:scale-105">
            <span className="text-2xl font-extrabold bg-linear-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
              KD
            </span>
          </div>
          <div className="absolute inset-0 w-20 h-20 bg-emerald-200 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
        </div>

        {/* Hospital Name */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            KAWAN DIABETES
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-px bg-linear-to-r from-transparent via-emerald-400 to-transparent"></div>
            <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase">
              RS Panti Nugroho
            </p>
            <div className="w-8 h-px bg-linear-to-r from-transparent via-emerald-400 to-transparent"></div>
          </div>
        </div>

        <div className="text-center max-w-sm">
          <p className="text-gray-600 text-base leading-relaxed">
            Bersama menuju hidup yang lebih sehat dan berkualitas
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-green-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            {message}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg viewBox="0 0 1440 60" className="w-full h-15 opacity-10">
          <path
            fill="url(#wave-linear)"
            d="M0,32L60,37.3C120,43,240,53,360,48C480,43,600,21,720,21.3C840,21,960,43,1080,48C1200,53,1320,43,1380,37.3L1440,32V60H1380C1320,60,1200,60,1080,60C960,60,840,60,720,60C600,60,480,60,360,60C240,60,120,60,60,60H0V32Z"
          />
          <defs>
            <linearlinear id="wave-linear" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearlinear>
          </defs>
        </svg>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        /* Custom pulse for glow effect */
        @keyframes gentle-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;