import React from 'react';

const capabilities = [
  { title: 'Instant approvals', desc: 'Reduce review time with automated status updates.' },
  { title: 'Inventory control', desc: 'Assign equipment, track hand-offs, and avoid shortages.' },
  { title: 'Smart notifications', desc: 'Keep requestors informed at every step.' },
  { title: 'Role-based access', desc: 'Give each team the tools they need without clutter.' },
];

export default function CapabilitiesSection() {
  return (
    <section id="capabilities" className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 overflow-hidden">
      {/* Decorative Blur Background */}
      <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-cyan-50/50 blur-3xl" />
      
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        
        {/* Left Side: Content */}
        <div className="order-2 lg:order-1 space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-100 bg-cyan-50/50 px-4 py-2 text-sm font-bold text-cyan-700 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-600"></span>
            </span>
            Trusted by Campus Organizers
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">run an event.</span>
            </h2>
            <p className="max-w-xl text-lg leading-8 text-slate-600 font-medium">
              From application to approval to equipment hand-off, this system connects students, OSAS, and property managers in one streamlined digital ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a href="#workflow" className="rounded-full bg-slate-950 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 active:scale-95">
              Request a demo
            </a>
            <div className="flex -space-x-3 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="inline-block h-10 w-10 rounded-full border-2 border-white bg-slate-100 ring-2 ring-transparent transition-transform hover:scale-110">
                   <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" className="rounded-full" />
                </div>
              ))}
              <div className="flex h-10 items-center justify-center pl-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                +12 Teams
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visuals & Grid */}
        <div className="order-1 lg:order-2 space-y-6">
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-2 shadow-2xl transition-all duration-500 hover:shadow-cyan-500/10">
            <div className="overflow-hidden rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
                alt="Team collaborating"
                className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            {/* Glassmorphism Overlay */}
            <div className="absolute left-8 top-8 max-w-[280px] rounded-2xl border border-white/20 bg-white/80 p-5 shadow-xl backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">Live Insights</p>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-950">
                Venue availability and schedules in one centralized view.
              </p>
            </div>
          </div>

          {/* Feature Mini-Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((item) => (
              <div 
                key={item.title} 
                className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-50/50"
              >
                <div className="mb-4 h-1.5 w-8 rounded-full bg-slate-200 transition-all group-hover:w-12 group-hover:bg-cyan-500" />
                <p className="text-sm font-bold text-slate-950">{item.title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500 font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}