"use client";
import React, { useState, useEffect, useMemo } from 'react';

// --- STATIC BUILDING DEFINITIONS ---
const layer4Buildings = [
  { w: 'w-[8%]', h: 'h-[25%]' }, { w: 'w-[12%]', h: 'h-[35%]' }, { w: 'w-[6%]', h: 'h-[20%]' },
  { w: 'w-[10%]', h: 'h-[40%]' }, { w: 'w-[15%]', h: 'h-[28%]' }, { w: 'w-[8%]', h: 'h-[45%]' },
  { w: 'w-[12%]', h: 'h-[32%]' }, { w: 'w-[9%]', h: 'h-[38%]' }, { w: 'w-[10%]', h: 'h-[22%]' },
  { w: 'w-[10%]', h: 'h-[30%]' }
];

const layer3Buildings = [
  { w: 'w-[10%]', h: 'h-[30%]' }, { w: 'w-[7%]', h: 'h-[45%]' }, { w: 'w-[12%]', h: 'h-[35%]' },
  { w: 'w-[9%]', h: 'h-[50%]', shape: 'pointed' }, { w: 'w-[11%]', h: 'h-[40%]' }, 
  { w: 'w-[14%]', h: 'h-[25%]' }, { w: 'w-[8%]', h: 'h-[55%]' }, { w: 'w-[12%]', h: 'h-[42%]' },
  { w: 'w-[10%]', h: 'h-[36%]' }, { w: 'w-[7%]', h: 'h-[28%]' }
];

const layer2Buildings = [
  { w: 'w-[8%]', h: 'h-[35%]' }, { w: 'w-[10%]', h: 'h-[25%]' }, { w: 'w-[12%]', h: 'h-[55%]', hasAntenna: true },
  { w: 'w-[9%]', h: 'h-[42%]' }, { w: 'w-[14%]', h: 'h-[30%]' }, { w: 'w-[10%]', h: 'h-[65%]', shape: 'stepped' },
  { w: 'w-[11%]', h: 'h-[48%]' }, { w: 'w-[13%]', h: 'h-[38%]' }, { w: 'w-[8%]', h: 'h-[50%]' },
  { w: 'w-[5%]', h: 'h-[32%]' }
];

