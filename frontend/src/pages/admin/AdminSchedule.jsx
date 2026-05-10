// src/pages/admin/AdminSchedule.jsx
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, CheckCircle2, Clock } from 'lucide-react';
import api from '../../utils/api';

const AdminSchedule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const res = await api.get('/admin/applications/schedule/', {
        params: {
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0],
        },
      });
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  // ✅ FIXED: Handle null dates and invalid event dates
  const getEventsForDate = (date) => {
    if (!date) return [];

    return events.filter((event) => {
      if (!event?.start_date) return false;

      const eventDate = new Date(event.start_date);
      if (isNaN(eventDate.getTime())) return false;

      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // ✅ Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // ✅ Format time for display (12-hour format with AM/PM)
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const formatDateTimeForPanel = (event) => {
    const date = formatDate(event.start_date);
    const startTime = formatTime(event.start_time);
    const endTime = formatTime(event.end_time);

    if (startTime && endTime) return `${date} • ${startTime}–${endTime}`;
    if (startTime) return `${date} • ${startTime}`;
    return date;
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const dayPanelEvents = selectedEvent ? selectedEvent : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Event Schedule</h1>
          <p className="text-slate-500 mt-1">Manage approved event schedules</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            {['Month', 'Week', 'Day'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode.toLowerCase())}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === mode.toLowerCase()
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>

            <span className="font-bold text-slate-900 min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>

            <button
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar + Right Details Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex gap-6">
          {/* Calendar */}
          <div className="flex-1 min-w-0">
            {/* Week Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-black text-slate-400 uppercase tracking-wider py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentDate).map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={index}
                      className="min-h-[120px] p-2 rounded-xl border border-transparent bg-slate-50/30"
                    />
                  );
                }

                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const dayNumber = date.getDate();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 rounded-xl border transition-all flex flex-col ${
                      'bg-white border-slate-100 hover:border-blue-300'
                    } ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                  >
                    <div
                      className={`text-sm font-bold mb-1 flex items-center justify-between ${
                        isToday ? 'text-blue-600' : 'text-slate-700'
                      }`}
                    >
                      <span>{dayNumber}</span>
                      {dayEvents.length > 0 && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                    </div>

                    <div className="flex-1 space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedEvent(event)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setSelectedEvent(event);
                          }}
                          className="text-[9px] font-bold px-1.5 py-1 rounded bg-blue-50 text-blue-700 truncate cursor-pointer hover:bg-blue-100 transition-colors"
                          title={`${event.event_name}${event.start_time ? ` • ${formatTime(event.start_time)}` : ''}`}
                        >
                          <div className="truncate">{event.event_name}</div>

                          {/* ✅ show time on calendar card */}
                          {(event.start_time || event.end_time) && (
                            <div className="text-[8px] text-blue-500 font-medium truncate flex items-center gap-0.5">
                              <Clock size={8} />
                              {formatTime(event.start_time)}
                              {event.end_time ? `–${formatTime(event.end_time)}` : ''}
                            </div>
                          )}
                        </div>
                      ))}

                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-slate-400 font-medium pl-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side Details Panel */}
          <div className="w-[360px] shrink-0">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sticky top-6">
              <h3 className="font-black text-slate-900 text-lg">Event Details</h3>
              <p className="text-xs text-slate-500 mt-1">
                Click an event in the calendar
              </p>

              {!dayPanelEvents ? (
                <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
                  No event selected.
                </div>
              ) : (
                <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
                  <p className="font-bold text-slate-900 text-sm">{dayPanelEvents.event_name}</p>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <CalendarIcon size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">When</p>
                        <p className="font-bold text-slate-900">{formatDateTimeForPanel(dayPanelEvents)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Venue</p>
                        <p className="font-bold text-slate-900">
                          {dayPanelEvents.venue || dayPanelEvents.location || 'Venue TBD'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Clock size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Time</p>
                        <p className="font-bold text-slate-900">
                          {dayPanelEvents.start_time ? formatTime(dayPanelEvents.start_time) : 'TBD'}
                          {dayPanelEvents.end_time ? ` – ${formatTime(dayPanelEvents.end_time)}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Requested By</p>
                      <p className="font-bold text-slate-900 text-sm">
                        {dayPanelEvents.user_username || dayPanelEvents.user?.username || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approved Events List - WITH TIME */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-black text-slate-900 mb-4">Upcoming Approved Events</h3>

        {events.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No approved events scheduled</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => setSelectedEvent(event)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{event.event_name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={14} />
                        {formatDate(event.start_date)}
                      </span>

                      {(event.start_time || event.end_time) && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock size={14} className="text-blue-500" />
                          {formatTime(event.start_time)}
                          {event.end_time && <span>–{formatTime(event.end_time)}</span>}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {event.venue || event.location || 'Venue TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-50 text-green-600 border border-green-200">
                    Approved
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    by {event.user_username || event.user?.username || 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSchedule;
