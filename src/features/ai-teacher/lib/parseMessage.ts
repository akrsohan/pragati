import type { AnswerCard, Artifact, VisualData } from '../types';
import { extFor, slugify } from './utils';

/**
 * The AI answers in Markdown plus a few special fenced blocks:
 *   ```cards      JSON [{title, sub, color}]
 *   ```sources    JSON ["Pragati OS Guideline"]
 *   ```followups  JSON ["question 1", "question 2"]
 *   ```visual     JSON step-by-step array visualization
 *   ```document   Markdown text of a note / cheat-sheet / PDF  (title="Notes.pdf")
 *   ```html       Complete HTML page                            (title="index.html")
 *   ```python title="file.py"   Any code file
 */
export type Segment =
  | { type: 'text'; text: string }
  | { type: 'artifact'; id: string }
  | { type: 'pending'; label: string };

export interface ParsedMessage {
  segments: Segment[];
  cards: AnswerCard[];
  sources: string[];
  followups: string[];
  artifacts: Artifact[];
  /** artifact that should open automatically in the Visual Explainer */
  autoOpenId?: string;
}

interface VisualPayload extends Partial<VisualData> {
  title?: string;
}

function safeJson<T>(body: string): T | null {
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

function isVisual(v: VisualPayload | null): v is VisualPayload & VisualData {
  return (
    !!v &&
    Array.isArray(v.array) &&
    v.array.every((n) => typeof n === 'number') &&
    Array.isArray(v.steps) &&
    v.steps.length > 0 &&
    v.steps.every((s) => Number.isInteger(s.low) && Number.isInteger(s.high) && Number.isInteger(s.mid)) &&
    typeof v.code === 'string'
  );
}

const stringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 6) : [];

export function parseMessage(messageId: string, content: string): ParsedMessage {
  const out: ParsedMessage = { segments: [], cards: [], sources: [], followups: [], artifacts: [] };
  const re = /```([^\n`]*)\n([\s\S]*?)(?:```|$)/g;
  let last = 0;
  let idx = 0;
  const autoCandidates: Artifact[] = [];
  let m: RegExpExecArray | null;

  const pushText = (t: string) => {
    if (t.trim()) out.segments.push({ type: 'text', text: t.trim() });
  };
  const addArtifact = (a: Artifact, auto: boolean) => {
    out.artifacts.push(a);
    out.segments.push({ type: 'artifact', id: a.id });
    if (auto) autoCandidates.push(a);
  };

  while ((m = re.exec(content)) !== null) {
    pushText(content.slice(last, m.index));
    last = m.index + m[0].length;

    const info = m[1].trim();
    const body = m[2].replace(/\n$/, '');
    const closed = m[0].lastIndexOf('```') > 0;
    const lang = (info.split(/\s+/)[0] || 'text').toLowerCase();
    const title = /title="([^"]+)"/.exec(info)?.[1];
    const id = `${messageId}-a${idx++}`;

    switch (lang) {
      case 'cards': {
        const v = closed ? safeJson<AnswerCard[]>(body) : null;
        if (Array.isArray(v)) out.cards = v.filter((c) => c && typeof c.title === 'string').slice(0, 6);
        break;
      }
      case 'sources':
        if (closed) out.sources = stringArray(safeJson<unknown>(body));
        break;
      case 'followups':
        if (closed) out.followups = stringArray(safeJson<unknown>(body));
        break;
      case 'visual': {
        const v = closed ? safeJson<VisualPayload>(body) : null;
        if (isVisual(v)) {
          const name = v.title ?? title ?? 'Visualization';
          const language = v.language ?? 'python';
          addArtifact(
            {
              id,
              kind: 'visual',
              title: name,
              filename: `${slugify(name).replace(/-/g, '_')}.${extFor(language)}`,
              language,
              content: v.code,
              visual: { ...v, language },
            },
            true,
          );
        } else {
          out.segments.push({ type: 'pending', label: closed ? 'Visualization could not be loaded' : 'Preparing visualization...' });
        }
        break;
      }
      case 'document':
      case 'pdf': {
        const name = (title ?? 'Notes').replace(/\.(pdf|md)$/i, '');
        addArtifact(
          { id, kind: 'document', title: name, filename: `${slugify(name)}.md`, language: 'markdown', content: body },
          closed,
        );
        break;
      }
      case 'html':
        addArtifact(
          { id, kind: 'html', title: title ?? 'index.html', filename: title ?? 'index.html', language: 'html', content: body },
          closed,
        );
        break;
      default:
        addArtifact(
          { id, kind: 'code', title: title ?? lang, filename: title ?? `snippet.${extFor(lang)}`, language: lang, content: body },
          closed && !!title,
        );
    }
  }

  // remaining text; hide a half-typed fence such as "```pyth" while streaming
  pushText(content.slice(last).replace(/```[^\n`]*$/, ''));

  // Clean and extract any trailing text-based sources line into structured sources cards
  for (let i = 0; i < out.segments.length; i++) {
    const seg = out.segments[i];
    if (seg.type === 'text') {
      const srcMatch = /(?:\n|^)(?:\*{0,2}(?:Sources|Verified Resources|উৎস):?\*{0,2})\s*([^\n]+(?:\n[^\n]+)*)$/i.exec(seg.text);
      if (srcMatch) {
        if (out.sources.length === 0) {
          const lines = srcMatch[1]
            .split(/[\n,;•\-|]+/)
            .map((s) => s.trim().replace(/^\[|\]$/g, '').replace(/^\d+[\.\)]\s*/, ''))
            .filter((s) => s.length > 2);
          if (lines.length > 0) {
            out.sources = lines.slice(0, 4);
          }
        }
        const cleanedText = seg.text.slice(0, srcMatch.index).trim();
        if (cleanedText) {
          seg.text = cleanedText;
        } else {
          out.segments.splice(i, 1);
          i--;
        }
      }
    }
  }

  // visual > web page > document > code file; first one wins inside the same kind
  const priority: Record<Artifact['kind'], number> = { visual: 0, html: 1, document: 2, code: 3 };
  out.autoOpenId = [...autoCandidates].sort((x, y) => priority[x.kind] - priority[y.kind])[0]?.id;
  return out;
}