export const Cityscape = () => {
  const [mounted, setMounted] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 18 || hour < 6);
    setMounted(true);

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Auto-trigger if there's no scrolling happening or just a short delay
    const timer = setTimeout(() => setIsVisible(true), 800);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Adaptive palette
  const colors = isNight ? {
    layer4: '#3b4770', 
    layer3: '#232d56', 
    layer2: '#131b36', 
    layer1: '#080b14', 
    windowFront: '#fef1b6', 
    windowMid: '#aebde6', 
    redLight: '#ff4d4d'
  } : {
    layer4: '#cbd5e1', 
    layer3: '#94a3b8', 
    layer2: '#64748b', 
    layer1: '#475569', 
    windowFront: '#ffffff', 
    windowMid: '#f1f5f9', 
    redLight: '#ef4444'
  };

  const Windows = ({ count, density, type = 'dot', color = colors.windowFront }: any) => {
    // Generate window states
    const wins = useMemo(() => Array.from({ length: count }).map(() => ({
      isLit: Math.random() < density,
      isDash: type === 'dash' && Math.random() > 0.5
    })), [count, density, type]);

    // Apply different styling for day/night
    return (
      <div className="flex flex-wrap justify-center content-start w-full h-full p-1.5 gap-1.5 overflow-hidden">
        {wins.map((w, i) => {
          if (!w.isLit) return <div key={i} className={`h-1.5 ${w.isDash ? 'w-4' : 'w-1.5'}`} />;
          return (
            <div
              key={i}
              className={`h-1.5 rounded-[1px] ${w.isDash ? 'w-4' : 'w-1.5'} ${isNight ? '' : 'opacity-50'}`}
              style={isNight ? { backgroundColor: color, boxShadow: `0 0 4px ${color}80` } : { backgroundColor: '#e2e8f0' }}
            />
          );
        })}
      </div>
    );
  };

  const RedLight = ({ className }: any) => (
    <div className={`absolute w-1 h-1 rounded-full ${isNight ? 'animate-pulse' : ''} ${className}`} 
         style={{ backgroundColor: colors.redLight, boxShadow: isNight ? `0 0 6px ${colors.redLight}` : 'none' }} />
  );

  const StaticLayer = ({ zIndex, children, delay }: any) => {
    return (
      <div className="absolute bottom-0 left-0 w-full flex items-end justify-between"
           style={{ 
             height: '100%',
             zIndex, 
             transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
             opacity: isVisible ? 1 : 0,
             transition: `transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, opacity 1.2s ease-out ${delay}s`
           }}>
        {children}
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full pointer-events-none overflow-hidden" style={{ height: '60vh', zIndex: 0 }}>
      {/* Background Glow */}
      <div className={`absolute bottom-0 w-full h-[50vh] bg-gradient-to-t transition-colors duration-1000 ${isNight ? 'from-indigo-900/10' : 'from-slate-400/20'} to-transparent`} />

      <div className="relative w-full max-w-[1800px] mx-auto h-full flex items-end px-[2%] xl:px-0">
        
        {/* --- LAYER 4: FARTHEST BUILDINGS --- */}
        <StaticLayer zIndex={10} delay={0.1}>
          {layer4Buildings.map((b, i) => (
            <div key={`l4-${i}`} className={`${b.w} ${b.h}`} style={{ backgroundColor: colors.layer4 }} />
          ))}
        </StaticLayer>

        {/* --- LAYER 3: MID-BACK BUILDINGS --- */}
        <StaticLayer zIndex={20} delay={0.4}>
          {layer3Buildings.map((b, i) => (
            <div key={`l3-${i}`} className={`${b.w} ${b.h} relative flex flex-col justify-end items-center`} style={{ backgroundColor: b.shape !== 'pointed' ? colors.layer3 : 'transparent' }}>
               {b.shape === 'pointed' && (
                 <>
                   <div className="w-full h-[80%]" style={{ backgroundColor: colors.layer3 }} />
                   <div className="absolute top-0 w-full h-[20%]" style={{ backgroundColor: colors.layer3, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
                 </>
               )}
            </div>
          ))}
        </StaticLayer>

        {/* --- LAYER 2: MID-FRONT BUILDINGS --- */}
        <StaticLayer zIndex={30} delay={0.7}>
          {layer2Buildings.map((b, i) => (
            <div key={`l2-${i}`} className={`${b.w} ${b.h} relative flex flex-col justify-end items-center`} style={{ backgroundColor: b.shape !== 'stepped' ? colors.layer2 : 'transparent' }}>
              {b.hasAntenna && <div className="absolute -top-6 w-[2px] h-6" style={{ backgroundColor: isNight ? '#222' : '#94a3b8' }}><RedLight className="-top-1 -left-[1px]" /></div>}
              
              {b.shape === 'stepped' ? (
                <>
                  <div className="w-[40%] h-[10%] relative" style={{ backgroundColor: colors.layer2 }}>
                    {isNight && <RedLight className="-top-1 left-1/2 -translate-x-1/2" />}
                  </div>
                  <div className="w-[70%] h-[20%]" style={{ backgroundColor: colors.layer2 }} />
                  <div className="w-full h-[70%]" style={{ backgroundColor: colors.layer2 }}>
                    <Windows count={40} density={0.1} color={colors.windowMid} />
                  </div>
                </>
              ) : (
                 <Windows count={60} density={0.08} color={colors.windowMid} />
              )}
            </div>
          ))}
        </StaticLayer>

        {/* --- LAYER 1: FOREGROUND HERO BUILDINGS --- */}
        <StaticLayer zIndex={40} delay={1.0}>
          {/* Far Left Stepped */}
          <div className="w-[8%] h-[25%] flex flex-col items-center">
            <div className="w-[60%] h-[20%]" style={{ backgroundColor: colors.layer1 }} />
            <div className="w-full h-[80%] relative" style={{ backgroundColor: colors.layer1 }}><Windows count={15} density={0.3} type="dash" /></div>
          </div>

          {/* Short Flat */}
          <div className="w-[9%] h-[18%]" style={{ backgroundColor: colors.layer1 }}><Windows count={20} density={0.2} /></div>

          {/* Tall Pointed */}
          <div className="w-[10%] h-[45%] relative flex flex-col">
            <div className="w-full h-[15%]" style={{ backgroundColor: colors.layer1, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
            <div className="w-full h-[85%]" style={{ backgroundColor: colors.layer1 }}><Windows count={40} density={0.25} /></div>
          </div>

          {/* Gap Filler */}
          <div className="w-[6%] h-[28%]" style={{ backgroundColor: colors.layer1 }}><Windows count={12} density={0.4} type="dash" /></div>

          {/* Left Center Hero (Tall Stepped) */}
          <div className="w-[12%] h-[60%] relative flex flex-col items-center">
            <div className="absolute -top-8 w-[2px] h-8" style={{ backgroundColor: isNight ? '#111' : '#64748b' }}><RedLight className="-top-1 -left-[1px]" /></div>
            <div className="w-[30%] h-[8%]" style={{ backgroundColor: colors.layer1 }} />
            <div className="w-[60%] h-[12%]" style={{ backgroundColor: colors.layer1 }} />
            <div className="w-full h-[80%]" style={{ backgroundColor: colors.layer1 }}><Windows count={80} density={0.2} /></div>
          </div>

          {/* Mid Right Flat Dash Windows */}
          <div className="w-[15%] h-[35%]" style={{ backgroundColor: colors.layer1 }}><Windows count={40} density={0.3} type="dash" /></div>

          {/* Right Center Hero (Tallest, Double Antenna) */}
          <div className="w-[14%] h-[70%] relative flex flex-col items-center">
            <div className="absolute -top-12 left-[30%] w-[2px] h-12" style={{ backgroundColor: isNight ? '#111' : '#64748b' }}><RedLight className="-top-1 -left-[1px]" /></div>
            <div className="absolute -top-16 right-[30%] w-[2px] h-16" style={{ backgroundColor: isNight ? '#111' : '#64748b' }}><RedLight className="-top-1 -left-[1px]" /></div>
            <div className="w-[40%] h-[5%]" style={{ backgroundColor: colors.layer1 }} />
            <div className="w-[70%] h-[15%]" style={{ backgroundColor: colors.layer1 }} />
            <div className="w-full h-[80%]" style={{ backgroundColor: colors.layer1 }}><Windows count={90} density={0.25} type="dash" /></div>
          </div>

          {/* Medium Flat */}
          <div className="w-[11%] h-[40%]" style={{ backgroundColor: colors.layer1 }}><Windows count={30} density={0.2} /></div>

          {/* Right Stepped */}
          <div className="w-[9%] h-[30%] flex flex-col items-end">
            <div className="w-[50%] h-[20%]" style={{ backgroundColor: colors.layer1 }} />
            <div className="w-[80%] h-[30%]" style={{ backgroundColor: colors.layer1 }} />
            <div className="w-full h-[50%]" style={{ backgroundColor: colors.layer1 }}><Windows count={15} density={0.3} /></div>
          </div>

          {/* Far Right Short */}
          <div className="w-[6%] h-[22%]" style={{ backgroundColor: colors.layer1 }}><Windows count={20} density={0.25} type="dash" /></div>
        </StaticLayer>
        
        {/* Solid ground to tether everything to the bottom pixel */}
        <div className="absolute bottom-0 w-[100vw] left-[50%] -translate-x-1/2 h-1 z-50 transition-colors duration-1000" style={{ backgroundColor: colors.layer1 }} />
      </div>
    </div>
  );
};
