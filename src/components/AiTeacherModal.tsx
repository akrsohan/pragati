import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
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
  BookOpen
} from 'lucide-react';
import { Profile, Skill, RoadmapStep, UserProgress, TeacherMessage, AiTeacherResponse } from '../types';
import { supabase } from '../lib/supabase';

interface AiTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile | null;
  allSkills: Skill[];
  initialSkillId?: string;
  initialStepId?: string;
  roadmapSteps: Record<string, RoadmapStep[]>;
  completedProgress: UserProgress[];
  onOpenAuthModal?: (options?: { title?: string; message?: string }) => void;
  onViewMilestone?: (skillId: string, stepId?: string) => void;
  onStartChallenge?: (skill: Skill) => void;
}

export const AiTeacherModal: React.FC<AiTeacherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allSkills,
  initialSkillId,
  initialStepId,
  roadmapSteps,
  completedProgress,
  onOpenAuthModal,
  onViewMilestone,
  onStartChallenge
}) => {
  // Current active skill
  const [selectedSkillId, setSelectedSkillId] = useState<string>(() => {
    if (initialSkillId && allSkills.some(s => s.id === initialSkillId)) {
      return initialSkillId;
    }
    return allSkills[0]?.id || 'skill-1787555255194';
  });

  // Current active step focus
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(initialStepId);

  // Chat conversation state
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [revealedHintIds, setRevealedHintIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);

  // Synchronize initialSkillId & initialStepId when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialSkillId && allSkills.some(s => s.id === initialSkillId)) {
        setSelectedSkillId(initialSkillId);
      }
      if (initialStepId) {
        setSelectedStepId(initialStepId);
      }
    }
  }, [isOpen, initialSkillId, initialStepId, allSkills]);

  // Current skill object and steps
  const currentSkill = allSkills.find(s => s.id === selectedSkillId) || allSkills[0];
  const currentSteps = currentSkill ? (roadmapSteps[currentSkill.id] || []) : [];

  // Completed steps calculation for current user
  const userProgressForSkill = completedProgress.find(p => p.skill_id === selectedSkillId);
  const completedStepOrders = userProgressForSkill?.status === 'completed'
    ? currentSteps.map(s => s.step_order)
    : Array.isArray(userProgressForSkill?.steps_completed)
      ? userProgressForSkill.steps_completed
      : [];

  // Focused step object
  const focusedStep = selectedStepId 
    ? currentSteps.find(s => s.id === selectedStepId) || currentSteps[0]
    : currentSteps.find(s => !completedStepOrders.includes(s.step_order)) || currentSteps[0];

  // Initialize welcoming teacher greeting when skill/modal opens and messages are empty
  useEffect(() => {
    if (isOpen && messages.length === 0 && currentSkill) {
      const stepName = focusedStep ? focusedStep.title : 'the fundamentals';
      const welcomeText = `Hello ${currentUser?.full_name ? currentUser.full_name.split(' ')[0] : 'there'}! 👋 I am your **Pragati AI Teacher**.\n\nI am currently teaching you **${currentSkill.name}**, focusing on **${stepName}**.\n\nAsk me anything! I can explain concepts simply, write code examples, give you a quick practice challenge, or provide hints. How can I help you learn today?`;

      setMessages([
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'teacher',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          teaching_mode: 'general',
          current_topic: focusedStep?.title || currentSkill.name,
          related_step_id: focusedStep?.id,
          related_step_title: focusedStep?.title,
          suggested_followups: [
            `Explain ${stepName} simply`,
            `Show a code example for ${stepName}`,
            `Give me a practice quiz question`
          ]
        }
      ]);
    }
  }, [isOpen, selectedSkillId, focusedStep, currentSkill, currentUser, messages.length]);

  // Auto-scroll chat to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, scrollToBottom]);

  // Copy code snippet to clipboard
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    });
  };

  // Toggle hint reveal
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
          message: 'Log in to chat with your personalized Pragati curriculum tutor.'
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
      console.error('[AiTeacherModal exception]:', err);
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
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {paragraphs.map((p, pIdx) => {
          const lines = p.split('\n');

          return (
            <p key={pIdx}>
              {lines.map((line, lIdx) => {
                // Parse markdown-style bold (**text**) and code (`code`)
                const parts: React.ReactNode[] = [];
                let remaining = line;
                let k = 0;

                while (remaining.length > 0) {
                  // Check for code blocks inline
                  const codeMatch = remaining.match(/`([^`]+)`/);
                  // Check for bold text
                  const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

                  if (codeMatch && (!boldMatch || codeMatch.index! < boldMatch.index!)) {
                    const before = remaining.slice(0, codeMatch.index);
                    if (before) parts.push(before);
                    parts.push(
                      <code key={k++} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-purple-100 dark:bg-purple-950/70 text-[#6c5ce7] dark:text-purple-300 font-mono text-[11px]">
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      id="ai-teacher-modal-backdrop"
    >
      <div 
        className="w-full max-w-4xl bg-white dark:bg-[#141726] border border-slate-200 dark:border-[#262b47] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[880px] transition-all transform animate-scale-in"
      >
        {/* 1. Modal Top Header */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-r from-[#6c5ce7] via-[#7d6dfa] to-[#8075ff] text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close AI Teacher"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md">
              <Bot className="w-3.5 h-3.5" />
              <span>Pragati AI Teacher</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/25 text-emerald-100 text-[10px] font-bold border border-emerald-300/30">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              <span>Personalized Curriculum Tutor</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pr-10">
            <div>
              <h3 className="text-lg sm:text-2xl font-black tracking-tight leading-tight flex items-center gap-2">
                <span>Interactive Learning Classroom</span>
              </h3>
              <p className="text-xs sm:text-sm text-white/90 mt-0.5 max-w-xl leading-relaxed">
                {currentUser 
                  ? `Mentoring ${currentUser.full_name || 'Student'} on verified DIU CSE milestones`
                  : 'Log in to save personalized curriculum context and progress'}
              </p>
            </div>

            {messages.length > 1 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-bold transition-all text-white/90 cursor-pointer"
                title="Clear current chat thread"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Track & Milestone Selector Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-[#101321] border-b border-slate-200 dark:border-[#23273e] flex items-center justify-between gap-3 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#6c5ce7]" />
              <span>Track:</span>
            </span>

            {/* Track selector chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {allSkills.map(sk => {
                const isSelected = sk.id === selectedSkillId;
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => {
                      setSelectedSkillId(sk.id);
                      setSelectedStepId(undefined);
                      setMessages([]);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer border ${
                      isSelected 
                        ? 'bg-[#6c5ce7] text-white border-[#6c5ce7] shadow-xs' 
                        : 'bg-white dark:bg-[#181c2e] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#262b47] hover:bg-slate-100 dark:hover:bg-[#20253e]'
                    }`}
                  >
                    <span>{sk.icon || '⚡'}</span>
                    <span>{sk.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Focus Milestone indicator */}
          {focusedStep && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-[#161a2e] px-2.5 py-1 rounded-xl border border-slate-200 dark:border-[#262b47] shrink-0 font-medium">
              <span className="font-extrabold text-[#6c5ce7] dark:text-purple-300">
                #{focusedStep.step_order}
              </span>
              <span className="max-w-[180px] truncate" title={focusedStep.title}>
                {focusedStep.title}
              </span>
            </div>
          )}
        </div>

        {/* 3. Messages Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FBFBFE] dark:bg-[#0e111d]">
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
                <div className="max-w-[85%] sm:max-w-xl p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#6c5ce7] to-[#7d6dfa] text-white shadow-md rounded-tr-xs text-xs sm:text-sm font-medium leading-relaxed">
                  {msg.text}
                </div>
              ) : (
                <div className="w-full max-w-2xl p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] shadow-xs rounded-tl-xs space-y-3.5">
                  {/* Text Content */}
                  <div className="text-slate-800 dark:text-slate-100">
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Code Snippet Card (if returned) */}
                  {msg.code_snippet && (
                    <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-[#0f111a] dark:bg-[#0b0d14] text-slate-100 text-xs font-mono shadow-inner">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/50 text-[11px] text-slate-400">
                        <span className="uppercase font-bold tracking-wider">{msg.code_language || 'code'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(msg.code_snippet!, msg.id)}
                          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedCodeId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3.5 overflow-x-auto whitespace-pre leading-normal">
                        <code>{msg.code_snippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Practice Question Box */}
                  {msg.practice_question && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Interactive Practice Challenge</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {msg.practice_question}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSendMessage(`Here is my answer to the practice question: `)}
                        className="text-[11px] font-extrabold text-[#6c5ce7] dark:text-purple-300 hover:underline pt-1 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Answer this question</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Collapsible Hint Accordion */}
                  {msg.hint && (
                    <div className="border border-purple-200/80 dark:border-purple-900/50 rounded-xl overflow-hidden bg-purple-50/40 dark:bg-purple-950/20">
                      <button
                        type="button"
                        onClick={() => toggleHint(msg.id)}
                        className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-[#6c5ce7] dark:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span>{revealedHintIds[msg.id] ? 'Hide Teacher Hint' : '💡 Need a Hint? Click to reveal'}</span>
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${revealedHintIds[msg.id] ? 'rotate-90' : ''}`} />
                      </button>

                      {revealedHintIds[msg.id] && (
                        <div className="px-3 pb-3 pt-1 text-xs text-slate-700 dark:text-slate-200 leading-relaxed border-t border-purple-100 dark:border-purple-900/30">
                          {msg.hint}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verified Resources & Roadmap Navigation Row */}
                  {(msg.verified_resources && msg.verified_resources.length > 0 || msg.related_step_id) && (
                    <div className="pt-1 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100 dark:border-[#23273e]">
                      {/* Verified PDF / Doc Links */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {msg.verified_resources?.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors shadow-2xs"
                            title={res.title}
                          >
                            <FileText className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                            <span className="max-w-[140px] truncate">{res.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                          </a>
                        ))}
                      </div>

                      {/* Deep-link to Roadmap Milestone button */}
                      {msg.related_step_id && onViewMilestone && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onViewMilestone(selectedSkillId, msg.related_step_id);
                          }}
                          className="text-[11px] font-extrabold text-[#6c5ce7] dark:text-purple-300 hover:text-[#5848c2] inline-flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Compass className="w-3 h-3" />
                          <span>View Milestone in Roadmap</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Suggested Follow-up Prompts */}
                  {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                    <div className="pt-1.5 space-y-1.5">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Suggested Follow-ups
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggested_followups.map((promptText, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleSendMessage(promptText)}
                            disabled={isLoading}
                            className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#121424] hover:bg-purple-50 dark:hover:bg-[#1e223d] hover:text-[#6c5ce7] dark:hover:text-purple-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#262b47] transition-all cursor-pointer text-left"
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

          {/* Loading Indicator Bubble */}
          {isLoading && (
            <div className="flex items-start gap-2.5 max-w-md animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-[#6c5ce7]/10 dark:bg-[#6c5ce7]/20 text-[#6c5ce7] flex items-center justify-center font-bold shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#6c5ce7] animate-spin" />
                <span>AI Teacher is preparing explanation...</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSendMessage(undefined)}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg text-[11px] shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. Quick Action Chips Bar */}
        <div className="px-4 py-2 bg-slate-50/80 dark:bg-[#111422] border-t border-slate-200 dark:border-[#23273e] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 pl-1">
            Quick Actions:
          </span>

          <button
            type="button"
            onClick={() => handleSendMessage('Explain this concept simply with a real-world analogy.', 'simplify')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#181c30] hover:bg-slate-100 dark:hover:bg-[#20253e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262b47] text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Explain Simply</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('Show me a practical code example for this milestone.', 'example')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#181c30] hover:bg-slate-100 dark:hover:bg-[#20253e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262b47] text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
          >
            <Code className="w-3 h-3 text-blue-500" />
            <span>Code Example</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('Give me a practice challenge question to test my understanding.', 'practice')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#181c30] hover:bg-slate-100 dark:hover:bg-[#20253e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262b47] text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3 text-emerald-500" />
            <span>Practice Quiz</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('Give me a hint for solving problems related to this milestone.', 'hint')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#181c30] hover:bg-slate-100 dark:hover:bg-[#20253e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262b47] text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>Get Hint</span>
          </button>
        </div>

        {/* 5. Chat Input Area */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#141726] border-t border-slate-200 dark:border-[#262b47] shrink-0">
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
                className="w-full py-2.5 sm:py-3 pl-4 pr-10 rounded-2xl bg-slate-100 dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] focus:border-[#6c5ce7] dark:focus:border-[#6c5ce7] focus:outline-hidden text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 sm:p-3 rounded-2xl bg-[#6c5ce7] hover:bg-[#5848c2] text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#6c5ce7]/30 transition-all cursor-pointer shrink-0 flex items-center justify-center"
              aria-label="Send message to AI Teacher"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 px-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Grounded in Pragati's verified curriculum · Zero hallucinated links</span>
            </span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>

      </div>
    </div>
  );
};
