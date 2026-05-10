import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Wrench,
  ChevronLeft,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Plus,
  Minus,
  Search
} from 'lucide-react';
import Logo from '../images/Logo.png';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const SubmitApplication = ({ onBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [allEquipment, setAllEquipment] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [showEquipmentList, setShowEquipmentList] = useState(false);

  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    start_time: '',
    end_time: '',
    end_date: '',
    venue: '',
    purpose: '',
    equipment: [],  // Array of {equipment_id, quantity}
    expected_attendees: '',
    estimated_budget: '',
    contact_person: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '',
    contact_email: user?.email || '',
    contact_phone: '',
    description: '',
    event_type: 'Conference',
  });

  // Fetch equipment from API
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setEquipmentLoading(true);
        const response = await api.get('/equipment/available/');
        const data = response.data;
        setAllEquipment(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch equipment:', err);
        setAllEquipment([]);
      } finally {
        setEquipmentLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const venueOptions = [
    'Main Auditorium',
    'Conference Room A',
    'Conference Room B',
    'Outdoor Grounds',
    'Multipurpose Hall',
    'Sports Complex',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEquipmentChange = (equipmentId) => {
    setFormData(prev => {
      const current = prev.equipment || [];
      const existingEquipment = current.find(eq => eq.equipment_id === equipmentId);
      
      if (existingEquipment) {
        // Remove equipment
        return {
          ...prev,
          equipment: current.filter(eq => eq.equipment_id !== equipmentId),
        };
      } else {
        // Add equipment with default quantity of 1
        return {
          ...prev,
          equipment: [...current, { equipment_id: equipmentId, quantity: 1 }],
        };
      }
    });
  };

  const handleEquipmentQuantityChange = (equipmentId, quantity) => {
    setFormData(prev => {
      const current = prev.equipment || [];
      return {
        ...prev,
        equipment: current.map(eq =>
          eq.equipment_id === equipmentId
            ? { ...eq, quantity: Math.max(1, parseInt(quantity) || 1) }
            : eq
        ),
      };
    });
  };

  const removeEquipmentItem = (equipmentId) => {
    setFormData(prev => ({
      ...prev,
      equipment: (prev.equipment || []).filter(eq => eq.equipment_id !== equipmentId),
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const validateForm = () => {
    if (!formData.event_name.trim())    { setError('Event Title is required'); return false; }
    if (!formData.event_date)           { setError('Event Date is required'); return false; }
    if (!formData.start_time)           { setError('Start Time is required'); return false; }
    if (!formData.venue)                { setError('Venue selection is required'); return false; }
    if (!formData.purpose.trim())       { setError('Purpose of Event is required'); return false; }
    if (!formData.contact_person.trim()) { setError('Contact Person is required'); return false; }
    if (!formData.contact_email.trim()) { setError('Contact Email is required'); return false; }
    if (!formData.contact_phone.trim()) { setError('Contact Phone is required'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('event_name', formData.event_name);
      formDataToSend.append('event_type', formData.event_type);
      formDataToSend.append('description', formData.purpose);
      formDataToSend.append('purpose', formData.purpose);

      // Date fields — send both for compatibility
      formDataToSend.append('event_date', formData.event_date);
      formDataToSend.append('start_date', formData.event_date);
      formDataToSend.append('end_date', formData.end_date || formData.event_date);

      // Time fields
      formDataToSend.append('start_time', formData.start_time);
      if (formData.end_time) formDataToSend.append('end_time', formData.end_time);

      // Venue fields — send both for compatibility
      formDataToSend.append('venue', formData.venue);
      formDataToSend.append('location', formData.venue);

      formDataToSend.append('expected_attendees', formData.expected_attendees || '0');
      formDataToSend.append('estimated_budget', formData.estimated_budget || '0');

      formDataToSend.append('contact_person', formData.contact_person);
      formDataToSend.append('contact_email', formData.contact_email);
      formDataToSend.append('contact_phone', formData.contact_phone);

      // Equipment — send as JSON string with equipment_id and quantity
      const equipmentJson = JSON.stringify(
        Array.isArray(formData.equipment) && formData.equipment.length > 0
          ? formData.equipment
          : []
      );
      formDataToSend.append('equipment', equipmentJson);

      // File attachments
      attachments.forEach((att) => {
        formDataToSend.append('document', att.file);
      });

      const response = await api.post('/applications/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Submission successful:', response.data);
      setSuccess(true);
      setTimeout(() => navigate('/applications'), 2000);

    } catch (err) {
      console.error('Submission error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-600 mb-6">Your event application has been successfully submitted.</p>
          <p className="text-sm text-slate-500">Redirecting to your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto mb-8">
        <button onClick={() => navigate('/applications')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
          <ChevronLeft size={20} /> Back to Applications
        </button>
        <div className="flex items-center gap-4 mb-6">
          <img src={Logo} alt="OSAS" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">Submit New Application</h1>
            <p className="text-slate-500 text-sm">Fill out the form below to submit your event request</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Event Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Event Details</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="event_name"
                value={formData.event_name}
                onChange={handleChange}
                placeholder="Enter a descriptive name for your event"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Venue & Purpose + Equipment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <MapPin className="text-orange-600" size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Venue & Purpose</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Venue Selection <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Select a preferred venue</option>
                    {venueOptions.map(venue => (
                      <option key={venue} value={venue}>{venue}</option>
                    ))}
                  </select>
                  <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-180 pointer-events-none" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Purpose of Event <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Explain the primary objective and expected outcomes of this event..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Wrench className="text-purple-600" size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Equipment</h2>
            </div>

            {/* Selected Equipment List */}
            {formData.equipment && formData.equipment.length > 0 && (
              <div className="mb-6 pb-6 border-b border-slate-200">
                <p className="text-xs text-slate-500 mb-3 font-bold uppercase tracking-wider">Selected Items ({formData.equipment.length})</p>
                <div className="space-y-2">
                  {formData.equipment.map((item) => {
                    const eq = allEquipment.find(e => e.id === item.equipment_id);
                    return eq ? (
                      <div key={item.equipment_id} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{eq.equipment_name}</p>
                          <p className="text-xs text-slate-600">{eq.equipment_id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleEquipmentQuantityChange(item.equipment_id, e.target.value)}
                            min="1"
                            className="w-12 px-2 py-1 text-sm border border-slate-300 rounded text-center outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => removeEquipmentItem(item.equipment_id)}
                            className="p-1 hover:bg-red-100 rounded transition text-red-600"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Equipment Search & Add */}
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Browse Equipment</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search equipment by name or ID..."
                  value={equipmentSearch}
                  onChange={(e) => {
                    setEquipmentSearch(e.target.value);
                    setShowEquipmentList(true);
                  }}
                  onFocus={() => setShowEquipmentList(true)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Available Equipment List */}
            {showEquipmentList && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                {equipmentLoading ? (
                  <div className="p-4 text-center text-slate-500">Loading equipment...</div>
                ) : (
                  <>
                    {allEquipment
                      .filter(eq =>
                        eq.equipment_name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                        eq.equipment_id.toLowerCase().includes(equipmentSearch.toLowerCase())
                      )
                      .map(eq => {
                        const isSelected = formData.equipment?.some(item => item.equipment_id === eq.id);
                        return (
                          <button
                            key={eq.id}
                            type="button"
                            onClick={() => {
                              handleEquipmentChange(eq.id);
                              setEquipmentSearch('');
                              setShowEquipmentList(false);
                            }}
                            className={`w-full text-left px-4 py-3 border-b border-slate-200 hover:bg-blue-50 transition flex items-center justify-between ${
                              isSelected ? 'bg-blue-100' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">{eq.equipment_name}</p>
                              <p className="text-xs text-slate-600">{eq.equipment_id} • {eq.category}</p>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="text-blue-600" size={20} />
                            ) : (
                              <Plus className="text-slate-400" size={20} />
                            )}
                          </button>
                        );
                      })}
                    {allEquipment.filter(eq =>
                      eq.equipment_name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                      eq.equipment_id.toLowerCase().includes(equipmentSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="p-4 text-center text-slate-500 text-sm">No equipment found</div>
                    )}
                  </>
                )}
              </div>
            )}

            {!showEquipmentList && allEquipment.length > 0 && (
              <div className="text-xs text-slate-500">
                {allEquipment.length} equipment available • Click search to browse
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="text-green-600" size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Additional Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Expected Attendees</label>
              <input
                type="number"
                name="expected_attendees"
                value={formData.expected_attendees}
                onChange={handleChange}
                placeholder="Number of attendees"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Estimated Budget (₱)</label>
              <input
                type="number"
                name="estimated_budget"
                value={formData.estimated_budget}
                onChange={handleChange}
                placeholder="Budget amount"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Attachments</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all"
            >
              <Upload size={40} className="text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium text-sm">Click to upload files</p>
              <p className="text-slate-400 text-xs mt-1">PDF, DOC, DOCX, JPG, PNG up to 10MB each</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{att.name}</p>
                        <p className="text-xs text-slate-500">{(att.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeAttachment(att.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500">Estimated review time: 3–5 business days</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/applications')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all flex items-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting...</>
              ) : (
                <>Submit Application <ChevronLeft size={18} className="rotate-180" /></>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SubmitApplication;