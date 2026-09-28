import React from 'react';
import { X, Sparkles, Brain, CheckCircle2, ArrowRight, Zap, Target, BookOpen, Trophy } from 'lucide-react';
import { Profile, Skill, UserProgress } from '../types';

interface AiSkillGapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile | null;
  completedProgress: UserProgress[];
  allSkills: Skill[];
  onSelectSkill: (skillId: string) => void;
}

export const AiSkillGapModal: React.FC<AiSkillGapModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  completedProgress,
  allSkills,
  onSelectSkill
}) => {
  if (!isOpen) return null;

  const completedSkillIds = new Set(completedProgress.map(p => p.skill_id));
  const completedList = allSkills.filter(s => completedSkillIds.has(s.id));
  const remainingSkills = allSkills.filter(s => !completedSkillIds.has(s.id));

  // Determine top recommendations
  const recommendedNext = remainingSkills.slice(0, 3);
  const readinessPercentage = Math.min(100, Math.max(15, (completedList.length / Math.max(1, allSkills.length)) * 100));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      id="ai-skill-gap-modal"
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#141726] border border-slate-200 dark:border-[#262b47] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all transform animate-scale-in"
      >
        {/* Header */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-r from-[#6c5ce7] via-[#7d6dfa] to-[#8075ff] text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md mb-2.5">
            <Brain className="w-3.5 h-3.5" />
            <span>AI Skill Gap Intelligence</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Personalized Career Gap Report
          </h3>
          <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-lg leading-relaxed">
            Tailored analysis for {currentUser?.full_name || 'Student'} ({currentUser?.department || 'DIU'} · {currentUser?.batch_number || 'General Batch'})
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6">
          
          {/* Readiness Metric Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F9FC] dark:bg-[#1a1e33] border border-slate-200 dark:border-[#262b47] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6c5ce7] to-indigo-400 text-white flex items-center justify-center shadow-md shadow-[#6c5ce7]/30 shrink-0 font-black text-base">
                {Math.round(readinessPercentage)}%
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Curriculum Readiness</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {completedList.length} of {allSkills.length} Track Milestones Mastered
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1 text-[#6c5ce7] dark:text-purple-300">
                <Zap className="w-4 h-4 fill-current" />
                {currentUser?.points || 0} pts
              </span>
              <span className="flex items-center gap-1 text-orange-500">
                <Trophy className="w-4 h-4" />
                {currentUser?.current_streak || 0}d streak
              </span>
            </div>
          </div>

          {/* AI Recommended Next Sprints */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#6c5ce7]" />
                Top Priority Gap Recommendations
              </h4>
              <span className="text-[11px] font-bold text-[#6c5ce7] dark:text-purple-300">AI Suggested</span>
            </div>

            <div className="space-y-2.5">
              {recommendedNext.length > 0 ? (
                recommendedNext.map((sk) => (
                  <div
                    key={sk.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] hover:border-[#6c5ce7] dark:hover:border-[#6c5ce7] transition-all flex items-center justify-between gap-3 shadow-2xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-2xs shrink-0"
                        style={{ background: sk.bg_color || '#6c5ce7', color: '#fff' }}
                      >
                        {sk.icon || '⚡'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#6c5ce7] dark:group-hover:text-purple-300 transition-colors truncate">
                          {sk.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{sk.difficulty || 'Sprint'}</span>
                          <span>•</span>
                          <span className="text-[#6c5ce7] dark:text-purple-300 font-bold">+10 pts reward</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectSkill(sk.id);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#6c5ce7]/10 dark:bg-purple-950/60 hover:bg-[#6c5ce7] text-[#6c5ce7] dark:text-purple-300 hover:text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>Start Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  🎉 Fantastic! You have completed all currently catalogued roadmap tracks!
                </div>
              )}
            </div>
          </div>

          {/* Mastered Skills Showcase */}
          {completedList.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Verified Mastered Skills ({completedList.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {completedList.map(sk => (
                  <span
                    key={sk.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                  >
                    <span>{sk.icon || '✓'}</span>
                    <span>{sk.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#111422] border-t border-slate-200 dark:border-[#262b47] flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Updated automatically from your completed challenges and milestones.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-[#1e2238] hover:bg-slate-300 dark:hover:bg-[#282d4a] text-slate-800 dark:text-white font-extrabold text-xs transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
