import React from 'react';
import { AlertTriangle, X, Trash2, ShieldAlert } from 'lucide-react';

interface CancelChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  skillName: string;
}

export const CancelChallengeModal: React.FC<CancelChallengeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  skillName
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 cursor-default"
      id="cancel-challenge-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-[#141726] border-2 border-rose-100 dark:border-[#23273e] text-slate-900 dark:text-white rounded-2xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-4 sm:gap-5"
        id="cancel-challenge-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Gradient Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-600 rounded-t-2xl"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#181c30] transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-center gap-4 pt-1 pr-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xl sm:text-2xl font-black shadow-xs shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Action Required
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              Cancel Challenge?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              For skill: <b className="text-rose-600 dark:text-rose-400 font-bold">{skillName}</b>
            </p>
          </div>
        </div>

        {/* Description & Note */}
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl p-4 text-rose-950 dark:text-rose-200 shadow-xs">
          <p className="text-sm font-black leading-snug mb-1 text-rose-900 dark:text-rose-200">
            Are you sure you want to cancel this challenge?
          </p>
          <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed font-medium">
            Cancelling will delete your progress for this skill and allow you to pick a new one anytime. No points will be lost.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 bg-white dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1e223d] transition-colors cursor-pointer"
            id="btn-keep-challenge"
          >
            Keep Challenge
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:flex-[1.5] py-2.5 sm:py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            id="btn-confirm-cancel-challenge"
          >
            <Trash2 className="w-4 h-4" />
            Yes, Cancel Challenge
          </button>
        </div>
      </div>
    </div>
  );
};
