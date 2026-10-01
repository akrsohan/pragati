import { cn } from '../lib/utils';

export function BotAvatar({ size = 36, className }: { size?: number; className?: string }) {
  const eye = (left: number) => (
    <span className="absolute rounded-full bg-white" style={{ left: size * left, top: size * 0.38, width: size * 0.13, height: size * 0.13 }} />
  );
  return (
    <div className={cn('relative shrink-0 rounded-[30%] bg-gradient-to-br from-[#7C6CFF] to-[#22C3E6]', className)} style={{ width: size, height: size }}>
      {eye(0.28)}
      {eye(0.59)}
      <span className="absolute rounded-full bg-white" style={{ left: size * 0.34, top: size * 0.64, width: size * 0.32, height: Math.max(2, size * 0.06) }} />
      <span className="absolute rounded-full bg-white" style={{ left: size * 0.485, top: size * 0.1, width: Math.max(2, size * 0.05), height: size * 0.12 }} />
    </div>
  );
}
