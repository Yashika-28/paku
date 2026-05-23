"use client";
import React, { useState, useEffect } from 'react';
import {
  FileText, Clock, FlaskConical, BarChart3, Cloud, Sun,
  BookOpen, Quote, ChevronDown, ChevronUp,
  GraduationCap, Calendar as CalendarIcon, RefreshCw,
  MapPin, CloudRain, Wind, CloudFog, CloudLightning, Moon, Star,
  AlertCircle, StickyNote, CheckCircle, Plus, Users, Bell, Link as LinkIcon, Upload, X, Loader2
} from 'lucide-react';

// Import the Google Context (Same as your CalendarPage)
import { useGoogle } from '@/context/GoogleContext';
import SkyBanner from '@/components/SkyBanner';
import { Cityscape } from '@/components/Cityscape';
import { useTimeTheme } from '@/hooks/useTimeTheme';

// --- UI Components ---
const Card = ({ children, className = "", onClick, theme }: any) => (
  <div
    onClick={onClick}
    className={`relative ${theme?.cardBg || 'bg-white/15 dark:bg-slate-900/60'} backdrop-blur-2xl rounded-[2.5rem] border ${theme?.cardBorder || 'border-white/30 dark:border-white/10'} shadow-[0_12px_40px_rgba(0,0,0,0.2)] transition-all duration-500 hover:shadow-[0_24px_60px_rgba(0,0,0,0.3)] hover:-translate-y-2 overflow-hidden z-10 ${className}`}
  >
    {/* Opaque Corner Accents - Premium Glassmorphism */}
    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, white 0%, transparent 25%), radial-gradient(circle at 100% 0%, white 0%, transparent 25%), radial-gradient(circle at 0% 100%, white 0%, transparent 25%), radial-gradient(circle at 100% 100%, white 0%, transparent 25%)' }} />
    
    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/20 dark:from-white/10 to-transparent rounded-[2.5rem] pointer-events-none" />
    <div className="relative z-10 w-full h-full">{children}</div>
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, disabled = false }: any) => {
  const baseStyle = "flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-lg shadow-gray-200 dark:shadow-slate-900",
    outline: "border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700",
    ghost: "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700",
    danger: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${styles[variant as keyof typeof styles]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const ChatbotQuote = ({ quote, author, theme }: { quote: string, author: string, theme: any }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [quote]);

  useEffect(() => {
    if (index < quote.length) {
      const timer = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, 35);
      return () => clearTimeout(timer);
    }
  }, [index, quote.length]);

  const displayedText = quote.substring(0, index);
  const isTyping = index < quote.length;

  return (
    <div translate="no" spellCheck="false" data-gramm="false">
      <p className={`text-lg font-medium italic leading-relaxed ${theme.isDark ? 'text-indigo-50' : 'text-slate-800'}`}>
        &quot;{displayedText}&quot;
        {isTyping && <span className={`animate-pulse inline-block w-1.5 h-4 ml-1 ${theme.isDark ? 'bg-indigo-200' : 'bg-slate-400'} align-middle`}></span>}
      </p>

      <div className={`mt-3 transition-opacity duration-1000 ${!isTyping ? 'opacity-100' : 'opacity-0'}`}>
        <p className={`text-sm font-bold opacity-60 uppercase tracking-widest ${theme.isDark ? 'text-indigo-200' : 'text-slate-600'}`}>
          — {author}
        </p>
      </div>
    </div>
  );
};

// --- New Widgets ---

