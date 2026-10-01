import { useMemo, useState } from 'react';
import type { Chat } from '../types';
import { topicColor } from '../constants';
import { groupChats, cn } from '../lib/utils';
import { BotAvatar } from './BotAvatar';
import { Icon } from './Icons';

interface Props {
  chats: Chat[];
  activeId: string | null;
  userName: string;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ chats, activeId, userName, onNew, onSelect, onDelete }: Props) {
  const [q, setQ] = useState('');
  const groups = useMemo(
    () => groupChats(chats.filter((c) => c.title.toLowerCase().includes(q.trim().toLowerCase()))),
    [chats, q],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 pb-2 pt-5">
        <BotAvatar size={38} />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold text-[#1B1B2F]">Pragati AI Teacher</div>
          <div className="truncate text-[10px] text-[#7A78A0]">Ask anything about CSE</div>
        </div>
      </div>

      <div className="px-6 pt-4">
        <button
          type="button"
          onClick={onNew}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C6CFF] to-[#A78BFA] text-[14px] font-bold text-white shadow-md transition hover:opacity-95 cursor-pointer"
        >
          <Icon name="plus" className="h-4 w-4" /> New chat
        </button>
        <div className="relative mt-4">
          <Icon name="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A98B8]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search chats..."
            className="h-10 w-full rounded-xl border border-[#E2DFF5] bg-white pl-10 pr-3 text-[12px] outline-none focus:border-[#7C6CFF]"
          />
        </div>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-4 pb-4">
        {groups.length === 0 && <p className="px-3 pt-4 text-[12px] text-[#7A78A0]">No chats yet. Ask your first question!</p>}
        {groups.map((g) => (
          <div key={g.label} className="mb-4">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8A88AE]">{g.label}</div>
            {g.items.map((c) => {
              const active = c.id === activeId;
              return (
                <div
                  key={c.id}
                  className={cn(
                    'group relative mb-1 flex items-center rounded-xl border transition',
                    active ? 'border-[#DCD8F7] bg-white shadow-sm' : 'border-transparent hover:bg-white/70',
                  )}
                >
                  {active && <span className="absolute left-0 top-2 h-6 w-1 rounded-full bg-[#7C6CFF]" />}
                  <button type="button" onClick={() => onSelect(c.id)} className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-2.5 text-left cursor-pointer">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: topicColor(c.topic) }} />
                    <span className={cn('truncate text-[12.5px]', active ? 'font-bold text-[#1B1B2F]' : 'text-[#4B4B63]')}>{c.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    aria-label="Delete chat"
                    className="mr-2 hidden h-7 w-7 items-center justify-center rounded-lg text-[#9A98B8] hover:bg-[#F1EEFF] hover:text-[#E11D48] group-hover:flex cursor-pointer"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-[#E2DFF5] px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C6CFF] text-[16px] font-bold text-white">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-[#1B1B2F]">{userName}</div>
          <div className="text-[10px] text-[#7A78A0]">DIU CSE student</div>
        </div>
      </div>
    </div>
  );
}
