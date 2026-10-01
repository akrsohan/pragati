import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Target, 
  BookOpen, 
  Trophy, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink, 
  Clock, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  FileText,
  Eye,
  Bot
} from 'lucide-react';
import { Profile, Skill, UserProgress, AiSkillGapAnalysis } from '../types';
import { supabase } from '../lib/supabase';

interface AiSkillGapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile | null;
  completedProgress: UserProgress[];
  allSkills: Skill[];
  onSelectSkill: (skillId: string) => void;
  onViewMilestone?: (skillId: string, stepId?: string) => void;
  onStartChallenge?: (skill: Skill) => void;
  onAskTeacher?: (skillId: string, stepId?: string) => void;
  initialSkillId?: string;
  onOpenAuthModal?: (options?: { title?: string; message?: string }) => void;
}

export const AiSkillGapModal: React.FC<AiSkillGapModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  completedProgress,
  allSkills,
  onSelectSkill,
  onViewMilestone,
  onStartChallenge,
  onAskTeacher,
  initialSkillId,
  onOpenAuthModal
}) => {
  // Current selected skill for gap analysis
  const [selectedSkillId, setSelectedSkillId] = useState<string>(() => {
    if (initialSkillId && allSkills.some(s => s.id === initialSkillId)) {
      return initialSkillId;
    }
    return allSkills[0]?.id || 'skill-1787555255194';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AiSkillGapAnalysis | null>(null);
  const [incompleteNotice, setIncompleteNotice] = useState<{ skillName: string; message: string } | null>(null);
  const [analysisCache, setAnalysisCache] = useState<Record<string, AiSkillGapAnalysis>>({});

  // Sync selectedSkillId when modal opens with initialSkillId
  useEffect(() => {
    if (isOpen) {
      if (initialSkillId && allSkills.some(s => s.id === initialSkillId)) {
        setSelectedSkillId(initialSkillId);
      } else if (!selectedSkillId && allSkills.length > 0) {
        setSelectedSkillId(allSkills[0].id);
      }
    }
  }, [isOpen, initialSkillId, allSkills]);

  // Execute AI Skill Gap Analysis via secure Express backend
  const executeAnalysis = useCallback(async (skillId: string, forceRefresh = false) => {
    if (!currentUser || !currentUser.id) {
      setIsLoading(false);
      return;
    }

    if (!skillId) return;

    // Check in-memory cache first if not forced
    if (!forceRefresh && analysisCache[skillId]) {
      setAnalysisResult(analysisCache[skillId]);
      setIncompleteNotice(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIncompleteNotice(null);

    try {
      // 1. Retrieve authenticated Supabase access token
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      
      if (sessionErr || !sessionData?.session?.access_token) {
        throw new Error('Your session has expired or is invalid. Please log in again.');
      }

      const accessToken = sessionData.session.access_token;

      // 2. Call backend proxy endpoint
      const response = await fetch('/api/analyze-skill-gap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ skillId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Server returned error (${response.status})`);
      }

      // 3. Handle Incomplete Roadmap Guard
      if (data.available === false && data.reason === 'ROADMAP_INCOMPLETE') {
        setIncompleteNotice({
          skillName: data.skillName || 'this skill',
          message: data.message || 'The curriculum for this skill is currently under curation.'
        });
        setAnalysisResult(null);
        return;
      }

      // 4. Set successful validated analysis
      if (data.available && data.data) {
        setAnalysisResult(data.data);
        setAnalysisCache(prev => ({
          ...prev,
          [skillId]: data.data
        }));
      } else {
        throw new Error('Invalid analysis format received from server.');
      }

    } catch (err: any) {
      console.error('[AiSkillGapModal analysis error]:', err);
      setError(err?.message || 'Failed to complete AI Skill Gap Analysis. Please check your connection and try again.');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, analysisCache]);

  // Trigger analysis when modal opens or selected skill changes
  useEffect(() => {
    if (isOpen && selectedSkillId && currentUser) {
      executeAnalysis(selectedSkillId);
    }
  }, [isOpen, selectedSkillId, currentUser, executeAnalysis]);

  if (!isOpen) return null;

  const currentSkillObj = allSkills.find(s => s.id === selectedSkillId) || allSkills[0];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60';
      case 'MEDIUM':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'LOW':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getMasteryBadgeColor = (level: string) => {
    switch (level) {
      case 'Mastered':
        return 'bg-emerald-500 text-white shadow-emerald-500/20';
      case 'Proficient':
        return 'bg-indigo-600 text-white shadow-indigo-600/20';
      case 'Developing':
        return 'bg-[#6c5ce7] text-white shadow-[#6c5ce7]/20';
      case 'Beginner':
        return 'bg-amber-500 text-white shadow-amber-500/20';
      default:
        return 'bg-slate-500 text-white shadow-slate-500/20';
    }
  };

  const handleViewMilestone = (stepId?: string) => {
    onClose();
    if (onViewMilestone) {
      onViewMilestone(selectedSkillId, stepId);
    } else {
      onSelectSkill(selectedSkillId);
    }
  };

  const handleStartChallenge = () => {
    onClose();
    if (onStartChallenge && currentSkillObj) {
      onStartChallenge(currentSkillObj);
    } else {
      onSelectSkill(selectedSkillId);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      id="ai-skill-gap-modal"
    >
      <div 
        className="w-full max-w-3xl bg-white dark:bg-[#141726] border border-slate-200 dark:border-[#262b47] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all transform animate-scale-in"
      >
        {/* Header */}
        <div className="relative p-5 sm:p-7 bg-gradient-to-r from-[#6c5ce7] via-[#7d6dfa] to-[#8075ff] text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md">
              <Brain className="w-3.5 h-3.5" />
              <span>AI Skill Gap Intelligence</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/25 text-emerald-100 text-[10px] font-bold border border-emerald-300/30">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              <span>Gemini 2.5 Flash</span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Personalized Career &amp; Skill Gap Report
          </h3>
          <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl leading-relaxed">
            {currentUser 
              ? `Grounded in Pragati's verified curriculum for ${currentUser.full_name || 'Student'} (${currentUser.department || 'CSE'} · ${currentUser.batch_number || 'General Batch'})`
              : 'Log in to evaluate your personal roadmap milestones and receive custom gap analysis.'}
          </p>
        </div>

        {/* Skill Selection Track Bar */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-[#101321] border-b border-slate-200 dark:border-[#23273e] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap pl-1 pr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#6c5ce7]" />
            <span>Select Track:</span>
          </span>

          <div className="flex items-center gap-1.5">
            {allSkills.map((sk) => {
              const isSelected = sk.id === selectedSkillId;
              const isCompleted = completedProgress.some(p => p.skill_id === sk.id && p.status === 'completed');

              return (
                <button
                  key={sk.id}
                  type="button"
                  onClick={() => {
                    setSelectedSkillId(sk.id);
                  }}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border ${
                    isSelected 
                      ? 'bg-[#6c5ce7] text-white border-[#6c5ce7] shadow-xs shadow-[#6c5ce7]/30 scale-102' 
                      : 'bg-white dark:bg-[#181c2e] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#262b47] hover:border-[#6c5ce7]/50 hover:bg-slate-100 dark:hover:bg-[#1f243c]'
                  }`}
                >
                  <span>{sk.icon || '⚡'}</span>
                  <span>{sk.name}</span>
                  {isCompleted && (
                    <CheckCircle2 className={`w-3 h-3 ${isSelected ? 'text-emerald-300' : 'text-emerald-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
          {/* Guest User Authentication Prompt */}
          {!currentUser ? (
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#6c5ce7]/10 dark:bg-[#6c5ce7]/20 text-[#6c5ce7] flex items-center justify-center mx-auto shadow-inner">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Authentication Required
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  To analyze your skill gaps, track completed milestones, and get tailored AI recommendations, please log in or create your Pragati account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAuthModal) {
                    onOpenAuthModal({
                      title: 'Login for AI Skill Gap Analyzer',
                      message: 'Log in to analyze your verified Pragati roadmap progress with Gemini.'
                    });
                  }
                }}
                className="px-6 py-2.5 bg-[#6c5ce7] hover:bg-[#5848c2] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-[#6c5ce7]/30 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Log In / Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : isLoading ? (
            /* Loading Shimmer State */
            <div className="py-12 px-6 rounded-3xl bg-slate-50/70 dark:bg-[#181c30]/50 border border-slate-200/80 dark:border-[#262b47] text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-[#6c5ce7]/20 border-t-[#6c5ce7] animate-spin" />
                <div className="absolute inset-2 rounded-full bg-[#6c5ce7]/10 flex items-center justify-center text-[#6c5ce7]">
                  <Brain className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <span>Analyzing {currentSkillObj?.name || 'Skill'} Milestones...</span>
                  <Sparkles className="w-4 h-4 text-[#6c5ce7] animate-spin" />
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Cross-referencing your completed tasks with Pragati's verified curriculum roadmap via Gemini 2.5 Flash.
                </p>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="p-6 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                    Analysis Error
                  </h4>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => executeAnalysis(selectedSkillId, true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Analysis</span>
                </button>
              </div>
            </div>
          ) : incompleteNotice ? (
            /* Incomplete Roadmap Guard Banner */
            <div className="p-7 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-amber-900 dark:text-amber-200">
                  Curriculum Under Admin Curation
                </h4>
                <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/90 mt-1.5 max-w-md mx-auto leading-relaxed">
                  {incompleteNotice.message}
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-900/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  Pragati Integrity Rule: No hallucinated steps
                </span>
              </div>
            </div>
          ) : analysisResult ? (
            /* Validated AI Report Content */
            <div className="space-y-6">
              
              {/* Readiness & Score Card */}
              <div className="p-5 rounded-2xl bg-[#F8F9FC] dark:bg-[#1a1e33] border border-slate-200 dark:border-[#262b47] space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6c5ce7] to-indigo-400 text-white flex flex-col items-center justify-center shadow-md shadow-[#6c5ce7]/30 shrink-0">
                      <span className="font-black text-lg leading-none">{analysisResult.match_percentage}%</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5 opacity-90">Match</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {analysisResult.target_skill_name} Track Readiness
                        </h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${getMasteryBadgeColor(analysisResult.mastery_level)}`}>
                          {analysisResult.mastery_level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {analysisResult.completed_milestones_count} of {analysisResult.total_milestones} curriculum milestones completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#121422] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#262b47]">
                      <Clock className="w-3.5 h-3.5 text-[#6c5ce7]" />
                      <span>~{analysisResult.estimated_hours_to_close_gap} hrs to goal</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => executeAnalysis(selectedSkillId, true)}
                      className="p-1.5 text-slate-400 hover:text-[#6c5ce7] rounded-lg hover:bg-slate-200 dark:hover:bg-[#23273e] transition-colors"
                      title="Re-analyze current progress"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="w-full bg-slate-200 dark:bg-[#111422] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#6c5ce7] to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, analysisResult.match_percentage)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Overall AI Summary Callout */}
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#6c5ce7] dark:text-purple-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-black uppercase tracking-wider text-[#6c5ce7] dark:text-purple-300">
                      AI Diagnostic Summary
                    </h5>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      {analysisResult.overall_gap_summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Immediate Recommendation Card */}
              {analysisResult.match_percentage < 100 && analysisResult.next_recommended_milestone && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#6c5ce7] text-white flex items-center justify-center shrink-0 font-extrabold text-sm shadow-xs">
                      #{analysisResult.next_recommended_step_order || 1}
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-wider text-[#6c5ce7] dark:text-purple-300">
                        Immediate Next Step
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {analysisResult.next_recommended_milestone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={() => handleViewMilestone(analysisResult.next_recommended_step_id)}
                      className="flex-1 sm:flex-initial px-3.5 py-2 bg-white dark:bg-[#181c2e] hover:bg-slate-100 dark:hover:bg-[#222842] text-[#6c5ce7] dark:text-purple-300 font-extrabold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800/60 shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Navigate directly to this milestone in the curriculum roadmap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Milestone</span>
                    </button>

                    {onAskTeacher && (
                      <button
                        type="button"
                        onClick={() => onAskTeacher(selectedSkillId, analysisResult.next_recommended_step_id)}
                        className="flex-1 sm:flex-initial px-3.5 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-[#6c5ce7] dark:text-purple-300 font-extrabold text-xs rounded-xl border border-purple-200 dark:border-purple-800/60 shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Open Pragati AI Teacher to learn and practice this milestone"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Ask AI Teacher</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleStartChallenge}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-[#6c5ce7] hover:bg-[#5848c2] text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow-md hover:shadow-[#6c5ce7]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Start timed skill sprint and beat the deadline"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Start Skill Challenge</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Detailed Skill Gaps List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#6c5ce7]" />
                    <span>Prioritized Curriculum Gaps ({analysisResult.skill_gaps.length})</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    Ranked by prerequisite priority
                  </span>
                </div>

                <div className="space-y-3">
                  {analysisResult.skill_gaps.length > 0 ? (
                    analysisResult.skill_gaps.map((gap, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] hover:border-[#6c5ce7]/60 transition-all space-y-2.5 shadow-2xs group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-[#121424] text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-[#262b47]">
                              #{gap.step_order}
                            </span>
                            <h5 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#6c5ce7] dark:group-hover:text-purple-300 transition-colors">
                              {gap.topic_title}
                            </h5>
                          </div>

                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${getPriorityColor(gap.priority)}`}>
                            {gap.priority} Priority
                          </span>
                        </div>

                        {/* Gap Reason */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                          <strong className="font-semibold text-slate-900 dark:text-white">Why it matters:</strong> {gap.gap_reason}
                        </p>

                        {/* Recommended Action */}
                        <div className="text-xs text-[#6c5ce7] dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/30 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40 leading-snug">
                          <span className="font-bold">Recommended action:</span> {gap.recommended_action}
                        </div>

                        {/* Verified Resource & Action Row */}
                        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                          <div>
                            {gap.verified_resource_url && (
                              <a
                                href={gap.verified_resource_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors shadow-2xs"
                              >
                                <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                <span>Verified Notes / Drive PDF</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                              </a>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleViewMilestone(gap.step_id)}
                            className="text-xs font-bold text-[#6c5ce7] dark:text-purple-300 hover:text-[#5848c2] dark:hover:text-purple-200 inline-flex items-center gap-1 cursor-pointer ml-auto"
                            title="Open and highlight this specific milestone in the roadmap"
                          >
                            <span>View Milestone</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-1.5">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <div className="text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
                        No Uncompleted Milestones in this Track!
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        You have mastered all published roadmap steps for {analysisResult.target_skill_name}.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mastered Strengths */}
              {analysisResult.key_strengths && analysisResult.key_strengths.length > 0 && (
                <div className="pt-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Verified Mastery in this Track ({analysisResult.key_strengths.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.key_strengths.map((str, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{str}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : null}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#111422] border-t border-slate-200 dark:border-[#262b47] flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Strictly grounded in Pragati admin-curated roadmap &amp; verified resources</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-[#1e2238] hover:bg-slate-300 dark:hover:bg-[#282d4a] text-slate-800 dark:text-white font-extrabold text-xs transition-colors cursor-pointer ml-auto"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
