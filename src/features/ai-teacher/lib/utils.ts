import type { Chat } from '../types';

export const cn = (...c: Array<string | false | null | undefined>): string => c.filter(Boolean).join(' ');

export const uid = (): string => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const formatTime = (ts: number): string =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'file';

const EXT: Record<string, string> = {
  python: 'py', py: 'py', javascript: 'js', js: 'js', typescript: 'ts', ts: 'ts', tsx: 'tsx', jsx: 'jsx',
  java: 'java', c: 'c', cpp: 'cpp', 'c++': 'cpp', csharp: 'cs', html: 'html', css: 'css', json: 'json',
  sql: 'sql', bash: 'sh', sh: 'sh', markdown: 'md', md: 'md', text: 'txt',
};
export const extFor = (lang: string): string => EXT[lang.toLowerCase()] ?? 'txt';

export const mimeFor = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'html') return 'text/html';
  if (ext === 'json') return 'application/json';
  if (ext === 'md') return 'text/markdown';
  if (ext === 'css') return 'text/css';
  return 'text/plain';
};

export function groupChats(chats: Chat[]): { label: string; items: Chat[] }[] {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86_400_000;
  const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
  const groups = [
    { label: 'Today', items: sorted.filter((c) => c.updatedAt >= startToday) },
    { label: 'Yesterday', items: sorted.filter((c) => c.updatedAt >= startYesterday && c.updatedAt < startToday) },
    { label: 'Earlier', items: sorted.filter((c) => c.updatedAt < startYesterday) },
  ];
  return groups.filter((g) => g.items.length > 0);
}
