import React, { useState, useRef, useEffect } from 'react';
import { PageType, Profile } from '../types';
import { getMainName } from '../lib/nameHelper';
import { PragatiiLogo } from './PragatiiLogo';
import { 
  Shield, 
  User, 
  LogOut, 
  CheckCircle, 
  Settings, 
  Flame, 
  Zap, 
  ChevronDown, 
  Compass, 
  LayoutDashboard, 
  Trophy, 
  Monitor, 
  MessageSquare,
  Sun,
  Moon,
  KeyRound
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageType;
  setCurrentPage?: (page: PageType) => void;
  onNavigate?: (page: PageType) => void;
  currentUser: Profile;
  onSignOut: () => void;
  onSelectUserForProfile?: (userId: string) => void;
  onOpenSendFeedback?: () => void;
  onOpenMyFeedback?: () => void;
  onOpenChangePassword?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  onNavigate,
  currentUser,
  onSignOut,
  onSelectUserForProfile,
  onOpenSendFeedback,
  onOpenMyFeedback,
  onOpenChangePassword,
  theme = 'light',
  onToggleTheme
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNav = (page: PageType) => {
    if (onNavigate) {
      onNavigate(page);
    } else if (setCurrentPage) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const navItems = [
    { id: 'discover' as PageType, label: 'Discover', icon: Compass },
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leaderboard' as PageType, label: 'Leaderboard', icon: Trophy },
  ];

  const isDark = theme === 'dark';

  return (
    <header 
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        isDark 
          ? 'bg-[#161828]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20' 
          : 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm shadow-slate-900/5'
      }`} 
      id="app-navbar-header"
    >
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4 sm:gap-6">
        
        {/* Brand Logo & Title */}
        <div 
          className="logo cursor-pointer hover:opacity-95 transition-all group flex items-center gap-3 select-none shrink-0" 
          onClick={() => {
            handleNav('discover');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          role="button"
          tabIndex={0}
          title="Go to Pragatii Home (Discover)"
          id="navbar-brand-logo"
        >
          <div className="shrink-0 flex items-center justify-center">
            <PragatiiLogo size={46} theme={theme} />
          </div>
          <div className="flex flex-col">
            <span className={`font-extrabold text-xl sm:text-2xl tracking-tight leading-none ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Pragatii
            </span>
            <span className={`text-[10px] sm:text-[11px] uppercase font-bold tracking-widest mt-1.5 ${
              isDark ? 'text-[#37f0ff]' : 'text-blue-600'
            }`}>
              Skill &amp; Growth Hub
            </span>
          </div>
        </div>

        {/* Main Desktop Navigation Links (Spacious, Single Line, Crisp Separation) */}
        <div 
          className={`hidden md:flex items-center gap-2.5 p-1.5 rounded-2xl border transition-colors ${
            isDark 
              ? 'bg-[#0e101a] border-white/10 shadow-inner' 
              : 'bg-slate-100/90 border-slate-200/90 shadow-inner'
          }`} 
          id="navbar-links"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button 
                key={item.id}
                type="button"
                className={`px-5 sm:px-6 py-2.5 rounded-xl text-sm sm:text-base font-extrabold transition-all flex items-center gap-2.5 select-none whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-[#6c5ce7] text-white shadow-md shadow-[#6c5ce7]/40 ring-1 ring-white/20' 
                    : isDark 
                      ? 'text-[#9ca3af] hover:text-white hover:bg-white/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
                onClick={() => handleNav(item.id)}
                id={`nav-link-${item.id}`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isActive ? 'text-white' : (isDark ? 'text-[#8a8ca3]' : 'text-slate-500')
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {currentUser.is_admin && (
            <button 
              type="button"
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm sm:text-base font-extrabold transition-all flex items-center gap-2 select-none whitespace-nowrap cursor-pointer ${
                currentPage === 'admin' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-1 ring-purple-300/30' 
                  : isDark
                    ? 'text-purple-300 hover:text-white hover:bg-purple-500/15'
                    : 'text-purple-700 hover:text-purple-900 hover:bg-purple-100/70'
              }`}
              onClick={() => handleNav('admin')}
              id="nav-link-admin"
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* Right Controls: Theme Toggle & User Avatar Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          
          {/* Dark / Light Mode Toggle Button */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border shadow-inner transition-all group focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer ${
                isDark 
                  ? 'bg-[#0e101a] hover:bg-white/10 border-white/10 text-white' 
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme mode"
              id="navbar-theme-toggle-btn"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>
          )}

          {/* User Avatar & Profile Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button 
              type="button"
              className="flex items-center gap-2.5 bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] hover:from-[#1e40af] hover:to-[#2563eb] text-white border border-white/20 rounded-full pl-1.5 pr-4 py-1.5 sm:py-2 transition-all shadow-lg shadow-blue-600/30 group focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              id="navbar-user-avatar-btn"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              {/* Avatar Icon */}
              {currentUser.avatar_url ? (
                <img 
                  src={currentUser.avatar_url} 
                  alt={currentUser.full_name} 
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-white/50 shadow-inner group-hover:scale-105 transition-transform" 
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-inner ring-2 ring-white/40 group-hover:scale-105 transition-transform">
                  {getInitials(currentUser.full_name)}
                </div>
              )}
              
              {/* Name */}
              <span className="text-sm font-black tracking-wide text-white uppercase leading-none select-none">
                {getMainName(currentUser.full_name)}
              </span>

              <ChevronDown className={`w-4 h-4 text-white/90 group-hover:text-white transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Clean Modern White Dropdown Menu (Matches Reference) */}
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-3 w-[calc(100vw-32px)] max-w-[320px] sm:w-[320px] bg-white border border-slate-100 rounded-[28px] shadow-2xl shadow-slate-950/25 p-5 sm:p-6 z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150"
                id="navbar-user-dropdown"
              >
                {/* User Profile Header */}
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight lowercase truncate">
                    {getMainName(currentUser.full_name)}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 lowercase tracking-wider mt-0.5 font-mono truncate">
                    {currentUser.email || 'mdsohanali636@gmail.com'}
                  </p>
                  
                  {/* Badges row: ADMIN, VERIFIED */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {currentUser.is_admin && (
                      <span className="px-3 py-1 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-[11px] font-black uppercase tracking-wider shadow-2xs">
                        ADMIN
                      </span>
                    )}
                    {currentUser.profile_completed ? (
                      <span className="px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] text-[11px] font-black uppercase tracking-wider shadow-2xs">
                        VERIFIED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[11px] font-bold uppercase tracking-wider">
                        SETUP REQUIRED
                      </span>
                    )}
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-3 space-y-1.5">
                  {/* Theme Mode Toggle in Dropdown */}
                  {onToggleTheme && (
                    <button 
                      type="button"
                      className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 text-slate-900 transition-all text-left group cursor-pointer"
                      onClick={() => {
                        onToggleTheme();
                      }}
                      id="dropdown-theme-toggle"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100/90 text-slate-800 flex items-center justify-center group-hover:bg-slate-200 transition-colors shrink-0">
                          {theme === 'dark' ? (
                            <Sun className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Moon className="w-5 h-5 text-indigo-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 uppercase">
                        {theme === 'dark' ? 'Dark' : 'Light'}
                      </span>
                    </button>
                  )}
                {/* My Dashboard */}
                <button 
                  type="button"
                  className="w-full flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-50 text-slate-900 transition-all text-left group cursor-pointer"
                  onClick={() => {
                    handleNav('dashboard');
                    setDropdownOpen(false);
                  }}
                  id="dropdown-dashboard"
                >
                  <div className="w-11 h-11 rounded-2xl bg-slate-100/90 text-slate-800 flex items-center justify-center group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors shrink-0">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                    My Dashboard
                  </div>
                </button>

                {/* Leaderboard */}
                <button 
                  type="button"
                  className="w-full flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-50 text-slate-900 transition-all text-left group cursor-pointer"
                  onClick={() => {
                    handleNav('leaderboard');
                    setDropdownOpen(false);
                  }}
                  id="dropdown-leaderboard"
                >
                  <div className="w-11 h-11 rounded-2xl bg-slate-100/90 text-slate-800 flex items-center justify-center group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                    Leaderboard
                  </div>
                </button>

                {/* Admin Portal (if admin) */}
                {currentUser.is_admin && (
                  <button 
                    type="button"
                    className="w-full flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-50 text-slate-900 transition-all text-left group cursor-pointer"
                    onClick={() => {
                      handleNav('admin');
                      setDropdownOpen(false);
                    }}
                    id="dropdown-admin-portal"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-slate-100/90 text-slate-800 flex items-center justify-center group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors shrink-0">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                      Admin Portal
                    </div>
                  </button>
                )}

                {/* My Public Profile */}
                <button 
                  type="button"
                  className="w-full flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-50 text-slate-900 transition-all text-left group cursor-pointer"
                  onClick={() => {
                    if (onSelectUserForProfile) onSelectUserForProfile(currentUser.id);
                    handleNav('profile');
                    setDropdownOpen(false);
                  }}
                  id="dropdown-my-profile"
                >
                  <div className="w-11 h-11 rounded-2xl bg-slate-100/90 text-slate-800 flex items-center justify-center group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                    My Public Profile
                  </div>
                </button>

                {/* Edit Profile Setup */}
                <button 
                  type="button"
                  className="w-full flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-50 text-slate-900 transition-all text-left group cursor-pointer"
                  onClick={() => {
                    handleNav('profile-setup');
                    setDropdownOpen(false);
                  }}
                  id="dropdown-edit-profile"
                >
                  <div className="w-11 h-11 rounded-2xl bg-slate-100/90 text-slate-800 flex items-center justify-center group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors shrink-0">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                    Edit Profile Setup
                  </div>
                </button>

                {/* Change Password */}
                <button 
                  type="button"
                  className="w-full flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-50 text-slate-900 transition-all text-left group cursor-pointer"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onOpenChangePassword) onOpenChangePassword();
                  }}
                  id="dropdown-change-password"
                >
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#6c5ce7] flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-[#5b4bc4] transition-colors shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                      Change Password
                    </span>
                    <span className="text-[11px] text-[#8a8ca3] font-medium">
                      Update account security
                    </span>
                  </div>
                </button>

                {/* Send Feedback */}
                <button 
                  type="button"
                  className="w-full flex items-center gap-3.5 p-2 rounded-2xl hover:bg-purple-50 text-slate-900 transition-all text-left group cursor-pointer"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onOpenSendFeedback) onOpenSendFeedback();
                  }}
                  id="dropdown-send-feedback"
                >
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-[#6c5ce7] flex items-center justify-center group-hover:bg-purple-100 transition-colors shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                      Send Feedback
                    </span>
                    <span className="text-[11px] text-[#8a8ca3] font-medium">
                      Share suggestions or ideas
                    </span>
                  </div>
                </button>

                {/* My Feedback History */}
                <button 
                  type="button"
                  className="w-full flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-50 text-slate-900 transition-all text-left group cursor-pointer"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onOpenMyFeedback) onOpenMyFeedback();
                  }}
                  id="dropdown-my-feedback"
                >
                  <div className="w-11 h-11 rounded-2xl bg-slate-100/90 text-slate-800 flex items-center justify-center group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                    My Feedback
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="pt-2 border-t border-slate-100">
                {/* LOG OUT */}
                <button 
                  type="button"
                  className="w-full flex items-center gap-3.5 p-2 rounded-2xl hover:bg-red-50/60 transition-all text-left group cursor-pointer"
                  onClick={() => {
                    setDropdownOpen(false);
                    onSignOut();
                  }}
                  id="dropdown-signout"
                >
                  <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-100 group-hover:text-red-600 transition-colors shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div className="font-black text-red-600 text-sm sm:text-base tracking-wider uppercase">
                    LOG OUT
                  </div>
                </button>
              </div>
            </div>
          )}
          </div>
        </div>

      </div>

      {/* Responsive Secondary Nav Bar (For mobile & smaller screens: smooth, spacious single horizontal line) */}
      <div 
        className={`md:hidden border-t px-4 py-2 flex items-center justify-start gap-2.5 overflow-x-auto no-scrollbar transition-colors ${
          isDark 
            ? 'border-white/10 bg-[#121422]' 
            : 'border-slate-200 bg-slate-50/95'
        }`} 
        id="mobile-navbar-links"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button 
              key={item.id}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 select-none whitespace-nowrap shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-[#6c5ce7] text-white shadow-md shadow-[#6c5ce7]/40 ring-1 ring-white/20' 
                  : isDark
                    ? 'text-[#9ca3af] hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              onClick={() => handleNav(item.id)}
              id={`mobile-nav-${item.id}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : (isDark ? 'text-[#8a8ca3]' : 'text-slate-500')}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {currentUser.is_admin && (
          <button 
            type="button"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 select-none whitespace-nowrap shrink-0 cursor-pointer ${
              currentPage === 'admin' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-1 ring-purple-300/30' 
                : isDark
                  ? 'text-purple-300 hover:text-white hover:bg-purple-500/15'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-purple-100'
            }`}
            onClick={() => handleNav('admin')}
            id="mobile-nav-admin"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin</span>
          </button>
        )}

        {onToggleTheme && (
          <button 
            type="button"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 select-none whitespace-nowrap shrink-0 cursor-pointer ml-auto ${
              isDark 
                ? 'text-amber-300 hover:text-white hover:bg-white/5' 
                : 'text-indigo-600 hover:text-indigo-900 hover:bg-slate-200/60'
            }`}
            onClick={onToggleTheme}
            id="mobile-nav-theme-toggle"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dark</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

