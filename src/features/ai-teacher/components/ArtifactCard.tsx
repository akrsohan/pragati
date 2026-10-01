import { useState } from 'react';
import type { Artifact } from '../types';
import { copyText, downloadArtifact } from '../lib/download';
import { cn } from '../lib/utils';
import { Icon } from './Icons';

const LABEL: Record<Artifact['kind'], string> = {
  code: 'Code',
  html: 'Web page',
  document: 'PDF / Notes',
  visual: 'Visualization',
};

export function ArtifactCard({ artifact, active, onOpen }: { artifact: Artifact; active: boolean; onOpen: () => void }) {
  const [copied, setCopied] = useState(false);
  const lines = artifact.content.split('\n');
  const preview = lines.slice(0, 7).join('\n');
  const displayName = artifact.kind === 'document' ? `${artifact.title}.pdf` : artifact.filename;

  return (
    <div className={cn('my-3 overflow-hidden rounded-xl border bg-[#0F1020]', active ? 'border-[#7C6CFF]' : 'border-[#23254A]')}>
      <div className="flex flex-wrap items-center gap-2 bg-[#171934] px-3 py-2">
        <Icon name="file" className="h-4 w-4 text-[#A7A9E8]" />
        <span className="truncate text-[12px] font-semibold text-white">{displayName}</span>
        <span className="rounded-full bg-[#2A2D5A] px-2 py-0.5 text-[10px] font-bold uppercase text-[#B9BCE8]">{LABEL[artifact.kind]}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            title="Copy"
            onClick={async () => {
              setCopied(await copyText(artifact.content));
              setTimeout(() => setCopied(false), 1500);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#B9BCE8] hover:bg-[#2A2D5A] cursor-pointer"
          >
            <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4" />
          </button>
          <button type="button" title="Download" onClick={() => downloadArtifact(artifact, artifact.kind === 'document' ? 'pdf' : 'native')} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#B9BCE8] hover:bg-[#2A2D5A] cursor-pointer">
            <Icon name="download" className="h-4 w-4" />
          </button>
          <button type="button" onClick={onOpen} className="flex items-center gap-1.5 rounded-lg bg-[#7C6CFF] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#6B5BF0] cursor-pointer">
            <Icon name="panel" className="h-3.5 w-3.5" /> {active ? 'Opened' : 'Open in Explainer'}
          </button>
        </div>
      </div>
      {artifact.kind === 'visual' && artifact.visual ? (
        <div className="px-4 py-3 text-[12px] text-[#C5C8FF]">
          Interactive step-by-step visualization · {artifact.visual.steps.length} steps · {artifact.visual.array.length} elements
        </div>
      ) : (
        <pre className="max-h-44 overflow-hidden px-4 py-3 font-mono text-[12px] leading-5 text-[#E6E6FF]">
          {preview}
          {lines.length > 7 && <span className="text-[#6E71A8]">{'\n'}... {lines.length - 7} more lines</span>}
        </pre>
      )}
    </div>
  );
}
