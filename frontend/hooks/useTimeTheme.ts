import { useState, useEffect, useRef } from 'react';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface ThemeTokens {
  pageBg: string;
  textColor: string;
  titleColor: string;
  cardBg: string; // Background for standard tiles
  cardBorder: string;
  accentColor: string;
  isDark: boolean;
}

const THEMES: Record<TimeOfDay, ThemeTokens> = {
  morning: {
    pageBg: 'linear-gradient(to bottom, #9a3412 0%, #c2410c 8%, #ea580c 18%, #f59e0b 32%, #fde68a 48%, #fffbeb 65%, #fefce8 100%)',
    textColor: 'text-orange-950',
    titleColor: 'text-orange-900',
    cardBg: 'bg-orange-50/60',
    cardBorder: 'border-orange-200/50',
    accentColor: 'text-orange-600',
    isDark: false,
  },
  afternoon: {
    pageBg: 'linear-gradient(to bottom, #075985 0%, #0369a1 10%, #0ea5e9 25%, #7dd3fc 42%, #e0f2fe 60%, #f0f9ff 80%, #ffffff 100%)',
    textColor: 'text-blue-950',
    titleColor: 'text-blue-900',
    cardBg: 'bg-white/70',
    cardBorder: 'border-blue-100/50',
    accentColor: 'text-blue-600',
    isDark: false,
  },
  evening: {
    pageBg: 'linear-gradient(to bottom, #312e81 0%, #4338ca 12%, #6d28d9 25%, #9333ea 40%, #db2777 55%, #f472b6 70%, #fb923c 85%, #fde68a 100%)',
    textColor: 'text-indigo-950',
    titleColor: 'text-white',
    cardBg: 'bg-indigo-950/40',
    cardBorder: 'border-white/20',
    accentColor: 'text-pink-300',
    isDark: true,
  },
  night: {
    pageBg: 'linear-gradient(to bottom, #020617 0%, #0f172a 15%, #1e1b4b 35%, #1e3a8a 55%, #0f172a 75%, #020617 100%)',
    textColor: 'text-slate-200',
    titleColor: 'text-white',
    cardBg: 'bg-slate-900/70',
    cardBorder: 'border-white/10',
    accentColor: 'text-blue-400',
    isDark: true,
  }
};

export const useTimeTheme = () => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('afternoon');
  const [theme, setTheme] = useState<ThemeTokens>(THEMES.afternoon);
  const [prevPageBg, setPrevPageBg] = useState(THEMES.afternoon.pageBg);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastBgRef = useRef(THEMES.afternoon.pageBg);

  useEffect(() => {
    const updateTheme = () => {
      const now = new Date();
      const h = now.getHours() + now.getMinutes() / 60;

      let nextTime: TimeOfDay = 'afternoon';
      if (h >= 5 && h < 12) nextTime = 'morning';
      else if (h >= 12 && h < 17) nextTime = 'afternoon';
      else if (h >= 17 && h < 20) nextTime = 'evening';
      else nextTime = 'night';

      const nextTheme = THEMES[nextTime];
      
      // Sync document class for Tailwind dark mode
      document.documentElement.classList.toggle('dark', nextTheme.isDark);

      if (nextTheme.pageBg !== lastBgRef.current) {
        setPrevPageBg(lastBgRef.current);
        setTheme(nextTheme);
        setTimeOfDay(nextTime);
        setIsTransitioning(true);
        lastBgRef.current = nextTheme.pageBg;

        // Reset transitioning flag after CSS transition duration (3s)
        setTimeout(() => setIsTransitioning(false), 3100);
      }
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  return { 
    ...theme,
    timeOfDay,
    prevPageBg,
    isTransitioning 
  };
};
