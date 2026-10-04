import { TOPICS } from '../constants';
import type { TopicFilter } from '../types';
import { cn } from '../lib/utils';

export function TopicChips({ value, onChange }: { value: TopicFilter; onChange: (t: TopicFilter) => void }) {
  const items: { id: TopicFilter; color?: string }[] = [{ id: 'All topics' }, ...TOPICS.map((t) => ({ id: t.id as TopicFilter, color: t.color }))];
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
      <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wider text-[#8A88AE] dark:text-[#7C7A9E] mr-1">
        Topic:
      </span>
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className={cn(
              'flex h-7.5 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[11.5px] font-semibold transition cursor-pointer',
              active
                ? 'border-[#6E5CF6] bg-[#6E5CF6] text-white shadow-xs'
                : 'border-[#E4E0FA] dark:border-[#2E2B4B] bg-white dark:bg-[#1A1A2E] text-[#424258] dark:text-[#C5C4DC] hover:border-[#6E5CF6] hover:text-[#6E5CF6]'
            )}
          >
            {!active && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: it.color ?? '#10B981' }} />}
            <span>{it.id}</span>
          </button>
        );
      })}
    </div>
  );
}
