import React, { useEffect } from 'react';
import { LogIn, UserPlus, X, Lock, Compass, Sparkles } from 'lucide-react';
import { PragatiiLogo } from './PragatiiLogo';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  badge?: string;
  onLogin: () => void;
  onSignUp: () => void;
  continueText?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  title = 'Login Required',
  message = 'Create an account or log in to start this challenge and track your progress.',
  badge = 'Pragatii Skill Hub',
  onLogin,
  onSignUp,
  continueText = 'Continue Exploring'
}) => {
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
      className="fixed inset-0 bg-black/65 dark:bg-black/85 backdrop-blur-xs z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150 cursor-default"
      id="auth-required-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="bg-white dark:bg-[#141726] border-2 border-indigo-100 dark:border-[#23273e] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 max-w-md w-full my-auto shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col gap-6"
        id="auth-required-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#181c30] transition-colors cursor-pointer"
          id="auth-modal-close-btn"
          title="Close dialog"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header Icon */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6c5ce7]/20 via-[#6c5ce7]/10 to-indigo-500/20 border border-[#6c5ce7]/30 flex items-center justify-center shadow-inner">
              <PragatiiLogo size={40} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[#6c5ce7] text-white flex items-center justify-center shadow-md">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-purple-950/60 text-[#6c5ce7] dark:text-purple-300 border border-indigo-100 dark:border-purple-800/40 mb-2 shadow-2xs">
            {badge}
          </span>

          <h3 
            id="auth-modal-title"
            className="text-xl sm:text-2xl font-black text-[#22252E] dark:text-white tracking-tight"
          >
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-2 leading-relaxed max-w-sm">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Sign Up / Create Account CTA */}
          <button
            type="button"
            onClick={onSignUp}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6c5ce7] via-[#7d6dfa] to-[#8075ff] hover:from-[#5b4bc4] hover:to-[#6c5ce7] text-white font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-[#6c5ce7]/30 hover:shadow-xl hover:shadow-[#6c5ce7]/40 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            id="auth-modal-signup-btn"
          >
            <UserPlus className="w-4.5 h-4.5" />
            <span>Sign Up</span>
          </button>

          {/* Log In Button */}
          <button
            type="button"
            onClick={onLogin}
            className="w-full py-3 px-5 rounded-2xl bg-[#F3F1EC] dark:bg-[#1c2035] hover:bg-[#eae7e0] dark:hover:bg-[#252a45] text-slate-800 dark:text-white border border-[#E8E4DC] dark:border-[#2a2f4c] font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            id="auth-modal-login-btn"
          >
            <LogIn className="w-4.5 h-4.5 text-[#6c5ce7] dark:text-purple-300" />
            <span>Log In</span>
          </button>

          {/* Continue Exploring / Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2 mt-1"
            id="auth-modal-continue-btn"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>{continueText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
