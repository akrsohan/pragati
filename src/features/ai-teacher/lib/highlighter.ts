import Prism from 'prismjs';

// Load commonly used syntax definitions safely
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markup'; // HTML / XML
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

const LANG_MAP: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  h: 'c',
  hpp: 'cpp',
  html: 'markup',
  xml: 'markup',
  sh: 'bash',
  shell: 'bash',
  md: 'markdown',
};

/**
 * Safely highlight code using PrismJS.
 * Returns HTML string with span classes (token keyword, string, function, etc.).
 * Falls back to escaped plain text if grammar is missing or error occurs.
 */
export function highlightCode(code: string, language: string): string {
  if (!code) return '';
  const cleanLang = (language || 'text').trim().toLowerCase();
  const normalizedLang = LANG_MAP[cleanLang] || cleanLang;

  try {
    const grammar = Prism.languages[normalizedLang];
    if (grammar) {
      return Prism.highlight(code, grammar, normalizedLang);
    }
  } catch (e) {
    // Fall back to escaped plain text
  }

  // Safe HTML escaping fallback
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
