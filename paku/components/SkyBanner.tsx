"use client";
import React, { useState, useEffect } from 'react';

interface SkyBannerProps {
  weatherCode?: number;
}

export default function SkyBanner({ weatherCode = 0 }: SkyBannerProps) {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('afternoon');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
    else if (hour >= 17 && hour < 20) setTimeOfDay('evening');
    else setTimeOfDay('night');
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-52 md:h-56 bg-gradient-to-r from-sky-400 to-blue-500 animate-pulse" />;
  }

  const skyGradients = {
    morning: 'from-orange-300 via-amber-200 to-sky-300',
    afternoon: 'from-sky-400 via-blue-400 to-cyan-300',
    evening: 'from-indigo-500 via-purple-400 to-orange-300',
    night: 'from-slate-900 via-indigo-950 to-slate-800',
  };

  const isNight = timeOfDay === 'night';
  const isCloudy = weatherCode >= 2 && weatherCode <= 3;
  const isRainy = weatherCode > 50 && weatherCode <= 90;
  const isStormy = weatherCode > 90;
  const showClouds = isCloudy || isRainy || isStormy;

  return (
    <div className={`relative w-full h-52 md:h-56 overflow-hidden bg-gradient-to-r ${skyGradients[timeOfDay]} transition-all duration-1000`}>
      
      {/* Horizon glow */}
      {(timeOfDay === 'morning' || timeOfDay === 'evening') && (
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-200/40 to-transparent" />
      )}

      {/* Sun */}
      {!isNight && (
        <div className={`sky-sun absolute ${
          timeOfDay === 'morning' ? 'sky-sun-morning' :
          timeOfDay === 'afternoon' ? 'sky-sun-noon' :
          'sky-sun-evening'
        }`}>
          <div className="relative">
            {/* Core sun */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-[0_0_60px_rgba(251,191,36,0.6),0_0_120px_rgba(251,191,36,0.3)]" />
            {/* Pulsing glow ring */}
            <div className="absolute inset-[-8px] rounded-full bg-yellow-300/20 sky-pulse" />
            <div className="absolute inset-[-16px] rounded-full bg-yellow-200/10 sky-pulse-delayed" />
          </div>
        </div>
      )}

      {/* Moon */}
      {isNight && (
        <div className="absolute top-4 right-[20%] sky-float" style={{ width: 'clamp(3rem, 6vw, 5rem)', height: 'clamp(3rem, 6vw, 5rem)' }}>
          <div className="relative w-full h-full">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-[0_0_40px_rgba(203,213,225,0.4),0_0_80px_rgba(203,213,225,0.2)]" />
            {/* Craters */}
            <div className="absolute top-[18%] left-[28%] w-[18%] h-[18%] rounded-full bg-slate-400/60" />
            <div className="absolute top-[50%] left-[14%] w-[14%] h-[14%] rounded-full bg-amber-300/35" />
            <div className="absolute bottom-[18%] right-[18%] w-[16%] h-[16%] rounded-full bg-slate-400/55" />
          </div>
        </div>
      )}

      {/* Stars (night only) */}
      {isNight && (
        <>
          <div className="absolute top-4 left-[10%] w-1.5 h-1.5 rounded-full bg-white sky-twinkle" />
          <div className="absolute top-8 left-[25%] w-1 h-1 rounded-full bg-white/80 sky-twinkle-delayed" />
          <div className="absolute top-3 left-[40%] w-1.5 h-1.5 rounded-full bg-white sky-twinkle" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-12 left-[55%] w-1 h-1 rounded-full bg-white/70 sky-twinkle-delayed" />
          <div className="absolute top-6 left-[70%] w-1.5 h-1.5 rounded-full bg-white/90 sky-twinkle" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-2 left-[85%] w-1 h-1 rounded-full bg-white/60 sky-twinkle-delayed" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-16 left-[15%] w-1 h-1 rounded-full bg-white/80 sky-twinkle" style={{ animationDelay: '2s' }} />
          <div className="absolute top-10 left-[48%] w-0.5 h-0.5 rounded-full bg-white/50 sky-twinkle-delayed" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-14 left-[78%] w-1 h-1 rounded-full bg-white sky-twinkle" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-5 left-[60%] w-0.5 h-0.5 rounded-full bg-white/70 sky-twinkle-delayed" style={{ animationDelay: '1.8s' }} />
          {/* Star cross sparkle */}
          <div className="absolute top-8 left-[35%]">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 sky-sparkle">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-white/80" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-white/80" />
              </div>
            </div>
          </div>
          {/* Shooting star */}
          <div className="absolute sky-shooting-star" style={{ top: '15%', left: '5%' }}>
            <div className="relative">
              <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              <div className="absolute top-0 right-full w-20 h-[1px] bg-gradient-to-l from-white/80 to-transparent" />
            </div>
          </div>
        </>
      )}

      {/* Clouds */}
      {(showClouds || timeOfDay === 'afternoon') && (
        <>
          {/* Cloud 1 */}
          <div className={`absolute sky-cloud-drift ${isStormy ? 'sky-cloud-drift-fast' : ''}`} style={{ top: '15%' }}>
            <div className={`flex items-end ${isStormy ? 'opacity-90' : 'opacity-70'}`}>
              <div className={`w-16 h-8 rounded-full ${isStormy ? 'bg-slate-500' : 'bg-white'}`} />
              <div className={`w-10 h-12 rounded-full -ml-6 ${isStormy ? 'bg-slate-600' : 'bg-white'}`} />
              <div className={`w-14 h-9 rounded-full -ml-5 ${isStormy ? 'bg-slate-500' : 'bg-white'}`} />
            </div>
          </div>
          {/* Cloud 2 */}
          <div className={`absolute sky-cloud-drift-reverse ${isStormy ? 'sky-cloud-drift-fast' : ''}`} style={{ top: '35%' }}>
            <div className={`flex items-end ${isStormy ? 'opacity-80' : 'opacity-50'} scale-75`}>
              <div className={`w-12 h-6 rounded-full ${isStormy ? 'bg-slate-600' : 'bg-white'}`} />
              <div className={`w-8 h-10 rounded-full -ml-4 ${isStormy ? 'bg-slate-500' : 'bg-white'}`} />
              <div className={`w-10 h-7 rounded-full -ml-3 ${isStormy ? 'bg-slate-600' : 'bg-white'}`} />
            </div>
          </div>
          {/* Cloud 3 */}
          <div className={`absolute sky-cloud-drift ${isStormy ? 'sky-cloud-drift-fast' : ''}`} style={{ top: '55%', animationDelay: '5s' }}>
            <div className={`flex items-end ${isStormy ? 'opacity-85' : 'opacity-60'} scale-90`}>
              <div className={`w-14 h-7 rounded-full ${isStormy ? 'bg-slate-500' : 'bg-white'}`} />
              <div className={`w-9 h-11 rounded-full -ml-5 ${isStormy ? 'bg-slate-600' : 'bg-white'}`} />
              <div className={`w-12 h-8 rounded-full -ml-4 ${isStormy ? 'bg-slate-500' : 'bg-white'}`} />
            </div>
          </div>
        </>
      )}

      {/* Rain */}
      {(isRainy || isStormy) && (
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-[1.5px] h-4 bg-gradient-to-b from-transparent to-blue-200/60 sky-rain"
              style={{
                left: `${(i * 5) + Math.random() * 3}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${0.5 + Math.random() * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Lightning flash */}
      {isStormy && (
        <div className="absolute inset-0 sky-lightning" />
      )}

      {/* Ground / horizon line */}
      <div className={`absolute bottom-0 left-0 right-0 h-8 ${
        isNight 
          ? 'bg-gradient-to-t from-slate-900/80 to-transparent' 
          : 'bg-gradient-to-t from-black/5 to-transparent'
      }`} />

      {/* Decorative hills silhouette */}
      <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1200 80" preserveAspectRatio="none">
        <path 
          d="M0,80 C200,20 400,60 600,30 C800,0 1000,50 1200,20 L1200,80 Z" 
          className={isNight ? 'fill-slate-800/60' : 'fill-black/5'}
        />
      </svg>
    </div>
  );
}
