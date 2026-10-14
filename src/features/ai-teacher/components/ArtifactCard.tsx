import { useState, useMemo } from 'react';
import type { Artifact } from '../types';
import { copyText, downloadArtifact } from '../lib/download';
import { cn } from '../lib/utils';
import { highlightCode } from '../lib/highlighter';
import { Icon } from './Icons';

const LABEL: Record<Artifact['kind'], string> = {
  code: 'Code',
  html: 'Web page',
  document: 'PDF / Notes',
  visual: 'Visualization',
};

export function ArtifactCard({ artifact, active, onOpen }: { artifact: Artifact; active: boolean; onOpen: () => void }) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => artifact.content.split('\n'), [artifact.content]);
  const isShortCode = lines.length <= 16;
  const [isExpanded, setIsExpanded] = useState(isShortCode);

  const displayCode = isExpanded ? artifact.content : lines.slice(0, 10).join('\n');
  const highlightedHtml = useMemo(
    () => highlightCode(displayCode, artifact.language || 'text'),
    [displayCode, artifact.language]
  );
  const displayName = artifact.kind === 'document' ? `${artifact.title}.pdf` : artifact.filename;

  return (
    <div className={cn('my-3.5 overflow-hidden rounded-xl border bg-[#0F1020]', active ? 'border-[#7C6CFF]' : 'border-[#23254A]')}>
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#171934] px-3.5 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="file" className="h-4 w-4 text-[#A7A9E8] shrink-0" />
          <span className="truncate text-[12px] font-semibold text-white">{displayName}</span>
          <span className="rounded-full bg-[#2A2D5A] px-2 py-0.5 text-[10px] font-bold uppercase text-[#B9BCE8] shrink-0">
            {LABEL[artifact.kind]}
          </span>
          <span className="text-[11px] font-mono text-[#8284B8] shrink-0">
            {lines.length} lines
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isShortCode && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 rounded-lg bg-[#2A2D5A] hover:bg-[#373B72] px-2.5 py-1 text-[11px] font-semibold text-[#D4D7FF] transition cursor-pointer"
              title={isExpanded ? 'Collapse preview' : 'Show full code'}
            >
              <span>{isExpanded ? 'Collapse' : 'Expand full code'}</span>
            </button>
          )}
          <button
            type="button"
            title="Copy code"
            onClick={async () => {
              setCopied(await copyText(artifact.content));
              setTimeout(() => setCopied(false), 1500);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#B9BCE8] hover:bg-[#2A2D5A] cursor-pointer transition"
          >
            <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Download"
            onClick={() => downloadArtifact(artifact, artifact.kind === 'document' ? 'pdf' : 'native')}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#B9BCE8] hover:bg-[#2A2D5A] cursor-pointer transition"
          >
            <Icon name="download" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onOpen}
            className="flex items-center gap-1.5 rounded-lg bg-[#7C6CFF] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#6B5BF0] cursor-pointer transition"
          >
            <Icon name="panel" className="h-3.5 w-3.5" /> {active ? 'Opened' : 'Open in Explainer'}
          </button>
        </div>
      </div>

      {artifact.kind === 'visual' && artifact.visual ? (
        <div className="px-4 py-3 text-[12px] text-[#C5C8FF]">
          Interactive step-by-step visualization · {artifact.visual.steps.length} steps · {artifact.visual.array.length} elements
        </div>
      ) : (
        <div className="relative">
          <pre
            className={cn(
              'overflow-x-auto px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-[#E6E6FF] [scrollbar-width:thin]',
              isExpanded ? 'max-h-[550px] overflow-y-auto' : 'max-h-52 overflow-hidden'
            )}
          >
            <code
              className="font-mono"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>

          {!isExpanded && lines.length > 10 && (
            <div className="border-t border-[#23254A] bg-[#121326] px-4 py-2 flex items-center justify-between">
              <span className="text-[11.5px] text-[#9A9CC8]">
                Showing first 10 of {lines.length} lines
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="text-[11.5px] font-bold text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 cursor-pointer transition"
              >
                <span>Show all {lines.length} lines ↓</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
