import { useState, useEffect } from 'react';

export const useTimeTheme = () => {
  const [themeClass, setThemeClass] = useState("bg-gray-50 dark:bg-slate-950");
  const [textColor, setTextColor] = useState("text-gray-900 dark:text-white");

  useEffect(() => {
    const updateTheme = () => {
      const now = new Date();
      const timeInHours = now.getHours() + now.getMinutes() / 60;
      
      // Toggle global Tailwind dark mode based on time of day
      const isNight = timeInHours >= 20 || timeInHours < 5;
      if (isNight) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }

      if (timeInHours >= 5 && timeInHours < 12) {
        setThemeClass("bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-300 via-amber-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950");
        setTextColor("text-orange-950 dark:text-orange-200");
      } else if (timeInHours >= 12 && timeInHours < 17) {
        setThemeClass("bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 via-blue-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950");
        setTextColor("text-blue-950 dark:text-blue-200");
      } else if (timeInHours >= 17 && timeInHours < 20) {
        setThemeClass("bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-400 via-purple-200 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950");
        setTextColor("text-indigo-950 dark:text-indigo-200");
      } else {
        setThemeClass("bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950");
        setTextColor("text-white dark:text-slate-200"); 
      }
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  return { themeClass, textColor };
};
