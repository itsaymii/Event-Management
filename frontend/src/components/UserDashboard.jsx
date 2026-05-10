import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Plus, 
  Search, 
  Bell, 
  Hourglass, 
  MoreVertical, 
  Pencil, 
  XCircle,
  MapPin,
  Clock
} from 'lucide-react';
import Logo from '../images/Logo.png';

const Dashboard = () => {
  const applications = [
    { id: 1, title: 'Creative Arts Mixer', date: 'Nov 12, 2024 • 18:00', venue: 'North Gallery', status: 'Pending', color: 'blue' },
    { id: 2, title: 'Product Launch Q4', date: 'Dec 05, 2024 • 10:00', venue: 'Main Auditorium', status: 'Approved', color: 'green' },
    { id: 3, title: 'Community Townhall', date: 'Oct 30, 2024 • 14:00', venue: 'Public Plaza', status: 'Rejected', color: 'red' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center gap-3">
          <img src={Logo} alt="OSAS" className="w-8 h-8 object-contain" />
          <span className="font-black text-xl tracking-tight">OSAS</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<FileText size={20} />} label="My Applications" />
          <NavItem icon={<Calendar size={20} />} label="Schedule" />
        </nav>

        <div className="p-4 mt-auto">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200">
            <Plus size={18} />
            Create Event
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Dashboard Overview</h2>
          <div className="flex items-center gap-6">
            <Search className="text-slate-400 cursor-pointer hover:text-slate-600" size={20} />
            <div className="relative">
              <Bell className="text-slate-400 cursor-pointer hover:text-slate-600" size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <img 
              src="https://ui-avatars.com/api/?name=Alexander+Reid&background=f1f5f9&color=0f172a" 
              alt="User" 
              className="w-10 h-10 rounded-full border border-slate-200 shadow-sm"
            />
          </div>
        </header>

        {/* Welcome Section */}
        <section className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome back, Alexander</h1>
            <p className="text-slate-500 font-medium">
              You have <span className="text-slate-900">3 active event applications</span> and 2 pending reviews for the upcoming season.
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-100">
            <Plus size={20} />
            Submit New Application
          </button>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard label="Total Applications" value="12" change="+24%" color="blue" />
          <StatCard label="Pending Approval" value="03" icon={<Hourglass className="text-blue-500" size={20} />} />
          <div className="bg-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4">Next Event Scheduled</p>
              <h3 className="text-xl font-bold mb-2">Global Tech Summit 2024</h3>
              <p className="text-sm opacity-90">October 24th • Main Auditorium</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          </div>
        </div>

        {/* Table Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm mb-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black">My Applications</h3>
            <button className="text-blue-600 font-bold text-sm hover:underline">View Archive →</button>
          </div>
          
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">
                <th className="text-left pb-4 font-black">Event Title</th>
                <th className="text-left pb-4 font-black">Date & Time</th>
                <th className="text-left pb-4 font-black">Venue</th>
                <th className="text-left pb-4 font-black">Status</th>
                <th className="text-right pb-4 font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applications.map((app) => (
                <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-${app.color}-50 text-${app.color}-600`}>
                        <FileText size={18} />
                      </div>
                      <span className="font-bold text-slate-900">{app.title}</span>
                    </div>
                  </td>
                  <td className="py-5 text-sm text-slate-500 font-medium">{app.date}</td>
                  <td className="py-5 text-sm text-slate-500 font-medium">{app.venue}</td>
                  <td className="py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-${app.color}-50 text-${app.color}-600 border border-${app.color}-100`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Pencil size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><XCircle size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Form Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-10 shadow-sm max-w-4xl mx-auto">
          <div className="mb-10">
            <h3 className="text-2xl font-black mb-2">Submit New Application</h3>
            <p className="text-slate-500 text-sm font-medium">Fill out the details below to request a new event booking.</p>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-6">
              <InputGroup label="Event Title" placeholder="e.g. Winter Networking Dinner" />
              <InputGroup label="Date & Time" type="datetime-local" />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Venue Location</label>
                <div className="relative group">
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm outline-none appearance-none cursor-pointer focus:bg-white focus:border-blue-500 transition-all">
                    <option>Main Auditorium</option>
                    <option>North Gallery</option>
                    <option>Public Plaza</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Purpose & Description</label>
                <textarea 
                  rows="4"
                  placeholder="Briefly describe the intent of this event..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm outline-none focus:bg-white focus:border-blue-500 transition-all resize-none"
                ></textarea>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Equipment Needs</label>
                <div className="flex flex-wrap gap-3">
                  {['PA System', 'Projector', 'Catering', 'Live Stream'].map(item => (
                    <label key={item} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 cursor-pointer hover:border-blue-300 transition-all">
                      <input type="checkbox" className="w-3 h-3 accent-blue-600" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button type="button" className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Save Draft</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all active:scale-95">
                Submit Application
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

// Reusable Components
const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
    active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
  }`}>
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

const StatCard = ({ label, value, change, icon }) => (
  <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm flex justify-between items-start">
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{label}</p>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-black text-slate-900">{value}</span>
        {change && (
          <span className="mb-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg">{change}</span>
        )}
      </div>
    </div>
    {icon}
  </div>
);

const InputGroup = ({ label, placeholder, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm outline-none focus:bg-white focus:border-blue-500 transition-all"
    />
  </div>
);

const ChevronDown = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

export default Dashboard;