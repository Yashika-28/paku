"use client";
import React, { useState, useEffect, useRef } from 'react';

interface SkyBannerProps {
  weatherCode?: number;
  transparent?: boolean;
}

export default function SkyBanner({ weatherCode = 0, transparent = false }: SkyBannerProps) {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('afternoon');
  const [mounted, setMounted] = useState(false);
  const [timeInHours, setTimeInHours] = useState(12);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const time = hours + minutes / 60;
      setTimeInHours(time);

      if (time >= 5 && time < 12) setTimeOfDay('morning');
      else if (time >= 12 && time < 17) setTimeOfDay('afternoon');
      else if (time >= 17 && time < 20) setTimeOfDay('evening');
      else setTimeOfDay('night');
      setMounted(true);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    if (!bannerRef.current) return;
    const handleScroll = () => {
      if (bannerRef.current) {
        const scrollY = window.scrollY;
        bannerRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-60 md:h-72 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-sky-400 to-blue-500 shimmer" />
      </div>
    );
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

  // Calculate dynamic celestial positions
  // Sun is visible mostly between 5:00 and 20:00 (15 hours)
  const isSunVisible = timeInHours >= 5 && timeInHours <= 20;
  let sunProgress = 0;
  if (isSunVisible) {
    sunProgress = (timeInHours - 5) / 15;
  }
  const sunLeft = `${5 + sunProgress * 90}%`;
  const sunBottom = `${Math.sin(sunProgress * Math.PI) * 50 + 5}%`; // Arc up to 55% height

  // Moon is visible from 18:00 to 7:00 (13 hours)
  const isMoonVisible = timeInHours >= 18 || timeInHours <= 7;
  let moonProgress = 0;
  if (timeInHours >= 18) {
    moonProgress = (timeInHours - 18) / 13;
  } else if (timeInHours <= 7) {
    moonProgress = (timeInHours + 6) / 13;
  }
  const moonLeft = `${5 + moonProgress * 90}%`;
  const moonBottom = `${Math.sin(moonProgress * Math.PI) * 45 + 15}%`; // Arc up to 60% height

  return (
    <div className="relative w-full h-60 md:h-72 overflow-hidden">
      {/* 
        This is the shared parallax layer. 
        If not transparent, it provides the sky gradient background.
        If transparent, it's just a container for celestial items.
      */}
      <div 
        ref={bannerRef} 
        className={`absolute inset-0 w-full h-[130%] transition-all duration-[2000ms] ease-in-out sky-parallax ${!transparent ? `bg-gradient-to-r ${skyGradients[timeOfDay]}` : ''}`}
      >
        {!transparent && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
        )}

        {/* Atmospheric haze layer — hidden when parent page IS the sky */}
        {!transparent && (
          <div
            className="absolute inset-0 opacity-30 transition-all duration-1000"
            style={{
              background: timeOfDay === 'morning'
                ? 'radial-gradient(ellipse at 20% 80%, rgba(251,191,36,0.3) 0%, transparent 60%)'
                : timeOfDay === 'evening'
                ? 'radial-gradient(ellipse at 80% 80%, rgba(251,146,60,0.4) 0%, transparent 60%)'
                : timeOfDay === 'night'
                ? 'radial-gradient(ellipse at 70% 30%, rgba(99,102,241,0.15) 0%, transparent 60%)'
                : 'radial-gradient(ellipse at 50% 20%, rgba(56,189,248,0.2) 0%, transparent 60%)',
            }}
          />
        )}

        {/* Horizon glow — hidden when parent page IS the sky */}
        {!transparent && (timeOfDay === 'morning' || timeOfDay === 'evening') && (
          <>
            <div className={`absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-orange-200/50 to-transparent transition-opacity duration-[2000ms] ${timeOfDay === 'morning' || timeOfDay === 'evening' ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-orange-300/30 to-transparent transition-opacity duration-[2000ms] ${timeOfDay === 'morning' || timeOfDay === 'evening' ? 'opacity-100' : 'opacity-0'}`} />
          </>
        )}

        {/* Sun — with dynamic exact positioning */}
        {isSunVisible && (
          <div className="sky-sun absolute transition-all duration-1000 ease-linear" style={{ left: sunLeft, bottom: sunBottom, transform: 'translateX(-50%)' }}>
            <div className="relative">
              {/* Outer atmospheric glow */}
              <div className="absolute inset-[-32px] rounded-full bg-yellow-200/10 sky-pulse-delayed" />
              {/* Mid glow ring */}
              <div className="absolute inset-[-16px] rounded-full bg-yellow-300/15 sky-pulse" />
              {/* Inner glow ring */}
              <div className="absolute inset-[-8px] rounded-full bg-yellow-300/25 sky-pulse" style={{ animationDelay: '0.5s' }} />
              {/* Core sun with rich gradient */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-400 shadow-[0_0_60px_rgba(251,191,36,0.6),0_0_120px_rgba(251,191,36,0.3),0_0_200px_rgba(251,191,36,0.1)]" />
              {/* Sun highlight */}
              <div className="absolute top-1 left-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/30 blur-sm" />
            </div>
          </div>
        )}

        {/* Moon — with ambient glow and dynamic exact positioning */}
        {isMoonVisible && (
          <div className="absolute transition-all duration-1000 ease-linear sky-float" style={{ left: moonLeft, bottom: moonBottom, transform: 'translateX(-50%)', width: 'clamp(3rem, 6vw, 5rem)', height: 'clamp(3rem, 6vw, 5rem)' }}>
            <div className="relative w-full h-full">
              {/* Moon glow */}
              <div className="absolute inset-[-20px] rounded-full bg-slate-200/10 sky-pulse" />
              <div className="absolute inset-[-10px] rounded-full bg-slate-200/15 sky-pulse-delayed" />
              {/* Moon body */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-50 to-slate-200 shadow-[0_0_40px_rgba(203,213,225,0.4),0_0_80px_rgba(203,213,225,0.2)]" />
              {/* Craters */}
              <div className="absolute top-[18%] left-[28%] w-[18%] h-[18%] rounded-full bg-slate-300/50" />
              <div className="absolute top-[50%] left-[14%] w-[14%] h-[14%] rounded-full bg-slate-300/35" />
              <div className="absolute bottom-[18%] right-[18%] w-[16%] h-[16%] rounded-full bg-slate-300/45" />
              {/* Subtle surface texture */}
              <div className="absolute top-[35%] right-[25%] w-[10%] h-[10%] rounded-full bg-slate-400/20" />
            </div>
          </div>
        )}

        {/* Stars (night only) — more stars with varied sizes */}
        {isNight && (
          <>
            {/* Large twinkling stars */}
            <div className="absolute top-4 left-[10%] w-1.5 h-1.5 rounded-full bg-white sky-twinkle" />
            <div className="absolute top-3 left-[40%] w-1.5 h-1.5 rounded-full bg-white sky-twinkle" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-6 left-[70%] w-1.5 h-1.5 rounded-full bg-white/90 sky-twinkle" style={{ animationDelay: '1.2s' }} />
            <div className="absolute top-14 left-[78%] w-1 h-1 rounded-full bg-white sky-twinkle" style={{ animationDelay: '0.8s' }} />
            <div className="absolute top-16 left-[15%] w-1 h-1 rounded-full bg-white/80 sky-twinkle" style={{ animationDelay: '2s' }} />

            {/* Small delayed twinkle stars */}
            <div className="absolute top-8 left-[25%] w-1 h-1 rounded-full bg-white/80 sky-twinkle-delayed" />
            <div className="absolute top-12 left-[55%] w-1 h-1 rounded-full bg-white/70 sky-twinkle-delayed" />
            <div className="absolute top-2 left-[85%] w-1 h-1 rounded-full bg-white/60 sky-twinkle-delayed" style={{ animationDelay: '0.3s' }} />
            <div className="absolute top-5 left-[60%] w-0.5 h-0.5 rounded-full bg-white/70 sky-twinkle-delayed" style={{ animationDelay: '1.8s' }} />
            <div className="absolute top-10 left-[48%] w-0.5 h-0.5 rounded-full bg-white/50 sky-twinkle-delayed" style={{ animationDelay: '1.5s' }} />

            {/* Extra faint background stars */}
            <div className="absolute top-20 left-[5%] w-0.5 h-0.5 rounded-full bg-white/40 sky-twinkle" style={{ animationDelay: '2.5s' }} />
            <div className="absolute top-18 left-[33%] w-0.5 h-0.5 rounded-full bg-white/30 sky-twinkle-delayed" style={{ animationDelay: '3s' }} />
            <div className="absolute top-22 left-[68%] w-0.5 h-0.5 rounded-full bg-white/40 sky-twinkle" style={{ animationDelay: '1.7s' }} />
            <div className="absolute top-24 left-[90%] w-0.5 h-0.5 rounded-full bg-white/35 sky-twinkle-delayed" style={{ animationDelay: '2.2s' }} />

            {/* Star cross sparkle */}
            <div className="absolute top-8 left-[35%]">
              <div className="relative w-3 h-3">
                <div className="absolute inset-0 sky-sparkle">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-white/80" />
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-white/80" />
                </div>
              </div>
            </div>

            {/* Second sparkle */}
            <div className="absolute top-14 left-[52%]">
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 sky-sparkle" style={{ animationDelay: '2.5s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-white/60" />
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-white/60" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Clouds — with improved organic shapes */}
        {(showClouds || timeOfDay === 'afternoon') && (
          <>
            {/* Cloud 1 — large foreground */}
            <div className={`absolute sky-cloud-drift ${isStormy ? 'sky-cloud-drift-fast' : ''}`} style={{ top: '12%' }}>
              <div className={`flex items-end ${isStormy ? 'opacity-90' : 'opacity-70'}`}>
                <div className={`w-16 h-8 rounded-full ${isStormy ? 'bg-slate-500' : 'bg-white'} blur-[0.5px]`} />
                <div className={`w-12 h-14 rounded-full -ml-7 ${isStormy ? 'bg-slate-600' : 'bg-white'} blur-[0.5px]`} />
                <div className={`w-14 h-10 rounded-full -ml-6 ${isStormy ? 'bg-slate-500' : 'bg-white'} blur-[0.5px]`} />
                <div className={`w-8 h-6 rounded-full -ml-4 ${isStormy ? 'bg-slate-500' : 'bg-white'} blur-[0.5px]`} />
              </div>
            </div>
            {/* Cloud 2 — mid-layer, reversed direction */}
            <div className={`absolute sky-cloud-drift-reverse ${isStormy ? 'sky-cloud-drift-fast' : ''}`} style={{ top: '32%' }}>
              <div className={`flex items-end ${isStormy ? 'opacity-80' : 'opacity-45'} scale-75`}>
                <div className={`w-12 h-6 rounded-full ${isStormy ? 'bg-slate-600' : 'bg-white/90'} blur-[1px]`} />
                <div className={`w-10 h-12 rounded-full -ml-5 ${isStormy ? 'bg-slate-500' : 'bg-white/90'} blur-[1px]`} />
                <div className={`w-10 h-8 rounded-full -ml-4 ${isStormy ? 'bg-slate-600' : 'bg-white/90'} blur-[1px]`} />
              </div>
            </div>
            {/* Cloud 3 — back layer, slower */}
            <div className={`absolute sky-cloud-drift ${isStormy ? 'sky-cloud-drift-fast' : ''}`} style={{ top: '50%', animationDelay: '8s', animationDuration: '50s' }}>
              <div className={`flex items-end ${isStormy ? 'opacity-75' : 'opacity-35'} scale-[0.6]`}>
                <div className={`w-14 h-7 rounded-full ${isStormy ? 'bg-slate-500' : 'bg-white/80'} blur-[1.5px]`} />
                <div className={`w-11 h-13 rounded-full -ml-6 ${isStormy ? 'bg-slate-600' : 'bg-white/80'} blur-[1.5px]`} />
                <div className={`w-12 h-9 rounded-full -ml-5 ${isStormy ? 'bg-slate-500' : 'bg-white/80'} blur-[1.5px]`} />
              </div>
            </div>
          </>
        )}

        {/* Rain — with better distribution and wind angle */}
        {(isRainy || isStormy) && (
          <div className="absolute inset-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-blue-200/40 to-blue-300/60 sky-rain"
                style={{
                  left: `${(i * 3.3) + Math.random() * 2}%`,
                  height: `${12 + Math.random() * 10}px`,
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${0.5 + Math.random() * 0.3}s`,
                  transform: `rotate(${isStormy ? 15 : 5}deg)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Lightning flash */}
        {isStormy && (
          <div className="absolute inset-0 sky-lightning pointer-events-none" />
        )}
      </div>

      {/* Ground and horizon line — hidden when parent page IS the sky */}
      {!transparent && (
        <>
          <div className={`absolute bottom-0 left-0 right-0 h-10 ${
            isNight 
              ? 'bg-gradient-to-t from-slate-900/80 to-transparent' 
              : 'bg-gradient-to-t from-black/5 to-transparent'
          }`} />

          {/* Decorative hills silhouette — with two layers for depth */}
          <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1200 80" preserveAspectRatio="none">
            <path 
              d="M0,80 C150,50 350,70 500,40 C650,10 850,55 1000,25 C1100,10 1150,40 1200,30 L1200,80 Z" 
              className={isNight ? 'fill-slate-800/40' : 'fill-black/[0.03]'}
            />
            <path 
              d="M0,80 C200,20 400,60 600,30 C800,0 1000,50 1200,20 L1200,80 Z" 
              className={isNight ? 'fill-slate-800/60' : 'fill-black/5'}
            />
          </svg>
        </>
      )}
    </div>
  );
}
