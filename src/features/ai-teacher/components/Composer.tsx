import { useEffect, useRef } from 'react';
import type { Attachment } from '../types';
import { GROUNDED_TEXT } from '../constants';
import { Icon } from './Icons';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  streaming: boolean;
  attachments: Attachment[];
  onAttach: (files: FileList) => void;
  onRemoveAttachment: (name: string) => void;
  focusTick: number;
  placeholder?: string;
}

export function Composer({ value, onChange, onSend, onStop, streaming, attachments, onAttach, onRemoveAttachment, focusTick, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  useEffect(() => {
    if (focusTick > 0) {
      const el = ref.current;
      el?.focus();
      el?.setSelectionRange(el.value.length, el.value.length);
    }
  }, [focusTick]);

  const canSend = value.trim().length > 0 || attachments.length > 0;

  return (
    <div>
      <div className="rounded-[28px] border border-[#DAD6F5] bg-white shadow-[0_8px_24px_rgba(27,27,80,0.08)] transition focus-within:border-[#7C6CFF]">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {attachments.map((a) => (
              <span key={a.name} className="flex items-center gap-1.5 rounded-full bg-[#F1EEFF] px-3 py-1 text-[11px] font-semibold text-[#5B4BDB]">
                <Icon name="file" className="h-3.5 w-3.5" />
                {a.name}
                <button type="button" onClick={() => onRemoveAttachment(a.name)} aria-label={`Remove ${a.name}`} className="cursor-pointer">
                  <Icon name="close" className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 p-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Attach a code or text file"
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0EEFF] text-[#7C6CFF] transition hover:bg-[#E6E2FF] cursor-pointer"
          >
            <Icon name="plus" className="h-5 w-5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            hidden
            multiple
            accept=".txt,.md,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.html,.css,.json,.sql"
            onChange={(e) => {
              if (e.target.files?.length) onAttach(e.target.files);
              e.target.value = '';
            }}
          />
          <textarea
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (!streaming) onSend();
              }
            }}
            placeholder={placeholder ?? 'Ask any CSE question - DSA, OS, DBMS, career...'}
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2.5 text-[14px] text-[#1B1B2F] outline-none placeholder:text-[#9A98B8]"
          />
          {streaming ? (
            <button type="button" onClick={onStop} title="Stop" className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B1B2F] text-white cursor-pointer">
              <Icon name="stop" className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              title="Send"
              className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C6CFF] to-[#22C3E6] text-white transition enabled:hover:scale-105 disabled:opacity-40 cursor-pointer"
            >
              <Icon name="send" className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#8C8AA8] sm:justify-start sm:pl-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
        {GROUNDED_TEXT}
      </p>
    </div>
  );
}
