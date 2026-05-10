import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-32 lg:pb-40">
      {/* Cinematic Background Accents */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-full -translate-x-1/2 [background:radial-gradient(50%_50%_at_50%_50%,#ecfeff_0%,rgba(255,255,255,0)_100%)] opacity-70" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          
          {/* Left Column: Content */}
          <div className="relative z-10 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/50 px-4 py-1.5 text-sm font-medium text-cyan-700 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-600"></span>
              </span>
              Built for modern campus teams
            </div>

            <div className="mt-8 space-y-6">
              <h1 className="text-5xl font-bold tracking-tight text-slate-950 sm:text-7xl">
                Reserve venues. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">
                  Approve faster.
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 font-medium">
                Ditch the paperwork. A role-based platform that unifies <span className="text-slate-900 font-semibold">Users, OSAS, and Property</span> into one seamless digital workflow.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a href="#get-started" className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-950 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-xl shadow-slate-200">
                <span className="relative z-10">Get started now</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-cyan-600 to-indigo-600 transition-transform duration-300 group-hover:translate-x-0" />
              </a>
              <a href="#capabilities" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50">
                View platform demo
              </a>
            </div>

            {/* Quick Stats/Trust Badges */}
            <div className="mt-12 flex items-center gap-8 border-t border-slate-100 pt-8">
              <div>
                <p className="text-2xl font-bold text-slate-900">100%</p>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Paperless</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-2xl font-bold text-slate-900">Real-time</p>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Tracking</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visuals */}
          <div className="relative order-1 lg:order-2">
            {/* The Main Image Container */}
            <div className="relative rounded-[2.5rem] border border-slate-200 bg-slate-100 p-2 shadow-2xl">
              <div className="overflow-hidden rounded-[2rem] bg-white">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                  alt="Dashboard Preview"
                  className="h-[400px] w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Floating UI Elements */}
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-xl backdrop-blur-md sm:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Request Approved</p>
                    <p className="text-[10px] text-slate-500">Venue: Main Auditorium</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-xl backdrop-blur-md sm:block">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-600" />
                  <p className="text-xs font-bold text-slate-900">Property: 12 Items Reserved</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}