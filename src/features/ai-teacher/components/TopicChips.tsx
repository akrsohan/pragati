import { TOPICS } from '../constants';
import type { TopicFilter } from '../types';
import { cn } from '../lib/utils';

export function TopicChips({ value, onChange }: { value: TopicFilter; onChange: (t: TopicFilter) => void }) {
  const items: { id: TopicFilter; color?: string }[] = [{ id: 'All topics' }, ...TOPICS.map((t) => ({ id: t.id as TopicFilter, color: t.color }))];
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#8A88AE]">Topic</span>
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold transition cursor-pointer',
              active ? 'border-[#7C6CFF] bg-[#7C6CFF] text-white' : 'border-[#E2E0F2] bg-white text-[#4B4B63] hover:border-[#7C6CFF]',
            )}
          >
            {!active && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: it.color ?? '#10B981' }} />}
            {it.id}
          </button>
        );
      })}
    </div>
  );
}
