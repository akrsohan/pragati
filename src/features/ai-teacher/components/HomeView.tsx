import { TOPICS, TRY_ASKING, type QuickActionId } from '../constants';
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
  const displayName = p.userName ? p.userName.trim() : 'Student';

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#FAF9FF] dark:bg-[#111122]">
      {/* Top Navbar */}
      <div className="flex shrink-0 items-center justify-between px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={p.onMenu}
          className={`flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-white dark:bg-[#1B1B2F] border border-[#ECE8F8] dark:border-[#2D2A48] text-[#6E5CF6] dark:text-[#A78BFA] shadow-xs cursor-pointer ${p.menuClass}`}
          aria-label="Open menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <span />
        {p.onClose && (
          <button
            type="button"
            onClick={p.onClose}
            aria-label="Close"
            className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-[#F1EEFF] dark:bg-[#252245] text-[#6E5CF6] dark:text-[#A78BFA] hover:bg-[#E6E2FF] dark:hover:bg-[#322C5A] cursor-pointer transition"
          >
            <Icon name="close" className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* Main Home Scrollable Content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-16 pt-3 sm:pt-8 [scrollbar-width:thin]">
        <div className="mx-auto flex max-w-[840px] flex-col items-center">
          <BotAvatar size={64} />
          
          <div className="mt-5 text-center px-2">
            <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight text-[#18182E] dark:text-white">
              Hello, {displayName}
            </h1>
            <h2 className="mt-1 text-[22px] sm:text-[26px] font-extrabold text-[#6E5CF6] dark:text-[#9F8EFF] tracking-tight">
              What would you like to explore today?
            </h2>
            <p className="mt-2.5 text-[13.5px] sm:text-[14px] text-[#7A78A0] dark:text-[#9A98BD] font-medium max-w-[560px] mx-auto leading-relaxed">
              Ask anything about Computer Science — algorithms, operating systems, DBMS, code examples, or career advice.
            </p>
          </div>

          {/* Composer Input Area */}
          <div className="mt-7 w-full">
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

          {/* Quick Action Pills */}
          <div className="mt-4 mb-9 w-full">
            <QuickActions onAction={p.onQuickAction} centered />
          </div>

          {/* Topics Grid Section */}
          <div className="w-full mb-9">
            <div className="mb-3.5 text-[11px] font-bold uppercase tracking-wider text-[#7A78A0] dark:text-[#8E8CB0] px-1">
              Explore by Topic
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => p.onPickTopic(t.id)}
                  className="rounded-2xl border border-[#E5E2F6] dark:border-[#2C2A44] bg-white dark:bg-[#18182D] p-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-[#7C6CFF] hover:shadow-md cursor-pointer group flex flex-col justify-between min-h-[96px]"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span
                      className="flex h-7.5 w-7.5 items-center justify-center rounded-xl text-[13px] font-bold transition-transform group-hover:scale-105 shrink-0"
                      style={{ backgroundColor: `${t.color}20`, color: t.color }}
                    >
                      {t.id.charAt(0)}
                    </span>
                    <span className="truncate text-[14px] font-bold text-[#18182E] dark:text-white group-hover:text-[#6E5CF6] transition-colors">
                      {t.id}
                    </span>
                  </div>
                  <p className="text-[11.5px] leading-snug text-[#6A6888] dark:text-[#9A98BD] line-clamp-2">
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Inquiries Section */}
          <div className="w-full">
            <div className="mb-3.5 text-[11px] font-bold uppercase tracking-wider text-[#7A78A0] dark:text-[#8E8CB0] px-1">
              Suggested Inquiries
            </div>
            <div className="flex flex-wrap gap-2.5">
              {TRY_ASKING.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => p.onAsk(q)}
                  className="rounded-full border border-[#DFDCF5] dark:border-[#2D2A48] bg-white dark:bg-[#18182D] px-4 py-2 text-[12.5px] font-medium text-[#42425A] dark:text-[#C5C4DC] shadow-xs hover:border-[#6E5CF6] hover:text-[#6E5CF6] hover:bg-[#F9F8FF] dark:hover:bg-[#201E36] hover:shadow-sm transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
