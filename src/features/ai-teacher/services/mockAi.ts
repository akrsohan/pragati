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

export function getMockReply(text: string): string {
  const t = text.toLowerCase().trim();
  const isBangla = /[\u0980-\u09FF]/.test(text) || /\b(ki|kivabe|bolo|koro|shikhte|chai|hobe|dao|bujhao|er|ar)\b/i.test(t);

  // 1. Check for EXPLICIT ARTIFACT requests (webpage creation, landing page, PDF, interactive diagram)
  const isExplicitWebpageRequest = /(landing\s*page|webpage\s*banao|website\s*banao|create\s*(an?\s*)?html\s*file|build\s*(a\s*)?webpage|html\s*file\s*create)/i.test(t);
  const isExplicitPdfRequest = /(pdf\s*banao|make\s*(a\s*)?pdf|create\s*(a\s*)?(pdf|study\s*sheet|cheat\s*sheet)|note\s*pdf|downloadable\s*pdf)/i.test(t);
  const isExplicitDiagramRequest = /(interactive\s*visualization|visual\s*diagram|visual\s*explainer\s*dekhao|step\s*by\s*step\s*visual)/i.test(t);

  if (isExplicitWebpageRequest) {
    return [
      isBangla
        ? 'তোমার অনুরোধ অনুযায়ী একটি কমপ্লিট HTML ল্যান্ডিং পেজ তৈরি করা হয়েছে। Preview ট্যাবে সরাসরি লাইভ প্রিভিউ দেখতে পারো এবং ফাইলটি ডাউনলোড করতে পারো।'
        : 'Here is a complete HTML landing page as requested. You can preview it live in the preview panel and download the file.',
      block('html title="index.html"', `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pragati CSE Webpage</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #0f172a; color: #fff; text-align: center; padding: 64px 20px; }
    h1 { font-size: 36px; margin: 0 0 12px; color: #7c6cff; }
    p { color: #94a3b8; max-width: 600px; margin: 0 auto 24px; line-height: 1.6; }
    button { background: linear-gradient(135deg,#7c6cff,#22c3e6); color: #fff; border: 0; padding: 12px 24px; border-radius: 999px; font-size: 15px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Welcome to Pragati CSE</h1>
  <p>Learn Computer Science & Engineering step-by-step with verified university guidelines and expert AI mentorship.</p>
  <button onclick="alert('Welcome!')">Explore Curriculum</button>
</body>
</html>`),
      block('followups', JSON.stringify(['Add a navigation bar', 'Make it responsive', 'Explain HTML structure']))
    ].join('\n\n');
  }

  if (isExplicitPdfRequest) {
    return [
      isBangla
        ? 'তোমার জন্য একটি **Study Cheat Sheet / PDF Document** তৈরি করা হয়েছে। ডানদিকের প্রিভিউ প্যানেলে দেখতে পারো এবং PDF হিসেবে ডাউনলোড করতে পারো।'
        : 'Here is your structured **Study Cheat Sheet / PDF Document**. You can review and download it as PDF from the panel.',
      block('document title="Study_Notes.pdf"', `# Computer Science Study Notes
## Key Concepts & Overview
- **Fundamentals**: Master foundational data structures and core algorithms.
- **Time Complexity**: Always analyze Best, Average, and Worst-case bounds ($O(1)$, $O(\\log n)$, $O(n)$, $O(n \\log n)$).
- **Practical Design**: Write clean, modular, and maintainable code.

> Tip: In technical exams and interviews, always explain the underlying mechanism before jumping to code.`),
      block('followups', JSON.stringify(['Add more examples', 'Give practice questions', 'Explain Big-O notations']))
    ].join('\n\n');
  }

  if (isExplicitDiagramRequest && /binary\s*search/.test(t)) {
    return [
      isBangla
        ? 'Binary Search-এর step-by-step Visual Explanation ডানদিকের Visual Explainer প্যানেলে ওপেন করা হয়েছে:'
        : 'Interactive step-by-step Visual Explanation for Binary Search is ready in the Visual Explainer:',
      block('visual', JSON.stringify(BINARY_VISUAL)),
      block('python title="binary_search.py"', BINARY_CODE),
      '**Time Complexity**: $O(\\log n)$, কারণ প্রতি ধাপে সার্চ স্পেস অর্ধেক হয়ে যায়।',
      block('followups', JSON.stringify(['Explain the code', 'Practice problems', 'Binary search vs Linear search']))
    ].join('\n\n');
  }

  // 2. DEFINITION / CONCEPTUAL QUESTIONS (NO CODE, NO ARTIFACT)
  if (/html/.test(t) && /(full\s*form|full\s*name|ki\b|define|meaning|stands\s*for|what\s*is)/i.test(t)) {
    return isBangla
      ? `**HTML**-এর পূর্ণরূপ হলো **HyperText Markup Language**।

এটি কোনো প্রোগ্রামিং ল্যাঙ্গুয়েজ নয়, বরং এটি একটি স্ট্যান্ডার্ড মার্কআপ ল্যাঙ্গুয়েজ যা দিয়ে ওয়েব পেজের মূল গঠন বা কন্টেন্টের কাঠামো (যেমন: headings, paragraphs, links, images, tables, forms) তৈরি করা হয়।

### প্রধান বিষয়সমূহ:
1. **HyperText**: এর মাধ্যমে একটি ওয়েব পেজের সাথে অন্য পেজের লিংক বা হাইপারলিংক তৈরি করা যায়।
2. **Markup Language**: এটি নির্দিষ্ট ট্যাগ (\`<tag>\`) এবং এলিমেন্ট ব্যবহার করে ব্রাউজারকে নির্দেশ দেয় টেক্সট ও কন্টেন্ট কীভাবে প্রদর্শিত হবে।`
      : `**HTML** stands for **HyperText Markup Language**.

It is the standard markup language used by web browsers to structure and display content (such as headings, paragraphs, images, links, and forms) on the World Wide Web.

### Key Characteristics:
1. **HyperText**: Refers to links that connect web pages to one another.
2. **Markup**: Uses tags (\`<tag>\`) to annotate text, images, and other content for web browsers to render accurately.`;
  }

  if (/css/.test(t) && /(full\s*form|ki\b|define|meaning|stands\s*for|what\s*is)/i.test(t)) {
    return isBangla
      ? `**CSS**-এর পূর্ণরূপ হলো **Cascading Style Sheets**।

এটি ওয়েব পেজের ভিজ্যুয়াল ডিজাইন, লেআউট, কালার, ফন্ট এবং রেসপন্সিভনেস নিয়ন্ত্রণের জন্য ব্যবহৃত একটি স্টাইলশিট ল্যাঙ্গুয়েজ।`
      : `**CSS** stands for **Cascading Style Sheets**.

It is a stylesheet language used to describe the presentation, layout, colors, fonts, and responsiveness of an HTML document.`;
  }

  if (/pointer/.test(t) && /(ki\b|what\s*is|define|meaning)/i.test(t) && !/code\s*dao|example\s*code/i.test(t)) {
    return isBangla
      ? `C/C++ প্রোগ্রামিংয়ে **Pointer** হলো এমন একটি ভ্যারিয়েবল যা সরাসরি কোনো ডেটা ভ্যালু ধারণ না করে অন্য একটি ভ্যারিয়েবলের **মেমোরি অ্যাড্রেস (Memory Address)** স্টোর করে।

### কেন Pointer ব্যবহার করা হয়?
1. **Direct Memory Access**: মেমোরির সাথে সরাসরি কাজ করার সুবিধা দেয়।
2. **Dynamic Memory Allocation**: রানটাইমে \`malloc()\` বা \`calloc()\` দিয়ে মেমোরি ম্যানেজ করতে সাহায্য করে।
3. **Pass-by-Reference**: বড় ডেটা স্ট্রাকচার পুরো কপি না করে শুধু রেফারেন্স পাস করে দ্রুত কাজ সম্পন্ন করে।`
      : `In C/C++, a **pointer** is a variable that stores the **memory address** of another variable rather than holding a direct data value.

### Key Applications:
1. **Direct Memory Manipulation**: Direct hardware and memory access.
2. **Dynamic Memory Allocation**: Managing heap memory at runtime using \`malloc\` and \`free\`.
3. **Efficient Pass-by-Reference**: Passing large structures to functions without copying data.`;
  }

  if (/deadlock/.test(t)) {
    return isBangla
      ? `Operating System-এ **Deadlock** হলো এমন একটি অচলাবস্থা যেখানে দুই বা ততোধিক প্রসেস পরস্পরের আটকে রাখা রিসোর্সের জন্য অনির্দিষ্টকালের জন্য অপেক্ষা করে এবং কোনো প্রসেসই অগ্রসর হতে পারে না।

### Deadlock সৃষ্টির ৪টি শর্ত (Coffman Conditions):
1. **Mutual Exclusion**: অন্তত একটি রিসোর্স এমন হতে হবে যা একসাথে কেবল একটি প্রসেস ব্যবহার করতে পারে।
2. **Hold and Wait**: একটি প্রসেস অন্তত একটি রিসোর্স ধরে রেখে অন্য রিসোর্সের জন্য অপেক্ষা করবে।
3. **No Preemption**: রিসোর্স শেষ হওয়ার আগে জোরপূর্বক কেড়ে নেওয়া যাবে না।
4. **Circular Wait**: প্রসেসগুলোর মধ্যে চক্রাকার অপেক্ষার চেইন তৈরি হবে (P1 $\\rightarrow$ P2 $\\rightarrow$ P3 $\\rightarrow$ P1)।`
      : `In Operating Systems, a **deadlock** is a situation where two or more processes are unable to proceed because each is waiting for the other to release resources.

### The 4 Coffman Conditions:
1. **Mutual Exclusion**: At least one non-shareable resource.
2. **Hold and Wait**: A process holds resources while requesting others.
3. **No Preemption**: Resources cannot be forcibly reclaimed.
4. **Circular Wait**: A closed loop of processes where each waits for a resource held by the next.`;
  }

  // 3. CODE REQUEST ONLY (Markdown code block, NO ARTIFACT / NO VISUAL)
  if (/(code\s*dao|code\s*example|implementation\s*dao|write\s*(the\s*)?code|show\s*(me\s*)?(the\s*)?syntax|syntax\s*dao)/i.test(t)) {
    if (/html/.test(t)) {
      return isBangla
        ? `নিচে একটি আদর্শ HTML ডকুমেন্টের বেসিক স্ট্রাকচার কোড দেওয়া হলো:\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Basic Structure</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n    <p>This is a basic HTML paragraph.</p>\n</body>\n</html>\n\`\`\``
        : `Here is the standard basic HTML document structure:\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Basic Structure</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n    <p>This is a basic HTML paragraph.</p>\n</body>\n</html>\n\`\`\``;
    }
    if (/pointer/.test(t) || /c\b/.test(t)) {
      return isBangla
        ? `C-তে পয়েন্টারের একটি কার্যকর কোড উদাহরণ:\n\n\`\`\`c\n#include <stdio.h>\n\nint main() {\n    int num = 42;\n    int *ptr = &num; // num-এর address ptr-এ রাখা হলো\n\n    printf("Value of num: %d\\n", num);\n    printf("Address of num: %p\\n", (void*)&num);\n    printf("Value via ptr: %d\\n", *ptr);\n    return 0;\n}\n\`\`\``
        : `Here is a clear C pointer code example:\n\n\`\`\`c\n#include <stdio.h>\n\nint main() {\n    int num = 42;\n    int *ptr = &num;\n    printf("Value: %d\\n", num);\n    printf("Address: %p\\n", (void*)&num);\n    printf("Dereferenced: %d\\n", *ptr);\n    return 0;\n}\n\`\`\``;
    }
  }

  // Generic clean answer
  return isBangla
    ? `**${text}** সম্পর্কিত মূল ধারণা:

কম্পিউটার সায়েন্স ও সফটওয়্যার ইঞ্জিনিয়ারিংয়ে এটি একটি গুরুত্বপূর্ণ বিষয়। বিষয়টির মূল মেকানিজম এবং প্র্যাকটিক্যাল প্রয়োগ সম্পর্কে কোনো নির্দিষ্ট প্রশ্ন বা কোড দেখতে চাইলে জানাতে পারো!`
    : `Regarding your question on **"${text}"**:

In Computer Science & Software Engineering, mastering this topic involves understanding its underlying mechanism, trade-offs, and practical use cases. Feel free to ask for a deeper dive or a code example!`;
}

export async function streamMock(text: string, onToken: (chunk: string) => void, signal?: AbortSignal): Promise<void> {
  const reply = getMockReply(text);
  for (let i = 0; i < reply.length; i += 16) {
    if (signal?.aborted) return;
    onToken(reply.slice(i, i + 16));
    await new Promise((r) => setTimeout(r, 12));
  }
}
