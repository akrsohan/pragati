import { QUICK_ACTIONS, type QuickActionId } from '../constants';

export function QuickActions({ onAction, centered }: { onAction: (id: QuickActionId) => void; centered?: boolean }) {
  return (
    <div className={centered ? 'flex flex-wrap justify-center gap-2.5' : 'flex items-center gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none]'}>
      {QUICK_ACTIONS.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onAction(a.id)}
          className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-[#E2DFF5] dark:border-[#2E2B4B] bg-white dark:bg-[#1A1A2E] px-4 text-[12.5px] font-semibold text-[#2C2C42] dark:text-[#C5C4DC] shadow-xs transition hover:border-[#6E5CF6] hover:text-[#6E5CF6] hover:bg-[#F9F8FF] dark:hover:bg-[#221F3D] hover:shadow-sm cursor-pointer"
        >
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}
