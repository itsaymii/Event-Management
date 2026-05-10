import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  HelpCircle,
  Download,
  X,
  Users,
  Calendar as CalendarIcon
} from 'lucide-react';
import api from '../../utils/api';

const AdminEquipmentManagement = () => {
  const [equipment, setEquipment] = useState([]);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedEquipmentForBorrow, setSelectedEquipmentForBorrow] = useState(null);
  const [stats, setStats] = useState({
    total_equipment: 0,
    available: 0,
    borrowed: 0,
    maintenance: 0,
    damaged: 0,
  });

  // Form states
  const [formData, setFormData] = useState({
    equipment_id: '',
    equipment_name: '',
    description: '',
    category: '',
    status: 'available',
    condition: 'excellent',
    quantity_available: 1,
    quantity_total: 1,
    purchase_date: '',
    purchase_cost: '',
  });

  // Borrow form state
  const [borrowFormData, setBorrowFormData] = useState({
    quantity_borrowed: 1,
    expected_return_date: '',
    notes: '',
  });

  // Tabs
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    fetchEquipment();
    fetchStats();
    fetchBorrowedItems();
  }, [statusFilter]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/admin/equipment/', { params });
      setEquipment(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/equipment/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchBorrowedItems = async () => {
    try {
      const response = await api.get('/admin/equipment-borrow/currently_borrowed/');
      setBorrowedItems(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch borrowed equipment:', error);
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/equipment/${editingId}/`, formData);
      } else {
        await api.post('/admin/equipment/', formData);
      }
      resetForm();
      fetchEquipment();
      fetchStats();
    } catch (error) {
      console.error('Failed to save equipment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      equipment_id: '',
      equipment_name: '',
      description: '',
      category: '',
      status: 'available',
      condition: 'excellent',
      quantity_available: 1,
      quantity_total: 1,
      purchase_date: '',
      purchase_cost: '',
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEditEquipment = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleDeleteEquipment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      await api.delete(`/admin/equipment/${id}/`);
      fetchEquipment();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete equipment:', error);
    }
  };

  const handleBorrowClick = (item) => {
    setSelectedEquipmentForBorrow(item);
    setBorrowFormData({
      quantity_borrowed: 1,
      expected_return_date: '',
      notes: '',
    });
    setShowBorrowForm(true);
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!selectedEquipmentForBorrow) return;

    try {
      const response = await api.post('/admin/equipment-borrow/borrow_equipment/', {
        equipment_id: selectedEquipmentForBorrow.id,
        quantity_borrowed: borrowFormData.quantity_borrowed,
        expected_return_date: borrowFormData.expected_return_date,
        notes: borrowFormData.notes,
      });

      if (response.status === 201) {
        setShowBorrowForm(false);
        setSelectedEquipmentForBorrow(null);
        fetchEquipment();
        fetchStats();
        fetchBorrowedItems();
        alert('Equipment borrowed successfully!');
      }
    } catch (error) {
      console.error('Failed to borrow equipment:', error);
      alert(error.response?.data?.error || 'Failed to borrow equipment');
    }
  };

  const closeBorrowForm = () => {
    setShowBorrowForm(false);
    setSelectedEquipmentForBorrow(null);
    setBorrowFormData({
      quantity_borrowed: 1,
      expected_return_date: '',
      notes: '',
    });
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

  const getStatusIcon = (status) => {
    const icons = {
      available: <CheckCircle2 className="text-green-600" size={16} />,
      borrowed: <Clock className="text-blue-600" size={16} />,
      maintenance: <Wrench className="text-yellow-600" size={16} />,
      damaged: <AlertTriangle className="text-red-600" size={16} />,
    };
    return icons[status] || null;
  };

  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-green-50 text-green-600 border-green-100',
      borrowed: 'bg-blue-50 text-blue-600 border-blue-100',
      maintenance: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      damaged: 'bg-red-50 text-red-600 border-red-100',
    };
    return styles[status] || 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const filteredEquipment = equipment.filter((item) =>
    item.equipment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Loading State
  if (loading && equipment.length === 0) {
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
          <h1 className="text-2xl font-black text-slate-900">Equipment Management</h1>
          <p className="text-slate-500 mt-1">Manage inventory, track borrowing, and monitor maintenance</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-[0.98]"
        >
          <Plus size={20} strokeWidth={3} />
          Add Equipment
        </button>
      </div>

      {/* ✅ Stats Grid - Matches Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard 
          title="Total Equipment" 
          value={stats.total_equipment} 
          icon={<FileText className="text-slate-600" size={24} />}
          bgColor="bg-slate-50"
          borderColor="border-slate-100"
        />
        <StatCard 
          title="Available" 
          value={stats.available} 
          icon={<CheckCircle2 className="text-green-600" size={24} />}
          bgColor="bg-green-50"
          borderColor="border-green-100"
        />
        <StatCard 
          title="Borrowed" 
          value={stats.borrowed} 
          icon={<Clock className="text-blue-600" size={24} />}
          bgColor="bg-blue-50"
          borderColor="border-blue-100"
        />
        <StatCard 
          title="Maintenance" 
          value={stats.maintenance} 
          icon={<Wrench className="text-yellow-600" size={24} />}
          bgColor="bg-yellow-50"
          borderColor="border-yellow-100"
        />
        <StatCard 
          title="Damaged" 
          value={stats.damaged} 
          icon={<AlertTriangle className="text-red-600" size={24} />}
          bgColor="bg-red-50"
          borderColor="border-red-100"
        />
      </div>

      {/* ✅ Tabs - Matches Dashboard Style */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 p-1 w-fit">
        {['inventory', 'borrowed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab === 'inventory' ? 'Inventory' : 'Borrowed Items'}
          </button>
        ))}
      </div>

      {/* ✅ Add/Edit Form - Matches Dashboard Form Style */}
      {showAddForm && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">
              {editingId ? 'Edit Equipment' : 'Add New Equipment'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleAddEquipment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Equipment ID <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., AUD-001"
                value={formData.equipment_id}
                onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Equipment Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., Wireless Microphone"
                value={formData.equipment_name}
                onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <input
                type="text"
                placeholder="e.g., Audio, Visual, Stage"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
                <option value="maintenance">Maintenance</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                placeholder="Describe the equipment, specifications, usage guidelines..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Purchase Date</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quantity Total</label>
              <input
                type="number"
                value={formData.quantity_total}
                onChange={(e) => setFormData({ ...formData, quantity_total: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Purchase Cost (₱)</label>
              <input
                type="number"
                value={formData.purchase_cost}
                onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
                step="0.01"
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-[0.98]"
              >
                {editingId ? 'Update Equipment' : 'Add Equipment'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ✅ Borrow Form Modal */}
      {showBorrowForm && selectedEquipmentForBorrow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg">Borrow Equipment</h3>
              <button
                onClick={closeBorrowForm}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleBorrow} className="p-6 space-y-5">
              {/* Equipment Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Equipment</p>
                <p className="font-bold text-slate-900 text-lg mb-1">{selectedEquipmentForBorrow.equipment_name}</p>
                <p className="text-sm text-slate-600">ID: {selectedEquipmentForBorrow.equipment_id}</p>
                <p className="text-sm text-slate-600 mt-2">
                  Available: <span className="font-bold text-blue-600">{selectedEquipmentForBorrow.available_quantity}</span> / <span className="font-bold">{selectedEquipmentForBorrow.quantity_total}</span>
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Quantity to Borrow <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={borrowFormData.quantity_borrowed}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, quantity_borrowed: parseInt(e.target.value) || 1 })}
                  min="1"
                  max={selectedEquipmentForBorrow.available_quantity}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {borrowFormData.quantity_borrowed > selectedEquipmentForBorrow.available_quantity && (
                  <p className="text-red-600 text-sm mt-2">❌ Only {selectedEquipmentForBorrow.available_quantity} available</p>
                )}
              </div>

              {/* Expected Return Date */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Expected Return Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={borrowFormData.expected_return_date}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, expected_return_date: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notes</label>
                <textarea
                  value={borrowFormData.notes}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, notes: e.target.value })}
                  placeholder="Any special instructions or notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  rows={3}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeBorrowForm}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={borrowFormData.quantity_borrowed > selectedEquipmentForBorrow.available_quantity}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Borrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Search & Filter - Matches Dashboard Style */}
      {activeTab === 'inventory' && (
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search equipment ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all appearance-none"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="borrowed">Borrowed</option>
          <option value="maintenance">Maintenance</option>
          <option value="damaged">Damaged</option>
        </select>
      </div>
      )}

      {/* ✅ Equipment Inventory Table - Matches Dashboard Table Style */}
      {activeTab === 'inventory' && (
      <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-6">Equipment</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Condition</th>
                <th className="px-8 py-6">Quantity</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-12 h-12 text-slate-300" />
                      <p>No equipment found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <Wrench size={20} className="text-white/50" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight mb-0.5">{item.equipment_name}</p>
                          <p className="text-xs text-slate-400 font-mono">{item.equipment_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-600">{item.category || '-'}</td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-700 capitalize">{item.condition}</span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-700">
                      {item.quantity_available}/{item.quantity_total}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.available_quantity > 0 && (
                          <button
                            onClick={() => handleBorrowClick(item)}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-xs font-bold border border-blue-200"
                            title="Borrow"
                          >
                            Borrow
                          </button>
                        )}
                        <button
                          onClick={() => handleEditEquipment(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEquipment(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-white border-t border-slate-50 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredEquipment.length} of {equipment.length} items
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
      )}

      {/* ✅ Borrowed Equipment Table */}
      {activeTab === 'borrowed' && (
      <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-6">Equipment</th>
                <th className="px-8 py-6">Quantity</th>
                <th className="px-8 py-6">Borrow Date</th>
                <th className="px-8 py-6">Due Date</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {borrowedItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 className="w-12 h-12 text-green-300" />
                      <p>No equipment currently borrowed</p>
                    </div>
                  </td>
                </tr>
              ) : (
                borrowedItems.map((item) => {
                  const daysLeft = getDaysUntilDue(item.expected_return_date);
                  const isOverdue = item.is_overdue || daysLeft < 0;

                  return (
                    <tr 
                      key={item.id} 
                      className={`group hover:bg-slate-50/50 transition-colors ${isOverdue ? 'bg-red-50/30' : ''}`}
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
                      <td className="px-8 py-6 text-sm font-bold text-slate-700">
                        {item.quantity_borrowed}
                      </td>
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
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-red-50 text-red-600 border-red-100">
                            <AlertCircle size={12} />
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-blue-50 text-blue-600 border-blue-100">
                            <Clock size={12} />
                            {daysLeft}d left
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <a href="/admin/borrowed" className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-bold transition-colors border border-blue-200">
                          View Details
                        </a>
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
            Showing {borrowedItems.length} items
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
      )}
    </div>
  );
};

// ✅ StatCard Component - Matches Dashboard Style
const StatCard = ({ title, value, icon, bgColor, borderColor }) => (
  <div className={`${bgColor} ${borderColor} rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
    <div className="flex items-center justify-between mb-3">
      <div className="p-2.5 bg-white/70 rounded-xl">
        {icon}
      </div>
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-1">{value}</h3>
    <p className="text-sm text-slate-600 font-medium">{title}</p>
  </div>
);

export default AdminEquipmentManagement;
