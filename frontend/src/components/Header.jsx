// Header.jsx
import React from 'react';
import Logo from '../images/Logo.png';

export default function Header({ onLoginClick }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        
        {/* Logo Brand */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white transition-transform duration-300 group-hover:rotate-6">
            <img
              src={Logo}
              alt="Logo"
              className="h-7 w-7 rounded-full object-contain"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-950">
            OSAS<span className="text-cyan-600">.</span>Event
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {['Features', 'Workflow', 'Roles', 'Contact'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`} 
              className="relative py-1 transition-colors hover:text-slate-950 group"
            >
              {item}
              <span className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 bg-cyan-600 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        {/* Action Button */}
      <div className="flex items-center gap-4">
          <button 
            onClick={onLoginClick} // Dito i-trigger ang pag-open
            className="hidden text-sm font-semibold text-slate-600 transition hover:text-slate-950 sm:block"
          >
            Log in
          </button>
          
          <a 
            href="#get-started" 
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
          >
            Get started
          </a>
        </div>

      </div>
    </header>
  );
}
