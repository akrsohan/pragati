import { TOPICS, TRY_ASKING, GROUNDED_TEXT, type QuickActionId } from '../constants';
import type { Attachment, Topic } from '../types';
import { BotAvatar } from './BotAvatar';
import { Composer } from './Composer';
import { QuickActions } from './QuickActions';
import { Icon } from './Icons';

interface Props {
  userName: string;
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
  onPickTopic: (t: Topic) => void;
  onAsk: (q: string) => void;
  onMenu: () => void;
  menuClass: string;
  onClose?: () => void;
}

export function HomeView(p: Props) {
  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#FAF9FF]">
      <div className="flex items-center justify-between px-4 pt-4">
        <button type="button" onClick={p.onMenu} className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#7C6CFF] shadow-sm cursor-pointer ${p.menuClass}`} aria-label="Open menu">
          <Icon name="menu" />
        </button>
        <span />
        {p.onClose && (
          <button type="button" onClick={p.onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EEFF] text-[#7C6CFF] hover:bg-[#E6E2FF] cursor-pointer">
            <Icon name="close" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[860px] flex-col items-center px-4 pb-8 pt-4 sm:pt-10">
          <BotAvatar size={64} />
          <h1 className="mt-5 text-center text-[28px] font-extrabold leading-tight text-[#1B1B2F] sm:text-[32px]">Hello {p.userName}</h1>
          <h2 className="text-center text-[26px] font-extrabold leading-tight text-[#7C6CFF] sm:text-[32px]">What do you want to learn today?</h2>
          <p className="mt-3 text-center text-[13px] text-[#7A78A0]">Ask anything about CSE: concepts, code, exams, projects or career.</p>

          <div className="mt-6 w-full">
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
          <div className="mt-4">
            <QuickActions onAction={p.onQuickAction} centered />
          </div>

          <div className="mt-10 w-full">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#8A88AE]">Explore by topic</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => p.onPickTopic(t.id)}
                  className="rounded-2xl border border-[#E6E4F5] bg-white p-4 text-left shadow-[0_6px_18px_rgba(27,27,80,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(27,27,80,0.1)] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-bold" style={{ backgroundColor: `${t.color}29`, color: t.color }}>
                      {t.id.charAt(0)}
                    </span>
                    <span className="text-[14px] font-bold text-[#1B1B2F]">{t.id}</span>
                  </div>
                  <p className="mt-3 text-[11px] leading-snug text-[#6A6888]">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 w-full">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#8A88AE]">Try asking</div>
            <div className="flex flex-wrap gap-2.5">
              {TRY_ASKING.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => p.onAsk(q)}
                  className="rounded-full border border-[#E2E0F2] bg-white px-4 py-2 text-[12px] text-[#4B4B63] transition hover:border-[#7C6CFF] hover:text-[#7C6CFF] cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-10 flex items-center gap-1.5 text-[10px] text-[#8C8AA8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            {GROUNDED_TEXT}
          </p>
        </div>
      </div>
    </div>
  );
}
