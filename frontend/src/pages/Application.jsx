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
  SlidersHorizontal,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  LogOut,
  ChevronDown,
  X,
  MapPin,
  Users,
  Mail,
  Phone,
  ExternalLink,
  Wrench
} from 'lucide-react';
import Logo from '../images/Logo.png';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const equipmentLabels = {
  projector: 'Projector & Screen',
  pa_system: 'PA System / Microphones',
  lighting: 'Lighting Rig',
  stage: 'Stage Platforms',
  wifi: 'High-speed Wi-Fi',
  power: 'Power Extensions',
};

const ApplicationsPage = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.username || user?.email || 'User';
  const displayEmail = user?.email || 'No email available';
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchQuery: ''
  });

  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowDetailsModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/applications/');
        const data = response.data.results || response.data;
        setApplications(data);
        setFilteredApplications(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  useEffect(() => {
    let result = [...applications];
    if (filters.status !== 'all') {
      result = result.filter(app => app.status?.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let daysBack = 0;
      switch (filters.dateRange) {
        case 'today': daysBack = 1; break;
        case 'week': daysBack = 7; break;
        case 'month': daysBack = 30; break;
        case 'quarter': daysBack = 90; break;
        default: daysBack = 30;
      }
      const cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);
      result = result.filter(app => new Date(app.created_at) >= cutoffDate);
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(app =>
        app.event_name?.toLowerCase().includes(query) ||
        app.id?.toString().toLowerCase().includes(query) ||
        app.location?.toLowerCase().includes(query) ||
        app.venue?.toLowerCase().includes(query)
      );
    }
    setFilteredApplications(result);
  }, [filters, applications]);

  // Returns complete Tailwind class strings — no interpolation needed
  const getStatusColor = (status = '') => {
    const key = status.toLowerCase();
    const colors = {
      approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-600' },
      pending:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-100',  dot: 'bg-orange-600'  },
      rejected: { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100',     dot: 'bg-red-600'     },
    };
    return colors[key] ?? { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', dot: 'bg-slate-600' };
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'TBD') return 'TBD';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'TBD';
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch (e) {
      return 'TBD';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount).replace('PHP', '₱');
  };

  // Parse raw equipment value into a list of IDs, then map to labels
  const resolveEquipmentItems = (raw) => {
    let ids = [];
    if (Array.isArray(raw)) {
      ids = raw;
    } else if (typeof raw === 'string' && raw && raw !== '[]' && raw !== 'null') {
      try {
        const parsed = JSON.parse(raw);
        ids = Array.isArray(parsed) ? parsed : [raw];
      } catch {
        ids = [raw];
      }
    }
    return ids.map(id => equipmentLabels[id] || id).filter(Boolean);
  };

  const handleViewDetails = async (app) => {
    setLoadingDetails(true);
    setShowDetailsModal(true);
    try {
      const response = await api.get(`/applications/${app.id}/`);
      // Store raw API data — resolveEquipmentItems handles display
      setSelectedApp(response.data);
    } catch (err) {
      console.error('Failed to fetch details:', err);
      setSelectedApp(app);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedApp(null);
  };

  const handleClearFilters = () => {
    setFilters({ status: 'all', dateRange: 'all', searchQuery: '' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center bg-red-50 border border-red-200 rounded-2xl p-8">
          <p className="text-red-600 font-bold mb-4">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
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
          <SidebarLink icon={<FileText size={20} />} label="My Applications" active onClick={() => onNavigate('applications')} />
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
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-slate-900">My Applications</h1>
          <div className="flex items-center gap-5">
            <Search className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" size={20} />
            <div className="relative">
              <Bell className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" size={20} />
              <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
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
              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-lg z-50">
                  <div className="p-4 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">Signed in as</p>
                    <p className="text-xs text-slate-500">{displayEmail}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { setShowProfileDropdown(false); onLogout(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Filters Bar */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search applications, events, or IDs..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <FilterDropdown
              icon={<SlidersHorizontal size={16} />}
              label={`Status: ${filters.status === 'all' ? 'All' : filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
              ]}
              onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
            />
            <FilterDropdown
              icon={<CalendarIcon size={16} />}
              label={
                filters.dateRange === 'all' ? 'All Time' :
                filters.dateRange === 'today' ? 'Today' :
                filters.dateRange === 'week' ? 'Last 7 Days' :
                filters.dateRange === 'month' ? 'Last 30 Days' :
                filters.dateRange === 'quarter' ? 'Last 90 Days' : 'All Time'
              }
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'Last 30 Days' },
                { value: 'quarter', label: 'Last 90 Days' }
              ]}
              onChange={(val) => setFilters(prev => ({ ...prev, dateRange: val }))}
            />
          </div>
        </div>

        {/* Data Table */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="px-8 py-6">Event Details</th>
                  <th className="px-8 py-6">Application ID</th>
                  <th className="px-8 py-6">Submission Date</th>
                  <th className="px-8 py-6">Budget</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="w-12 h-12 text-slate-300" />
                        <p>No applications found matching your filters.</p>
                        <button
                          onClick={handleClearFilters}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => {
                    const color = getStatusColor(app.status);
                    return (
                      <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 overflow-hidden flex-shrink-0">
                              <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold opacity-20">IMG</div>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight mb-0.5">{app.event_name}</p>
                              <p className="text-xs text-slate-400 font-medium">
                                {app.venue || app.location || 'N/A'} • {formatDate(app.event_date || app.start_date)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-500 font-mono">APP-{app.id}</td>
                        <td className="px-8 py-6 text-sm font-medium text-slate-500">{formatDate(app.created_at)}</td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-700">
                          {formatCurrency(app.estimated_budget)}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${color.bg} ${color.text} ${color.border}`}>
                            <div className={`w-1 h-1 rounded-full ${color.dot}`} />
                            {app.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => handleViewDetails(app)}
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {app.status === 'rejected' ? 'Re-apply' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-6 bg-white border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {filteredApplications.length} of {applications.length} applications
            </p>
            <div className="flex items-center gap-2">
              <PaginationButton icon={<ChevronLeft size={16} />} disabled />
              <PaginationButton label="1" active />
              <PaginationButton icon={<ChevronRight size={16} />} disabled />
            </div>
          </div>
        </section>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <AnalyticsCard
            label="Approved"
            value={applications.filter(a => a.status === 'approved').length.toString()}
            icon={<CheckCircle2 className="text-blue-600/20" size={48} />}
            bgColor="bg-blue-50/50"
          />
          <AnalyticsCard
            label="In Review"
            value={applications.filter(a => a.status === 'pending').length.toString()}
            icon={<Clock className="text-orange-600/20" size={48} />}
            bgColor="bg-orange-50/50"
          />
          <div className="bg-white border border-slate-200/50 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Completion</span>
              <span className="text-xs font-black text-blue-600">85%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[85%] rounded-full shadow-[0_0_12px_rgba(37,99,235,0.3)]" />
            </div>
          </div>
        </div>
      </main>

      {/* VIEW DETAILS MODAL */}
      {showDetailsModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {loadingDetails && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-[2.5rem]">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium">Loading details...</p>
                </div>
              </div>
            )}

            {/* Modal Header */}
            <div className="bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900">Application Details</h2>
                <p className="text-slate-500 text-sm">APP-{selectedApp.id}</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div
              className="p-8 space-y-6 overflow-y-auto flex-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}
            >
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                {(() => {
                  const c = getStatusColor(selectedApp.status);
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
                      <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                      {selectedApp.status}
                    </span>
                  );
                })()}
                <span className="text-sm text-slate-500">Submitted {formatDate(selectedApp.created_at)}</span>
              </div>

              {/* Event Basic Info */}
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-lg">{selectedApp.event_name || 'Event Details'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Event Date */}
                  <div className="flex items-start gap-3 text-slate-600">
                    <CalendarIcon size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Event Date</p>
                      <p className="font-bold text-slate-900">{formatDate(selectedApp.event_date || selectedApp.start_date)}</p>
                      {selectedApp.end_date && selectedApp.end_date !== (selectedApp.event_date || selectedApp.start_date) && (
                        <p className="text-xs text-slate-500 mt-1">to {formatDate(selectedApp.end_date)}</p>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  {(selectedApp.start_time || selectedApp.end_time) && (
                    <div className="flex items-start gap-3 text-slate-600">
                      <Clock size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Time</p>
                        <p className="font-bold text-slate-900">{selectedApp.start_time || 'N/A'}</p>
                        {selectedApp.end_time && <p className="text-xs text-slate-500 mt-1">to {selectedApp.end_time}</p>}
                      </div>
                    </div>
                  )}

                  {/* Venue */}
                  {(selectedApp.venue || selectedApp.location) && (
                    <div className="flex items-start gap-3 text-slate-600">
                      <MapPin size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Venue</p>
                        <p className="font-bold text-slate-900">{selectedApp.venue || selectedApp.location}</p>
                      </div>
                    </div>
                  )}

                  {/* Event Type */}
                  {selectedApp.event_type && (
                    <div className="flex items-start gap-3 text-slate-600">
                      <FileText size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Event Type</p>
                        <p className="font-bold text-slate-900 capitalize">{selectedApp.event_type}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Purpose / Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">
                  {selectedApp.purpose ? 'Purpose of Event' : 'Description'}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 rounded-xl p-4">
                  {selectedApp.purpose || selectedApp.description || 'No description provided.'}
                </p>
              </div>

              {/* Equipment Section — Display with names and quantities */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Wrench size={16} className="text-purple-600" />
                  Equipment Requested
                </h4>
                {(() => {
                  // Use equipment_details from backend if available, otherwise fall back to equipment parsing
                  const items = selectedApp.equipment_details && selectedApp.equipment_details.length > 0 
                    ? selectedApp.equipment_details 
                    : resolveEquipmentItems(selectedApp.equipment);
                  
                  // Check if we have proper equipment details with names
                  const hasDetails = selectedApp.equipment_details && selectedApp.equipment_details.length > 0;
                  
                  return items && items.length > 0 ? (
                    <div className="space-y-2">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm text-slate-700 bg-white rounded-lg p-3 border border-green-100"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                            <span className="font-medium">
                              {hasDetails ? item.equipment_name : item}
                            </span>
                          </div>
                          {hasDetails && item.quantity && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                              Qty: {item.quantity}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-sm text-slate-400">No equipment requested</p>
                    </div>
                  );
                })()}
              </div>

              {/* Attendees & Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-blue-600" />
                    <span className="text-xs font-bold text-blue-600 uppercase">Expected Attendees</span>
                  </div>
                  <p className="text-2xl font-black text-blue-900">{selectedApp.expected_attendees || 'Not specified'}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-green-600 uppercase">Estimated Budget</span>
                  </div>
                  <p className="text-2xl font-black text-green-900">
                    {selectedApp.estimated_budget ? formatCurrency(selectedApp.estimated_budget) : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Users size={16} className="text-slate-600" />
                  Contact Person
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Name</p>
                      <p className="font-medium text-slate-900">{selectedApp.contact_person || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Mail size={14} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Email</p>
                      {selectedApp.contact_email ? (
                        <a href={`mailto:${selectedApp.contact_email}`} className="font-medium text-blue-600 hover:underline">
                          {selectedApp.contact_email}
                        </a>
                      ) : (
                        <p className="font-medium text-slate-400">Not provided</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Phone size={14} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Phone</p>
                      {selectedApp.contact_phone ? (
                        <a href={`tel:${selectedApp.contact_phone}`} className="font-medium text-blue-600 hover:underline">
                          {selectedApp.contact_phone}
                        </a>
                      ) : (
                        <p className="font-medium text-slate-400">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-slate-600" />
                  Attachments
                </h4>
                {selectedApp.document ? (
                  <a
                    href={selectedApp.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-sm transition-colors"
                  >
                    <FileText size={16} />
                    View Document <ExternalLink size={14} />
                  </a>
                ) : (
                  <p className="text-sm text-slate-400">No attachments uploaded</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-slate-100 px-8 py-4 flex justify-end gap-3 flex-shrink-0">
              <button onClick={handleCloseModal} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">
                Close
              </button>
              {selectedApp.status === 'rejected' && (
                <button
                  onClick={() => { handleCloseModal(); onNavigate('submit-application'); }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
                >
                  Re-apply
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarLink = ({ icon, label, active = false, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-900'}`}
  >
    {icon}<span className="text-sm">{label}</span>
  </div>
);

const FilterDropdown = ({ icon, label, options = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:border-slate-300 transition-all"
      >
        {icon}{label}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && options.length > 0 && (
        <div className="absolute top-full mt-2 right-0 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-2 max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange?.(opt.value); setIsOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PaginationButton = ({ label, icon, active = false, disabled = false }) => (
  <button
    disabled={disabled}
    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
  >
    {label || icon}
  </button>
);

const AnalyticsCard = ({ label, value, icon, bgColor }) => (
  <div className={`relative overflow-hidden ${bgColor} rounded-[2.5rem] border border-white p-8 shadow-sm group hover:scale-[1.02] transition-transform duration-300`}>
    <div className="relative z-10">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <p className="text-4xl font-black text-slate-900">{value}</p>
    </div>
    <div className="absolute right-[-10px] bottom-[-10px] transform group-hover:scale-110 transition-transform duration-500 opacity-60">
      {icon}
    </div>
  </div>
);

export default ApplicationsPage;