import React, { useState, useEffect } from 'react';
import { Skill } from '../types';
import { Clock, Check, X, Calendar, Sparkles, Plus, Minus, Trophy, Flame } from 'lucide-react';

interface DeadlineModalProps {
  skill: Skill;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (days: number, hours: number) => void;
  isCompleted?: boolean;
}

export const DeadlineModal: React.FC<DeadlineModalProps> = ({
  skill,
  isOpen,
  onClose,
  onConfirm,
  isCompleted = false
}) => {
  const [deadlineDays, setDeadlineDays] = useState<number>(0);
  const [deadlineHours, setDeadlineHours] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setDeadlineDays(0);
      setDeadlineHours(0);
    }
  }, [isOpen, skill.id]);

  if (!isOpen) return null;

  const validDays = Math.max(0, isNaN(deadlineDays) ? 0 : deadlineDays);
  const validHours = Math.max(0, isNaN(deadlineHours) ? 0 : deadlineHours);
  const totalHours = validDays * 24 + validHours;
  const isValidDuration = totalHours > 0;

  const estimatedEndDate = new Date(Date.now() + totalHours * 60 * 60 * 1000);
  const formattedEndDate = estimatedEndDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const handleQuickPreset = (presetDays: number, presetHours: number) => {
    setDeadlineDays(presetDays);
    setDeadlineHours(presetHours);
  };

  const handleConfirm = () => {
    if (!isValidDuration) return;
    onConfirm(validDays, validHours);
  };

  const skillColor = skill.bg_color || '#6c5ce7';

  // Colorful Presets with large, clear buttons
  const presets = [
    { label: '12 Hours', d: 0, h: 12, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50 border-cyan-300 text-cyan-800 hover:bg-cyan-100' },
    { label: '1 Day', d: 1, h: 0, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' },
    { label: '2 Days', d: 2, h: 0, color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50 border-indigo-300 text-indigo-800 hover:bg-indigo-100' },
    { label: '3 Days', d: 3, h: 0, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100' },
    { label: '5 Days', d: 5, h: 0, color: 'from-rose-500 to-amber-500', bg: 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100' },
    { label: '7 Days', d: 7, h: 0, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150 cursor-default" 
      id="deadline-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white border-2 border-indigo-100 rounded-md p-6 sm:p-8 max-w-2xl w-full my-auto shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col gap-5"
        id="deadline-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-gray-400 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer z-10"
          id="deadline-modal-close-btn"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section with Large Colorful Skill Badge */}
        <div className="flex items-center gap-4 pt-1 pr-8">
          <div 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-md flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-sm shrink-0"
            style={{ background: skillColor }}
          >
            {skill.icon || skill.name.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isCompleted ? (
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 inline-flex items-center gap-1 shadow-xs">
                  <Check className="w-3 h-3 text-emerald-600" /> Skill Mastered
                </span>
              ) : (
                <>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-indigo-600" /> Challenge Target
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 inline-flex items-center gap-1 shadow-xs">
                    <Trophy className="w-3 h-3 text-amber-500" /> +10 Points Reward
                  </span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1a1c2e] leading-tight tracking-tight">
              {isCompleted ? 'Skill Already Completed' : 'Set Your Deadline'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Target for <b className="text-indigo-600 font-bold">{skill.name}</b>
            </p>
          </div>
        </div>

        {isCompleted && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
            <Trophy className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">You have already completed the {skill.name} challenge!</p>
              <p className="text-emerald-700 text-xs mt-0.5">
                You earned +10 points for completing this curriculum. You cannot take this challenge again or add extra time to it. Please pick another roadmap!
              </p>
            </div>
          </div>
        )}

        {/* Stepper Inputs for Days and Hours with High Contrast & Big Typography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Days Input Card (Indigo Theme) */}
          <div className="bg-indigo-50/60 p-4 sm:p-5 border border-indigo-200 rounded-md flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded-sm">
                DAYS
              </span>
              <span className="text-xs font-bold text-indigo-600">24 hrs / day</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDeadlineDays(Math.max(0, validDays - 1))}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-white border border-indigo-200 text-indigo-700 font-black flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 text-base"
                title="Decrease 1 day"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline justify-center gap-1.5 flex-1 min-w-0 py-1">
                <input 
                  id="input-deadline-days"
                  type="number"
                  min="0"
                  max="90"
                  value={deadlineDays === 0 ? '' : deadlineDays}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDeadlineDays(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-16 sm:w-20 text-center text-3xl sm:text-4xl font-black text-indigo-950 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                  autoFocus
                />
                <span className="text-sm font-bold text-indigo-700 shrink-0">days</span>
              </div>

              <button
                type="button"
                onClick={() => setDeadlineDays(validDays + 1)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-indigo-600 text-white font-black flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 text-base"
                title="Increase 1 day"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hours Input Card (Rose/Amber Theme) */}
          <div className="bg-rose-50/60 p-4 sm:p-5 border border-rose-200 rounded-md flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-1 rounded-sm">
                HOURS
              </span>
              <span className="text-xs font-bold text-rose-600">0 - 23 hrs</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDeadlineHours(Math.max(0, validHours - 1))}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-white border border-rose-200 text-rose-700 font-black flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 text-base"
                title="Decrease 1 hour"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline justify-center gap-1.5 flex-1 min-w-0 py-1">
                <input 
                  id="input-deadline-hours"
                  type="number"
                  min="0"
                  max="23"
                  value={deadlineHours === 0 ? '' : deadlineHours}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDeadlineHours(isNaN(val) ? 0 : Math.max(0, Math.min(23, val)));
                  }}
                  className="w-16 sm:w-20 text-center text-3xl sm:text-4xl font-black text-rose-950 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
                <span className="text-sm font-bold text-rose-700 shrink-0">hours</span>
              </div>

              <button
                type="button"
                onClick={() => setDeadlineHours(Math.min(23, validHours + 1))}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-rose-600 text-white font-black flex items-center justify-center hover:bg-rose-700 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 text-base"
                title="Increase 1 hour"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Colorful Quick Presets */}
        <div className="flex flex-col gap-2">
          <div className="text-xs sm:text-sm font-bold text-gray-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-800 font-extrabold">
              <Flame className="w-4 h-4 text-amber-500" /> Quick Presets:
            </span>
            <span className="text-indigo-600 font-bold">Tap to auto-fill</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {presets.map((p) => {
              const isSelected = validDays === p.d && validHours === p.h;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleQuickPreset(p.d, p.h)}
                  className={`py-2 px-2 text-xs font-bold rounded-md border transition-all cursor-pointer text-center leading-tight ${
                    isSelected
                      ? `bg-gradient-to-r ${p.color} text-white border-transparent shadow-sm scale-102`
                      : `${p.bg} shadow-xs`
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Deadline Banner */}
        <div className={`rounded-md p-4 sm:p-5 transition-all shadow-xs ${
          isValidDuration 
            ? 'bg-[#161828] text-white border border-[#37f0ff]/50' 
            : 'bg-amber-50 border border-amber-300 text-amber-950'
        }`}>
          {isValidDuration ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 text-sm sm:text-base font-bold">
                <span className="flex items-center gap-2 text-[#37f0ff]">
                  <Clock className="w-4 h-4" /> Total Duration:
                </span>
                <span className="text-base sm:text-lg font-black text-amber-300">
                  {validDays > 0 ? `${validDays} Day${validDays > 1 ? 's' : ''} ` : ''}
                  {validHours > 0 ? `${validHours} Hour${validHours > 1 ? 's' : ''}` : ''}
                  {' '}({totalHours} hours total)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90 font-medium pt-2 border-t border-white/20">
                <Calendar className="w-3.5 h-3.5 text-[#37f0ff] shrink-0" />
                <span>Target Completion: <b className="text-white font-bold">{formattedEndDate}</b></span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Please select preset or enter at least 1 hour or 1 day for your challenge.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-5 bg-white border border-gray-300 rounded-md font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            id="btn-cancel-deadline"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isValidDuration || isCompleted}
            onClick={handleConfirm}
            className={`w-full sm:flex-[1.6] py-3 px-6 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
              isCompleted
                ? 'bg-emerald-600/80 text-white cursor-not-allowed'
                : isValidDuration 
                  ? 'bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white shadow-xs hover:opacity-95 cursor-pointer' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
            id="btn-confirm-deadline"
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Skill Already Completed (+10 XP)</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Confirm &amp; Start Challenge</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
