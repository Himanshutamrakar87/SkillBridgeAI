import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  HelpCircle,
  Award,
  Compass,
  LayoutDashboard,
  Menu,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ActiveTab } from '../types';

import { SkillBridgeLogo } from './SkillBridgeLogo';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  geminiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  geminiConnected,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Mentor', icon: Sparkles },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'explainer', label: 'Concept Explainer', icon: BookOpen },
    { id: 'quiz', label: 'Quiz Lab', icon: HelpCircle },
    { id: 'career', label: 'Career Roadmap', icon: Compass },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark with Unique Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-95"
              aria-label="SkillBridge AI Home"
            >
              <div className="p-1 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50/80 border border-indigo-100/80 group-hover:border-indigo-200 transition-colors shadow-2xs">
                <SkillBridgeLogo size={34} animated={true} />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1 leading-tight">
                  SkillBridge <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700">AI</span>
                </span>
                <span className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
                  Smart Learning Platform
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-line controls) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Status */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">
              {geminiConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">AI Assistant Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-700 font-medium">AI Offline</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleNavClick('assistant')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm hover:shadow-md shadow-indigo-500/20 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Mentor</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
          <div className="py-2 mb-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Student Learning Platform</span>
            <span className={geminiConnected ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
              {geminiConnected ? '● Online' : '● Offline'}
            </span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
