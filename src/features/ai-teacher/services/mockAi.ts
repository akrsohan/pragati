import type { VisualData } from '../types';

const F = '```';
const block = (info: string, body: string) => `${F}${info}\n${body}\n${F}`;

const BINARY_CODE = [
  'def binary_search(a, target):',
  '    low, high = 0, len(a) - 1',
  '    while low <= high:',
  '        mid = (low + high) // 2',
  '        if a[mid] == target: return mid',
  '        elif a[mid] < target: low = mid + 1',
  '        else: high = mid - 1',
  '    return -1',
].join('\n');

const BINARY_VISUAL: VisualData & { title: string } = {
  title: 'Binary search',
  subtitle: 'Find 23 in a sorted array',
  array: [2, 5, 8, 12, 16, 23, 38, 56, 72],
  target: 23,
  steps: [
    { low: 0, high: 8, mid: 4, note: 'mid = 4, value 16 is smaller than 23', detail: 'So the target is on the right: low = mid + 1', codeLine: 6 },
    { low: 5, high: 8, mid: 6, note: 'mid = 6, value 38 is greater than 23', detail: 'So the target is on the left: high = mid - 1', codeLine: 7 },
    { low: 5, high: 5, mid: 5, note: 'mid = 5, value 23 equals the target', detail: 'Found at index 5', codeLine: 5, found: true },
  ],
  code: BINARY_CODE,
  language: 'python',
  complexity: { time: 'O(log n)', space: 'O(1)' },
};

const REPLIES = {
  deadlock: [
    "A **deadlock** holo emon situation jekhane duita ba beshi process ek ar ekjoner resource er jonno wait kore, r kew-i agate pare na. Deadlock tokhon-i hoy jokhon **4 ta Coffman condition** ek sathe true hoy:",
    block('cards', JSON.stringify([
      { title: 'Mutual exclusion', sub: 'One resource, one process at a time', color: '#6366F1' },
      { title: 'Hold and wait', sub: 'Holds one resource, waits for more', color: '#F59E0B' },
      { title: 'No preemption', sub: 'Resource cannot be forcibly taken', color: '#10B981' },
      { title: 'Circular wait', sub: 'P1 waits for P2, P2 waits for P1', color: '#EC4899' },
    ])),
    block('sources', JSON.stringify(['Pragati OS Guideline', 'Roadmap: Semester 5'])),
    block('followups', JSON.stringify(['Real-life example', 'How to prevent deadlock', 'Give me exam questions'])),
  ].join('\n\n'),

  binary: [
    'Binary search sorted array-te kono item khuje ber kore, **protibar search range ke ordhek kore**. Ekhane step by step dekho (right side e Visual Explainer open hoyeche).',
    block('visual', JSON.stringify(BINARY_VISUAL)),
    block('python title="binary_search.py"', BINARY_CODE),
    '**Time complexity:** O(log n), karon protibar half element bad jay.',
    block('followups', JSON.stringify(['Explain the code', 'Practice problems', 'Binary search vs linear search'])),
  ].join('\n\n'),

  html: [
    'Ekta simple landing page ready. Preview tab e live dekho, r download kore nao.',
    block('html title="index.html"', `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #0f172a; color: #fff; text-align: center; padding: 64px 20px; }
    h1 { font-size: 40px; margin: 0 0 8px; }
    p { color: #94a3b8; }
    button { margin-top: 20px; background: linear-gradient(135deg,#7c6cff,#22c3e6); color: #fff; border: 0; padding: 12px 24px; border-radius: 999px; font-size: 16px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Hello Pragati</h1>
  <p>My first web page</p>
  <button onclick="alert('Welcome, CSE student!')">Click me</button>
</body>
</html>`),
    block('followups', JSON.stringify(['Explain this code', 'Add a navbar', 'Make it responsive'])),
  ].join('\n\n'),

  pdf: [
    'Tomar jonno ekta **Big-O cheat sheet** baniyechi. Preview dekho, tarpor PDF hishebe download koro.',
    block('document title="Big-O Cheat Sheet.pdf"', `# Big-O Cheat Sheet

## Common complexities
| Notation | Name | Example |
|---|---|---|
| O(1) | Constant | Array index access |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Linear search |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Bubble sort |

## Remember
- Drop constants: O(2n) becomes O(n)
- Keep the dominant term: O(n² + n) becomes O(n²)

> Tip: in exams, always write both time and space complexity.`),
    block('followups', JSON.stringify(['Explain O(n log n)', 'Give me practice questions'])),
  ].join('\n\n'),

  generic: [
    "Ami Pragati AI Teacher. Ekhon **demo mode** e achi (real AI connect kora nei), tai sample answer dekhacchi.",
    'Try korte paro:\n\n- `Deadlock ta ki?`\n- `Binary search ta bujhiye dao`\n- `Ekta HTML page banao`\n- `Big-O cheat sheet PDF banao`',
    block('followups', JSON.stringify(['Deadlock ta ki?', 'Binary search ta bujhiye dao', 'Big-O cheat sheet PDF banao'])),
  ].join('\n\n'),
};

export function getMockReply(text: string): string {
  const t = text.toLowerCase();
  if (/deadlock/.test(t)) return REPLIES.deadlock;
  if (/binary\s*search/.test(t)) return REPLIES.binary;
  if (/pdf|cheat\s*sheet|notes/.test(t)) return REPLIES.pdf;
  if (/html|web\s*page|webpage|landing/.test(t)) return REPLIES.html;
  return REPLIES.generic;
}

export async function streamMock(text: string, onToken: (chunk: string) => void, signal?: AbortSignal): Promise<void> {
  const reply = getMockReply(text);
  for (let i = 0; i < reply.length; i += 14) {
    if (signal?.aborted) return;
    onToken(reply.slice(i, i + 14));
    await new Promise((r) => setTimeout(r, 14));
  }
}
