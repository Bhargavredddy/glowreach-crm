'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  Send, 
  BarChart3, 
  MessageSquare, 
  Flame,
  Github,
  Linkedin
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'AI Audience Builder', path: '/audience-builder', icon: Sparkles },
    { name: 'Campaign Builder', path: '/campaign-builder', icon: Send },
    { name: 'Campaign Analytics', path: '/campaign-analytics', icon: BarChart3 },
    { name: 'Campaign Copilot', path: '/copilot', icon: MessageSquare },
  ];

  return (
    <aside className="w-72 h-screen border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between fixed left-0 top-0 z-30">
      {/* Brand logo & header */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-brand-600 to-violet-600 rounded-xl shadow-lg shadow-brand-500/10 flex items-center justify-center">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
              GlowReach AI
            </span>
            <p className="text-[10px] text-brand-400 uppercase tracking-widest font-semibold mt-0.5">
              CRM Engine
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="mt-10 space-y-1.5">
          {menuItems.map(item => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3.5 px-4.5 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                    ? 'text-white bg-gradient-to-r from-brand-500/10 to-transparent border-l-2 border-brand-500 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {/* Background glow on hover */}
                <span className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.name}</span>

                {isActive && (
                  <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Connect Profile & Copyright Footer */}
      <div className="p-6 border-t border-slate-800/50 bg-slate-900/20 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Connect:</span>
          <div className="flex space-x-2.5">
            <a 
              href="https://github.com/Bhargavredddy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 hover:text-brand-400 text-slate-400 transition-colors shadow-sm"
              title="GitHub Profile"
            >
              <Github className="w-4.5 h-4.5" />
            </a>
            <a 
              href="https://www.linkedin.com/in/bhargav-reddyy/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 hover:text-brand-400 text-slate-400 transition-colors shadow-sm"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 text-center font-medium pt-1">
          © Developed by Bhargav 2026
        </div>
      </div>
    </aside>
  );
}
