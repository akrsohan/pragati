import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { copyText } from '../lib/download';
import { Icon } from './Icons';

const BENGALI_DIGITS: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

/**
 * Preprocesses markdown text so that:
 * 1. Inline numbered lists (e.g. "...roadmap দেওয়া হলো: ১. Intro... ২. Process...")
 *    are automatically split into multi-line structured list items.
 * 2. Bengali numbered items ("১. ", "২. ") are mapped to standard ASCII list syntax ("1. ", "2. ")
 *    so CommonMark parses them into real structured <ol><li> items with clean spacing.
 * 3. Separate paragraphs and concluding remarks are visually divided instead of forming a wall of text.
 */
function normalizeMarkdown(raw: string): string {
  if (!raw) return '';

  let normalized = raw;

  // 1. Break inline numbered items inside text: "দেওয়া হলো: ১. Intro... ২. Process..." -> "\n\n1. Intro...\n\n2. Process..."
  normalized = normalized.replace(/([:।!?\n]|\.\s+)\s*([১-৯0-9]+[\.\)])\s+/g, '$1\n\n$2 ');

  // 2. Break inline bullet items inside text: "...পয়েন্ট: • পয়েন্ট ১ • পয়েন্ট ২" -> "\n\n- পয়েন্ট ১\n\n- পয়েন্ট ২"
  normalized = normalized.replace(/([:।!?\n]|\.\s+)\s*([•\-\*])\s+/g, '$1\n\n- ');

  // 3. Convert Bengali numbers at line start to ASCII: "১. " -> "1. "
  normalized = normalized.replace(/(^|\n)([ \t]*)([০-৯]+)([.)][ \t]+)/g, (_m, prefix, indent, digits, punct) => {
    const asciiDigits = digits.split('').map((d: string) => BENGALI_DIGITS[d] || d).join('');
    return `${prefix}${indent}${asciiDigits}${punct}`;
  });

  // 4. Ensure a blank line before list items or headings if stuck to preceding text
  normalized = normalized.replace(/([^\n])\n([ \t]*[0-9]+[.)][ \t]+)/g, '$1\n\n$2');
  normalized = normalized.replace(/([^\n])\n([ \t]*[-*+][ \t]+)/g, '$1\n\n$2');
  normalized = normalized.replace(/([^\n])\n(#{1,4}[ \t]+)/g, '$1\n\n$2');

  // 5. Break concluding advice / remarks into separate paragraph
  normalized = normalized.replace(/([।!?])\s*(শুরুতে তুমি|পরবর্তী ধাপে|মনে রাখবে|শুভকামনা!|সারসংক্ষেপ:|উপসংহার:|Summary:|Next Steps:)/g, '$1\n\n$2');

  return normalized;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = language && language !== 'text' ? language.toUpperCase() : 'CODE';

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-[#252538] bg-[#0F1020] text-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#252538] bg-[#16172B] px-3.5 py-1.5 text-[11px]">
        <span className="font-mono font-semibold tracking-wider text-[#A78BFA]">{displayLang}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium text-[#C5C4DB] transition hover:bg-[#25253D] hover:text-white cursor-pointer"
        >
          {copied ? (
            <>
              <span className="text-[#10B981]">✓</span>
              <span className="text-[#10B981]">Copied</span>
            </>
          ) : (
            <>
              <Icon name="copy" className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-[13.5px] sm:text-[14px] leading-relaxed font-mono">
        <pre className="!bg-transparent !p-0 !m-0 overflow-visible font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

const components: Components = {
  p: ({ children }) => (
    <p className="mb-3.5 text-[15px] sm:text-[15.5px] leading-[1.78] text-[#2C2C3E] dark:text-[#E2E1F0] last:mb-0 break-words">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-4 ml-1 pl-5 list-disc space-y-2.5 text-[15px] sm:text-[15.5px] leading-[1.75] text-[#2C2C3E] dark:text-[#E2E1F0] last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 ml-1 pl-5 list-decimal space-y-3 text-[15px] sm:text-[15.5px] leading-[1.75] text-[#2C2C3E] dark:text-[#E2E1F0] last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1 leading-[1.75] marker:font-semibold marker:text-[#6E5CF6]">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[#18182E] dark:text-white">
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic text-[#3C3C54] dark:text-[#D1D0E4]">{children}</em>,
  h1: ({ children }) => (
    <h3 className="mb-2.5 mt-5 text-[17px] sm:text-[18px] font-bold text-[#18182E] dark:text-white pb-1 border-b border-[#F0EDFF] dark:border-[#2D2D44] first:mt-1">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 mt-4.5 text-[16px] sm:text-[16.5px] font-bold text-[#18182E] dark:text-white first:mt-1">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-1.5 mt-4 text-[15px] sm:text-[15.5px] font-semibold text-[#18182E] dark:text-white first:mt-1">
      {children}
    </h4>
  ),
  h4: ({ children }) => (
    <h5 className="mb-1 mt-3.5 text-[14px] sm:text-[14.5px] font-semibold text-[#18182E] dark:text-white">
      {children}
    </h5>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-[#6E5CF6] dark:text-[#9F8EFF] underline underline-offset-2 hover:text-[#5B4BDB]"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
    const isMultiLine = typeof children === 'string' && children.includes('\n');

    if (match || isMultiLine) {
      const codeStr = String(children).replace(/\n$/, '');
      return <CodeBlock language={match?.[1] || ''} code={codeStr} />;
    }

    return (
      <code className="rounded-md bg-[#F1EEFF] dark:bg-[#2A264D] px-1.5 py-0.5 font-mono text-[0.88em] font-semibold text-[#5B4BDB] dark:text-[#A78BFA] border border-[#E5E0FA] dark:border-[#3D3768]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    return <div className="not-prose my-1">{children}</div>;
  },
  blockquote: ({ children }) => (
    <blockquote className="my-4 rounded-r-xl border-l-[3.5px] border-[#7C6CFF] bg-[#F7F6FF] dark:bg-[#1E1B38] px-4 py-3 text-[14px] sm:text-[14.5px] leading-[1.72] text-[#474764] dark:text-[#C5C4DB]">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-[#E2DFF5] dark:border-[#2D2D45]">
      <table className="min-w-full border-collapse text-[13.5px] sm:text-[14px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-[#E2DFF5] dark:border-[#2D2D45] bg-[#F1EEFF] dark:bg-[#262444] px-3.5 py-2 text-left font-semibold text-[#18182E] dark:text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-[#EBE8F8] dark:border-[#2A2A3E] px-3.5 py-2 text-[#2C2C3E] dark:text-[#E2E1F0]">
      {children}
    </td>
  ),
  hr: () => <hr className="my-4 border-[#EAE7F7] dark:border-[#2D2B48]" />
};

export function Markdown({ text }: { text: string }) {
  const processedText = normalizeMarkdown(text);

  return (
    <div className="font-ai-reading selection:bg-[#E5E0FA] dark:selection:bg-[#3D3768]">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {processedText}
      </ReactMarkdown>
    </div>
  );
}
