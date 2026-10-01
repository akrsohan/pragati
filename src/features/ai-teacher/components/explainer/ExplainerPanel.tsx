import { useEffect, useMemo, useRef, useState } from 'react';
import type { Artifact } from '../../types';
import { markdownToDocumentHtml } from '../../lib/documentHtml';
import { copyText, downloadArtifact, openHtmlInNewTab } from '../../lib/download';
import { cn } from '../../lib/utils';
import { Icon } from '../Icons';
import { ArrayVisualizer } from './ArrayVisualizer';
import { CodeViewer } from './CodeViewer';

type Tab = 'Visualize' | 'Code' | 'Complexity' | 'Preview' | 'Source';

const tabsFor = (k: Artifact['kind']): Tab[] => {
  if (k === 'visual') return ['Visualize', 'Code', 'Complexity'];
  if (k === 'html') return ['Preview', 'Code'];
  if (k === 'document') return ['Preview', 'Source'];
  return ['Code'];
};

interface Props {
  artifacts: Artifact[];
  active: Artifact;
  onSelect: (id: string) => void;
  onClose: () => void;
  onAsk: (text: string) => void;
}

export function ExplainerPanel({ artifacts, active, onSelect, onClose, onAsk }: Props) {
  const tabs = tabsFor(active.kind);
  const [tab, setTab] = useState<Tab>(tabs[0]);
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTab(tabsFor(active.kind)[0]);
    setMenu(false);
  }, [active.id, active.kind]);

  useEffect(() => {
    if (!menu) return;
    const h = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menu]);

  const docHtml = useMemo(
    () => (active.kind === 'document' ? markdownToDocumentHtml(active.title, active.content) : ''),
    [active.kind, active.title, active.content],
  );

  const item = 'flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12px] font-semibold text-[#14193A] hover:bg-[#EEF3FF] cursor-pointer';

  return (
    <aside className="fixed inset-0 z-40 flex flex-col bg-white lg:static lg:z-auto lg:w-[46%] lg:max-w-[700px] lg:shrink-0 lg:border-l lg:border-[#E4E8F5]">
      <header className="flex items-center gap-3 px-5 pt-5 sm:px-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-[18px] font-bold text-[#14193A]">Visual Explainer</h2>
          <p className="truncate text-[11px] text-[#8A93B8]">{active.kind === 'document' ? `${active.title}.pdf` : active.filename}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close explainer" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF3FF] text-[#2F6BFF] hover:bg-[#DDE8FF] cursor-pointer">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </header>

      {artifacts.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1 sm:px-8 [scrollbar-width:none]">
          {artifacts.map((a) => (
            <button key={a.id} type="button" onClick={() => onSelect(a.id)} className={cn('shrink-0 rounded-lg border px-3 py-1 text-[11px] font-semibold cursor-pointer', a.id === active.id ? 'border-[#2F6BFF] bg-[#EEF3FF] text-[#2F6BFF]' : 'border-[#DDE3F5] text-[#4B5378] hover:bg-[#F5F7FC]')}>
              {a.kind === 'document' ? `${a.title}.pdf` : a.filename}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2 px-5 sm:px-8">
        {tabs.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn('rounded-full border px-4 py-1.5 text-[11px] font-bold transition cursor-pointer', tab === t ? 'border-[#12183A] bg-[#12183A] text-white' : 'border-[#DDE3F5] bg-white text-[#4B5378] hover:bg-[#F5F7FC]')}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-5 pb-4 sm:px-8">
        {tab === 'Visualize' && active.visual && (
          <ArrayVisualizer key={active.id} data={active.visual} onPractice={() => onAsk(`Give me a practice problem similar to "${active.title}". Do not reveal the answer yet.`)} />
        )}
        {(tab === 'Code' || tab === 'Source') && <CodeViewer code={active.content} language={active.kind === 'document' ? 'markdown' : active.language} />}
        {tab === 'Preview' && active.kind === 'html' && (
          <div className="overflow-hidden rounded-2xl border border-[#DDE3F5]">
            <div className="flex items-center gap-2 bg-[#E9EDF8] px-4 py-2.5">
              {['#FF6159', '#FFBD2E', '#28C940'].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />)}
              <span className="ml-2 flex-1 truncate rounded-full bg-white px-3 py-1 text-[11px] text-[#6A7399]">preview://{active.filename}</span>
            </div>
            <iframe title="Preview" sandbox="allow-scripts" srcDoc={active.content} className="h-[520px] w-full bg-white" />
          </div>
        )}
        {tab === 'Preview' && active.kind === 'document' && (
          <div className="overflow-hidden rounded-2xl border border-[#DDE3F5]">
            <iframe title="Document preview" sandbox="" srcDoc={docHtml} className="h-[560px] w-full bg-white" />
          </div>
        )}
        {tab === 'Complexity' && active.visual && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-[#E8F8F2] p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#0B7A57]">Time complexity</div>
              <div className="mt-1 text-[28px] font-extrabold text-[#0B7A57]">{active.visual.complexity?.time ?? '-'}</div>
            </div>
            <div className="rounded-2xl bg-[#EEF3FF] p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#2F6BFF]">Space complexity</div>
              <div className="mt-1 text-[28px] font-extrabold text-[#2F6BFF]">{active.visual.complexity?.space ?? '-'}</div>
            </div>
            <button type="button" onClick={() => onAsk(`Explain the time and space complexity of ${active.title} in simple words.`)} className="rounded-full bg-[#2F6BFF] px-5 py-2.5 text-[12px] font-bold text-white hover:bg-[#2459D6] cursor-pointer">
              Ask AI to explain this
            </button>
          </div>
        )}
      </div>

      <footer className="flex items-center gap-2 border-t border-[#E4E8F5] px-5 py-3 sm:px-8">
        <button
          type="button"
          onClick={async () => {
            setCopied(await copyText(active.content));
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-2 rounded-full border border-[#DDE3F5] bg-white px-4 py-2 text-[12px] font-bold text-[#4B5378] hover:bg-[#F5F7FC] cursor-pointer"
        >
          <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}
        </button>

        <div ref={menuRef} className="relative ml-auto">
          <button type="button" onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-full bg-[#2F6BFF] px-5 py-2 text-[12px] font-bold text-white hover:bg-[#2459D6] cursor-pointer">
            <Icon name="download" className="h-4 w-4" /> Download <Icon name="chevronDown" className="h-3.5 w-3.5" />
          </button>
          {menu && (
            <div className="absolute bottom-full right-0 mb-2 w-60 overflow-hidden rounded-2xl border border-[#DDE3F5] bg-white shadow-xl">
              {active.kind === 'document' && (
                <>
                  <button className={item} onClick={() => { downloadArtifact(active, 'pdf'); setMenu(false); }}>PDF (Save as PDF)</button>
                  <button className={item} onClick={() => { downloadArtifact(active, 'md'); setMenu(false); }}>Markdown (.md)</button>
                  <button className={item} onClick={() => { downloadArtifact(active, 'html'); setMenu(false); }}>HTML (.html)</button>
                </>
              )}
              {active.kind === 'html' && (
                <>
                  <button className={item} onClick={() => { downloadArtifact(active); setMenu(false); }}>Download {active.filename}</button>
                  <button className={item} onClick={() => { openHtmlInNewTab(active.content); setMenu(false); }}>
                    <Icon name="external" className="h-4 w-4" /> Open in new tab
                  </button>
                </>
              )}
              {(active.kind === 'code' || active.kind === 'visual') && (
                <button className={item} onClick={() => { downloadArtifact(active); setMenu(false); }}>Download {active.filename}</button>
              )}
            </div>
          )}
        </div>
      </footer>
    </aside>
  );
}
