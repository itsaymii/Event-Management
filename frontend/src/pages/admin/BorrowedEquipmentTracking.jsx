import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import api from '../../utils/api';

const BorrowedEquipmentTracking = () => {
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [returningId, setReturningId] = useState(null);
  const [returnFormData, setReturnFormData] = useState({
    condition_on_return: 'good',
    notes: '',
    damage_notes: '',
  });

  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchBorrowedEquipment();
  }, []);

  const fetchBorrowedEquipment = async () => {
    try {
      setLoading(true);
      const borrowedRes = await api.get('/admin/equipment-borrow/currently_borrowed/');
      setBorrowedItems(borrowedRes.data.results || borrowedRes.data);

      const overdueRes = await api.get('/admin/equipment-borrow/overdue/');
      setOverdueItems(overdueRes.data.results || overdueRes.data);
    } catch (error) {
      console.error('Failed to fetch borrowed equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordReturn = async (borrowId) => {
    try {
      await api.post(`/admin/equipment-borrow/${borrowId}/record_return/`, returnFormData);
      setReturningId(null);
      setReturnFormData({ condition_on_return: 'good', notes: '', damage_notes: '' });
      fetchBorrowedEquipment();
    } catch (error) {
      console.error('Failed to record equipment return:', error);
    }
  };

  const getDaysOverdue = (expectedReturnDate) => {
    if (!expectedReturnDate) return 0;
    const today = new Date();
    const expected = new Date(expectedReturnDate);
    const diffTime = today - expected;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getDaysUntilDue = (expectedReturnDate) => {
    if (!expectedReturnDate) return 0;
    const today = new Date();
    const expected = new Date(expectedReturnDate);
    const diffTime = expected - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : -1;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const filteredBorrowed = borrowedItems.filter((item) =>
    item.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOverdue = overdueItems.filter((item) =>
    item.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Loading State
  if (loading && borrowedItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ✅ Header - Matches Dashboard Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Borrowed Equipment Tracking</h1>
          <p className="text-slate-500 mt-1">Monitor equipment loans, track returns, and manage overdue items</p>
        </div>
      </div>

      {/* ✅ Alert Banner - Matches Dashboard Style */}
      {overdueItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
            <AlertCircle className="text-red-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-red-900">⚠️ Overdue Equipment Alert</h3>
            <p className="text-red-700 text-sm mt-1">
              <span className="font-bold">{overdueItems.length}</span> equipment items are overdue for return
            </p>
          </div>
        </div>
      )}

      {/* ✅ Tabs - Matches Dashboard Style */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 p-1 w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock size={16} />
          Currently Borrowed ({borrowedItems.length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overdue'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <AlertCircle size={16} />
          Overdue ({overdueItems.length})
        </button>
      </div>

      {/* ✅ Search - Matches Dashboard Style */}
      <div className="flex-1 min-w-[300px] relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search equipment, borrower, or event..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
        />
      </div>

      {/* ✅ Return Modal - Matches Dashboard Modal Style */}
      {returningId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg">Record Equipment Return</h3>
              <button
                onClick={() => setReturningId(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Condition on Return</label>
                <select
                  value={returnFormData.condition_on_return}
                  onChange={(e) => setReturnFormData({ ...returnFormData, condition_on_return: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="excellent">Excellent - No issues</option>
                  <option value="good">Good - Minor wear</option>
                  <option value="fair">Fair - Noticeable wear</option>
                  <option value="poor">Poor - Damaged</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Return Notes</label>
                <textarea
                  value={returnFormData.notes}
                  onChange={(e) => setReturnFormData({ ...returnFormData, notes: e.target.value })}
                  placeholder="Any notes about the return process..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  rows={3}
                />
              </div>
              
              {returnFormData.condition_on_return === 'poor' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <label className="block text-sm font-bold text-red-700 mb-2">Damage Description</label>
                  <textarea
                    value={returnFormData.damage_notes}
                    onChange={(e) => setReturnFormData({ ...returnFormData, damage_notes: e.target.value })}
                    placeholder="Describe the damage in detail..."
                    className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setReturningId(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRecordReturn(returningId)}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-100 active:scale-[0.98]"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Equipment Table - Matches Dashboard Table Style */}
      <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-6">Equipment</th>
                <th className="px-8 py-6">Borrower</th>
                <th className="px-8 py-6">Event</th>
                <th className="px-8 py-6">Borrow Date</th>
                <th className="px-8 py-6">Due Date</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeTab === 'active' && filteredBorrowed.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Clock className="w-12 h-12 text-slate-300" />
                      <p>No currently borrowed equipment</p>
                    </div>
                  </td>
                </tr>
              ) : activeTab === 'overdue' && filteredOverdue.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 className="w-12 h-12 text-green-300" />
                      <p>Great! No overdue equipment</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (activeTab === 'active' ? filteredBorrowed : filteredOverdue).map((item) => {
                  const daysLeft = getDaysUntilDue(item.expected_return_date);
                  const daysOverdue = getDaysOverdue(item.expected_return_date);
                  const isActuallyOverdue = item.is_overdue || daysOverdue > 0;

                  return (
                    <tr 
                      key={item.id} 
                      className={`group hover:bg-slate-50/50 transition-colors ${isActuallyOverdue ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <FileText size={20} className="text-white/50" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight mb-0.5">{item.equipment_name}</p>
                            <p className="text-xs text-slate-400 font-mono">{item.equipment_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Users size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{item.user_full_name}</p>
                            <p className="text-xs text-slate-400">{item.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600">{item.event_name || '—'}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarIcon size={14} className="text-slate-400" />
                          {formatDate(item.borrow_date)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarIcon size={14} className="text-slate-400" />
                          {formatDate(item.expected_return_date)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {isActuallyOverdue ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-red-50 text-red-600 border-red-100">
                            <AlertCircle size={12} />
                            {daysOverdue}d overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-blue-50 text-blue-600 border-blue-100">
                            <Clock size={12} />
                            {daysLeft}d left
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => setReturningId(item.id)}
                          className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-bold transition-colors border border-green-200"
                        >
                          Record Return
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
            Showing {activeTab === 'active' ? filteredBorrowed.length : filteredOverdue.length} items
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
    </div>
  );
};

export default BorrowedEquipmentTracking;