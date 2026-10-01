import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components: Components = {
  p: ({ children }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  h1: ({ children }) => <h3 className="mb-2 mt-3 text-lg font-bold">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-2 mt-3 text-base font-bold">{children}</h3>,
  h3: ({ children }) => <h4 className="mb-1 mt-2 text-sm font-bold">{children}</h4>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-[#7C6CFF] underline underline-offset-2">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-[#F1EEFF] px-1.5 py-0.5 font-mono text-[0.85em] text-[#5B4BDB]">{children}</code>
  ),
  pre: ({ children }) => <pre className="mb-3 overflow-x-auto rounded-xl bg-[#0F1020] p-3 text-sm text-white">{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-4 border-[#7C6CFF] bg-[#FAF9FF] px-3 py-1 text-[#4B4B63]">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-[#E2DFF5] bg-[#F1EEFF] px-3 py-1.5 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-[#E2DFF5] px-3 py-1.5">{children}</td>,
};

export function Markdown({ text }: { text: string }) {
  return (
    <div className="text-[14px]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
