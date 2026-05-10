import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Plus,
  Search,
  Bell,
  Settings,
  HelpCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Rocket,
  Leaf,
  Palette,
  X
} from 'lucide-react';
import Logo from '../images/Logo.png';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SchedulePage = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.username || user?.email || 'User';
  const displayEmail = user?.email || 'No email available';
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch schedule data from Django backend
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await api.get('/applications/schedule/');
        
        const formattedData = (response.data || []).map(item => ({
          id: item.id,
          title: item.event_name,
          date: new Date(item.start_date),
          endDate: new Date(item.end_date),
          time: `${formatTime(item.start_date)} - ${formatTime(item.end_date)}`,
          location: item.location,
          status: item.status === 'approved' ? 'confirmed' : item.status,
          type: item.event_type?.toLowerCase() || 'other',
          description: item.description || '',
          registered: Math.floor(Math.random() * 900) + 100,
          original: item
        }));
        
        setScheduleItems(formattedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
        setError('Failed to load schedule. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '12:00 PM';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTypeColors = (type) => {
    const t = type?.toLowerCase();
    if (t === 'conference') return { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', icon: Rocket };
    if (t === 'festival') return { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', icon: Palette };
    if (t === 'workshop') return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', icon: Leaf };
    if (t === 'seminar') return { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', icon: CalendarIcon };
    return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: CalendarIcon };
  };

  // Calendar logic
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return scheduleItems.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForWeek = (weekDays) => {
    return scheduleItems.filter(item => {
      const itemDate = new Date(item.date);
      return weekDays.some(day => day.toDateString() === itemDate.toDateString());
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Get next upcoming event
  const nextEvent = scheduleItems
    .filter(item => new Date(item.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const daysUntilNext = nextEvent ? Math.ceil((new Date(nextEvent.date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  // Stats
  const totalEvents = scheduleItems.length;
  const confirmedEvents = scheduleItems.filter(item => item.status === 'confirmed').length;
  const pendingEvents = scheduleItems.filter(item => item.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-bold mb-2">⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-20">
        <div className="p-8 flex items-center gap-3">
          <img src={Logo} alt="OSAS" className="w-8 h-8 object-contain" />
          <span className="font-black text-xl tracking-tight">OSAS</span>
        </div>
        <nav className="flex-1 px-4 space-y-1.5">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => onNavigate('dashboard')} />
          <SidebarLink icon={<FileText size={20} />} label="My Applications" onClick={() => onNavigate('applications')} />
          <SidebarLink icon={<Calendar size={20} />} label="Schedule" active onClick={() => onNavigate('schedule')} />
          <div className="pt-6">
            <button onClick={() => onNavigate('submit-application')} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-bold transition-all shadow-xl shadow-blue-100 active:scale-[0.98]">
              <Plus size={20} strokeWidth={3} /> Submit New Application
            </button>
          </div>
        </nav>
        <div className="p-4 space-y-1 border-t border-slate-50">
          <SidebarLink icon={<Settings size={20} />} label="Settings" />
          <SidebarLink icon={<HelpCircle size={20} />} label="Help" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Event Schedule</h1>
              <p className="text-slate-500 mt-1">Managing {confirmedEvents} approved events this month</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Find an event..." className="pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64" />
              </div>
              <div className="relative">
                <Bell className="text-slate-400 cursor-pointer hover:text-slate-600" size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 rounded-xl" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                  <img src="https://ui-avatars.com/api/?name=User&background=f8fafc&color=0f172a&bold=true" alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
                  <ChevronDown size={16} className="text-slate-400" />
                </div>
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-lg z-50">
                    <div className="p-4 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">Signed in as</p>
                      <p className="text-xs text-slate-500">{displayEmail}</p>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { setShowProfileDropdown(false); onLogout(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
              {['Month', 'Week', 'Day'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode.toLowerCase())}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    viewMode === mode.toLowerCase()
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
                <button 
                  onClick={() => viewMode === 'month' ? navigateMonth(-1) : viewMode === 'week' ? navigateWeek(-1) : navigateDay(-1)} 
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <button onClick={goToToday} className="px-3 py-1 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  Today
                </button>
                <span className="font-bold text-slate-900 min-w-[140px] text-center">
                  {viewMode === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                  {viewMode === 'week' && (() => {
                    const weekDays = getWeekDays(currentDate);
                    const start = weekDays[0];
                    const end = weekDays[6];
                    return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
                  })()}
                  {viewMode === 'day' && `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
                </span>
                <button 
                  onClick={() => viewMode === 'month' ? navigateMonth(1) : viewMode === 'week' ? navigateWeek(1) : navigateDay(1)} 
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} className="text-slate-600" />
                </button>
              </div>

              {nextEvent && viewMode !== 'day' && (
                <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-bold text-blue-900">
                    Next: {nextEvent.title} in {daysUntilNext} {daysUntilNext === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Conditional View Rendering */}
      {viewMode === 'month' && (
        <div className="flex gap-6 items-start">
          <div className="flex-1">
            <MonthView
              currentDate={currentDate}
              scheduleItems={scheduleItems}
              getDaysInMonth={getDaysInMonth}
              getEventsForDate={getEventsForDate}
              getTypeColors={getTypeColors}
              weekDays={weekDays}
              setSelectedDate={setSelectedDate}
              setViewMode={setViewMode}
              setSelectedEvent={setSelectedEvent}
            />
          </div>

          <div className="w-[360px] shrink-0">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-5 sticky top-6">
              <h3 className="font-black text-slate-900 text-lg">Event Details</h3>
              <p className="text-xs text-slate-500 mt-1">Click an event in the calendar</p>

              {!selectedEvent ? (
                <div className="mt-6 bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
                  No event selected.
                </div>
              ) : (
                <div className="mt-6 bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <p className="font-bold text-slate-900 text-sm">{selectedEvent.title}</p>

                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-slate-400" />
                      <span className="font-bold">Date:</span>
                      <span>{formatDate(selectedEvent.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" />
                      <span className="font-bold">Time:</span>
                      <span>{selectedEvent.time || 'TBD'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="font-bold">Location:</span>
                      <span>{selectedEvent.location || 'TBD'}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileText size={16} className="text-slate-400 mt-0.5" />
                      <span className="font-bold">Description:</span>
                    </div>
                    <p className="text-slate-700 text-sm">{selectedEvent.description || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {viewMode === 'week' && (
          <WeekView 
            currentDate={currentDate}
            scheduleItems={scheduleItems}
            getWeekDays={getWeekDays}
            getEventsForDate={getEventsForDate}
            getTypeColors={getTypeColors}
            setSelectedDate={setSelectedDate}
            setViewMode={setViewMode}
          />
        )}

        {viewMode === 'day' && (
          <DayView 
            currentDate={currentDate}
            scheduleItems={scheduleItems}
            getEventsForDate={getEventsForDate}
            getTypeColors={getTypeColors}
            formatDate={formatDate}
          />
        )}

        {/* Quick Stats - Only show in Month and Week view */}
        {viewMode !== 'day' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <StatsCard title="Total Events" value={totalEvents.toString()} icon={<CalendarIcon className="text-blue-600" size={24} />} bgColor="bg-blue-50" />
            <StatsCard title="Confirmed" value={confirmedEvents.toString()} icon={<CheckCircle2 className="text-green-600" size={24} />} bgColor="bg-green-50" />
            <StatsCard title="Pending" value={pendingEvents.toString()} icon={<Clock className="text-orange-600" size={24} />} bgColor="bg-orange-50" />
          </div>
        )}
      </main>
    </div>
  );
};

// Month View Component
const MonthView = ({ currentDate, scheduleItems, getDaysInMonth, getEventsForDate, getTypeColors, weekDays, setSelectedDate, setViewMode, setSelectedEvent }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm p-8 mb-8">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {getDaysInMonth(currentDate).map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isToday = date && date.toDateString() === new Date().toDateString();
          const dayNumber = date?.getDate();

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 rounded-2xl border transition-all ${
                date
                  ? 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md cursor-pointer'
                  : 'bg-slate-50/50 border-transparent'
              } ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
              onClick={() => date && setSelectedDate(date)}
            >
              {date && (
                <>
                  <div className={`text-sm font-bold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                    {dayNumber}
                    {isToday && <div className="text-[8px] uppercase tracking-wider text-blue-600 font-black">Today</div>}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event, idx) => {
                      const colors = getTypeColors(event.type);
                      return (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent?.(event);
                            setSelectedDate?.(date);
                            setViewMode?.('month');
                          }}
                          className={`text-[9px] font-bold px-1.5 py-1 rounded-md ${colors.bg} ${colors.text} truncate cursor-pointer hover:opacity-95`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedEvent?.(event);
                              setSelectedDate?.(date);
                            }
                          }}
                          title={`${event.title}${event.time ? ` • ${event.time}` : ''}`}
                        >
                          <div className="truncate">{event.title}</div>
                          {event.time && (
                            <div className="text-[8px] font-black text-slate-700/70 truncate">
                              {event.time}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-medium pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Week View Component
const WeekView = ({ currentDate, scheduleItems, getWeekDays, getEventsForDate, getTypeColors, setSelectedDate, setViewMode }) => {
  const weekDays = getWeekDays(currentDate);
  const weekEvents = scheduleItems.filter(item => {
    const itemDate = new Date(item.date);
    return weekDays.some(day => day.toDateString() === itemDate.toDateString());
  });

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm p-8 mb-8">
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={index} className={`text-center p-3 rounded-xl ${isToday ? 'bg-blue-50 border-2 border-blue-200' : ''}`}>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
              </div>
              <div className={`text-2xl font-black ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Events Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, dayIndex) => {
          const dayEvents = getEventsForDate(day);
          return (
            <div key={dayIndex} className="min-h-[300px] p-2 bg-slate-50/30 rounded-xl border border-slate-100">
              {dayEvents.length === 0 ? (
                <div className="text-center text-slate-400 text-xs mt-8">No events</div>
              ) : (
                <div className="space-y-2">
                  {dayEvents.map((event, idx) => {
                    const colors = getTypeColors(event.type);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => { setSelectedDate(day); setViewMode('day'); }}
                        className={`p-2 rounded-lg ${colors.bg} ${colors.text} cursor-pointer hover:shadow-md transition-all`}
                      >
                        <div className="text-[10px] font-bold mb-1 truncate">{event.title}</div>
                        <div className="text-[9px] opacity-80">{event.time}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Day View Component
const DayView = ({ currentDate, scheduleItems, getEventsForDate, getTypeColors, formatDate }) => {
  const dayEvents = getEventsForDate(currentDate);
  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6">
      {/* Day Header */}
      <div className={`bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm p-8 ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()]}
            </h2>
            <p className={`text-sm font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
              {formatDate(currentDate)} {isToday && '• Today'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-slate-900">{dayEvents.length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Events</div>
          </div>
        </div>

        {/* Events Timeline */}
        <div className="space-y-4">
          {dayEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium mb-2">No events scheduled for this day</p>
              <button className="text-blue-600 font-bold hover:underline">Submit an application →</button>
            </div>
          ) : (
            dayEvents.map((event, index) => {
              const colors = getTypeColors(event.type);
              const Icon = colors.icon;
              return (
                <div key={index} className={`bg-slate-50 rounded-2xl p-6 border-l-4 ${colors.border.replace('border', 'border-l')}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${colors.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <Icon size={24} className={colors.text} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{event.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                        event.status === 'confirmed'
                          ? 'bg-green-50 text-green-600 border-green-200'
                          : 'bg-orange-50 text-orange-600 border-orange-200'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          event.status === 'confirmed' ? 'bg-green-600' : 'bg-orange-600'
                        }`} />
                        {event.status}
                      </span>
                      <div className="mt-2 text-xs font-bold text-blue-600">
                        {event.registered} registered
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const SidebarLink = ({ icon, label, active = false, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-900'}`}>
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

const StatsCard = ({ title, value, icon, bgColor }) => (
  <div className={`${bgColor} rounded-[2.5rem] border border-white p-6 shadow-sm`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-white/50 rounded-2xl">{icon}</div>
    </div>
    <h3 className="text-3xl font-black text-slate-900 mb-1">{value}</h3>
    <p className="text-sm text-slate-600 font-medium">{title}</p>
  </div>
);

export default SchedulePage;