const AgendaAndTasks = ({ theme, calendarEvents, isConnected, loading }: any) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'tasks'>('agenda');

  const [todos, setTodos] = useState([
    { id: 1, text: "Grade Python midterms", done: false },
    { id: 2, text: "Email TAs about lab setup", done: true },
    { id: 3, text: "Finalize guest speaker", done: false }
  ]);
  const [newTask, setNewTask] = useState("");

  const addTask = (e: any) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTask, done: false }]);
    setNewTask("");
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((t: any) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const isDark = theme?.isDark;
  const textColor = theme?.textColor || 'text-slate-800';
  const cardBorder = theme?.cardBorder || 'border-gray-100';

  return (
    <Card theme={theme} className="p-0 animate-slide-in-right delay-300 overflow-hidden flex flex-col h-[380px]">
      {/* Tab Header - fixed */}
      <div className={`flex border-b ${cardBorder} ${isDark ? 'bg-slate-800/60' : 'bg-white/40'} backdrop-blur-md flex-shrink-0`}>
        <button 
          onClick={() => setActiveTab('agenda')} 
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'agenda' 
              ? `${theme?.titleColor} border-b-2 bg-white/60 dark:bg-slate-700/80 shadow-inner` 
              : `${theme?.titleColor} opacity-70 hover:opacity-100 hover:bg-white/30 dark:hover:bg-slate-700/40`
          }`}
        >
          <CalendarIcon size={16} /> Agenda
          <span className={`text-[10px] ml-1 px-2 py-0.5 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'} shadow-sm`}>{calendarEvents.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('tasks')} 
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'tasks' 
              ? `${theme?.titleColor} border-b-2 bg-white/60 dark:bg-slate-700/80 shadow-inner` 
              : `${theme?.titleColor} opacity-70 hover:opacity-100 hover:bg-white/30 dark:hover:bg-slate-700/40`
          }`}
        >
          <CheckCircle size={16} /> Tasks
          <span className={`text-[10px] ml-1 px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'} shadow-sm`}>{todos.filter((t: any) => !t.done).length}</span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'agenda' ? (
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <div className="space-y-3">
            {!isConnected ? (
              <div className="text-center py-8 flex flex-col items-center gap-2 text-gray-400 dark:text-slate-500">
                <CloudRain size={32} className="opacity-50" />
                <span className="text-sm">Calendar not connected</span>
              </div>
            ) : loading ? (
              <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-gray-300 dark:text-slate-600" /></div>
            ) : calendarEvents.length > 0 ? (
              calendarEvents.map((ev: any) => (
                <div key={ev.id} className="group flex gap-3 items-start p-3 rounded-xl border border-gray-100 dark:border-slate-700/50 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer" onClick={() => window.open(ev.link, '_blank')}>
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${ev.urgent ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${ev.urgent ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-slate-200'} truncate`}>{ev.title}</p>
                    <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mt-0.5 flex items-center gap-1"><Clock size={10} /> {ev.time} • {ev.type}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 dark:text-slate-500 flex flex-col items-center">
                <Sun size={32} className="mb-3 text-amber-400 opacity-60" />
                <p className="font-medium text-gray-600 dark:text-slate-400">Clear Schedule</p>
                <p className="text-xs mt-1">No events scheduled for today.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Scrollable task list */}
          <div className="flex-1 overflow-y-auto p-5 pb-2 scrollbar-visible">
            <div className="space-y-2">
              {todos.map((todo: any) => (
                <div key={todo.id} onClick={() => toggleTodo(todo.id)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${todo.done ? 'opacity-60 bg-transparent border-transparent' : 'bg-white dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm'}`}>
                  <div className={`w-5 h-5 rounded-md flex-shrink-0 border-2 flex items-center justify-center transition-all ${todo.done ? 'bg-indigo-500 border-indigo-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]' : 'bg-gradient-to-b from-gray-50 to-gray-200 dark:from-slate-700 dark:to-slate-800 border-gray-300 dark:border-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),_0_2px_4px_rgba(0,0,0,0.1)]'}`}>
                    {todo.done && <CheckCircle size={12} className="text-white drop-shadow-sm" />}
                  </div>
                  <p className={`text-sm font-medium transition-all ${todo.done ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-700 dark:text-slate-200'}`}>
                    {todo.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pinned add-task form at bottom */}
          <form onSubmit={addTask} className="relative px-5 py-3 border-t border-gray-100 dark:border-slate-700/50 flex-shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add new task..."
              className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl pl-4 pr-11 py-3 text-sm outline-none border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner text-gray-800 dark:text-white placeholder:text-gray-400"
            />
            <button type="submit" className="absolute right-7 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white shadow-sm active:scale-95 transition-all">
              <Plus size={16} />
            </button>
          </form>
        </div>
      )}
    </Card>
  );
};

const DeadlinesList = ({ theme }: { theme: any }) => {
  const [deadlines, setDeadlines] = useState<any[]>([]);

  useEffect(() => {
    const now = Date.now();
    setDeadlines([
      { id: 1, title: 'Midterm Grades', date: new Date(now + 2 * 86400000), color: 'emerald' },
      { id: 2, title: 'Faculty Meeting', date: new Date(now + 5 * 86400000), color: 'amber' },
      { id: 3, title: 'Draft Proposals', date: new Date(now + 12 * 86400000), color: 'indigo' }
    ]);
  }, []);

  if (!deadlines.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {deadlines.map((dl, i) => {
        const daysLeft = Math.ceil((dl.date.getTime() - Date.now()) / 86400000);
        return (
          <Card theme={theme} key={dl.id} className={`p-5 !border-t-4 animate-slide-in-up`} style={{ borderTopColor: dl.color === 'emerald' ? '#10b981' : dl.color === 'amber' ? '#f59e0b' : '#6366f1', animationDelay: `${i * 100}ms` }}>
            <p className={`text-xs uppercase font-extrabold ${theme.isDark ? 'text-slate-400' : 'text-gray-500'} mb-1 tracking-wider`}>{dl.title}</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold tracking-tighter tabular-nums drop-shadow-sm" style={{ color: dl.color === 'emerald' ? '#10b981' : dl.color === 'amber' ? '#f59e0b' : '#818cf8' }}>{daysLeft}</span>
              <span className={`text-sm font-bold opacity-70 mb-1.5 uppercase ${theme.textColor}`}>Days</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-[11px] font-bold ${theme.isDark ? 'text-slate-500' : 'text-gray-400'} uppercase tracking-widest`}>{dl.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <div className={`h-1.5 flex-1 mx-3 ${theme.isDark ? 'bg-slate-700' : 'bg-gray-200'} shadow-inner rounded-full overflow-hidden`}>
                <div className="h-full rounded-full shadow-[inset_0_1px_rgba(255,255,255,0.4)]" style={{ backgroundColor: dl.color === 'emerald' ? '#10b981' : dl.color === 'amber' ? '#f59e0b' : '#6366f1', width: `${Math.max(5, 100 - (daysLeft * 5))}%` }} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// --- API & Logic Hooks ---

// 2. Google Calendar Integration Hook
const useCalendarAgenda = () => {
  const { config } = useGoogle();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTodayEvents = async () => {
    if (!config.accessToken || !window.gapi) return;
    setLoading(true);

    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const response = await window.gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': startOfDay.toISOString(),
        'timeMax': endOfDay.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'orderBy': 'startTime'
      });

      const googleEvents = response.result.items;

      const formattedEvents = googleEvents.map((ev: any) => {
        const start = ev.start.dateTime || ev.start.date;
        const dateObj = new Date(start);
        const timeStr = dateObj.toTimeString().substring(0, 5);
        const isUrgent = ev.summary?.toLowerCase().includes('urgent') || ev.summary?.toLowerCase().includes('deadline');

        return {
          id: ev.id,
          title: ev.summary || '(No Title)',
          time: timeStr.includes('00:00:00') ? 'All Day' : timeStr,
          type: ev.eventType || 'event',
          urgent: isUrgent,
          link: ev.htmlLink
        };
      });
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Agenda Sync Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.accessToken) {
      fetchTodayEvents();
    }
  }, [config.accessToken]);

  return { events, loading, refresh: fetchTodayEvents, isConnected: !!config.accessToken };
};

// 3. Location Hook
const useLocation = () => {
  const [location, setLocation] = useState({ lat: 28.61, long: 77.20, city: "New Delhi" });
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const cityRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const cityData = await cityRes.json();
          setLocation({ lat: latitude, long: longitude, city: cityData.city || cityData.locality || "Your Location" });
        } catch (e) { setLocation({ lat: latitude, long: longitude, city: "Unknown Location" }); }
      });
    }
  }, []);
  return location;
};

// 4. Weather Hook
const useWeather = (lat: number, long: number) => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true&temperature_unit=celsius`)
      .then(res => res.json()).then(data => { setWeather(data.current_weather); setLoading(false); })
      .catch(err => setLoading(false));
  }, [lat, long]);
  return { weather, loading };
};

// 5. News Hook
const useNews = (category: string) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    let rssUrl = "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en";
    if (category === 'Science') rssUrl = "https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en";

    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok' && data.items) setNews(data.items.slice(0, 5));
        else throw new Error("No data");
        setLoading(false);
      })
      .catch(() => {
        setNews([
          { title: "New AI Chip Architecture Revealed by Tech Giants", source: "TechCrunch", pubDate: new Date().toISOString(), link: "#" },
          { title: "The Future of Quantum Computing in 2025", source: "Wired", pubDate: new Date().toISOString(), link: "#" }
        ]);
        setLoading(false);
      });
  }, [category]);
  return { news, loading };
};

// 6. Quotes Hook
const useQuote = () => {
  const [quote, setQuote] = useState<any>(null);
  useEffect(() => {
    fetch('https://dummyjson.com/quotes/random').then(res => res.json()).then(data => setQuote(data));
  }, []);
  return quote;
};

// --- Mock Data ---
const CLASSES = [
  { id: 1, name: 'Operating Systems', subject: '3rd Year CSE', students: 54, nextClass: '10:30 AM', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { id: 2, name: 'Programming in Python', subject: '2nd Year', students: 60, nextClass: '01:00 PM', color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  { id: 3, name: 'DBMS', subject: '3rd Year', students: 48, nextClass: '08:00 AM', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' }
];

const NEWS_CATEGORIES = ["Technology", "AI", "Science", "Education"];

const INDIAN_STUDENTS = [
  { id: 1, name: "Aarav Sharma", id_num: "2024CS01", initial: "AS" },
  { id: 2, name: "Ananya Iyer", id_num: "2024CS02", initial: "AI" },
  { id: 3, name: "Ishaan Gupta", id_num: "2024CS03", initial: "IG" },
  { id: 4, name: "Diya Malhotra", id_num: "2024CS04", initial: "DM" },
  { id: 5, name: "Vikram Sethi", id_num: "2024CS05", initial: "VS" },
  { id: 6, name: "Saanvi Reddy", id_num: "2024CS06", initial: "SR" },
  { id: 7, name: "Arjun Mehra", id_num: "2024CS07", initial: "AM" },
  { id: 8, name: "Kavya Nair", id_num: "2024CS08", initial: "KN" },
  { id: 9, name: "Rohan Deshmukh", id_num: "2024CS09", initial: "RD" },
  { id: 10, name: "Myra Saxena", id_num: "2024CS10", initial: "MS" },
  { id: 11, name: "Kabir Singh", id_num: "2024CS11", initial: "KS" },
  { id: 12, name: "Zara Khan", id_num: "2024CS12", initial: "ZK" },
  { id: 13, name: "Devansh Patel", id_num: "2024CS13", initial: "DP" },
  { id: 14, name: "Isha Joshi", id_num: "2024CS14", initial: "IJ" },
  { id: 15, name: "Reyansh Kapoor", id_num: "2024CS15", initial: "RK" },
  { id: 16, name: "Priya Menon", id_num: "2024CS16", initial: "PM" },
  { id: 17, name: "Dhruv Chaudhary", id_num: "2024CS17", initial: "DC" },
  { id: 18, name: "Aditi Rao", id_num: "2024CS18", initial: "AR" },
  { id: 19, name: "Vihaan Agarwal", id_num: "2024CS19", initial: "VA" },
  { id: 20, name: "Siya Verma", id_num: "2024CS20", initial: "SV" },
  { id: 21, name: "Aryan Bose", id_num: "2024CS21", initial: "AB" },
  { id: 22, name: "Meera Bhat", id_num: "2024CS22", initial: "MB" },
  { id: 23, name: "Krishnan Ram", id_num: "2024CS23", initial: "KR" },
  { id: 24, name: "Tara Singh", id_num: "2024CS24", initial: "TS" },
  { id: 25, name: "Yash Trivedi", id_num: "2024CS25", initial: "YT" }
];

// Isolated News Widget to prevent full page re-renders when switching categories
const LatestUpdatesWidget = ({ theme }: { theme: any }) => {
  const [activeCategory, setActiveCategory] = useState("Technology");
  const { news, loading: newsLoading } = useNews(activeCategory);

  return (
    <Card theme={theme} className="p-5 animate-slide-in-right delay-400">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h3 className={`font-bold ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>Latest Updates</h3>
          <RefreshCw size={14} className={`text-gray-400 dark:text-slate-500 cursor-pointer ${newsLoading ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {NEWS_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {newsLoading ? (
          <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-xs">Fetching updates...</div>
        ) : (
          news.map((item, idx) => (
            <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
              <h4 className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-slate-700'} group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug mb-1 line-clamp-2`}>{item.title}</h4>
              <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-slate-500"><span>{item.source}</span><span>{new Date(item.pubDate).toLocaleDateString()}</span></div>
              {idx < news.length - 1 && <div className={`h-px ${theme.isDark ? 'bg-slate-700' : 'bg-gray-100'} mt-3`} />}
            </a>
          ))
        )}
      </div>
    </Card>
  );
};

export default function Dashboard() {
  const theme = useTimeTheme();
  const { pageBg, prevPageBg, isTransitioning, titleColor, textColor, isDark } = theme;
  const location = useLocation();
  const { weather, loading: weatherLoading } = useWeather(location.lat, location.long);

  const quote = useQuote();
  const { events: calendarEvents, loading: calendarLoading, isConnected } = useCalendarAgenda();

  const [expandedClass, setExpandedClass] = useState<number | null>(null);
  const [note, setNote] = useState("");

  // Time-dependent state to avoid hydration mismatch
  const [greeting, setGreeting] = useState("");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    setFormattedDate(
      new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    );
  }, []);

  // Assignment Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedClassForAssignment, setSelectedClassForAssignment] = useState<any>(null);
  const [driveLinkLoading, setDriveLinkLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    deadline: "",
    description: "",
    target: "all" // 'all' or 'selected'
  });

  // Students Modal States
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<any>(null);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun size={32} className="text-amber-500" />;
    return <Cloud size={32} className="text-slate-500 dark:text-slate-400" />;
  };

  const handleOpenAssignment = (cls: any) => {
    setSelectedClassForAssignment(cls);
    setShowModal(true);
    setGeneratedLink(null);
    setAssignmentData({ title: "", deadline: "", description: "", target: "all" });
  };

  const handleGenerateDriveLink = () => {
    if (!assignmentData.title) return alert("Please enter a title first.");
    setDriveLinkLoading(true);
    // Simulate API Call
    setTimeout(() => {
      const sanitizedTitle = assignmentData.title.replace(/\s+/g, '-').toLowerCase();
      setGeneratedLink(`https://drive.google.com/drive/folders/assignment-${sanitizedTitle}-${Date.now()}`);
      setDriveLinkLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      {/* ── Background Cross-fade Layers ── */}
      {/* Bottom Layer: The new/current gradient */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{ background: pageBg }}
      />
      
      {/* Top Layer: The old gradient that fades out when we transition */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-[3000ms] ease-in-out ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: prevPageBg }}
      />

      {/* --- Hero: Celestial layer (sun / moon / clouds / stars) on transparent sky --- */}
      <div className="relative">
        {/* SkyBanner renders only its celestial elements; the page bg IS the sky */}
        <SkyBanner weatherCode={weather?.weathercode ?? 0} transparent />

        {/* Greeting overlaid on sky */}
        <div className="absolute bottom-0 left-0 right-0 pb-4">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                <h1 className={`text-4xl font-extrabold tracking-tight mb-2 ${titleColor} drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]`}>
                  {greeting ? `${greeting}, Professor.` : '\u00A0'}
                </h1>
                <p className={`font-medium flex items-center gap-2 ${isDark ? 'text-white/80' : 'text-slate-700/80'} drop-shadow-sm`}>
                  <CalendarIcon size={16} />
                  {formattedDate || '\u00A0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Cityscape sits directly on the gradient sky --- */}
      <Cityscape />
      <div className="max-w-7xl mx-auto px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* --- Left Column (Main Content) --- */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quote Widget */}
            <Card theme={theme} className="animate-fade-in-up delay-100 backdrop-blur-md rounded-2xl p-6 shadow-xl border min-h-[160px] flex flex-col justify-center">
              <Quote className={`${isDark ? 'text-white' : 'text-slate-800'} opacity-30 mb-2`} size={24} />
              {quote ? (
                <ChatbotQuote theme={theme} quote={quote.quote} author={quote.author} />
              ) : (
                <div className="flex items-center gap-3 text-indigo-400/60 text-sm mt-2 font-medium">
                  <Loader2 size={16} className="animate-spin" /> Gathering an inspiring thought...
                </div>
              )}
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Card 1: Rescheduling Alert */}
              <Card theme={theme} className="p-5 border-l-4 border-l-red-400 bg-red-50/50 dark:bg-red-900/20 animate-fade-in-up delay-200 pulse-attention">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-red-500 dark:text-red-400 text-xs font-bold uppercase tracking-wider">Attention Needed</p>
                    <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-800'} mt-1 animate-count-up`}>4</h2>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1 leading-tight`}>Classes to be rescheduled</p>
                  </div>
                  <div className={`p-2 ${isDark ? 'bg-slate-700 text-red-400' : 'bg-white text-red-500'} rounded-xl shadow-sm`}><AlertCircle size={20} /></div>
                </div>
              </Card>

              {/* Card 2: Quick Note */}
              <Card theme={theme} className="p-4 relative group animate-fade-in-up delay-300">
                <div className="flex justify-between items-start mb-2">
                  <p className={`text-xs font-bold uppercase flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}><StickyNote size={12} /> Quick Note</p>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Type a reminder here..."
                  className={`w-full bg-transparent resize-none outline-none ${isDark ? 'text-slate-200' : 'text-gray-700'} text-sm font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500 h-[60px]`}
                />
              </Card>

              {/* Card 3: Lab Manuals */}
              <Card theme={theme} className="p-5 border-l-4 border-l-emerald-500 animate-fade-in-up delay-400">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Grading Update</p>
                    <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-800'} mt-1 animate-count-up delay-200`}>100%</h2>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1 leading-tight`}>Lab manuals assessed</p>
                  </div>
                  <div className={`p-2 ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} rounded-xl`}><CheckCircle size={20} /></div>
                </div>
              </Card>
            </div>

            {/* Upcoming Deadlines */}
            <div className="space-y-4 animate-fade-in-up delay-400 mb-8">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${textColor} transition-colors duration-500`}>
                <Clock size={20} className="opacity-70" /> Upcoming Deadlines
              </h3>
              <DeadlinesList theme={theme} />
            </div>

            {/* Classes Section */}
            <div className="space-y-4 animate-fade-in-up delay-500">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${textColor} transition-colors duration-500`}>
                <BookOpen size={20} className="opacity-70" /> Course Management
              </h3>
              <div className="space-y-3">
                {CLASSES.map((cls, idx) => (
                  <div key={cls.id} className={`group animate-slide-in-left`} style={{ animationDelay: `${600 + idx * 100}ms` }}>
                    <Card theme={theme} className={`overflow-hidden transition-all duration-300 ${expandedClass === cls.id ? 'ring-2 ring-blue-500 shadow-xl z-10 relative' : ''}`}>
                      {/* Header of Card */}
                      <div onClick={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)} className={`p-5 flex items-center justify-between cursor-pointer ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50/50'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cls.color}`}><GraduationCap size={24} /></div>
                          <div>
                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'} text-lg`}>{cls.name}</h4>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{cls.subject} • {cls.students} Students</p>
                          </div>
                        </div>
                        {expandedClass === cls.id ? <ChevronUp className="text-gray-400 dark:text-slate-500" /> : <ChevronDown className="text-gray-400 dark:text-slate-500" />}
                      </div>

                      {/* Expanded Content */}
                      {expandedClass === cls.id && (
                        <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                          <hr className="border-gray-100 dark:border-slate-700 mb-4" />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Button onClick={() => handleOpenAssignment(cls)} variant="outline" className="bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50" icon={Plus}>
                              Create Assignment
                            </Button>
                            <Button onClick={() => { setSelectedClassForStudents(cls); setShowStudentsModal(true); }} variant="outline" icon={Users}>
                              View Students
                            </Button>
                            <Button variant="outline" icon={Bell}>
                              Set Reminders
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- Right Column (Widgets) --- */}
          <div className="space-y-6">

            {/* Weather Widget */}
            <Card theme={theme} className="p-6 relative overflow-hidden text-gray-800 dark:text-slate-200 animate-slide-in-right delay-200">
              {weatherLoading ? (
                <div className="flex items-center justify-center py-6 text-gray-400 dark:text-slate-500 gap-2"><RefreshCw className="animate-spin" /> Loading Weather...</div>
              ) : weather ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-white/60' : 'text-slate-600/60'}`}>
                      <MapPin size={14} /> {location.city}
                    </div>
                    <div className={`${isDark ? 'bg-amber-900/30' : 'bg-amber-100'} p-2 rounded-full`}>{getWeatherIcon(weather.weathercode)}</div>
                  </div>

                  <div className="flex items-end gap-3">
                    <span className={`text-5xl font-extrabold tracking-tighter animate-fade-in-scale delay-400 ${isDark ? 'text-white' : 'text-slate-900'}`}>{Math.round(weather.temperature)}°</span>
                    <div className="mb-1">
                      <span className={`text-lg font-medium opacity-70 ${isDark ? 'text-white' : 'text-slate-900'}`}>C</span>
                      <p className={`text-xs mt-0.5 animate-fade-in-up delay-500 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {weather.weathercode <= 1 ? 'Clear Sky' : weather.weathercode <= 3 ? 'Partly Cloudy' : weather.weathercode <= 50 ? 'Overcast' : weather.weathercode <= 65 ? 'Rainy' : 'Stormy'}
                      </p>
                    </div>
                  </div>

                  <div className={`grid grid-cols-2 gap-3 mt-1 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                    <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <Wind size={14} className="text-blue-400" /> {weather.windspeed} km/h
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <CloudFog size={14} className="text-slate-400" /> Humidity High
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <Sun size={14} className="text-amber-400" /> Feels {Math.round(weather.temperature + (weather.windspeed > 10 ? -2 : 1))}°C
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <Clock size={14} className="text-indigo-400" /> {weather.is_day ? 'Daytime' : 'Nighttime'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 text-gray-400 dark:text-slate-500 gap-2">Weather unavailable</div>
              )}
            </Card>

            {/* Agenda & Tasks Widget */}
            <div className="animate-slide-in-right delay-300">
              <AgendaAndTasks theme={theme} calendarEvents={calendarEvents} isConnected={isConnected} loading={calendarLoading} />
            </div>

            {/* News Widget */}
            <LatestUpdatesWidget theme={theme} />

          </div>
        </div>
      </div>

      {/* --- Assignment Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          {/* Modal Content */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">New Assignment</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">{selectedClassForAssignment?.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 uppercase mb-1">Assignment Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-2 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g. Lab Report 3: Arrays"
                  value={assignmentData.title}
                  onChange={e => setAssignmentData({ ...assignmentData, title: e.target.value })}
                />
              </div>

              {/* Deadline & Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 uppercase mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-2 text-sm text-gray-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={assignmentData.deadline}
                    onChange={e => setAssignmentData({ ...assignmentData, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 uppercase mb-1">Assign To</label>
                  <select
                    className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-2 text-sm text-gray-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={assignmentData.target}
                    onChange={e => setAssignmentData({ ...assignmentData, target: e.target.value })}
                  >
                    <option value="all">All Students</option>
                    <option value="selected">Selected Students</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-2 text-sm text-gray-800 dark:text-white h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Instructions for students..."
                  value={assignmentData.description}
                  onChange={e => setAssignmentData({ ...assignmentData, description: e.target.value })}
                />
              </div>

              {/* File Upload Dummy */}
              <div className="border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                <Upload size={24} className="mb-2" />
                <span className="text-xs">Click to upload resource file</span>
              </div>

              {/* Drive Integration Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">Submission Folder</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Auto-create Google Drive folder</p>
                    </div>
                  </div>

                  {!generatedLink ? (
                    <button
                      onClick={handleGenerateDriveLink}
                      disabled={driveLinkLoading}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {driveLinkLoading ? <Loader2 className="animate-spin" size={12} /> : <LinkIcon size={12} />}
                      Generate Link
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> Created</span>
                  )}
                </div>

                {generatedLink && (
                  <div className="mt-3 bg-white dark:bg-slate-700 p-2 rounded border border-blue-100 dark:border-slate-600 flex items-center gap-2 overflow-hidden">
                    <LinkIcon size={14} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
                    <a href={generatedLink} target="_blank" className="text-xs text-blue-600 dark:text-blue-400 truncate underline">{generatedLink}</a>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-slate-700 flex gap-3 justify-end bg-gray-50 dark:bg-slate-900">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={() => setShowModal(false)}>Assign Task</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- Students List Modal --- */}
      {showStudentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowStudentsModal(false)} />
          
          <Card theme={theme} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] p-0 animate-scale-in">
            <div className={`p-6 border-b ${theme.cardBorder} flex justify-between items-center ${isDark ? 'bg-slate-800/40' : 'bg-gray-50'}`}>
              <div>
                <h2 className={`text-xl font-bold ${titleColor}`}>Students Roll</h2>
                <p className={`text-xs font-medium opacity-60 ${textColor}`}>Total 54 enrolled students</p>
              </div>
              <button 
                onClick={() => setShowStudentsModal(false)} 
                className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} className={textColor} />
              </button>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto scrollbar-thin">
              {INDIAN_STUDENTS.map((student, idx) => (
                <div 
                  key={student.id} 
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all hover:translate-x-1 ${
                    isDark ? 'hover:bg-slate-800/50 border-white/5' : 'hover:bg-blue-50/50 border-gray-100'
                  } border`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                      idx % 3 === 0 ? 'bg-blue-100 text-blue-600' : idx % 3 === 1 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {student.initial}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{student.name}</p>
                      <p className={`text-[10px] uppercase tracking-wider font-bold opacity-50 ${textColor}`}>{student.id_num}</p>
                    </div>
                  </div>
                  <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-500'
                  }`}>
                    Enrolled
                  </div>
                </div>
              ))}

              <div className={`mt-4 pt-4 border-t ${theme.cardBorder} text-center`}>
                <p className={`text-[10px] uppercase font-bold opacity-40 ${textColor} tracking-widest`}>Showing all enrolled students</p>
              </div>
            </div>

            <div className={`p-4 ${isDark ? 'bg-slate-900' : 'bg-white'} border-t ${theme.cardBorder}`}>
              <Button onClick={() => setShowStudentsModal(false)} className="w-full py-4 text-xs font-bold uppercase tracking-widest shadow-lg">Close Register</Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}