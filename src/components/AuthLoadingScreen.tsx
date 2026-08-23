import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { PragatiiLogo } from './PragatiiLogo';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0b12] text-white select-none px-4">
      {/* Background soft glow */}
      <div className="absolute w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      
      {/* Brand Icon & Spinner */}
      <div className="relative mb-6">
        <div className="flex items-center justify-center p-2">
          <PragatiiLogo size={80} />
        </div>
        <div className="absolute bottom-0 right-1 w-7 h-7 rounded-full bg-[#0a0b12] flex items-center justify-center border border-indigo-400/50 shadow-md">
          <RefreshCcw className="w-3.5 h-3.5 text-[#37f0ff] animate-spin" />
        </div>
      </div>

      {/* Title & Status */}
      <h2 className="text-xl font-extrabold tracking-tight text-white mb-2">
        Pragatii
      </h2>
      <p className="text-xs text-slate-400 tracking-wide animate-pulse font-medium">
        Verifying secure session &amp; learning profile...
      </p>
    </div>
  );
};
