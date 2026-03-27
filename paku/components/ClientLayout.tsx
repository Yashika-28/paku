"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { X, LayoutDashboard, Mail, User } from 'lucide-react';
import { Button } from './ui/BaseComponents';
import { useGoogle } from '@/context/GoogleContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { config } = useGoogle();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto dark mode based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    const isDark = hour >= 18 || hour < 6;
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  return (
    <div className="min-h-screen flex dark:bg-slate-950 transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-400 transition-colors">
               {isSidebarOpen ? <X size={20}/> : <LayoutDashboard size={20}/>}
             </button>
             <h2 className="text-xl font-semibold text-gray-800 dark:text-white capitalize transition-colors">EduAssist</h2>
          </div>
          <div className="flex items-center gap-3">
             {config.accessToken && <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded transition-colors">System Online</div>}
             <Button variant="ghost" icon={Mail} className="hidden md:flex dark:text-slate-300 dark:hover:bg-slate-700">Support</Button>
             <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 border-2 border-white dark:border-slate-700 shadow-sm">
               <User size={16} />
             </div>
          </div>
        </header>
        {/* No padding/max-width here — let pages control their own layout */}
        <div className="min-h-[calc(100vh-5rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}