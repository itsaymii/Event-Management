import React from 'react';

export default function CTASection() {
  return (
    <section id="get-started" className="relative mx-auto max-w-7xl px-6 pb-32 lg:px-8">
      {/* Container with Mesh Gradient */}
      <div className="relative overflow-hidden rounded-[3rem] mt-20 bg-slate-950 px-8 py-20 shadow-2xl lg:px-16">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-[500px] w-[500px] rounded-full bg-cyan-600/30 blur-[120px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[100px]" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Transform your process
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Ditch the sheets.<br /> 
              <span className="text-cyan-400">Own the flow.</span>
            </h2>
            <p className="max-w-xl text-lg leading-8 text-slate-400 font-medium">
              Join the campus teams already using <span className="text-white font-semibold">OSAS.Event</span> to accelerate approvals and keep property inventory 100% visible.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
            <a 
              href="#" 
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Get started — it’s free</span>
            </a>
            
            <a 
              href="#capabilities" 
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
            >
              Explore features
            </a>
          </div>
        </div>

        {/* Subtle Bottom Border Accent */}
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </div>

      {/* Floating Text Decor */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[12vw] font-black text-slate-50 opacity-[0.03] select-none pointer-events-none uppercase">
        Ready to start?
      </div>
    </section>
  );
}