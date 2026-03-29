import React from 'react';

// 1. Calendar: Mini glowing grid representing a calendar schedule
export const CalendarHeaderShape = () => (
  <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/30 flex p-1.5 gap-1 flex-wrap backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]">
    {Array.from({ length: 9 }).map((_, i) => (
      <div 
        key={i} 
        className={`w-1.5 h-1.5 rounded-[2px] ${
          i === 4 ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 
          i < 3 ? 'bg-blue-400/80' : 'bg-blue-300/30'
        }`} 
      />
    ))}
  </div>
);

// 2. Assignments: Staggered stacked paper shapes
export const AssignmentHeaderShape = () => (
  <div className="relative w-10 h-10 perspective-1000">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-white rounded-lg border border-purple-200 shadow-md transform rotate-[-6deg] translate-x-[-2px] translate-y-1"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-indigo-50 rounded-lg border border-purple-300 shadow-sm transform rotate-[3deg] translate-x-1"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg border border-indigo-400 shadow-[0_4px_12px_rgba(79,70,229,0.3)] transform translate-y-[-2px] flex flex-col justify-center items-center gap-1">
      <div className="w-4 h-[2px] bg-white/60 rounded-full"></div>
      <div className="w-5 h-[2px] bg-white/80 rounded-full"></div>
      <div className="w-3 h-[2px] bg-white/40 rounded-full"></div>
    </div>
  </div>
);

// 3. Labs: A bubbling test tube / beaker
export const LabHeaderShape = () => (
  <div className="relative w-8 h-10 ml-1">
    {/* Beaker shape */}
    <div className="absolute bottom-0 w-8 h-8 bg-gradient-to-b from-purple-500/20 to-fuchsia-600/40 rounded-b-xl rounded-t-sm border border-fuchsia-400/50 backdrop-blur-sm overflow-hidden flex items-end">
        {/* Liquid level */}
        <div className="w-full h-5 bg-gradient-to-t from-fuchsia-600 to-purple-500 relative animate-pulse">
            {/* Bubbles */}
            <div className="absolute w-1 h-1 bg-white/60 rounded-full bottom-1 left-2 animate-bounce"></div>
            <div className="absolute w-1.5 h-1.5 bg-white/80 rounded-full bottom-2 right-2 animate-bounce" style={{ animationDelay: '200ms' }}></div>
        </div>
    </div>
    {/* Neck */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-4 border-l border-r border-fuchsia-400/50 bg-gradient-to-b from-transparent to-fuchsia-500/10"></div>
    {/* Lip */}
    <div className="absolute top-[-1px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-fuchsia-300 rounded-full"></div>
  </div>
);

// 4. Create Assignment: A glowing abstract Plus / Sparkle
export const CreateHeaderShape = () => (
  <div className="relative w-10 h-10 flex items-center justify-center">
    <div className="absolute w-full h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_10px_theme(colors.blue.500)] animate-pulse"></div>
    <div className="absolute h-full w-[3px] bg-gradient-to-b from-transparent via-blue-500 to-transparent shadow-[0_0_10px_theme(colors.blue.500)] animate-pulse" style={{ animationDelay: '300ms' }}></div>
    <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_15px_theme(colors.white)]"></div>
  </div>
);

// 5. Settings: Abstract interconnected gears/rings
export const SettingsHeaderShape = () => (
  <div className="relative w-10 h-10 flex items-center justify-center group">
    <div className="absolute w-7 h-7 border-2 border-slate-700/80 dark:border-slate-400/80 rounded-full flex items-center justify-center origin-center group-hover:animate-spin">
       <div className="w-3 h-3 border border-slate-500/50 rounded-full"></div>
    </div>
    <div className="absolute w-4 h-4 border-2 border-slate-500/60 dark:border-slate-500/80 rounded-full top-0 right-0 origin-bottom-left group-hover:animate-spin-reverse delay-100"></div>
    <div className="absolute w-2 h-2 bg-slate-400 rounded-full bottom-1 left-1"></div>
  </div>
);
