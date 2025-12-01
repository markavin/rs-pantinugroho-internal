// File: src/components/SplashScreen.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";

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
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border border-green-200 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-emerald-300 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-green-100 rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">

        {/* Decorative Medical Illustrations */}
        <div className="absolute top-10 left-10 opacity-10">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 10C23.43 10 10 23.43 10 40C10 56.57 23.43 70 40 70C56.57 70 70 56.57 70 40C70 23.43 56.57 10 40 10Z" stroke="#10b981" strokeWidth="2" />
            <path d="M40 25V55M25 40H55" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <div className="absolute top-20 right-10 opacity-10">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 10L35 25H50L38 35L43 50L30 40L17 50L22 35L10 25H25L30 10Z" fill="#059669" />
          </svg>
        </div>

        <div className="absolute bottom-32 left-20 opacity-10">
          <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="35" cy="25" r="12" fill="#10b981" />
            <path d="M55 58C55 45 47 38 35 38C23 38 15 45 15 58" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Hospital Photo Banner - GANTI DENGAN FOTO */}
        <div className="mb-6 w-full max-w-md">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <motion.img
              src="/doctorwithpatient.jpg"
              alt="RS Panti Nugroho"
              className="w-full h-70 object-cover object-top"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
          </div>
        </div>

        {/* Hospital Logo - Modern Medical Cross */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-green-100 flex items-center justify-center transform transition-transform duration-500 hover:scale-105">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
              KD
            </span>
          </div>
          <div className="absolute inset-0 w-24 h-24 bg-emerald-200 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
        </div>

        {/* Hospital Name */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            KAWAN DIABETES
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
            <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase">
              RS Panti Nugroho
            </p>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
          </div>
        </div>

        {/* Motivational Quotes */}
        <div className="text-center max-w-lg mb-2 space-y-3">
          <p className="text-gray-800 text-lg font-semibold leading-relaxed">
            Bersama Menuju Hidup Sehat dan Berkualitas
          </p>
          <p className="text-emerald-700 text-base leading-relaxed italic">
            Kesehatan adalah investasi terbaik untuk masa depan Anda
          </p>
          {/* <div className="pt-2">
            <p className="text-gray-600 text-sm leading-relaxed">
              Percayakan kesehatan Anda kepada kami, kami siap mendampingi perjalanan hidup sehat Anda dengan penuh kasih dan profesionalisme
            </p>
          </div> */}
        </div>

        {/* Loading Spinner and Message */}
        <div className="flex flex-col items-center space-y-4">
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
            fill="url(#wave-gradient)"
            d="M0,32L60,37.3C120,43,240,53,360,48C480,43,600,21,720,21.3C840,21,960,43,1080,48C1200,53,1320,43,1380,37.3L1440,32V60H1380C1320,60,1200,60,1080,60C960,60,840,60,720,60C600,60,480,60,360,60C240,60,120,60,60,60H0V32Z"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
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

        @keyframes gentle-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* <style jsx>{`
  @keyframes kenburns {
    from {
      transform: scale(1.1);
    }
    to {
      transform: scale(1.25);
    }
  }
  .kenburns {
    animation: kenburns 8s ease-out infinite alternate;
  }
`}</style> */}
    </div>
  );
};

export default SplashScreen;