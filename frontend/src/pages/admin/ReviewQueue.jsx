import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye,
  Calendar,
  MapPin,
  Users,
  Mail,
  Phone,
  Wrench,
  FileText,
  ExternalLink
} from 'lucide-react';
import api from '../../utils/api';

const ReviewQueue = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(null);

  // ✅ Equipment ID to Label mapping (MUST match SubmitApplication.jsx)
  const equipmentLabels = {
    projector: 'Projector & Screen',
    pa_system: 'PA System / Microphones',
    lighting: 'Lighting Rig',
    stage: 'Stage Platforms',
    wifi: 'High-speed Wi-Fi',
    power: 'Power Extensions',
  };

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let url = '/admin/applications/?status=pending&page_size=20';
      if (filter !== 'all') {
        url = `/admin/applications/?status=${filter}&page_size=20`;
      }
      const res = await api.get(url);
      setApplications(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await api.post(`/admin/applications/${id}/approve/`);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      console.error('Failed to approve:', err);
      alert('Failed to approve application');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    setProcessing(id);
    try {
      await api.post(`/admin/applications/${id}/reject/`, {
        reason: rejectionReason,
      });
      setApplications((prev) => prev.filter((app) => app.id !== id));
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedApp(null);
    } catch (err) {
      console.error('Failed to reject:', err);
      alert('Failed to reject application');
    } finally {
      setProcessing(null);
    }
  };

  const filteredApps = applications.filter((app) =>
    app.event_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.user_username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-50 text-orange-600 border-orange-200',
      approved: 'bg-green-50 text-green-600 border-green-200',
      rejected: 'bg-red-50 text-red-600 border-red-200',
    };
    return colors[status] || colors.pending;
  };

  // ✅ Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'TBD';
    }
  };

  // ✅ Format currency (PHP)
  const formatCurrency = (amount) => {
    if (!amount) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount).replace('PHP', '₱');
  };

  // ✅ Parse equipment from JSON string / array / dicts to readable labels
  const parseEquipment = (equipment) => {
    if (!equipment) return [];

    // Array form: may contain scalars OR dicts like { equipment_id, quantity }
    if (Array.isArray(equipment)) {
      return equipment
        .map((item) => {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            const id = item.equipment_id;
            const qty = item.quantity;
            const label = equipmentLabels[id] || id;
            return qty ? `${label} (x${qty})` : label;
          }
          return equipmentLabels[item] || item;
        })
        .filter(Boolean);
    }

    // String form: may be JSON array or a single scalar
    if (typeof equipment === 'string') {
      try {
        const parsed = JSON.parse(equipment);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => {
              if (item && typeof item === 'object' && !Array.isArray(item)) {
                const id = item.equipment_id;
                const qty = item.quantity;
                const label = equipmentLabels[id] || id;
                return qty ? `${label} (x${qty})` : label;
              }
              return equipmentLabels[item] || item;
            })
            .filter(Boolean);
        }
        return [equipmentLabels[parsed] || parsed].filter(Boolean);
      } catch {
        // Not JSON, treat as scalar
        return [equipmentLabels[equipment] || equipment].filter(Boolean);
      }
    }

    // Dict / scalar fallback
    if (equipment && typeof equipment === 'object') {
      const id = equipment.equipment_id;
      const qty = equipment.quantity;
      const label = equipmentLabels[id] || id;
      return qty ? [`${label} (x${qty})`] : [label].filter(Boolean);
    }

    return [equipmentLabels[equipment] || equipment].filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Review Queue</h1>
          <p className="text-slate-500 mt-1">
            {filteredApps.length} applications pending review
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Application</th>
                <th className="px-6 py-4">Submitted By</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{app.event_name}</p>
                      <p className="text-xs text-slate-500">{app.venue || app.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{app.user_username}</p>
                      <p className="text-xs text-slate-400">{app.user_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 capitalize">{app.event_type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">
                        {formatDate(app.event_date || app.start_date)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(
                          app.status
                        )}`}
                      >
                        <Clock size={10} className="mr-1" />
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(app.id)}
                              disabled={processing === app.id}
                              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setShowRejectModal(true);
                              }}
                              disabled={processing === app.id}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400">
            Showing {filteredApps.length} applications
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg">1</button>
            <button className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ VIEW DETAILS MODAL - Complete with ALL fields */}
      {selectedApp && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Application Details</h3>
                <p className="text-slate-500 text-xs">APP-{selectedApp.id}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Status & Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-xs font-black uppercase border ${getStatusColor(selectedApp.status)}`}>
                    {selectedApp.status}
                  </span>
                  <span className="text-sm text-slate-500">
                    Submitted {formatDate(selectedApp.created_at)}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                  APP-{selectedApp.id}
                </span>
              </div>

              {/* Event Basic Info */}
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-slate-900 text-lg">{selectedApp.event_name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  
                  {/* ✅ Event Date */}
                  <div className="flex items-start gap-3 text-slate-600">
                    <Calendar size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Event Date</p>
                      <p className="font-bold text-slate-900">{formatDate(selectedApp.event_date || selectedApp.start_date)}</p>
                      {selectedApp.end_date && selectedApp.end_date !== (selectedApp.event_date || selectedApp.start_date) && (
                        <p className="text-xs text-slate-500 mt-1">to {formatDate(selectedApp.end_date)}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* ✅ Time */}
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

                  {/* ✅ Venue */}
                  {(selectedApp.venue || selectedApp.location) && (
                    <div className="flex items-start gap-3 text-slate-600">
                      <MapPin size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Venue</p>
                        <p className="font-bold text-slate-900">{selectedApp.venue || selectedApp.location || 'Not specified'}</p>
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

              {/* ✅ Purpose/Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {selectedApp.purpose ? 'Purpose of Event' : 'Description'}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 rounded-xl p-4">
                  {selectedApp.purpose || selectedApp.description || 'No description provided.'}
                </p>
              </div>

              {/* Equipment & Additional Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                  {/* ✅ Equipment */}
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Wrench size={16} className="text-purple-600" />
                      Equipment Requested
                    </h4>

                    {(() => {
                      // Prefer backend-resolved names/quantities
                      const details = selectedApp.equipment_details || [];
                      if (Array.isArray(details) && details.length > 0) {
                        return (
                          <div className="space-y-2">
                            {details.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm text-slate-700 bg-white rounded-lg p-3 border border-green-100"
                              >
                                <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                                <span className="font-medium">
                                  {item.equipment_name || 'Unknown equipment'}
                                  {item.quantity ? ` (x${item.quantity})` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // Fallback: parse raw equipment (may be IDs)
                      const equipmentList = parseEquipment(selectedApp.equipment);
                      return equipmentList.length > 0 ? (
                        <div className="space-y-2">
                          {equipmentList.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm text-slate-700 bg-white rounded-lg p-3 border border-green-100"
                            >
                              <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                              <span className="font-medium">{item}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No equipment requested</p>
                      );
                    })()}
                  </div>

                {/* Attendees & Budget */}
                <div className="space-y-4">
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
                      {formatCurrency(selectedApp.estimated_budget)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ Contact Information */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
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

              {/* ✅ Attachments */}
              {selectedApp.document ? (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-slate-600" />
                    Attachments
                  </h4>
                  <a 
                    href={selectedApp.document} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-sm transition-colors"
                  >
                    <FileText size={16} />
                    View Document <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-slate-600" />
                    Attachments
                  </h4>
                  <p className="text-sm text-slate-400">No attachments uploaded</p>
                </div>
              )}
            </div>

            {/* Modal Footer - Action Buttons */}
            {selectedApp.status === 'pending' && (
              <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedApp(null);
                    setShowRejectModal(true);
                  }}
                  className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedApp.id);
                    setSelectedApp(null);
                  }}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors"
                >
                  Approve Application
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-black text-slate-900 mb-2">Reject Application</h3>
              <p className="text-sm text-slate-500 mb-4">
                Are you sure you want to reject "{selectedApp.event_name}"?
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedApp(null);
                  setRejectionReason('');
                }}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedApp.id)}
                disabled={processing === selectedApp.id}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                {processing === selectedApp.id ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewQueue;
