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

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  streaming,
  attachments,
  onAttach,
  onRemoveAttachment,
  focusTick,
  placeholder,
}: Props) {
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
    <div className="w-full">
      <div className="rounded-[24px] border border-[#DCD8F7] dark:border-[#333058] bg-white dark:bg-[#18182D] p-2 sm:p-2.5 shadow-[0_4px_24px_rgba(27,27,80,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition focus-within:border-[#7C6CFF] focus-within:ring-2 focus-within:ring-[#7C6CFF]/15">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pb-2.5 pt-1">
            {attachments.map((a) => (
              <span
                key={a.name}
                className="flex items-center gap-1.5 rounded-full border border-[#E0DCF7] dark:border-[#332E58] bg-[#F1EEFF] dark:bg-[#252245] px-3 py-1 text-[11px] font-semibold text-[#5B4BDB] dark:text-[#B4A2FF]"
              >
                <Icon name="file" className="h-3.5 w-3.5" />
                <span className="max-w-[160px] truncate">{a.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(a.name)}
                  aria-label={`Remove ${a.name}`}
                  className="hover:opacity-75 cursor-pointer ml-0.5"
                >
                  <Icon name="close" className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Attach a code or text file"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F0FF] dark:bg-[#252245] text-[#6E5CF6] dark:text-[#B4A2FF] transition hover:bg-[#EAE4FF] dark:hover:bg-[#312B5E] cursor-pointer"
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
                if (!streaming && canSend) onSend();
              }
            }}
            placeholder={placeholder ?? 'Ask any CSE question — DSA, OS, DBMS, career...'}
            className="max-h-36 min-h-[42px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[14.5px] sm:text-[15px] leading-relaxed text-[#18182E] dark:text-white outline-none border-none placeholder:text-[#9A98B8] dark:placeholder:text-[#6A688A]"
          />
          
          {streaming ? (
            <button
              type="button"
              onClick={onStop}
              title="Stop generating"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#18182E] dark:bg-white text-white dark:text-[#18182E] transition hover:opacity-90 cursor-pointer shadow-xs"
            >
              <Icon name="stop" className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              title="Send question"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#6E5CF6] to-[#8C76FA] text-white transition enabled:hover:opacity-95 enabled:active:scale-95 disabled:opacity-35 cursor-pointer shadow-xs"
            >
              <Icon name="send" className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>
      
      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-[#8C8AA8] dark:text-[#7A789A] sm:justify-start sm:pl-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0" />
        <span>{GROUNDED_TEXT}</span>
      </p>
    </div>
  );
}
