import type { Artifact, Attachment, Chat, Language, TopicFilter } from '../types';
import { LANGUAGES, type QuickActionId } from '../constants';
import { Composer } from './Composer';
import { QuickActions } from './QuickActions';
import { MessageList } from './MessageList';
import { Icon } from './Icons';

interface Props {
  chat: Chat;
  topic: TopicFilter;
  onTopic: (t: TopicFilter) => void;
  language: Language;
  onLanguage: (l: Language) => void;
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  streaming: boolean;
  attachments: Attachment[];
  onAttach: (f: FileList) => void;
  onRemoveAttachment: (n: string) => void;
  focusTick: number;
  onQuickAction: (id: QuickActionId) => void;
  activeArtifactId: string | null;
  onOpenArtifact: (a: Artifact) => void;
  onFollowUp: (q: string) => void;
  onFeedback: (id: string, f: 'up' | 'down') => void;
  onMenu: () => void;
  menuClass: string;
  onClose?: () => void;
}

export function ChatView(p: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#FAF9FF] dark:bg-[#111122]">
      {/* Top Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-[#ECEAF8] dark:border-[#25243C] bg-white dark:bg-[#16162A] px-4 py-3 sm:px-6 shadow-xs">
        <button
          type="button"
          onClick={p.onMenu}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1EEFF] dark:bg-[#252345] text-[#6E5CF6] dark:text-[#A78BFA] transition hover:bg-[#E6E2FF] dark:hover:bg-[#322E58] cursor-pointer ${p.menuClass}`}
          aria-label="Open menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[16.5px] sm:text-[18px] font-bold text-[#18182E] dark:text-white leading-tight">
            Pragati AI Teacher
          </h1>
          <p className="hidden truncate text-[11.5px] text-[#7A78A0] dark:text-[#9A98BD] font-medium sm:block mt-0.5">
            Ask any CSE question — Concept explanations, code examples, quizzes, and career guidance.
          </p>
        </div>

        {/* Language selector */}
        <div className="relative hidden sm:block">
          <select
            value={p.language}
            onChange={(e) => p.onLanguage(e.target.value as Language)}
            className="appearance-none rounded-full border border-[#E4E0FA] dark:border-[#332F5C] bg-[#F3F0FF] dark:bg-[#232042] py-1.5 pl-3.5 pr-8 text-[11.5px] font-bold text-[#6E5CF6] dark:text-[#B4A2FF] outline-none transition hover:border-[#7C6CFF] cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l} className="bg-white dark:bg-[#1A1A2E] text-[#1B1B2F] dark:text-white">
                Language: {l}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6E5CF6] dark:text-[#B4A2FF]" />
        </div>

        {p.onClose && (
          <button
            type="button"
            onClick={p.onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1EEFF] dark:bg-[#252345] text-[#6E5CF6] dark:text-[#A78BFA] hover:bg-[#E6E2FF] dark:hover:bg-[#322E58] cursor-pointer transition"
          >
            <Icon name="close" className="h-4.5 w-4.5" />
          </button>
        )}
      </header>

      {/* Scrollable Message List */}
      <MessageList
        messages={p.chat.messages}
        activeArtifactId={p.activeArtifactId}
        onOpenArtifact={p.onOpenArtifact}
        onFollowUp={p.onFollowUp}
        onFeedback={p.onFeedback}
      />

      {/* Bottom Controls & Composer (Stable & Fixed) */}
      <div className="shrink-0 mx-auto w-full max-w-[860px] px-4 pb-4 pt-1 sm:pb-5">
        <div className="mb-2">
          <QuickActions onAction={p.onQuickAction} />
        </div>
        <Composer
          value={p.input}
          onChange={p.setInput}
          onSend={p.onSend}
          onStop={p.onStop}
          streaming={p.streaming}
          attachments={p.attachments}
          onAttach={p.onAttach}
          onRemoveAttachment={p.onRemoveAttachment}
          focusTick={p.focusTick}
        />
      </div>
    </div>
  );
}
