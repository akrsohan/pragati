import React from 'react';
import { PageType, Profile, UserProgress } from '../types';
import { Compass, LayoutDashboard, Trophy, User, Shield, Flame, Settings } from 'lucide-react';

interface BottomNavProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  currentUser: Profile;
  activeProgress: UserProgress | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  activeProgress
}) => {
  // Hide on login/signup pages
  if (currentPage === 'login' || currentPage === 'signup') {
    return null;
  }

  const hasActiveChallenge = activeProgress && activeProgress.status === 'in_progress';

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const navItems = [
    {
      id: 'discover' as PageType,
      label: 'Discover',
      icon: Compass,
      badge: null
    },
    {
      id: 'dashboard' as PageType,
      label: 'Challenge',
      icon: LayoutDashboard,
      badge: hasActiveChallenge ? 'Active' : null,
      isPulse: hasActiveChallenge
    },
    {
      id: 'leaderboard' as PageType,
      label: 'Leaderboard',
      icon: Trophy,
      badge: null
    },
    {
      id: 'profile' as PageType,
      label: 'My Profile',
      icon: User,
      badge: null,
      isAvatar: true
    }
  ];

  if (currentUser.is_admin) {
    navItems.push({
      id: 'admin' as PageType,
      label: 'Admin',
      icon: Shield,
      badge: 'Admin'
    });
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#161828]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 shadow-2xl transition-all"
      id="app-bottom-navbar"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md md:max-w-xl mx-auto px-3 py-2 flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === 'profile' && currentPage === 'profile-setup');

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all select-none cursor-pointer flex-1 group ${
                isActive 
                  ? 'text-[#6c5ce7] dark:text-white bg-[#6c5ce7]/10 dark:bg-[#6c5ce7]/20 shadow-xs' 
                  : 'text-slate-500 dark:text-[#9ca3af] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
              id={`bottom-nav-${item.id}`}
            >
              {/* Active Highlight Top Pip */}
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-[#6c5ce7] to-[#37f0ff] rounded-full shadow-sm shadow-[#6c5ce7]" />
              )}

              {/* Icon / Avatar Wrapper */}
              <div className="relative flex items-center justify-center mb-1">
                {item.isAvatar && currentUser.avatar_url ? (
                  <img 
                    src={currentUser.avatar_url} 
                    alt={currentUser.full_name} 
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-2 ${
                      isActive ? 'ring-[#6c5ce7]' : 'ring-slate-300 dark:ring-white/30'
                    }`}
                  />
                ) : (
                  <Icon 
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#6c5ce7] dark:text-[#37f0ff]' : 'text-current'
                    }`} 
                  />
                )}

                {/* Pulse Notification dot for Active Sprint */}
                {item.isPulse && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-white dark:ring-[#161828]" />
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[11px] font-bold tracking-tight leading-tight ${
                isActive ? 'text-[#6c5ce7] dark:text-white font-extrabold' : 'text-slate-500 dark:text-[#9ca3af]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
