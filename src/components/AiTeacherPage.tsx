import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Sparkles, 
  Brain, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  FileText, 
  Copy, 
  Check, 
  Lightbulb, 
  Code, 
  Compass, 
  HelpCircle, 
  Bot, 
  ArrowRight,
  Flame,
  Zap,
  BookOpen,
  GraduationCap,
  Trophy,
  CheckCircle2,
  Clock,
  ChevronDown,
  Target,
  FileCode,
  CornerDownLeft,
  MessageSquare
} from 'lucide-react';
import { Profile, Skill, RoadmapStep, UserProgress, TeacherMessage, AiTeacherResponse } from '../types';
import { supabase } from '../lib/supabase';

interface AiTeacherPageProps {
  currentUser: Profile | null;
  allSkills: Skill[];
  roadmapSteps: Record<string, RoadmapStep[]>;
  completedProgress: UserProgress[];
  onOpenAuthModal?: (options?: { title?: string; message?: string; badge?: string; intendedAction?: any }) => void;
  onViewMilestone?: (skillId: string, stepId?: string) => void;
  onStartChallenge?: (skill: Skill) => void;
  onBack?: () => void;
}

export const AiTeacherPage: React.FC<AiTeacherPageProps> = ({
  currentUser,
  allSkills,
  roadmapSteps,
  completedProgress,
  onOpenAuthModal,
  onViewMilestone,
  onStartChallenge,
  onBack
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Read query parameters from URL (?skill=...&step=...)
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlSkillId = queryParams.get('skill');
  const urlStepId = queryParams.get('step');

  // 2. Selected skill state
  const [selectedSkillId, setSelectedSkillId] = useState<string>(() => {
    if (urlSkillId && allSkills.some(s => s.id === urlSkillId)) {
      return urlSkillId;
    }
    return allSkills[0]?.id || 'skill-1787555255194';
  });

  // 3. Selected step focus state
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(urlStepId || undefined);

  // 4. Conversation state
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [revealedHintIds, setRevealedHintIds] = useState<Record<string, boolean>>({});
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state if URL query params change (e.g. user uses browser forward/back buttons)
  useEffect(() => {
    if (urlSkillId && allSkills.some(s => s.id === urlSkillId) && urlSkillId !== selectedSkillId) {
      setSelectedSkillId(urlSkillId);
    }
    if (urlStepId !== selectedStepId) {
      setSelectedStepId(urlStepId || undefined);
    }
  }, [urlSkillId, urlStepId, allSkills]);

  // Close skill dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSkillDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update URL helper when skill/step changes
  const updateUrlParams = useCallback((skillId: string, stepId?: string) => {
    const params = new URLSearchParams();
    if (skillId) params.set('skill', skillId);
    if (stepId) params.set('step', stepId);
    const searchStr = params.toString();
    navigate(`/ai-teacher${searchStr ? `?${searchStr}` : ''}`, { replace: true });
  }, [navigate]);

  // Change active skill
  const handleSelectSkill = (skillId: string) => {
    setSelectedSkillId(skillId);
    setSelectedStepId(undefined);
    setMessages([]);
    setError(null);
    setIsSkillDropdownOpen(false);
    updateUrlParams(skillId, undefined);
  };

  // Change active milestone step
  const handleSelectStep = (stepId?: string) => {
    setSelectedStepId(stepId);
    updateUrlParams(selectedSkillId, stepId);
  };

  // Resolve current skill and its roadmap steps
  const currentSkill = allSkills.find(s => s.id === selectedSkillId) || allSkills[0];
  const currentSteps = currentSkill ? (roadmapSteps[currentSkill.id] || []) : [];

  // Completed steps calculation for current user
  const userProgressForSkill = completedProgress.find(p => p.skill_id === selectedSkillId);
  const isCompleted = userProgressForSkill?.status === 'completed';
  const completedStepOrders = isCompleted
    ? currentSteps.map(s => s.step_order)
    : Array.isArray(userProgressForSkill?.steps_completed)
      ? userProgressForSkill.steps_completed
      : [];

  const completedCount = currentSteps.filter(s => completedStepOrders.includes(s.step_order)).length;
  const progressPercentage = currentSteps.length > 0 
    ? Math.min(100, Math.max(0, Math.round((completedCount / currentSteps.length) * 100)))
    : 0;

  // Mastery level label
  const masteryLevel = useMemo(() => {
    if (progressPercentage === 100 || isCompleted) return 'Mastered';
    if (progressPercentage >= 75) return 'Proficient';
    if (progressPercentage >= 40) return 'Developing';
    if (progressPercentage > 0) return 'Beginner';
    return 'Novice';
  }, [progressPercentage, isCompleted]);

  // Determine focal milestone step
  const focusedStep = useMemo(() => {
    if (selectedStepId) {
      const matched = currentSteps.find(s => s.id === selectedStepId);
      if (matched) return matched;
    }
    const nextIncomplete = currentSteps.find(s => !completedStepOrders.includes(s.step_order));
    return nextIncomplete || currentSteps[0] || null;
  }, [selectedStepId, currentSteps, completedStepOrders]);

  // Extract subtopics for focused step
  const focusedSubtopics = useMemo(() => {
    if (!focusedStep?.description) return [];
    return focusedStep.description.split('||').map(s => s.trim()).filter(Boolean);
  }, [focusedStep]);

  // Auto-scroll chat to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Copy code snippet to clipboard
  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    });
  };

  // Toggle hint accordion
  const toggleHint = (msgId: string) => {
    setRevealedHintIds(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  // Send message to AI Teacher
  const handleSendMessage = async (textToSend?: string, quickAction?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || isLoading) return;

    if (!currentUser) {
      if (onOpenAuthModal) {
        onOpenAuthModal({
          title: 'Login to Learn with AI Teacher',
          message: 'Log in to chat with your personalized Pragati curriculum tutor.',
          badge: 'AI Interactive Workspace',
          intendedAction: { type: 'ai_teacher', skillId: selectedSkillId, stepId: focusedStep?.id }
        });
      }
      return;
    }

    const userMessage: TeacherMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get Supabase Auth access token
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !sessionData?.session?.access_token) {
        throw new Error('Your session has expired. Please log in again to continue.');
      }
      const token = sessionData.session.access_token;

      // 2. Prepare past conversation history (last 6 turns)
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      // 3. Call backend endpoint
      const response = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skillId: selectedSkillId,
          currentStepId: focusedStep?.id,
          message: messageContent,
          conversationHistory,
          quickAction
        })
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || `Teacher service error (${response.status})`);
      }

      if (json.available === false && json.reason === 'ROADMAP_INCOMPLETE') {
        const teacherNotice: TeacherMessage = {
          id: `msg-teacher-${Date.now()}`,
          sender: 'teacher',
          text: json.message || `The curriculum for ${currentSkill.name} is currently being prepared. Check back soon!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          teaching_mode: 'general'
        };
        setMessages(prev => [...prev, teacherNotice]);
        return;
      }

      const teacherData: AiTeacherResponse = json.data;

      const aiMessage: TeacherMessage = {
        id: `msg-teacher-${Date.now()}`,
        sender: 'teacher',
        text: teacherData.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        teaching_mode: teacherData.teaching_mode,
        current_topic: teacherData.current_topic,
        related_step_id: teacherData.related_step_id,
        related_step_title: teacherData.related_step_title,
        practice_question: teacherData.practice_question,
        hint: teacherData.hint,
        code_snippet: teacherData.code_snippet,
        code_language: teacherData.code_language,
        verified_resources: teacherData.verified_resources,
        suggested_followups: teacherData.suggested_followups
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err: any) {
      console.error('[AiTeacherPage exception]:', err);
      setError(err?.message || 'Failed to communicate with AI Teacher. Please check your connection.');
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Helper function to safely format text with bold, inline code, and paragraphs
  const renderFormattedText = (content: string) => {
    if (!content) return null;

    const paragraphs = content.split('\n\n');

    return (
      <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100">
        {paragraphs.map((p, pIdx) => {
          const lines = p.split('\n');

          return (
            <p key={pIdx}>
              {lines.map((line, lIdx) => {
                const parts: React.ReactNode[] = [];
                let remaining = line;
                let k = 0;

                while (remaining.length > 0) {
                  const codeMatch = remaining.match(/`([^`]+)`/);
                  const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

                  if (codeMatch && (!boldMatch || codeMatch.index! < boldMatch.index!)) {
                    const before = remaining.slice(0, codeMatch.index);
                    if (before) parts.push(before);
                    parts.push(
                      <code key={k++} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-purple-100 dark:bg-purple-950/70 text-[#6c5ce7] dark:text-purple-300 font-mono text-[11px] font-semibold">
                        {codeMatch[1]}
                      </code>
                    );
                    remaining = remaining.slice(codeMatch.index! + codeMatch[0].length);
                  } else if (boldMatch) {
                    const before = remaining.slice(0, boldMatch.index);
                    if (before) parts.push(before);
                    parts.push(
                      <strong key={k++} className="font-extrabold text-slate-900 dark:text-white">
                        {boldMatch[1]}
                      </strong>
                    );
                    remaining = remaining.slice(boldMatch.index! + boldMatch[0].length);
                  } else {
                    parts.push(remaining);
                    break;
                  }
                }

                return (
                  <React.Fragment key={lIdx}>
                    {parts}
                    {lIdx < lines.length - 1 && <br />}
                  </React.Fragment>
                );
              })}
            </p>
          );
        })}
      </div>
    );
  };

  // Starter prompts when no messages exist yet
  const starterPrompts = useMemo(() => [
    {
      icon: BookOpen,
      title: 'Explain My Current Topic',
      query: `Explain ${focusedStep?.title || currentSkill?.name || 'this milestone'} simply with a real-world analogy.`,
      quickAction: 'simplify'
    },
    {
      icon: Code,
      title: 'Show a Practical Code Example',
      query: `Show me a clean, commented code example demonstrating ${focusedStep?.title || currentSkill?.name || 'this milestone'}.`,
      quickAction: 'example'
    },
    {
      icon: HelpCircle,
      title: 'Give Me a Practice Challenge',
      query: `Give me an interactive practice quiz challenge to test my understanding of ${focusedStep?.title || currentSkill?.name || 'this topic'}.`,
      quickAction: 'practice'
    },
    {
      icon: Lightbulb,
      title: 'Get a Conceptual Hint',
      query: `Give me a pedagogical hint on how to solve problems or master ${focusedStep?.title || currentSkill?.name || 'this topic'}.`,
      quickAction: 'hint'
    },
    {
      icon: Target,
      title: 'Teach from the Beginning',
      query: `Teach me ${currentSkill?.name || 'this skill'} from the absolute fundamentals step-by-step.`,
      quickAction: 'simplify'
    },
    {
      icon: Zap,
      title: 'Common Mistakes & Best Practices',
      query: `What are common pitfalls and industry best practices when working with ${focusedStep?.title || currentSkill?.name || 'this milestone'}?`,
      quickAction: 'general'
    }
  ], [focusedStep, currentSkill]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0b0d17] text-slate-900 dark:text-slate-100 transition-colors pb-20">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER / WORKSPACE BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#141726]/95 backdrop-blur-md border-b border-[#E8E4DC] dark:border-[#23273e] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Left: Back Button & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack ? onBack : () => navigate(-1)}
              className="p-2 sm:p-2.5 rounded-xl bg-[#F3F1EC] dark:bg-[#1c2035] hover:bg-[#e7e3d8] dark:hover:bg-[#252a45] text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs group"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#6c5ce7] to-[#8075ff] text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Pragati AI Teacher
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#6c5ce7] dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200/60 dark:border-purple-800/40">
                  <Sparkles className="w-3 h-3" />
                  Personal Learning Workspace
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                Learn smarter, practice better, and get guidance grounded in your Pragati roadmap.
              </p>
            </div>
          </div>

          {/* Right: Skill Dropdown & Reset Action */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Skill Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsSkillDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#181c30] border border-slate-200 dark:border-[#2b304c] text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-2xs hover:border-[#6c5ce7] dark:hover:border-[#6c5ce7] transition-all cursor-pointer"
                id="btn-ai-teacher-skill-selector"
                aria-expanded={isSkillDropdownOpen}
              >
                <span className="text-base">{currentSkill?.icon || '⚡'}</span>
                <span className="font-extrabold text-slate-900 dark:text-white max-w-[120px] sm:max-w-[160px] truncate">
                  {currentSkill?.name || 'Select Skill'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSkillDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isSkillDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-2xl bg-white dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] shadow-xl z-50 p-1.5 space-y-1 animate-scale-in">
                  <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Available Skill Tracks ({allSkills.length})
                  </div>
                  {allSkills.map(sk => {
                    const isSelected = sk.id === selectedSkillId;
                    return (
                      <button
                        key={sk.id}
                        type="button"
                        onClick={() => handleSelectSkill(sk.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isSelected 
                            ? 'bg-[#6c5ce7] text-white shadow-xs' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#20253e]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{sk.icon || '⚡'}</span>
                          <span className="truncate">{sk.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reset Thread Action */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#181c30] hover:bg-slate-200 dark:hover:bg-[#20253e] text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-[#2b304c] transition-all cursor-pointer shadow-2xs"
                title="Clear current conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Thread</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE CONTENT (2-COLUMN ON DESKTOP, STACKED ON MOBILE) */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ===================================================================== */}
          {/* LEFT COLUMN: CONVERSATION & AI TEACHING WORKSPACE (8 COLS) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-8 flex flex-col min-h-[680px] bg-white dark:bg-[#141726] border border-[#E8E4DC] dark:border-[#23273e] rounded-3xl shadow-sm overflow-hidden">
            
            {/* Top Contextual Banner */}
            <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-50/90 via-indigo-50/70 to-purple-50/90 dark:from-[#161a2e] dark:via-[#1e233d] dark:to-[#161a2e] border-b border-indigo-100 dark:border-[#23273e] flex items-center justify-between gap-3 flex-wrap shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                  Learning: <span className="text-[#6c5ce7] dark:text-purple-300">{currentSkill?.name}</span>
                </span>
                {focusedStep && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[220px] sm:max-w-[320px]" title={focusedStep.title}>
                      Focus: #{focusedStep.step_order} {focusedStep.title}
                    </span>
                  </>
                )}
              </div>

              {focusedStep && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-[#121524] px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <Target className="w-3 h-3 text-[#6c5ce7]" />
                  <span>Curriculum Grounded</span>
                </span>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[580px] sm:max-h-[640px] bg-[#FAF8F5]/40 dark:bg-[#0e111d]/50">
              
              {/* Empty State / Welcome Hero when no messages */}
              {messages.length === 0 && (
                <div className="py-4 sm:py-8 space-y-6">
                  
                  {/* Greeting Box */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-indigo-50/50 dark:from-[#181c32] dark:via-[#151829] dark:to-[#1c2038] border border-purple-100 dark:border-purple-900/30 shadow-xs space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#6c5ce7] text-white flex items-center justify-center shadow-md shadow-[#6c5ce7]/30">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          Welcome to AI Teacher{currentUser?.full_name ? `, ${currentUser.full_name.split(' ')[0]}` : ''}! 👋
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Your personal DIU CSE tutor for <span className="font-bold text-[#6c5ce7] dark:text-purple-300">{currentSkill?.name}</span>.
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      I understand your verified Pragati roadmap, completed milestones, and lecture notes. Ask me to break down difficult concepts, provide clean code examples, give you quick practice quizzes, or help you pass the milestone.
                    </p>

                    {focusedStep && (
                      <div className="pt-2 border-t border-purple-100 dark:border-purple-900/30 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-extrabold text-[#6c5ce7] dark:text-purple-300">Current Milestone:</span>
                        <span className="font-semibold">#{focusedStep.step_order} {focusedStep.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Starter Prompt Cards */}
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 pl-1">
                      Suggested Starting Prompts
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {starterPrompts.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(item.query, item.quickAction)}
                            disabled={isLoading}
                            className="p-3.5 rounded-2xl bg-white dark:bg-[#181c30] border border-slate-200/80 dark:border-[#262b47] hover:border-[#6c5ce7] dark:hover:border-[#6c5ce7] text-left transition-all group shadow-2xs hover:shadow-xs cursor-pointer flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#6c5ce7] dark:text-purple-300 group-hover:scale-105 transition-transform">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-[#6c5ce7] dark:group-hover:text-purple-300 transition-colors">
                                {item.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                              "{item.query}"
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* Message Thread */}
              {messages.map(msg => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5 max-w-full`}
                >
                  {/* Sender Name & Time */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 px-1">
                    {msg.sender === 'teacher' ? (
                      <>
                        <Bot className="w-3 h-3 text-[#6c5ce7]" />
                        <span className="text-[#6c5ce7] dark:text-purple-300 font-extrabold">Pragati AI Teacher</span>
                      </>
                    ) : (
                      <span>You</span>
                    )}
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble / Card */}
                  {msg.sender === 'user' ? (
                    <div className="max-w-[88%] sm:max-w-xl p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#6c5ce7] to-[#7d6dfa] text-white shadow-sm rounded-tr-xs text-xs sm:text-sm font-medium leading-relaxed">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="w-full max-w-2xl p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] shadow-xs rounded-tl-xs space-y-3.5">
                      
                      {/* Text Content */}
                      <div>
                        {renderFormattedText(msg.text)}
                      </div>

                      {/* Code Snippet Card (if returned) */}
                      {msg.code_snippet && (
                        <div className="rounded-2xl overflow-hidden border border-slate-700/60 bg-[#0f111a] dark:bg-[#0b0d14] text-slate-100 text-xs font-mono shadow-inner">
                          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-800/90 border-b border-slate-700/50 text-[11px] text-slate-400">
                            <span className="uppercase font-extrabold tracking-wider text-purple-300">
                              {msg.code_language || 'code'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(msg.code_snippet!, msg.id)}
                              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded-md hover:bg-slate-700/50"
                              title="Copy Code"
                            >
                              {copiedCodeId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed scrollbar-thin">
                            <code>{msg.code_snippet}</code>
                          </pre>
                        </div>
                      )}

                      {/* Practice Question Box */}
                      {msg.practice_question && (
                        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>Interactive Practice Challenge</span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                            {msg.practice_question}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleSendMessage(`Here is my solution/answer to the practice question: `)}
                            className="text-xs font-extrabold text-[#6c5ce7] dark:text-purple-300 hover:underline pt-1 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Answer this challenge</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Collapsible Hint Accordion */}
                      {msg.hint && (
                        <div className="border border-purple-200/80 dark:border-purple-900/50 rounded-2xl overflow-hidden bg-purple-50/50 dark:bg-purple-950/20">
                          <button
                            type="button"
                            onClick={() => toggleHint(msg.id)}
                            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-[#6c5ce7] dark:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Lightbulb className="w-4 h-4 text-amber-500" />
                              <span>{revealedHintIds[msg.id] ? 'Hide Teacher Hint' : '💡 Need a Hint? Click to reveal'}</span>
                            </span>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${revealedHintIds[msg.id] ? 'rotate-90' : ''}`} />
                          </button>

                          {revealedHintIds[msg.id] && (
                            <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-700 dark:text-slate-200 leading-relaxed border-t border-purple-100 dark:border-purple-900/30">
                              {msg.hint}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Verified Resources & Deep-link Row */}
                      {(msg.verified_resources && msg.verified_resources.length > 0 || msg.related_step_id) && (
                        <div className="pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100 dark:border-[#23273e]">
                          {/* Verified Doc / Google Drive Links */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {msg.verified_resources?.map((res, rIdx) => (
                              <a
                                key={rIdx}
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800 transition-colors shadow-2xs"
                                title={res.title}
                              >
                                <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                <span className="max-w-[160px] truncate">{res.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                              </a>
                            ))}
                          </div>

                          {/* View in Roadmap deep-link */}
                          {msg.related_step_id && onViewMilestone && (
                            <button
                              type="button"
                              onClick={() => onViewMilestone(selectedSkillId, msg.related_step_id)}
                              className="text-xs font-extrabold text-[#6c5ce7] dark:text-purple-300 hover:text-[#5848c2] inline-flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              <span>View Milestone in Roadmap</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Suggested Follow-ups */}
                      {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Suggested Next Questions
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggested_followups.map((promptText, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => handleSendMessage(promptText)}
                                disabled={isLoading}
                                className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#121424] hover:bg-purple-50 dark:hover:bg-[#1e223d] hover:text-[#6c5ce7] dark:hover:text-purple-300 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#262b47] transition-all cursor-pointer text-left"
                              >
                                <span>👉 {promptText}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5 max-w-md animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-[#6c5ce7]/10 dark:bg-[#6c5ce7]/20 text-[#6c5ce7] flex items-center justify-center font-bold shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-xs">
                    <Sparkles className="w-4 h-4 text-[#6c5ce7] animate-spin" />
                    <span>AI Teacher is analyzing curriculum & preparing response...</span>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendMessage(undefined)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shrink-0 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Toolbar */}
            <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-[#111422] border-t border-slate-200 dark:border-[#23273e] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 pl-1">
                Quick Actions:
              </span>

              <button
                type="button"
                onClick={() => handleSendMessage('Explain this concept simply with a real-world analogy.', 'simplify')}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#181c30] hover:bg-purple-50 dark:hover:bg-[#20253e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262b47] text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
              >
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>Explain Simply</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage('Show me a practical, commented code example for this milestone.', 'example')}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#181c30] hover:bg-purple-50 dark:hover:bg-[#20253e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262b47] text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
              >
                <Code className="w-3 h-3 text-blue-500" />
                <span>Code Example</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage('Give me an interactive practice challenge to test my understanding.', 'practice')}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#181c30] hover:bg-purple-50 dark:hover:bg-[#20253e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262b47] text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
              >
                <HelpCircle className="w-3 h-3 text-emerald-500" />
                <span>Practice Quiz</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage('Give me a hint for solving problems related to this milestone.', 'hint')}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#181c30] hover:bg-purple-50 dark:hover:bg-[#20253e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262b47] text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span>Get Hint</span>
              </button>
            </div>

            {/* Sticky Bottom Input Composer */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-[#141726] border-t border-slate-200 dark:border-[#262b47] shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={textareaRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Ask AI Teacher about ${focusedStep?.title || currentSkill?.name || 'this topic'}...`}
                    disabled={isLoading}
                    maxLength={2500}
                    className="w-full py-3 sm:py-3.5 pl-4 pr-10 rounded-2xl bg-slate-100 dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] focus:border-[#6c5ce7] dark:focus:border-[#6c5ce7] focus:outline-hidden text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#6c5ce7] hover:bg-[#5848c2] text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#6c5ce7]/30 transition-all cursor-pointer shrink-0 flex items-center justify-center"
                  aria-label="Send message to AI Teacher"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </form>

              <div className="flex items-center justify-between pt-2 px-1 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Grounded in Pragati curriculum · Zero hallucinated links</span>
                </span>
                <span className="hidden sm:inline">Press Enter to send</span>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: LEARNING CONTEXT & ROADMAP SIDEBAR (4 COLS) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Card 1: Skill Learning Context & Progress */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#141726] border border-[#E8E4DC] dark:border-[#23273e] shadow-xs space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#6c5ce7]/10 dark:bg-[#6c5ce7]/20 text-[#6c5ce7] flex items-center justify-center text-xl font-bold shadow-2xs">
                    {currentSkill?.icon || '⚡'}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {currentSkill?.name}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {currentSkill?.difficulty || 'Beginner'} Track
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-[#6c5ce7] dark:text-purple-300">
                    {progressPercentage}%
                  </span>
                  <div className="text-[10px] font-bold text-slate-400">
                    {masteryLevel}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-[#1c2035] overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#6c5ce7] to-[#8075ff] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>Completed: {completedCount} / {currentSteps.length} milestones</span>
                  <span>{isCompleted ? '🎉 Track Finished' : `${currentSteps.length - completedCount} remaining`}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                {onViewMilestone && (
                  <button
                    type="button"
                    onClick={() => onViewMilestone(selectedSkillId, focusedStep?.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#181c30] hover:bg-purple-50 dark:hover:bg-[#20253e] hover:text-[#6c5ce7] text-slate-800 dark:text-slate-200 text-xs font-black transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-[#2b304c] cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-[#6c5ce7]" />
                    <span>View in Roadmap</span>
                  </button>
                )}

                {onStartChallenge && currentSkill && (
                  <button
                    type="button"
                    onClick={() => onStartChallenge(currentSkill)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#7d6dfa] hover:from-[#5b4bc4] hover:to-[#6c5ce7] text-white text-xs font-black shadow-md shadow-[#6c5ce7]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Start Timed Challenge</span>
                  </button>
                )}
              </div>

            </div>

            {/* Card 2: Current Focus Milestone Details */}
            {focusedStep && (
              <div className="p-5 rounded-3xl bg-white dark:bg-[#141726] border border-[#E8E4DC] dark:border-[#23273e] shadow-xs space-y-3">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-[#6c5ce7] dark:text-purple-300 font-mono text-[11px] font-black">
                      #{focusedStep.step_order}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Current Milestone Focus
                    </span>
                  </div>

                  {completedStepOrders.includes(focusedStep.step_order) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
                      <Clock className="w-3 h-3" />
                      In Progress
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 leading-snug">
                    {focusedStep.title}
                  </h4>
                </div>

                {focusedSubtopics.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Topics in this milestone
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {focusedSubtopics.map((sub, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5 leading-tight">
                          <span className="text-[#6c5ce7] font-bold">•</span>
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {focusedStep.drive_link && (
                  <div className="pt-2 border-t border-slate-100 dark:border-[#23273e]">
                    <a
                      href={focusedStep.drive_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>Open Lecture Notes (Drive PDF)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

              </div>
            )}

            {/* Card 3: Curriculum Milestones Switcher */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#141726] border border-[#E8E4DC] dark:border-[#23273e] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#6c5ce7]" />
                  <span>Curriculum Milestones ({currentSteps.length})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">
                  Click to switch focus
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {currentSteps.map(step => {
                  const isSelected = (focusedStep?.id === step.id);
                  const isStepDone = completedStepOrders.includes(step.step_order);

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handleSelectStep(step.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#6c5ce7]/10 dark:bg-purple-950/60 text-[#6c5ce7] dark:text-purple-300 border border-[#6c5ce7]/30 font-extrabold' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1c2035] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[11px] text-slate-400">
                          #{step.step_order}
                        </span>
                        <span className="truncate">{step.title}</span>
                      </div>
                      {isStepDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
};
