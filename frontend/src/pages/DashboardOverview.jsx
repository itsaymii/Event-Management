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
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Logo from '../images/Logo.png';
import api from '../utils/api'; // ✅ Import ang axios instance na may JWT
import { useAuth } from '../context/AuthContext';

const DashboardOverview = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.username || user?.email || 'User';
  const displayEmail = user?.email || 'No email available';
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [stats, setStats] = useState({
    totalApplications: 0,
    approvedEvents: 0,
    pendingReview: 0,
    upcomingEvents: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // ✅ Notifications
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await api.get('/admin/notifications/');
      setNotifications(res.data || []);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setNotifLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/admin/notifications/mark_read/', { all: true });
      await fetchNotifications();
    } catch (e) {
      console.error('Failed to mark notifications as read', e);
    }
  };

  const openNotifications = async () => {
    const next = !showNotifDropdown;
    setShowNotifDropdown(next);
    if (next && notifications.length === 0) {
      await fetchNotifications();
    }
  };

  // ✅ Fetch data from Django backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await api.get('/applications/stats/');
        setStats(statsRes.data);

        // Fetch recent activities (using applications endpoint, limit to 4)
        const appsRes = await api.get('/applications/?limit=4');
        const apps = appsRes.data.results || appsRes.data;
        setRecentActivities(apps.map(app => ({
          id: app.id,
          title: app.status === 'approved' ? 'Event Approved' : 
                 app.status === 'rejected' ? 'Application Rejected' : 'Application Submitted',
          description: app.event_name,
          time: formatDate(app.created_at),
          type: app.status === 'approved' ? 'approval' : 
                app.status === 'rejected' ? 'rejection' : 'application',
          status: app.status
        })));

        // Fetch upcoming events for the calendar section
        const scheduleRes = await api.get('/applications/schedule/');
        setUpcomingEvents(scheduleRes.data.slice(0, 3).map(event => ({
          id: event.id,
          title: event.event_name,
          date: new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
          status: event.status === 'approved' ? 'confirmed' : 'pending'
        })));

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to empty states if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper: Format date to "X hours/days ago"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

