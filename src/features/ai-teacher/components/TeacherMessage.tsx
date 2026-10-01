import { useMemo } from 'react';
import type { Artifact, ChatMessage } from '../types';
import { parseMessage } from '../lib/parseMessage';
import { findGuideline } from '../knowledge/guidelines';
import { copyText } from '../lib/download';
import { formatTime, cn } from '../lib/utils';
import { BotAvatar } from './BotAvatar';
import { Markdown } from './Markdown';
import { ArtifactCard } from './ArtifactCard';
import { Icon } from './Icons';

const FALLBACK_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EC4899', '#0EA5E9', '#8B5CF6'];
const HEX = /^#[0-9a-fA-F]{6}$/;

interface Props {
  message: ChatMessage;
  activeArtifactId: string | null;
  onOpenArtifact: (a: Artifact) => void;
  onFollowUp: (q: string) => void;
  onFeedback: (id: string, f: 'up' | 'down') => void;
}

export function TeacherMessage({ message, activeArtifactId, onOpenArtifact, onFollowUp, onFeedback }: Props) {
  const parsed = useMemo(() => parseMessage(message.id, message.content), [message.id, message.content]);
  const streaming = message.status === 'streaming';
  const done = message.status !== 'streaming';
  const artifactById = new Map(parsed.artifacts.map((a) => [a.id, a]));
  const sources = parsed.sources.map((s) => findGuideline(s)).filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <div className="flex gap-3">
      <BotAvatar size={30} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2 text-[12px]">
          <span className="font-bold text-[#7C6CFF]">Pragati AI Teacher</span>
          <span className="text-[10px] text-[#8A8CB0]">{formatTime(message.createdAt)}</span>
        </div>

        <div className="rounded-2xl border border-[#E6E4F5] bg-white px-4 py-3.5 text-[#1B1B2F] shadow-sm">
          {message.status === 'error' && !message.content && <p className="text-[13px] text-[#E11D48]">Sorry, something went wrong. Please try again.</p>}
          {streaming && !message.content && (
            <div className="flex items-center gap-1.5 py-1" aria-label="Thinking">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-[#7C6CFF]" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          )}

          {parsed.segments.map((seg, i) => {
            if (seg.type === 'text') return <Markdown key={i} text={seg.text} />;
            if (seg.type === 'pending') return <p key={i} className="my-2 text-[12px] italic text-[#7A78A0]">{seg.label}</p>;
            const a = artifactById.get(seg.id);
            return a ? <ArtifactCard key={seg.id} artifact={a} active={activeArtifactId === a.id} onOpen={() => onOpenArtifact(a)} /> : null;
          })}

          {parsed.cards.length > 0 && (
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {parsed.cards.map((c, i) => {
                const color = c.color && HEX.test(c.color) ? c.color : FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                return (
                  <div key={i} className="relative overflow-hidden rounded-xl px-4 py-3" style={{ backgroundColor: `${color}24` }}>
                    <span className="absolute bottom-2.5 left-0 top-2.5 w-1 rounded-full" style={{ backgroundColor: color }} />
                    <div className="text-[12.5px] font-bold text-[#1B1B2F]">{c.title}</div>
                    {c.sub && <div className="mt-0.5 text-[11px] text-[#555571]">{c.sub}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {sources.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#8A8CB0]">Sources:</span>
              {sources.map((g) => (
                <a key={g.id} href={g.url} target="_blank" rel="noreferrer" className="rounded-full bg-[#F1EEFF] px-3 py-1 text-[10.5px] font-bold text-[#7C6CFF] hover:bg-[#E6E2FF]">
                  {g.title}
                </a>
              ))}
            </div>
          )}
        </div>

        {done && parsed.followups.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {parsed.followups.map((q) => (
              <button key={q} type="button" onClick={() => onFollowUp(q)} className="rounded-full bg-[#F1EEFF] px-3.5 py-1.5 text-[11px] font-semibold text-[#7C6CFF] transition hover:bg-[#E6E2FF] cursor-pointer">
                {q}
              </button>
            ))}
          </div>
        )}

        {done && message.content && (
          <div className="mt-2 flex items-center gap-1 text-[#9A98B8]">
            <button type="button" title="Copy answer" onClick={() => copyText(message.content)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F1EEFF] cursor-pointer">
              <Icon name="copy" className="h-4 w-4" />
            </button>
            <button type="button" title="Helpful" onClick={() => onFeedback(message.id, 'up')} className={cn('flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F1EEFF] cursor-pointer', message.feedback === 'up' && 'text-[#10B981]')}>
              <Icon name="thumbUp" className="h-4 w-4" />
            </button>
            <button type="button" title="Not helpful" onClick={() => onFeedback(message.id, 'down')} className={cn('flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F1EEFF] cursor-pointer', message.feedback === 'down' && 'text-[#E11D48]')}>
              <Icon name="thumbUp" className="h-4 w-4 rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
