export type Topic = 'DSA' | 'OS' | 'DBMS' | 'Networks' | 'OOP' | 'AI/ML' | 'Web Dev' | 'Career';
export type TopicFilter = Topic | 'All topics';
export type Language = 'Bangla + English' | 'English' | 'Bangla';
export type Role = 'user' | 'assistant';

export interface Attachment {
  name: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  attachments?: Attachment[];
  status?: 'streaming' | 'done' | 'error';
  feedback?: 'up' | 'down';
}

export interface Chat {
  id: string;
  title: string;
  topic: TopicFilter;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

/** Colored card shown inside an answer (e.g. the 4 Coffman conditions). */
export interface AnswerCard {
  title: string;
  sub?: string;
  color?: string;
}

export type ArtifactKind = 'code' | 'html' | 'document' | 'visual';

export interface VisualStep {
  low: number;
  high: number;
  mid: number;
  note: string;
  detail?: string;
  /** 1-based line number in `code` that should be highlighted for this step */
  codeLine?: number;
  found?: boolean;
}

export interface VisualData {
  subtitle?: string;
  array: number[];
  target?: number;
  steps: VisualStep[];
  code: string;
  language: string;
  complexity?: { time: string; space?: string };
}

/** Anything the AI produced that can be opened in the Visual Explainer panel. */
export interface Artifact {
  id: string;
  kind: ArtifactKind;
  title: string;
  filename: string;
  language: string;
  content: string;
  visual?: VisualData;
}
