import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Calendar, Settings, LogOut, Bell, Search, ChevronDown, Package } from 'lucide-react';
import Logo from '../../images/Logo.png';
import { useAuth } from '../../context/AuthContext';
import AdminOverview from './AdminOverview';
import ReviewQueue from './ReviewQueue';
import AdminSchedule from './AdminSchedule';
import AdminEquipmentManagement from './AdminEquipmentManagement';
import BorrowedEquipmentTracking from './BorrowedEquipmentTracking';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // ✅ Redirect non-OSAS users
  if (user && user.organization_role !== 'OSAS') {
    console.warn('⚠️ Non-OSAS user attempted to access admin. Redirecting...', { role: user.organization_role });
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { id: 'review', label: 'Review Queue', icon: <FileText size={20} />, path: '/admin/review' },
    { id: 'schedule', label: 'Schedule', icon: <Calendar size={20} />, path: '/admin/schedule' },
    { id: 'equipment', label: 'Equipment', icon: <Package size={20} />, path: '/admin/equipment' },
    { id: 'borrowed', label: 'Borrowed Items', icon: <Package size={20} />, path: '/admin/borrowed' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <img src={Logo} alt="OSAS Admin" className="w-8 h-8 object-contain" />
          <div>
            <span className="font-black text-xl tracking-tight block">OSAS</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <Settings size={20} />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search applications, users, events..."
              className="pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-80"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <img
                  src="https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff&bold=true"
                  alt="Admin"
                  className="w-8 h-8 rounded-full border border-slate-200"
                />
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-50">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">Admin Account</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowProfileDropdown(false); handleLogout(); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/review" element={<ReviewQueue />} />
            <Route path="/schedule" element={<AdminSchedule />} />
            <Route path="/equipment" element={<AdminEquipmentManagement />} />
            <Route path="/borrowed" element={<BorrowedEquipmentTracking />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;