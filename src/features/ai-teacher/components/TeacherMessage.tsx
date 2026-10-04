import { useMemo, useState } from 'react';
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
  const sources = useMemo(
    () => parsed.sources.map((s) => findGuideline(s)).filter((g): g is NonNullable<typeof g> => Boolean(g)),
    [parsed.sources]
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-3 sm:gap-3.5">
      <BotAvatar size={32} className="mt-1 shrink-0" />
      <div className="min-w-0 flex-1 max-w-[760px] sm:max-w-[820px]">
        {/* Teacher identity & timestamp */}
        <div className="mb-1.5 flex items-center gap-2 text-[12px]">
          <span className="font-bold text-[#6E5CF6] dark:text-[#9F8EFF]">Pragati AI Teacher</span>
          <span className="text-[10.5px] text-[#8A8CB0] dark:text-[#7A7A9A]">{formatTime(message.createdAt)}</span>
        </div>

        {/* AI Response Card Container */}
        <div className="rounded-2xl border border-[#E6E4F5] dark:border-[#2D2D45] bg-white dark:bg-[#18192A] px-5 py-4.5 sm:px-6 sm:py-5 text-[#1B1B2F] dark:text-[#E2E1F0] shadow-[0_2px_12px_rgba(27,27,80,0.03)] transition-colors">
          {message.status === 'error' && !message.content && (
            <p className="text-[13.5px] text-[#E11D48] dark:text-[#FB7185]">
              Sorry, could not generate a response. Please check your connection and try again.
            </p>
          )}

          {streaming && !message.content && (
            <div className="flex items-center gap-1.5 py-1.5" aria-label="Thinking">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#7C6CFF]"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          )}

          {/* Render parsed text segments and interactive artifact chips */}
          <div className="space-y-3.5">
            {parsed.segments.map((seg, i) => {
              if (seg.type === 'text') return <Markdown key={i} text={seg.text} />;
              if (seg.type === 'pending') {
                return (
                  <p key={i} className="my-2 text-[12.5px] italic text-[#7A78A0] dark:text-[#8E8CB2]">
                    {seg.label}
                  </p>
                );
              }
              const a = artifactById.get(seg.id);
              return a ? (
                <ArtifactCard
                  key={seg.id}
                  artifact={a}
                  active={activeArtifactId === a.id}
                  onOpen={() => onOpenArtifact(a)}
                />
              ) : null;
            })}
          </div>

          {/* Curriculum summary cards if present */}
          {parsed.cards.length > 0 && (
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {parsed.cards.map((c, i) => {
                const color = c.color && HEX.test(c.color) ? c.color : FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                return (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-xl border border-[#E9E6F7] dark:border-[#2C2A44] px-4 py-3"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <span className="absolute bottom-2.5 left-0 top-2.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <div className="text-[13px] font-bold text-[#1B1B2F] dark:text-white">{c.title}</div>
                    {c.sub && <div className="mt-0.5 text-[11.5px] text-[#555571] dark:text-[#A5A4BE]">{c.sub}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Sources Section: Rendered as clean, structured cards/chips instead of a single cramped paragraph */}
          {sources.length > 0 && (
            <div className="mt-5 border-t border-[#F0EDFF] dark:border-[#2A2845] pt-3.5">
              <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#7A78A0] dark:text-[#9A98BD]">
                <Icon name="book" className="h-3.5 w-3.5 text-[#7C6CFF]" />
                <span>Verified Curriculum Sources</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {sources.map((g) => (
                  <a
                    key={g.id}
                    href={g.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-2.5 rounded-xl border border-[#E9E6F7] dark:border-[#2E2C48] bg-[#FAF9FF] dark:bg-[#1E1C33] p-2.5 transition hover:border-[#7C6CFF] hover:bg-[#F3F0FF] dark:hover:bg-[#272445] hover:shadow-xs"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#ECE7FE] dark:bg-[#342F5E] text-[#6E5CF6] group-hover:scale-105 transition-transform">
                      <Icon name={g.url.includes('drive.google.com') ? 'file' : 'link'} className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="line-clamp-2 text-[12.5px] font-semibold text-[#1F1F35] dark:text-[#E2E1F0] group-hover:text-[#6E5CF6] leading-snug">
                        {g.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-[#7A78A0] dark:text-[#8E8CAE]">
                        <span>{g.topic || 'Curriculum'}</span>
                        <span>•</span>
                        <span className="font-medium text-[#6E5CF6] dark:text-[#A78BFA]">Open ↗</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls: Copy, Like, Dislike - Cleanly spaced below response */}
        {done && message.content && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[#9A98B8] dark:text-[#7A7A9A]">
            <button
              type="button"
              title="Copy answer"
              onClick={handleCopy}
              className="flex h-7.5 items-center gap-1.5 rounded-lg px-2 text-[11.5px] font-medium transition hover:bg-[#F1EEFF] dark:hover:bg-[#282645] hover:text-[#6E5CF6] cursor-pointer"
            >
              <Icon name="copy" className="h-3.5 w-3.5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <div className="h-3 w-[1px] bg-[#E2DFF5] dark:bg-[#2E2D48]" />
            <button
              type="button"
              title="Helpful"
              onClick={() => onFeedback(message.id, 'up')}
              className={cn(
                'flex h-7.5 w-7.5 items-center justify-center rounded-lg transition hover:bg-[#F1EEFF] dark:hover:bg-[#282645] cursor-pointer',
                message.feedback === 'up' ? 'text-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]/30' : 'hover:text-[#10B981]'
              )}
            >
              <Icon name="thumbUp" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Not helpful"
              onClick={() => onFeedback(message.id, 'down')}
              className={cn(
                'flex h-7.5 w-7.5 items-center justify-center rounded-lg transition hover:bg-[#F1EEFF] dark:hover:bg-[#282645] cursor-pointer',
                message.feedback === 'down' ? 'text-[#E11D48] bg-[#FFF1F2] dark:bg-[#881337]/30' : 'hover:text-[#E11D48]'
              )}
            >
              <Icon name="thumbUp" className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>
        )}

        {/* Suggested Follow-up Questions */}
        {done && parsed.followups.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {parsed.followups.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onFollowUp(q)}
                className="rounded-full border border-[#E2DFF5] dark:border-[#302D4C] bg-[#F7F6FF] dark:bg-[#1F1D36] px-3.5 py-1.5 text-[11.5px] font-semibold text-[#6E5CF6] dark:text-[#A78BFA] transition hover:border-[#7C6CFF] hover:bg-[#EFEAFF] dark:hover:bg-[#2B274F] cursor-pointer text-left"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
