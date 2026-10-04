import type { ChatMessage, Language, TopicFilter } from '../types';
import { buildSystemPrompt } from './systemPrompt';
import { supabase } from '../../../lib/supabase';
import { extFor, uid } from '../lib/utils';

export interface StreamParams {
  history: ChatMessage[];
  topic: TopicFilter;
  language: Language;
  userName: string;
  skillId?: string;
  currentStepId?: string;
  quickAction?: string;
  requestId?: string;
  signal?: AbortSignal;
  onToken: (chunk: string) => void;
  onResponseMeta?: (meta: { hasVisualArtifact: boolean; visual?: any; currentTopic?: string }) => void;
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

  // 1. Explicit visual artifact response (when visual !== null)
  if (tData.visual && typeof tData.visual === 'object') {
    const vType = (tData.visual.type || 'document').toLowerCase();
    const vTitle = tData.visual.title || (tData.current_topic ? `${tData.current_topic}` : 'Artifact');
    const vContent = tData.visual.content || '';

    if (vType === 'visual') {
      const visualBody = typeof vContent === 'object' ? JSON.stringify(vContent) : vContent;
      text += `\n\n\`\`\`visual\n${visualBody}\n\`\`\``;
    } else if (vType === 'html') {
      const htmlFilename = vTitle.endsWith('.html') ? vTitle : `${vTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.html`;
      text += `\n\n\`\`\`html title="${htmlFilename}"\n${vContent}\n\`\`\``;
    } else if (vType === 'code') {
      const lang = (tData.code_language || 'python').toLowerCase();
      const codeFilename = `${vTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.${extFor(lang)}`;
      text += `\n\n\`\`\`${lang} title="${codeFilename}"\n${vContent || tData.code_snippet || ''}\n\`\`\``;
    } else {
      // document / notes / cheat sheet
      const docFilename = (vTitle.endsWith('.md') || vTitle.endsWith('.pdf')) ? vTitle : `${vTitle}.md`;
      text += `\n\n\`\`\`document title="${docFilename}"\n${vContent}\n\`\`\``;
    }
  }

  // 2. Code snippet: if present and not already formatted inside answer or visual
  if (tData.code_snippet && typeof tData.code_snippet === 'string' && !text.includes(tData.code_snippet.slice(0, 30))) {
    const lang = (tData.code_language || 'python').toLowerCase();
    if (tData.visual) {
      const safeTopic = (tData.current_topic || 'solution')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      const filename = `${safeTopic || 'code'}.${extFor(lang)}`;
      text += `\n\n\`\`\`${lang} title="${filename}"\n${tData.code_snippet}\n\`\`\``;
    } else {
      text += `\n\n\`\`\`${lang}\n${tData.code_snippet}\n\`\`\``;
    }
  }

  // 3. Practice Question / Challenge (clean inline challenge, unless explicitly requested as document)
  if (tData.practice_question && typeof tData.practice_question === 'string' && !text.includes(tData.practice_question.slice(0, 30))) {
    if (tData.visual && tData.visual.type === 'document') {
      // already in visual document
    } else {
      text += `\n\n> 🎯 **Practice Challenge**: ${tData.practice_question}${tData.hint ? `\n> 💡 **Hint**: ${tData.hint}` : ''}`;
    }
  }

  // 4. Topic & Teaching Mode Summary Cards
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

  // 5. Sources block: Grounded verified resources
  if (Array.isArray(tData.verified_resources) && tData.verified_resources.length > 0 && !text.includes('```sources')) {
    const sourceTitles = tData.verified_resources
      .map((r: any) => r.title || r.url)
      .filter((s: any): s is string => typeof s === 'string' && s.trim().length > 0);
    if (sourceTitles.length > 0) {
      text += `\n\n\`\`\`sources\n${JSON.stringify(sourceTitles.slice(0, 4))}\n\`\`\``;
    }
  }

  // 6. Follow-ups block: Suggested follow-ups
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
  const currentQuestion = lastUser ? messageText(lastUser) : '';
  
  // Prior conversation history (strictly excluding the current user question)
  const priorHistory = p.history.slice(0, Math.max(0, p.history.length - 1));
  const usablePrior = priorHistory
    .filter((m) => m.content.trim() || (m.attachments?.length ?? 0) > 0)
    .slice(-10);

  const system = buildSystemPrompt({ topic: p.topic, language: p.language, userName: p.userName });
  const requestId = p.requestId || uid();

  try {
    // 1. Get Supabase auth token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    // 2. Call server-side /api/ai-teacher endpoint
    const response = await fetch('/api/ai-teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        requestId,
        system,
        topic: p.topic,
        language: p.language,
        skillId: p.skillId,
        currentStepId: p.currentStepId,
        quickAction: p.quickAction,
        message: currentQuestion,
        conversationHistory: usablePrior.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: messageText(m)
        })),
        stream: false
      }),
      signal: p.signal
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.error || `AI Teacher service responded with status ${response.status}`);
    }

    const data = await response.json();
    const hasVisual = Boolean(data?.data?.visual);
    p.onResponseMeta?.({ hasVisualArtifact: hasVisual, visual: data?.data?.visual, currentTopic: data?.data?.current_topic });

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
    console.error('[streamAnswer Error]:', err);
    p.onToken(`⚠️ **Notice:** ${err?.message || 'Could not reach AI Teacher. Please check your connection and try again.'}`);
  }
}
