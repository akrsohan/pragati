import { QUICK_ACTIONS, type QuickActionId } from '../constants';

export function QuickActions({ onAction, centered }: { onAction: (id: QuickActionId) => void; centered?: boolean }) {
  return (
    <div className={centered ? 'flex flex-wrap justify-center gap-2' : 'flex flex-wrap gap-2'}>
      {QUICK_ACTIONS.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onAction(a.id)}
          className="flex items-center gap-2 rounded-full border border-[#E2E0F2] bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#2B2B40] transition hover:border-[#7C6CFF] hover:shadow-sm cursor-pointer"
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
          {a.label}
        </button>
      ))}
    </div>
  );
}
