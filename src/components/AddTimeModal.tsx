import React, { useState, useEffect } from 'react';
import { Clock, Plus, Minus, X, Calendar, Sparkles, Flame, Check } from 'lucide-react';

interface AddTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (extraDays: number, extraHours: number) => void;
  currentDeadline: string;
  skillName: string;
}

export const AddTimeModal: React.FC<AddTimeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentDeadline,
  skillName
}) => {
  const [extraDays, setExtraDays] = useState<number>(0);
  const [extraHours, setExtraHours] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setExtraDays(0);
      setExtraHours(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validDays = Math.max(0, isNaN(extraDays) ? 0 : extraDays);
  const validHours = Math.max(0, isNaN(extraHours) ? 0 : extraHours);
  const totalExtraHours = validDays * 24 + validHours;
  const isValid = totalExtraHours > 0;

  const baseDate = new Date(currentDeadline);
  const newDeadlineDate = new Date(baseDate.getTime() + totalExtraHours * 60 * 60 * 1000);
  
  const formattedNewDeadline = newDeadlineDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(validDays, validHours);
    onClose();
  };

  const presets = [
    { label: '+6 Hours', d: 0, h: 6, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50 border-cyan-300 text-cyan-800 hover:bg-cyan-100' },
    { label: '+12 Hours', d: 0, h: 12, color: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100' },
    { label: '+1 Day', d: 1, h: 0, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' },
    { label: '+2 Days', d: 2, h: 0, color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50 border-indigo-300 text-indigo-800 hover:bg-indigo-100' },
    { label: '+3 Days', d: 3, h: 0, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100' },
    { label: '+5 Days', d: 5, h: 0, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150 cursor-default"
      id="add-time-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-[#141726] border-2 border-emerald-100 dark:border-[#23273e] text-slate-900 dark:text-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full my-auto shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col gap-5"
        id="add-time-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#181c30] transition-colors cursor-pointer z-10"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Emerald Badge */}
        <div className="flex items-center gap-4 pt-1 pr-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black shadow-xs shrink-0">
            <Plus className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 inline-flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Deadline Extension
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              Add More Time
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Extend duration for <b className="text-emerald-700 dark:text-emerald-400 font-bold">{skillName}</b>
            </p>
          </div>
        </div>

        {/* Stepper Inputs for Days and Hours with Colorful Themes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Add Days Input Card (Teal/Emerald Theme) */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 sm:p-5 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-md">
                ADD DAYS
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+24 hrs / day</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setExtraDays(Math.max(0, validDays - 1))}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white dark:bg-[#181c30] border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-emerald-600 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 text-base"
                title="Decrease 1 day"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline justify-center gap-1.5 flex-1 min-w-0 py-1">
                <input 
                  id="input-extra-days"
                  type="number"
                  min="0"
                  max="90"
                  value={extraDays === 0 ? '' : extraDays}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setExtraDays(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-16 sm:w-20 text-center text-3xl sm:text-4xl font-black text-emerald-950 dark:text-white focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                  autoFocus
                />
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 shrink-0">days</span>
              </div>

              <button
                type="button"
                onClick={() => setExtraDays(validDays + 1)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 text-base"
                title="Increase 1 day"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add Hours Input Card (Cyan/Sky Theme) */}
          <div className="bg-cyan-50/60 dark:bg-cyan-950/30 p-4 sm:p-5 border border-cyan-200/80 dark:border-cyan-800/40 rounded-xl flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/60 px-2.5 py-1 rounded-md">
                ADD HOURS
              </span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">+1 hr each</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setExtraHours(Math.max(0, validHours - 1))}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white dark:bg-[#181c30] border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 font-black flex items-center justify-center hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-600 dark:hover:text-white hover:border-cyan-600 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 text-base"
                title="Decrease 1 hour"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline justify-center gap-1.5 flex-1 min-w-0 py-1">
                <input 
                  id="input-extra-hours"
                  type="number"
                  min="0"
                  max="48"
                  value={extraHours === 0 ? '' : extraHours}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setExtraHours(isNaN(val) ? 0 : Math.max(0, Math.min(48, val)));
                  }}
                  className="w-16 sm:w-20 text-center text-3xl sm:text-4xl font-black text-cyan-950 dark:text-white focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
                <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300 shrink-0">hours</span>
              </div>

              <button
                type="button"
                onClick={() => setExtraHours(Math.min(48, validHours + 1))}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-black flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 text-base"
                title="Increase 1 hour"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Colorful Quick Presets */}
        <div className="flex flex-col gap-2">
          <div className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-extrabold">
              <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Quick Presets:
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Tap to auto-fill</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {presets.map((btn) => {
              const isSelected = validDays === btn.d && validHours === btn.h;
              return (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => {
                    setExtraDays(btn.d);
                    setExtraHours(btn.h);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center leading-tight ${
                    isSelected
                      ? `bg-gradient-to-r ${btn.color} text-white border-transparent shadow-sm scale-102`
                      : `bg-slate-50 dark:bg-[#181c30] border-slate-200 dark:border-[#262b47] text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-500/50 shadow-xs`
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview of Extended Deadline */}
        <div className={`rounded-xl p-4 sm:p-5 transition-all shadow-xs ${
          isValid 
            ? 'bg-slate-900 dark:bg-[#101320] text-white border border-emerald-400/40' 
            : 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200'
        }`}>
          {isValid ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 text-sm sm:text-base font-bold">
                <span className="flex items-center gap-2 text-emerald-400">
                  <Clock className="w-4 h-4" /> Added Time:
                </span>
                <span className="text-base sm:text-lg font-black text-amber-300">
                  +{validDays > 0 ? `${validDays} Day${validDays > 1 ? 's' : ''} ` : ''}
                  {validHours > 0 ? `${validHours} Hour${validHours > 1 ? 's' : ''}` : ''}
                  {' '}(+{totalExtraHours} hours)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90 font-medium pt-2 border-t border-white/20">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>New Target: <b className="text-white font-bold">{formattedNewDeadline}</b></span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Enter or tap days/hours to add to this challenge.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-5 bg-white dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1e223d] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={handleConfirm}
            className={`w-full sm:flex-[1.6] py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              isValid 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:opacity-95' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
            }`}
            id="btn-confirm-add-time"
          >
            <Check className="w-4 h-4 text-white" />
            Add Time to Challenge
          </button>
        </div>
      </div>
    </div>
  );
};
