import type { Artifact, Attachment, Chat, Language, TopicFilter } from '../types';
import { LANGUAGES, type QuickActionId } from '../constants';
import { Composer } from './Composer';
import { QuickActions } from './QuickActions';
import { TopicChips } from './TopicChips';
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
    <div className="flex h-full min-h-0 flex-col bg-[#FAF9FF]">
      <header className="flex items-center gap-3 border-b border-[#ECEAF8] bg-white px-4 py-3 sm:px-6">
        <button type="button" onClick={p.onMenu} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1EEFF] text-[#7C6CFF] cursor-pointer ${p.menuClass}`} aria-label="Open menu">
          <Icon name="menu" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-bold text-[#1B1B2F] sm:text-[19px]">Pragati AI Teacher</h1>
          <p className="hidden truncate text-[11px] text-[#7A78A0] sm:block">Ask any CSE question. Answers are grounded in Pragati's verified guidelines.</p>
        </div>
        <label className="relative hidden sm:block">
          <span className="sr-only">Language</span>
          <select
            value={p.language}
            onChange={(e) => p.onLanguage(e.target.value as Language)}
            className="appearance-none rounded-full bg-[#F1EEFF] py-1.5 pl-4 pr-8 text-[11px] font-bold text-[#7C6CFF] outline-none cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>Language: {l}</option>
            ))}
          </select>
          <Icon name="chevronDown" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7C6CFF]" />
        </label>
        {p.onClose && (
          <button type="button" onClick={p.onClose} aria-label="Close" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1EEFF] text-[#7C6CFF] hover:bg-[#E6E2FF] cursor-pointer">
            <Icon name="close" />
          </button>
        )}
      </header>

      <div className="mx-auto w-full max-w-[900px] px-4 pt-3">
        <TopicChips value={p.topic} onChange={p.onTopic} />
      </div>

      <MessageList messages={p.chat.messages} activeArtifactId={p.activeArtifactId} onOpenArtifact={p.onOpenArtifact} onFollowUp={p.onFollowUp} onFeedback={p.onFeedback} />

      <div className="mx-auto w-full max-w-[900px] px-4 pb-4 pt-2">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#8A88AE]">Quick actions</div>
        <div className="mb-3">
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
