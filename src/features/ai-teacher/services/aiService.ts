import type { ChatMessage, Language, TopicFilter } from '../types';
import { buildSystemPrompt } from './systemPrompt';
import { streamMock } from './mockAi';
import { supabase } from '../../../lib/supabase';
import { extFor } from '../lib/utils';

export interface StreamParams {
  history: ChatMessage[];
  topic: TopicFilter;
  language: Language;
  userName: string;
  skillId?: string;
  currentStepId?: string;
  quickAction?: string;
  signal?: AbortSignal;
  onToken: (chunk: string) => void;
}

function messageText(m: ChatMessage): string {
  const files = (m.attachments ?? [])
    .map((a) => `\n\n[Attached file: ${a.name}]\n\`\`\`\n${a.content}\n\`\`\``)
    .join('');
  return m.content + files;
}

function formatTeacherResponse(tData: any, fallbackReply?: string): string {
  if (!tData) return fallbackReply || '';

  let text = tData.answer || fallbackReply || '';

  // 1. Code artifact if present and not already formatted inside answer
  if (tData.code_snippet && typeof tData.code_snippet === 'string' && !text.includes(tData.code_snippet.slice(0, 30))) {
    const lang = (tData.code_language || 'python').toLowerCase();
    const safeTopic = (tData.current_topic || 'solution')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const filename = `${safeTopic || 'code'}.${extFor(lang)}`;
    text += `\n\n\`\`\`${lang} title="${filename}"\n${tData.code_snippet}\n\`\`\``;
  }

  // 2. Practice Question / Notes document artifact
  if (tData.practice_question && typeof tData.practice_question === 'string' && !text.includes(tData.practice_question.slice(0, 30))) {
    const docTitle = `${(tData.current_topic || 'Practice').slice(0, 24)} Challenge.md`;
    text += `\n\n\`\`\`document title="${docTitle}"\n# Practice Challenge: ${tData.current_topic || 'Topic'}\n\n${tData.practice_question}\n\n${tData.hint ? `> 💡 **Hint**: ${tData.hint}\n` : ''}\`\`\``;
  }

  // 3. Topic & Teaching Mode Summary Cards
  if (tData.current_topic && !text.includes('```cards')) {
    const cards: Array<{ title: string; sub?: string; color: string }> = [
      {
        title: tData.current_topic,
        sub: tData.related_step_title ? `Milestone: ${tData.related_step_title}` : 'Pragati Curriculum',
        color: '#7C6CFF'
      }
    ];
    if (tData.teaching_mode && tData.teaching_mode !== 'explanation') {
      cards.push({
        title: `Mode: ${tData.teaching_mode.toUpperCase()}`,
        sub: 'Interactive Learning Mode',
        color: '#10B981'
      });
    }
    text += `\n\n\`\`\`cards\n${JSON.stringify(cards)}\n\`\`\``;
  }

  // 4. Sources block: Grounded verified resources
  if (Array.isArray(tData.verified_resources) && tData.verified_resources.length > 0 && !text.includes('```sources')) {
    const sourceTitles = tData.verified_resources
      .map((r: any) => r.title || r.url)
      .filter((s: any): s is string => typeof s === 'string' && s.trim().length > 0);
    if (sourceTitles.length > 0) {
      text += `\n\n\`\`\`sources\n${JSON.stringify(sourceTitles.slice(0, 4))}\n\`\`\``;
    }
  }

  // 5. Follow-ups block: Suggested follow-ups
  if (Array.isArray(tData.suggested_followups) && tData.suggested_followups.length > 0 && !text.includes('```followups')) {
    const followups = tData.suggested_followups
      .filter((q: any): q is string => typeof q === 'string' && q.trim().length > 0)
      .slice(0, 3);
    if (followups.length > 0) {
      text += `\n\n\`\`\`followups\n${JSON.stringify(followups)}\n\`\`\``;
    }
  }

  return text;
}

export async function streamAnswer(p: StreamParams): Promise<void> {
  const lastUser = [...p.history].reverse().find((m) => m.role === 'user');
  const usable = p.history.filter((m) => m.content.trim() || (m.attachments?.length ?? 0) > 0).slice(-20);
  const system = buildSystemPrompt({ topic: p.topic, language: p.language, userName: p.userName });

  try {
    // 1. Get Supabase auth token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    // 2. Call existing server-side /api/ai-teacher endpoint
    const response = await fetch('/api/ai-teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        system,
        topic: p.topic,
        language: p.language,
        skillId: p.skillId,
        currentStepId: p.currentStepId,
        quickAction: p.quickAction,
        message: lastUser?.content || '',
        messages: usable.map((m) => ({ role: m.role, content: messageText(m) })),
        conversationHistory: usable.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: messageText(m)
        })),
        stream: true
      }),
      signal: p.signal
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.error || `AI Teacher service responded with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream available');
      const decoder = new TextDecoder();
      while (true) {
        if (p.signal?.aborted) {
          reader.cancel();
          return;
        }
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        p.onToken(chunk);
      }
      return;
    }

    const data = await response.json();
    const reply = formatTeacherResponse(data.data, data.reply);
    if (reply) {
      for (let i = 0; i < reply.length; i += 24) {
        if (p.signal?.aborted) return;
        p.onToken(reply.slice(i, i + 24));
        await new Promise((r) => setTimeout(r, 8));
      }
      return;
    }
  } catch (err: any) {
    if (p.signal?.aborted) return;
    console.warn('[streamAnswer] Backend connection notice, using grounded fallback:', err?.message || err);
    await streamMock(lastUser?.content ?? '', p.onToken, p.signal);
  }
}
