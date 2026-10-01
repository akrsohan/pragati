import type { Topic } from './types';

export const GROUNDED_TEXT = "Grounded in Pragati's verified guidelines  ·  Zero hallucinated links";

export const TOPICS: { id: Topic; desc: string; color: string }[] = [
  { id: 'DSA', desc: 'Arrays, trees, graphs, algorithms', color: '#6366F1' },
  { id: 'OS', desc: 'Processes, memory, deadlock', color: '#F59E0B' },
  { id: 'DBMS', desc: 'SQL, normalization, transactions', color: '#10B981' },
  { id: 'Networks', desc: 'TCP/IP, routing, OSI model', color: '#0EA5E9' },
  { id: 'OOP', desc: 'Classes, inheritance, design', color: '#EC4899' },
  { id: 'AI/ML', desc: 'Models, data, learning', color: '#8B5CF6' },
  { id: 'Web Dev', desc: 'Frontend, backend, APIs', color: '#F97316' },
  { id: 'Career', desc: 'Internship, CV, interviews', color: '#14B8A6' },
];

export const topicColor = (t: string): string => TOPICS.find((x) => x.id === t)?.color ?? '#7C6CFF';

export type QuickActionId = 'explain' | 'code' | 'quiz' | 'hint';

export const QUICK_ACTIONS: {
  id: QuickActionId;
  label: string;
  color: string;
  /** used when the user already typed a question */
  prefix: string;
  /** used when there is no typed text but a chat already exists */
  follow: string;
}[] = [
  { id: 'explain', label: 'Explain Simply', color: '#F5A623', prefix: 'Explain simply: ', follow: 'Explain your last answer in a much simpler way, using an everyday analogy.' },
  { id: 'code', label: 'Code Example', color: '#3B82F6', prefix: 'Show a code example: ', follow: 'Show a short, complete code example for your last answer.' },
  { id: 'quiz', label: 'Practice Quiz', color: '#10B981', prefix: 'Give me a practice quiz question on: ', follow: 'Give me one practice quiz question on this topic. Do not reveal the answer yet.' },
  { id: 'hint', label: 'Get Hint', color: '#A855F7', prefix: 'Give me a hint (not the full answer) for: ', follow: 'Give me a hint for the last question, without revealing the full answer.' },
];

export const TRY_ASKING = [
  'How do I start competitive programming?',
  'Process vs thread',
  'Best final year project ideas',
];

export const LANGUAGES = ['Bangla + English', 'English', 'Bangla'] as const;
