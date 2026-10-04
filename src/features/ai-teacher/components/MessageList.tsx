import { useEffect, useRef } from 'react';
import type { Artifact, ChatMessage } from '../types';
import { TeacherMessage } from './TeacherMessage';
import { Icon } from './Icons';

interface Props {
  messages: ChatMessage[];
  activeArtifactId: string | null;
  onOpenArtifact: (a: Artifact) => void;
  onFollowUp: (q: string) => void;
  onFeedback: (id: string, f: 'up' | 'down') => void;
}

export function MessageList({ messages, activeArtifactId, onOpenArtifact, onFollowUp, onFeedback }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const lastLen = messages[messages.length - 1]?.content.length ?? 0;

  useEffect(() => {
    stick.current = true;
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  useEffect(() => {
    if (stick.current) endRef.current?.scrollIntoView({ block: 'end' });
  }, [lastLen]);

  return (
    <div
      ref={boxRef}
      onScroll={() => {
        const el = boxRef.current;
        if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      }}
      className="min-h-0 flex-1 overflow-y-auto"
    >
      <div className="mx-auto w-full max-w-[860px] space-y-7 px-4 py-6 sm:px-6 sm:py-8">
        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex flex-col items-end gap-1.5">
              <div className="max-w-[85%] sm:max-w-[76%] whitespace-pre-wrap rounded-[22px] rounded-br-[6px] bg-gradient-to-r from-[#6E5CF6] to-[#8C76FA] px-4.5 py-3 sm:px-5 sm:py-3.5 text-[14.5px] sm:text-[15px] leading-[1.65] text-white shadow-[0_2px_10px_rgba(110,92,246,0.18)]">
                {m.content}
              </div>
              {m.attachments?.map((a) => (
                <span
                  key={a.name}
                  className="flex items-center gap-1.5 rounded-full border border-[#E2DFF5] dark:border-[#333054] bg-[#F1EEFF] dark:bg-[#262248] px-3 py-1 text-[11px] font-semibold text-[#5B4BDB] dark:text-[#A78BFA]"
                >
                  <Icon name="file" className="h-3.5 w-3.5" />
                  <span>{a.name}</span>
                </span>
              ))}
            </div>
          ) : (
            <TeacherMessage
              key={m.id}
              message={m}
              activeArtifactId={activeArtifactId}
              onOpenArtifact={onOpenArtifact}
              onFollowUp={onFollowUp}
              onFeedback={onFeedback}
            />
          ),
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
