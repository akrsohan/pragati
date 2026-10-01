import type { Artifact } from '../types';
import { mimeFor } from './utils';
import { markdownToDocumentHtml } from './documentHtml';

export function downloadText(filename: string, content: string, mime?: string): void {
  const blob = new Blob([content], { type: `${mime ?? mimeFor(filename)};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Opens the browser print dialog for an HTML string -> user chooses "Save as PDF". */
export function printHtml(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 1500);
  }, 350);
}

export function openHtmlInNewTab(html: string): void {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export type DownloadFormat = 'native' | 'pdf' | 'md' | 'html';

export function downloadArtifact(a: Artifact, format: DownloadFormat = 'native'): void {
  if (a.kind === 'document') {
    const base = a.filename.replace(/\.md$/i, '');
    if (format === 'pdf') return printHtml(markdownToDocumentHtml(a.title, a.content));
    if (format === 'html') return downloadText(`${base}.html`, markdownToDocumentHtml(a.title, a.content), 'text/html');
    return downloadText(`${base}.md`, a.content, 'text/markdown');
  }
  downloadText(a.filename, a.content);
}
