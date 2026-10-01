import React, { useEffect } from 'react';
import { LogIn, UserPlus, X, Lock, ArrowRight, Sparkles } from 'lucide-react';

export interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  title?: string;
  description?: string;
  secondaryDescription?: string;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSignUp,
  title = 'Login Required',
  description = 'Please log in to your Pragati account to access this feature.',
  secondaryDescription = 'Your progress, learning activity, and personalized features are available after you sign in.'
}) => {
  // Handle Escape key to dismiss without navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/65 dark:bg-black/85 backdrop-blur-md z-[100] overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200 cursor-default select-none"
      id="login-required-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-required-modal-title"
      aria-describedby="login-required-modal-desc"
    >
      <div 
        className="bg-white dark:bg-[#131627] border border-indigo-100/90 dark:border-[#242A45] text-slate-900 dark:text-white rounded-[28px] p-6 sm:p-8 max-w-[430px] w-full my-auto shadow-[0_20px_50px_rgba(20,20,60,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative animate-in zoom-in-95 duration-200 flex flex-col gap-6 overflow-hidden"
        id="login-required-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#6c5ce7]/12 via-indigo-500/5 to-transparent pointer-events-none" />

        {/* Top-Right Dismiss Button */}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-slate-100/80 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
          id="login-required-modal-close-btn"
          title="Close dialog"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Floating Lock Badge and Copy */}
        <div className="flex flex-col items-center text-center pt-2 relative z-10">
          {/* Lock Icon Container with Ambient Aura */}
          <div className="relative mb-4 flex items-center justify-center">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#6C5CE7]/30 via-indigo-400/20 to-purple-500/30 blur-md pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-white to-indigo-50/70 dark:from-[#1A1D2E] dark:to-[#171A2B] border border-indigo-100 dark:border-purple-900/40 flex items-center justify-center shadow-lg shadow-indigo-950/10 dark:shadow-black/50 relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#8B7CFF] text-white flex items-center justify-center shadow-md shadow-[#6C5CE7]/40 ring-1 ring-white/30">
                <Lock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <h3 
            id="login-required-modal-title"
            className="text-2xl sm:text-[25px] font-black text-[#1E202B] dark:text-white tracking-tight leading-tight"
          >
            {title}
          </h3>

          <p 
            id="login-required-modal-desc"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-2.5 max-w-[340px] leading-relaxed"
          >
            {description}
          </p>

          {secondaryDescription && (
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-[340px]">
              {secondaryDescription}
            </p>
          )}
        </div>

        {/* Exactly Three Primary Actions in Polished Visual Hierarchy */}
        <div className="flex flex-col gap-2.5 pt-1 relative z-10">
          {/* 1. PRIMARY: Login Button */}
          <button
            type="button"
            onClick={onLogin}
            className="group relative w-full h-13 sm:h-13.5 px-5 rounded-2xl bg-gradient-to-r from-[#6C5CE7] via-[#7B6CF8] to-[#8D80FF] hover:from-[#5C4BDC] hover:via-[#6C5CE7] hover:to-[#7E70FF] text-white font-extrabold text-[15px] sm:text-base tracking-wide flex items-center justify-between shadow-lg shadow-[#6C5CE7]/30 hover:shadow-xl hover:shadow-[#6C5CE7]/45 ring-1 ring-white/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer overflow-hidden"
            id="login-required-primary-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <LogIn className="w-4.5 h-4.5" />
              </div>
              <span>Log In</span>
            </div>
            <ArrowRight className="w-4.5 h-4.5 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>

          {/* 2. SECONDARY: Sign Up Button */}
          <button
            type="button"
            onClick={onSignUp}
            className="group w-full h-12 sm:h-12.5 px-5 rounded-2xl bg-white hover:bg-purple-50/60 dark:bg-[#181C2E] dark:hover:bg-[#20253E] text-slate-800 hover:text-[#6C5CE7] dark:text-slate-100 dark:hover:text-purple-300 border-2 border-slate-200 hover:border-[#6C5CE7]/50 dark:border-[#272D47] dark:hover:border-purple-500/40 font-extrabold text-sm sm:text-[15px] tracking-wide flex items-center justify-between shadow-2xs hover:shadow-md hover:shadow-purple-500/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer"
            id="login-required-signup-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserPlus className="w-4.5 h-4.5" />
              </div>
              <span>Create Account (Sign Up)</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C5CE7] dark:text-purple-300 opacity-80 group-hover:opacity-100">
              Free
            </span>
          </button>

          {/* 3. TERTIARY: Later (Dismisses without navigation) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="w-full h-10 px-4 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer text-center mt-1 rounded-xl hover:bg-slate-100/80 dark:hover:bg-white/5 active:scale-98"
            id="login-required-later-btn"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
