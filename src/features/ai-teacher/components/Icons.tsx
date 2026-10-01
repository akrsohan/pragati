import { cn } from '../lib/utils';

const PATHS = {
  plus: ['M12 5v14', 'M5 12h14'],
  send: ['M22 2L11 13', 'M22 2l-7 20-4-9-9-4 20-7z'],
  close: ['M18 6L6 18', 'M6 6l12 12'],
  copy: ['M9 9h11v11H9z', 'M5 15H4V4h11v1'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  menu: ['M3 12h18', 'M3 6h18', 'M3 18h18'],
  check: ['M20 6L9 17l-5-5'],
  trash: ['M3 6h18', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6', 'M10 11v6', 'M14 11v6', 'M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3'],
  prev: ['M15 18l-6-6 6-6'],
  next: ['M9 18l6-6-6-6'],
  thumbUp: ['M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.4-9a2 2 0 0 0-2-2.3H14z', 'M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  external: ['M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6', 'M15 3h6v6', 'M10 14L21 3'],
  chevronDown: ['M6 9l6 6 6-6'],
  paperclip: ['M21.4 11.1l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5'],
  panel: ['M3 5h18v14H3z', 'M15 5v14'],
} as const;

export type IconName = keyof typeof PATHS | 'play' | 'pause' | 'stop';

export function Icon({ name, className }: { name: IconName; className?: string }) {
  if (name === 'play') return <svg viewBox="0 0 24 24" className={cn('h-5 w-5', className)} fill="currentColor"><path d="M7 4l13 8-13 8z" /></svg>;
  if (name === 'pause') return <svg viewBox="0 0 24 24" className={cn('h-5 w-5', className)} fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>;
  if (name === 'stop') return <svg viewBox="0 0 24 24" className={cn('h-5 w-5', className)} fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;
  return (
    <svg viewBox="0 0 24 24" className={cn('h-5 w-5', className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
