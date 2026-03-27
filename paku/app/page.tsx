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

// --- UI Components ---
const Card = ({ children, className = "", onClick }: any) => (
  <div onClick={onClick} className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
    {children}
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

// --- API & Logic Hooks ---

// 1. Dynamic Background Hook
const useTimeTheme = () => {
  const [themeClass, setThemeClass] = useState("bg-gray-50 dark:bg-slate-950");
  const [textColor, setTextColor] = useState("text-gray-900 dark:text-white");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setThemeClass("bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-300 via-amber-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950");
      setTextColor("text-orange-950 dark:text-orange-200");
    } else if (hour >= 12 && hour < 17) {
      setThemeClass("bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 via-blue-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950");
      setTextColor("text-blue-950 dark:text-blue-200");
    } else if (hour >= 17 && hour < 20) {
      setThemeClass("bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-400 via-purple-200 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950");
      setTextColor("text-indigo-950 dark:text-indigo-200");
    } else {
      setThemeClass("bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950");
      setTextColor("text-white dark:text-slate-200"); 
    }
  }, []);

  return { themeClass, textColor };
};

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
    if(category === 'Science') rssUrl = "https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en";
    
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

export default function Dashboard() {
  const { themeClass, textColor } = useTimeTheme();
  const location = useLocation();
  const { weather, loading: weatherLoading } = useWeather(location.lat, location.long);
  const [activeCategory, setActiveCategory] = useState("Technology");
  const { news, loading: newsLoading } = useNews(activeCategory);
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
      if(!assignmentData.title) return alert("Please enter a title first.");
      setDriveLinkLoading(true);
      // Simulate API Call
      setTimeout(() => {
          const sanitizedTitle = assignmentData.title.replace(/\s+/g, '-').toLowerCase();
          setGeneratedLink(`https://drive.google.com/drive/folders/assignment-${sanitizedTitle}-${Date.now()}`);
          setDriveLinkLoading(false);
      }, 1500);
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ease-in-out font-sans text-gray-800 dark:text-slate-200 ${themeClass}`}>
      
      {/* --- Hero: Full-bleed Sky Background + Greeting Overlay --- */}
      <div className="relative">
        {/* Sky Banner — fills full width, taller for natural blending */}
        <SkyBanner weatherCode={weather?.weathercode ?? 0} />
        
        {/* Large gradient fade: sky blends into page background */}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-white/40 dark:via-slate-950/40 to-transparent" />
        
        {/* Greeting overlaid on sky */}
        <div className="absolute bottom-0 left-0 right-0 pb-4">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 transition-colors duration-500 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                  {greeting ? `${greeting}, Professor.` : '\u00A0'}
                </h1>
                <p className="font-medium flex items-center gap-2 text-white/80 drop-shadow-md">
                  <CalendarIcon size={16} />
                  {formattedDate || '\u00A0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content (padded, max-width) --- */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left Column (Main Content) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quote Widget */}
          {quote && (
            <div className="bg-gradient-to-br from-gray-900/90 to-slate-800/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-md rounded-2xl p-6 text-white shadow-xl shadow-gray-900/10 dark:shadow-black/20 border border-white/10 dark:border-slate-700/30">
              <Quote className="opacity-30 mb-2" size={24} />
              <p className="text-lg font-medium italic leading-relaxed text-indigo-50">&quot;{quote.quote}&quot;</p>
              <p className="mt-3 text-sm font-bold opacity-60 uppercase tracking-widest text-indigo-200">— {quote.author}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Rescheduling Alert */}
            <Card className="p-5 border-l-4 border-l-red-400 bg-red-50/50 dark:bg-red-900/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-500 dark:text-red-400 text-xs font-bold uppercase tracking-wider">Attention Needed</p>
                  <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">4</h2>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mt-1 leading-tight">Classes to be rescheduled</p>
                </div>
                <div className="p-2 bg-white dark:bg-slate-700 rounded-xl text-red-500 dark:text-red-400 shadow-sm"><AlertCircle size={20} /></div>
              </div>
            </Card>

            {/* Card 2: Quick Note */}
            <Card className="p-4 relative group">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase flex items-center gap-1"><StickyNote size={12}/> Quick Note</p>
                </div>
                <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Type a reminder here..."
                    className="w-full bg-transparent resize-none outline-none text-gray-700 dark:text-slate-200 text-sm font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500 h-[60px]"
                />
            </Card>

            {/* Card 3: Lab Manuals */}
            <Card className="p-5 border-l-4 border-l-emerald-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Grading Update</p>
                  <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">100%</h2>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mt-1 leading-tight">Lab manuals assessed</p>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400"><CheckCircle size={20} /></div>
              </div>
            </Card>
          </div>

          {/* Classes Section */}
          <div className="space-y-4">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${textColor} transition-colors duration-500`}>
              <BookOpen size={20} className="opacity-70" /> Course Management
            </h3>
            <div className="space-y-3">
              {CLASSES.map((cls) => (
                <div key={cls.id} className="group">
                    <Card className={`overflow-hidden transition-all duration-300 ${expandedClass === cls.id ? 'ring-2 ring-blue-500 shadow-xl z-10 relative' : ''}`}>
                    {/* Header of Card */}
                    <div onClick={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-700/50">
                        <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cls.color}`}><GraduationCap size={24} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white text-lg">{cls.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{cls.subject} • {cls.students} Students</p>
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
                                <Button variant="outline" icon={Users}>
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
          <Card className="p-6 relative overflow-hidden text-gray-800 dark:text-slate-200">
             {weatherLoading ? (
                 <div className="flex items-center justify-center py-6 text-gray-400 dark:text-slate-500 gap-2"><RefreshCw className="animate-spin" /> Loading Weather...</div>
             ) : weather ? (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm font-semibold opacity-60">
                            <MapPin size={14} /> {location.city}
                        </div>
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">{getWeatherIcon(weather.weathercode)}</div>
                    </div>
                    
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-extrabold tracking-tighter">{Math.round(weather.temperature)}°</span>
                        <div className="mb-1">
                            <span className="text-lg font-medium opacity-70">C</span>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                              {weather.weathercode <= 1 ? 'Clear Sky' : weather.weathercode <= 3 ? 'Partly Cloudy' : weather.weathercode <= 50 ? 'Overcast' : weather.weathercode <= 65 ? 'Rainy' : 'Stormy'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-1 pt-4 border-t border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                            <Wind size={14} className="text-blue-400" /> {weather.windspeed} km/h
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                            <CloudFog size={14} className="text-slate-400" /> Humidity High
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                            <Sun size={14} className="text-amber-400" /> Feels {Math.round(weather.temperature + (weather.windspeed > 10 ? -2 : 1))}°C
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                            <Clock size={14} className="text-indigo-400" /> {weather.is_day ? 'Daytime' : 'Nighttime'}
                        </div>
                    </div>

                    {/* Wind direction visual */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-500">Wind Dir</span>
                        <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{ width: `${Math.min(100, (weather.windspeed / 30) * 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">{weather.winddirection}°</span>
                    </div>
                </div>
             ) : (
                <div className="flex items-center justify-center py-6 text-gray-400 dark:text-slate-500 gap-2">Weather unavailable</div>
             )}
          </Card>

          {/* Calendar Agenda Widget */}
          <Card className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><CalendarIcon size={18} className="text-blue-500" /> Today&apos;s Agenda</h3>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">{calendarEvents.length} Events</span>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {!isConnected ? (
                     <div className="text-center py-8 flex flex-col items-center gap-2 text-gray-400 dark:text-slate-500">
                         <CloudRain size={32} className="opacity-50" />
                         <span className="text-xs">Calendar not connected</span>
                     </div>
                ) : calendarLoading ? (
                    <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-gray-300 dark:text-slate-600" /></div>
                ) : calendarEvents.length > 0 ? (
                    calendarEvents.map(ev => (
                        <div key={ev.id} className="group flex gap-3 items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => window.open(ev.link, '_blank')}>
                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${ev.urgent ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-blue-400'}`}></div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${ev.urgent ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-slate-200'} truncate`}>{ev.title}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">{ev.time} • {ev.type}</p>
                        </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-xs">
                         <Sun size={24} className="mx-auto mb-2 text-amber-400 opacity-50"/>
                         No events scheduled for today.
                    </div>
                )}
            </div>
          </Card>

          {/* News Widget */}
          <Card className="p-5">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 dark:text-white">Latest Updates</h3>
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
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug mb-1 line-clamp-2">{item.title}</h4>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-slate-500"><span>{item.source}</span><span>{new Date(item.pubDate).toLocaleDateString()}</span></div>
                    {idx < news.length - 1 && <div className="h-px bg-gray-50 dark:bg-slate-700 mt-3" />}
                  </a>
                ))
              )}
            </div>
          </Card>

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
                    <button onClick={() => setShowModal(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"><X size={20}/></button>
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
                            onChange={e => setAssignmentData({...assignmentData, title: e.target.value})}
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
                                onChange={e => setAssignmentData({...assignmentData, deadline: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 uppercase mb-1">Assign To</label>
                            <select 
                                className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-2 text-sm text-gray-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={assignmentData.target}
                                onChange={e => setAssignmentData({...assignmentData, target: e.target.value})}
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
                            onChange={e => setAssignmentData({...assignmentData, description: e.target.value})}
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
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" className="w-5 h-5"/>
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
                                    {driveLinkLoading ? <Loader2 className="animate-spin" size={12}/> : <LinkIcon size={12}/>}
                                    Generate Link
                                </button>
                            ) : (
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle size={12}/> Created</span>
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

    </div>
  );
}