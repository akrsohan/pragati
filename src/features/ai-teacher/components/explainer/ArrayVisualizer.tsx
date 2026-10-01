import { useEffect, useState } from 'react';
import type { VisualData } from '../../types';
import { cn } from '../../lib/utils';
import { Icon } from '../Icons';
import { CodeViewer } from './CodeViewer';

export function ArrayVisualizer({ data, onPractice }: { data: VisualData; onPractice: () => void }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const total = data.steps.length;
  const cur = data.steps[Math.min(step, total - 1)];

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setStep((s) => {
        if (s >= total - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1600);
    return () => clearInterval(t);
  }, [playing, total]);

  const togglePlay = () => {
    if (!playing && step >= total - 1) setStep(0);
    setPlaying((p) => !p);
  };

  const boxClass = (i: number): string => {
    if (i < cur.low || i > cur.high) return 'border-[#E1E5F0] bg-[#EEF0F6] text-[#B3B9CF]';
    if (i === cur.mid) return cur.found ? 'border-transparent bg-gradient-to-br from-[#10B981] to-[#22C3E6] text-white' : 'border-transparent bg-gradient-to-br from-[#2F6BFF] to-[#22C3E6] text-white';
    return 'border-2 border-[#AFC4FF] bg-white text-[#14193A]';
  };

  const bottomLabel = (i: number): { text: string; cls: string } | null => {
    if (i === cur.low && i === cur.high) return { text: 'low, high', cls: 'text-[#7C3AED]' };
    if (i === cur.low) return { text: 'low', cls: 'text-[#16A34A]' };
    if (i === cur.high) return { text: 'high', cls: 'text-[#E11D48]' };
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-[#4B5378]">{data.subtitle ?? 'Step-by-step'}</p>
        <span className="rounded-full bg-[#EEF3FF] px-3 py-1 text-[11px] font-bold text-[#2F6BFF]">Step {step + 1} of {total}</span>
      </div>

      <div className="mt-6 grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: `repeat(${data.array.length}, minmax(0, 1fr))` }}>
        {data.array.map((v, i) => {
          const bl = bottomLabel(i);
          return (
            <div key={i} className="flex flex-col items-center">
              <div className="h-5 text-[12px] font-bold text-[#2F6BFF]">{i === cur.mid ? (cur.found ? 'found' : 'mid') : ''}</div>
              <div className={cn('flex aspect-square w-full max-w-[62px] items-center justify-center rounded-xl border text-[15px] font-bold transition-all duration-300 sm:text-[18px]', boxClass(i))}>{v}</div>
              <div className="mt-1.5 text-[10px] text-[#9AA3C5]">{i}</div>
              <div className={cn('h-5 text-[11px] font-bold sm:text-[12px]', bl?.cls)}>{bl?.text ?? ''}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 rounded-2xl bg-[#EEF3FF] px-5 py-3.5">
        <p className="text-[13px] font-bold text-[#14193A]">{cur.note}</p>
        {cur.detail && <p className="mt-0.5 text-[12px] text-[#4B5378]">{cur.detail}</p>}
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button type="button" onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0} aria-label="Previous step" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DDE3F5] bg-white text-[#4B5378] disabled:opacity-40 cursor-pointer">
          <Icon name="prev" className="h-4 w-4" />
        </button>
        <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16A34A] text-white shadow-md cursor-pointer hover:bg-[#15803d] transition-colors">
          <Icon name={playing ? 'pause' : 'play'} className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => { setPlaying(false); setStep((s) => Math.min(total - 1, s + 1)); }} disabled={step >= total - 1} aria-label="Next step" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DDE3F5] bg-white text-[#4B5378] disabled:opacity-40 cursor-pointer">
          <Icon name="next" className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#E4E8F5]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#2F6BFF] to-[#22C3E6] transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>

      <div className="mt-6">
        <CodeViewer code={data.code} language={data.language} highlightLine={cur.codeLine} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {data.complexity?.time && <span className="rounded-full bg-[#E8F8F2] px-4 py-2 text-[12px] font-bold text-[#0B7A57]">Time  {data.complexity.time}</span>}
        {data.complexity?.space && <span className="rounded-full bg-[#EEF3FF] px-4 py-2 text-[12px] font-bold text-[#2F6BFF]">Space  {data.complexity.space}</span>}
        <button type="button" onClick={onPractice} className="ml-auto rounded-full bg-[#2F6BFF] px-5 py-2 text-[12px] font-bold text-white hover:bg-[#2459D6] cursor-pointer">
          Practice problem
        </button>
      </div>
    </div>
  );
}
