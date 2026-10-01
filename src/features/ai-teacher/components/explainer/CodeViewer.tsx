import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

const KEYWORDS = new Set([
  'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'import', 'from', 'as', 'try', 'except',
  'finally', 'with', 'lambda', 'pass', 'break', 'continue', 'None', 'True', 'False', 'function', 'const', 'let', 'var', 'new', 'this',
  'async', 'await', 'export', 'default', 'public', 'private', 'protected', 'static', 'void', 'int', 'float', 'double', 'char', 'long',
  'bool', 'boolean', 'string', 'struct', 'include', 'using', 'namespace', 'switch', 'case', 'throw', 'throws', 'extends', 'implements',
  'interface', 'enum', 'typeof', 'null', 'undefined', 'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'CREATE', 'TABLE',
  'ORDER', 'BY', 'GROUP', 'INTO', 'VALUES',
]);

const TOKEN = /(\/\/.*|#.*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;

function highlight(line: string, language: string): ReactNode[] {
  const lang = language.toLowerCase();
  if (lang === 'html' || lang === 'xml') {
    return line.split(/(<\/?[\w!-][^>]*>)/g).map((part, i) =>
      part.startsWith('<') ? <span key={i} className="text-[#FF9E64]">{part}</span> : <span key={i}>{part}</span>,
    );
  }
  if (lang === 'markdown' || lang === 'md' || lang === 'text') return [line];
  return line.split(TOKEN).map((part, i) => {
    if (!part) return null;
    if (part.startsWith('//') || part.startsWith('#')) return <span key={i} className="text-[#6E71A8]">{part}</span>;
    if (part.startsWith('"') || part.startsWith("'")) return <span key={i} className="text-[#9ECE6A]">{part}</span>;
    if (/^\d/.test(part)) return <span key={i} className="text-[#FF9E64]">{part}</span>;
    if (KEYWORDS.has(part)) return <span key={i} className="text-[#C792EA]">{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

export function CodeViewer({ code, language, highlightLine, numbered = true }: { code: string; language: string; highlightLine?: number; numbered?: boolean }) {
  const lines = code.split('\n');
  return (
    <div className="overflow-x-auto rounded-2xl bg-[#12183A] py-4 text-[12.5px] leading-[26px] text-[#E6E6FF]">
      <pre className="min-w-max font-mono">
        {lines.map((l, i) => (
          <div key={i} className={cn('flex px-4', highlightLine === i + 1 && 'bg-[#6D5DF6]/35')}>
            {numbered && <span className="mr-4 w-5 shrink-0 select-none text-right text-[#5E688F]">{i + 1}</span>}
            <code className="whitespace-pre">{highlight(l, language)}</code>
          </div>
        ))}
      </pre>
    </div>
  );
}
