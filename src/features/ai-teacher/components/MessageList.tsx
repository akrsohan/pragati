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
      <div className="mx-auto w-full max-w-[900px] space-y-6 px-4 py-6">
        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex flex-col items-end gap-1.5">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-[20px] bg-gradient-to-r from-[#7C6CFF] to-[#A78BFA] px-5 py-3 text-[14px] leading-relaxed text-white shadow-sm sm:max-w-[70%]">
                {m.content}
              </div>
              {m.attachments?.map((a) => (
                <span key={a.name} className="flex items-center gap-1.5 rounded-full bg-[#F1EEFF] px-3 py-1 text-[11px] font-semibold text-[#5B4BDB]">
                  <Icon name="file" className="h-3.5 w-3.5" /> {a.name}
                </span>
              ))}
            </div>
          ) : (
            <TeacherMessage key={m.id} message={m} activeArtifactId={activeArtifactId} onOpenArtifact={onOpenArtifact} onFollowUp={onFollowUp} onFeedback={onFeedback} />
          ),
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
