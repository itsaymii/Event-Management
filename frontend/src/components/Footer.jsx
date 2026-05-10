import React from 'react';

export default function Footer() {
  return (
    <footer id="contact" className="relative border-t border-slate-200 bg-white px-6 pt-24 pb-12 lg:px-8">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -z-10 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_0.6fr_0.6fr_0.6fr]">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-[10px] font-black tracking-tighter text-white">
                OS
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-950">
                OSAS<span className="text-cyan-600">.</span>Event
              </span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-slate-500 font-medium">
              Revolutionizing campus event coordination through transparency, automated workflows, and real-time asset tracking.
            </p>
            <div className="flex items-center gap-4">
              {['G', 'X', 'T'].map((social) => (
                <button key={social} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 transition-all hover:border-cyan-600 hover:text-cyan-600 hover:shadow-sm">
                  {social}
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {[
            { title: 'Product', links: ['Features', 'Workflow', 'Roles', 'Equipment'] },
            { title: 'Resources', links: ['Documentation', 'API Reference', 'Case Studies', 'Support'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] }
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900">{col.title}</p>
              <ul className="mt-6 space-y-4">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-500 transition-colors hover:text-cyan-600 font-medium">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col items-center justify-between gap-8 border-t border-slate-100 pt-10 sm:flex-row">
          <p className="text-xs font-medium text-slate-400">
            © 2026 OSAS Event Management. All rights reserved.
          </p>
          
          {/* Credits Badge */}
          <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-1.5 pr-5 transition-all hover:border-cyan-200 hover:bg-white hover:shadow-md hover:shadow-cyan-500/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-[10px] font-bold text-white transition-transform group-hover:rotate-12">
              AR
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold leading-none">Developed by</span>
              <span className="text-sm font-bold text-slate-900 leading-tight transition-colors group-hover:text-cyan-600">Aimee Rose</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}