// ✅ Dynamic stats array from API - WITH REAL PERCENTAGES
const statsData = [
  {
    title: "Total Applications",
    value: stats.totalApplications?.toString() || "0",
    change: stats.totalApplicationsChange !== undefined 
      ? `${stats.totalApplicationsChange >= 0 ? '+' : ''}${stats.totalApplicationsChange}%`
      : "0%",
    changeType: (stats.totalApplicationsChange ?? 0) >= 0 ? "positive" : "negative",
    icon: <FileText className="text-blue-600" size={24} />,
    bgColor: "bg-blue-50"
  },
  {
    title: "Approved Events",
    value: stats.approvedEvents?.toString() || "0",
    change: stats.approvedEventsChange !== undefined 
      ? `${stats.approvedEventsChange >= 0 ? '+' : ''}${stats.approvedEventsChange}%`
      : "0%",
    changeType: (stats.approvedEventsChange ?? 0) >= 0 ? "positive" : "negative",
    icon: <CheckCircle2 className="text-green-600" size={24} />,
    bgColor: "bg-green-50"
  },
  {
    title: "Pending Review",
    value: stats.pendingReview?.toString() || "0",
    change: stats.pendingReviewChange !== undefined 
      ? `${stats.pendingReviewChange >= 0 ? '+' : ''}${stats.pendingReviewChange}%`
      : "0%",
    changeType: (stats.pendingReviewChange ?? 0) >= 0 ? "positive" : "negative",
    icon: <Clock className="text-orange-600" size={24} />,
    bgColor: "bg-orange-50"
  },
  {
    title: "Upcoming Events",
    value: stats.upcomingEvents?.toString() || "0",
    change: stats.upcomingEventsChange !== undefined 
      ? `${stats.upcomingEventsChange >= 0 ? '+' : ''}${stats.upcomingEventsChange}%`
      : "0%",
    changeType: (stats.upcomingEventsChange ?? 0) >= 0 ? "positive" : "negative",
    icon: <CalendarIcon className="text-purple-600" size={24} />,
    bgColor: "bg-purple-50"
  }
];

  // Loading State UI
  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading dashboard...</p>
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
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" active onClick={() => onNavigate('dashboard')} />
          <SidebarLink icon={<FileText size={20} />} label="My Applications" onClick={() => onNavigate('applications')} />
          <SidebarLink icon={<Calendar size={20} />} label="Schedule" onClick={() => onNavigate('schedule')} />

          <div className="pt-6">
            <button
              onClick={() => onNavigate('submit-application')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-bold transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
            >
              <Plus size={20} strokeWidth={3} />
              Submit New Application
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
        {/* Header Actions */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>
            <p className="text-sm text-slate-500 mt-1">Welcome back, {displayName}.</p>
          </div>
          <div className="flex items-center gap-5">
            <Search className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" size={20} />
            <div className="relative">
              <button
                type="button"
                onClick={openNotifications}
                className="relative p-1"
                aria-label="Notifications"
              >
                <Bell className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" size={20} />
                {Array.isArray(notifications) && notifications.some((n) => !n.is_read) && (
                  <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {showNotifDropdown && (
                <div
                  ref={notifDropdownRef}
                  className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl border border-slate-200 shadow-lg z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-black text-slate-900">Notifications</p>
                    <button
                      onClick={markAllRead}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                      disabled={notifLoading}
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[340px] overflow-y-auto">
                    {notifLoading ? (
                      <div className="p-4 text-sm text-slate-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-sm text-slate-500">No notifications.</div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                          onClick={async () => {
                            try {
                              if (!n.is_read) {
                                await api.post('/admin/notifications/mark_read/', { all: true });
                                await fetchNotifications();
                              }
                              const route = n?.payload?.route;
                              if (route) window.location.href = route;
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 w-2.5 h-2.5 rounded-full ${
                                n.is_read ? 'bg-slate-300' : 'bg-blue-600'
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-black text-slate-900">{n.title}</p>
                              {n.message && (
                                <p className="text-xs text-slate-600 mt-1 line-clamp-3">{n.message}</p>
                              )}
                              <p className="text-[10px] text-slate-400 mt-2">
                                {new Date(n.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 rounded-xl transition-colors"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f8fafc&color=0f172a&bold=true`}
                  alt={`${displayName} avatar`}
                  className="w-8 h-8 rounded-full border border-slate-200"
                />
                <ChevronDown size={16} className="text-slate-400" />
              </div>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-lg z-50">
                  <div className="p-4 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">Signed in as</p>
                    <p className="text-xs text-slate-500">{displayEmail}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              bgColor={stat.bgColor}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Recent Activity</h2>
              <TrendingUp className="text-slate-400" size={20} />
            </div>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-center text-slate-400 py-4 text-sm">No recent activity</p>
              ) : (
                recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={activity.id || index}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    type={activity.type}
                  />
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Upcoming Events</h2>
              <CalendarIcon className="text-slate-400" size={20} />
            </div>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-center text-slate-400 py-4 text-sm">No upcoming events</p>
              ) : (
                upcomingEvents.map((event, index) => (
                  <EventItem
                    key={event.id || index}
                    title={event.title}
                    date={event.date}
                    status={event.status}
                  />
                ))
              )}
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="w-full mt-6 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl transition-colors"
            >
              View Full Schedule
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm p-8">
          <h2 className="text-xl font-black text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionButton
              title="Submit Application"
              description="Apply for a new event"
              icon={<Plus size={20} />}
              onClick={() => onNavigate('submit-application')}
              color="bg-blue-600 hover:bg-blue-700"
            />
            <QuickActionButton
              title="View Applications"
              description="Check your submissions"
              icon={<FileText size={20} />}
              onClick={() => onNavigate('applications')}
              color="bg-green-600 hover:bg-green-700"
            />
            <QuickActionButton
              title="My Schedule"
              description="View upcoming events"
              icon={<Calendar size={20} />}
              onClick={() => onNavigate('schedule')}
              color="bg-purple-600 hover:bg-purple-700"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

//  Sub-components (same as before, reusable)
const SidebarLink = ({ icon, label, active = false, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${
      active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-900'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

const StatsCard = ({ title, value, change, changeType, icon, bgColor }) => (
  <div className={`${bgColor} rounded-[2.5rem] border border-white p-6 shadow-sm hover:scale-[1.02] transition-transform duration-200`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-white/50 rounded-2xl">
        {icon}
      </div>
      <span className={`text-xs font-bold ${
        changeType === 'positive' ? 'text-green-600' : 'text-red-600'
      }`}>
        {change}
      </span>
    </div>
    <h3 className="text-3xl font-black text-slate-900 mb-1">{value}</h3>
    <p className="text-sm text-slate-600 font-medium">{title}</p>
  </div>
);

const ActivityItem = ({ title, description, time, type }) => (
  <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
    <div className={`w-2 h-2 rounded-full ${
      type === 'application' ? 'bg-blue-500' :
      type === 'approval' ? 'bg-green-500' :
      type === 'schedule' ? 'bg-purple-500' : 'bg-red-500'
    }`} />
    <div className="flex-1">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
    <span className="text-xs text-slate-400">{time}</span>
  </div>
);

const EventItem = ({ title, date, status }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
    <div>
      <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
      <p className="text-xs text-slate-500">{date}</p>
    </div>
    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
      status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
    }`}>
      {status}
    </span>
  </div>
);

const QuickActionButton = ({ title, description, icon, onClick, color }) => (
  <button
    onClick={onClick}
    className={`${color} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-left group`}
  >
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <h3 className="font-bold text-lg">{title}</h3>
    </div>
    <p className="text-sm opacity-90">{description}</p>
  </button>
);

export default DashboardOverview;
