import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Clock, XCircle, Calendar, TrendingUp, Users } from 'lucide-react';
import api from '../../utils/api';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    total_applications: 0,
    total_applications_change: 0,
    approved_events: 0,
    pending_review: 0,
    rejected_applications: 0,
    upcoming_events: 0,
    recent_submissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await api.get('/admin/applications/stats/');
        setStats(statsRes.data);

        // Fetch recent pending applications
        const appsRes = await api.get('/admin/applications/?status=pending&page_size=5');
        setRecentApps(appsRes.data.results || appsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.total_applications,
      change: stats.total_applications_change,
      icon: <FileText className="text-blue-600" size={24} />,
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Approved Events',
      value: stats.approved_events,
      icon: <CheckCircle2 className="text-green-600" size={24} />,
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Review',
      value: stats.pending_review,
      icon: <Clock className="text-orange-600" size={24} />,
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Rejected',
      value: stats.rejected_applications,
      icon: <XCircle className="text-red-600" size={24} />,
      bgColor: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage applications, reviews, and event schedules</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.bgColor} rounded-2xl border border-white p-6 shadow-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/50 rounded-xl">{stat.icon}</div>
              {stat.change !== undefined && (
                <span
                  className={`text-xs font-bold ${
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change >= 0 ? '+' : ''}
                  {stat.change}%
                </span>
              )}
            </div>
            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Pending Applications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900">Pending Reviews</h2>
            <span className="text-sm font-bold text-blue-600">{stats.pending_review} total</span>
          </div>

          {recentApps.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No pending applications</p>
          ) : (
            <div className="space-y-4">
              {recentApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{app.event_name}</p>
                      <p className="text-xs text-slate-500">
                        by {app.user_username} • {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-orange-50 text-orange-600 border border-orange-200">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Upcoming */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-black text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-sm transition-colors">
                <FileText size={18} />
                Review Pending Apps
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-bold text-sm transition-colors">
                <Calendar size={18} />
                Manage Schedule
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-sm transition-colors">
                <Users size={18} />
                View Users
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900">Upcoming Events</h3>
              <Calendar size={18} className="text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.upcoming_events}</p>
            <p className="text-sm text-slate-500">Approved events scheduled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;