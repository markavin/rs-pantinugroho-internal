// File: src/components/SplashScreen.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const motivationalSlides = [
    {
      id: 1,
      title: "Selamat Datang! 🌟",
      subtitle: "Di RS Pantinugroho Diabetes Care",
      message: "Bersama kita kelola diabetes dengan penuh semangat!",
      bgColor: "from-blue-400 to-cyan-400",
      icon: "💪"
    },
    {
      id: 2,
      title: "Kamu Hebat! 🎯",
      subtitle: "Setiap Langkah Berarti",
      message: "Kontrol gula darah hari ini untuk masa depan yang lebih sehat",
      bgColor: "from-green-400 to-emerald-400",
      icon: "❤️"
    },
    {
      id: 3,
      title: "Tetap Semangat! ✨",
      subtitle: "Konsisten adalah Kunci",
      message: "Pantau makanan, minum obat tepat waktu, dan jaga aktivitas fisik",
      bgColor: "from-purple-400 to-pink-400",
      icon: "🌈"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev < motivationalSlides.length - 1) {
          return prev + 1;
        } else {
          // After showing all slides, finish splash screen
          setTimeout(onFinish, 1000);
          return prev;
        }
      });
    }, 2500); // Change slide every 2.5 seconds

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background with gradient animation */}
      <div className={`absolute inset-0 bg-gradient-to-br ${motivationalSlides[currentSlide].bgColor} transition-all duration-1000`}>
        {/* Animated circles */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full animate-bounce delay-75"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white/15 rounded-full animate-bounce delay-150"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/25 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-32 right-10 w-8 h-8 bg-white/20 rounded-full animate-bounce delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-8 max-w-lg mx-auto">
        {/* Hospital Logo */}
        <div className="mb-8 animate-pulse">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">🏥</span>
          </div>
        </div>

        {/* Slide Content */}
        <div className="space-y-6 animate-fade-in">
          <div className="text-6xl animate-bounce">
            {motivationalSlides[currentSlide].icon}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              {motivationalSlides[currentSlide].title}
            </h1>
            <h2 className="text-xl font-semibold text-white/90">
              {motivationalSlides[currentSlide].subtitle}
            </h2>
          </div>

          <p className="text-lg text-white/95 leading-relaxed px-4">
            {motivationalSlides[currentSlide].message}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2 pt-4">
            {motivationalSlides.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        <div className="mt-12">
          <div className="w-16 h-16 mx-auto">
            <div className="w-full h-full border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white/90 mt-4 text-sm font-medium">
            Menyiapkan aplikasi untuk Anda...
          </p>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-24">
          <path
            fill="rgba(255,255,255,0.1)"
            d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64V120H1392C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120H0V32Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default SplashScreen;