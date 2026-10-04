import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { supabase } from '../src/lib/supabase';

function generateDeterministicTeacherResponse(
  skill: any,
  focusedStep: any,
  message: string,
  quickAction?: string
) {
  const isBangla = /[\u0980-\u09FF]/.test(message) || /\b(ki|kivabe|bolo|koro|shikhte|chai|hobe)\b/i.test(message);
  const questionTopic = focusedStep?.title || skill?.name || 'Computer Science & Engineering';

  if (quickAction === 'code' || message.toLowerCase().includes('code')) {
    return {
      answer: isBangla
        ? `নিচে **${questionTopic}** সম্পর্কিত একটি প্রাথমিক ও কার্যকর কোড উদাহরণ দেওয়া হলো:`
        : `Here is a practical code example demonstrating **${questionTopic}**:`,
      teaching_mode: 'example',
      current_topic: questionTopic,
      related_step_title: focusedStep?.title || null,
      code_snippet: `#include <stdio.h>\n\nint main() {\n    printf("Pragati CSE Concept: ${questionTopic}\\n");\n    return 0;\n}`,
      code_language: 'c',
      hint: isBangla ? 'কোডটি নিজে রান করে আউটপুট পর্যবেক্ষণ করো।' : 'Try executing this snippet in your local compiler.',
      practice_question: isBangla ? 'এই কোডে কী পরিবর্তন করলে আউটপুট ডায়নামিক হবে?' : 'How would you modify this code to accept dynamic user input?',
      visual: null,
      suggested_followups: [
        `How does this concept work in practical software development?`,
        `Can you explain the step-by-step logic behind this?`,
        `What are the common edge cases to watch out for?`
      ]
    };
  }

  return {
    answer: isBangla
      ? `**${questionTopic}** হলো Computer Science & Engineering-এর একটি অত্যন্ত গুরুত্বপূর্ণ বিষয়।\n\n### মূল ধারণা:\n1. এটি সিস্টেমের কাঠামো ও কার্যপদ্ধতি বুঝতে সহায়তা করে।\n2. বাস্তব প্রজেক্ট ও সফটওয়্যার তৈরিতে এর সরাসরি প্রয়োগ রয়েছে।\n\nতোমার কোনো নির্দিষ্ট প্রশ্ন থাকলে সরাসরি জিজ্ঞাসা করতে পারো!`
      : `**${questionTopic}** is a fundamental concept in Computer Science & Engineering.\n\n### Key Principles:\n1. It provides core architectural understanding.\n2. It has direct practical applications in real-world software engineering.\n\nFeel free to ask any specific question!`,
    teaching_mode: 'explanation',
    current_topic: questionTopic,
    related_step_title: focusedStep?.title || null,
    practice_question: isBangla ? `${questionTopic}-এর প্রধান সুবিধা কী?` : `What is the primary advantage of ${questionTopic}?`,
    hint: isBangla ? 'মৌলিক বিষয়গুলো আগে পরিষ্কার করো, এরপর অ্যাডভান্সড অংশে যাও।' : 'Focus on the fundamentals before moving to advanced edge cases.',
    code_snippet: null,
    code_language: null,
    visual: null,
    suggested_followups: [
      `Can you give a code example of ${questionTopic}?`,
      `Explain ${questionTopic} with a simple real-world analogy.`,
      `Give me a practice quiz on this.`
    ]
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    let authenticatedUserId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          const { data: authData, error: authError } = await supabase.auth.getUser(token);
          if (!authError && authData?.user?.id) {
            authenticatedUserId = authData.user.id;
          }
        } catch (e) {
          console.warn('[Vercel AI Teacher Auth notice]:', e);
        }
      }
    }

    const { skillId: rawSkillId, currentStepId, message, conversationHistory, quickAction, topic, language, userName: reqUserName } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Missing or empty message parameter.' });
      return;
    }

    const trimmedMessage = message.trim().slice(0, 2500);

    let skillId = rawSkillId;
    let skill: any = null;
    let resolvedSkillId: string | null = null;

    if (rawSkillId && rawSkillId !== 'All topics' && rawSkillId !== 'general') {
      const { data: exactSkill } = await supabase
        .from('skills')
        .select('id, name, description, difficulty, avg_days')
        .eq('id', rawSkillId)
        .maybeSingle();

      if (exactSkill) {
        skill = exactSkill;
        resolvedSkillId = exactSkill.id;
      }
    }

    let steps: any[] = [];
    if (resolvedSkillId) {
      const { data: rawSteps } = await supabase
        .from('roadmap_steps')
        .select('*')
        .eq('skill_id', resolvedSkillId)
        .order('step_order', { ascending: true });
      steps = rawSteps || [];
    }

    let resources: any[] = [];
    if (resolvedSkillId) {
      const { data: rawResources } = await supabase
        .from('skill_resources')
        .select('id, title, type, format, url, description')
        .eq('skill_id', resolvedSkillId);
      resources = rawResources || [];
    }

    let userProgress: any = null;
    if (resolvedSkillId && authenticatedUserId) {
      const { data: up } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .eq('skill_id', resolvedSkillId)
        .maybeSingle();
      userProgress = up;
    }

    let profile: any = null;
    if (authenticatedUserId) {
      const { data: p } = await supabase
        .from('profiles')
        .select('full_name, department')
        .eq('id', authenticatedUserId)
        .maybeSingle();
      profile = p;
    }

    const studentFullName = profile?.full_name || (typeof reqUserName === 'string' && reqUserName.trim()) || 'Student';
    const studentDept = profile?.department || 'CSE';

    const isCompleted = userProgress?.status === 'completed';
    const completedStepOrders: number[] = isCompleted
      ? steps.map(s => s.step_order)
      : Array.isArray(userProgress?.steps_completed)
        ? userProgress.steps_completed
        : [];

    const completedSteps = steps.filter(s => completedStepOrders.includes(s.step_order));
    const incompleteSteps = steps.filter(s => !completedStepOrders.includes(s.step_order));
    const matchPercentage = steps.length > 0
      ? Math.min(100, Math.max(0, Math.round((completedSteps.length / steps.length) * 100)))
      : 0;

    let masteryLevel: 'Novice' | 'Beginner' | 'Developing' | 'Proficient' | 'Mastered' = 'Beginner';
    if (matchPercentage === 100 || isCompleted) masteryLevel = 'Mastered';
    else if (matchPercentage >= 75) masteryLevel = 'Proficient';
    else if (matchPercentage >= 40) masteryLevel = 'Developing';
    else if (matchPercentage > 0) masteryLevel = 'Beginner';
    else masteryLevel = 'Novice';

    let focusedStep = null;
    if (steps.length > 0) {
      if (currentStepId && typeof currentStepId === 'string' && currentStepId.trim().length > 0) {
        focusedStep = steps.find(s => s.id === currentStepId.trim()) || null;
      }
      if (!focusedStep) {
        focusedStep = incompleteSteps.length > 0 ? incompleteSteps[0] : steps[0];
      }
    }

    const verifiedResourcesForStep: Array<{ title: string; url: string; format?: string; type?: string }> = [];
    if (focusedStep?.drive_link && (focusedStep.drive_link.startsWith('http://') || focusedStep.drive_link.startsWith('https://'))) {
      verifiedResourcesForStep.push({
        title: `${focusedStep.title} (Lecture Notes / Google Drive PDF)`,
        url: focusedStep.drive_link,
        format: 'drive',
        type: 'document'
      });
    }
    if (focusedStep?.resource_link && (focusedStep.resource_link.startsWith('http://') || focusedStep.resource_link.startsWith('https://'))) {
      verifiedResourcesForStep.push({
        title: `${focusedStep.title} (Official Documentation / Reference)`,
        url: focusedStep.resource_link,
        format: 'link',
        type: 'reference'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!geminiApiKey) {
      const fallbackResult = generateDeterministicTeacherResponse(skill, focusedStep, trimmedMessage, quickAction);
      res.status(200).json({
        success: true,
        data: {
          ...fallbackResult,
          verified_resources: verifiedResourcesForStep
        }
      });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const sanitizedHistory: Array<{ role: 'user' | 'model'; text: string }> = [];
    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-8)) {
        if (turn && typeof turn.text === 'string' && (turn.role === 'user' || turn.role === 'assistant' || turn.role === 'model')) {
          const role = (turn.role === 'assistant' || turn.role === 'model') ? 'model' : 'user';
          const text = turn.text.trim().slice(0, 1000);
          if (!text || (role === 'user' && text === trimmedMessage)) continue;
          sanitizedHistory.push({ role, text });
        }
      }
    }

    const systemInstruction = `You are Pragati AI Teacher — an expert-level Computer Science educator, senior software engineer, technical mentor, and university academic instructor for CSE students.
Answer accurately, thoroughly, directly with multi-paragraph Markdown formatting and code snippets where helpful.`;

    let historyText = '';
    if (sanitizedHistory.length > 0) {
      historyText = sanitizedHistory.map(h => `${h.role === 'user' ? 'Student' : 'AI Teacher'}: ${h.text}`).join('\n\n');
    }

    const userPromptText = `<student_context>
Name: ${studentFullName}
Department: ${studentDept}
</student_context>

<current_question>
${trimmedMessage}
</current_question>

<final_instruction>
Answer the student's question "${trimmedMessage}" accurately with multi-paragraph Markdown.
In the JSON response:
- "answer": Your expert answer in Markdown.
- "current_topic": Specific topic title.
- "teaching_mode": "explanation", "example", "practice", or "hint".
</final_instruction>`;

    const contents: any[] = [];
    for (const h of sanitizedHistory) {
      contents.push({ role: h.role, parts: [{ text: h.text }] });
    }
    contents.push({ role: 'user', parts: [{ text: userPromptText }] });

    let rawResult: any = null;
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash-lite'];

    for (const modelName of candidateModels) {
      try {
        const config: any = {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING },
              teaching_mode: { type: Type.STRING },
              current_topic: { type: Type.STRING },
              related_step_title: { type: Type.STRING, nullable: true },
              practice_question: { type: Type.STRING, nullable: true },
              hint: { type: Type.STRING, nullable: true },
              code_snippet: { type: Type.STRING, nullable: true },
              code_language: { type: Type.STRING, nullable: true },
              suggested_followups: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['answer', 'teaching_mode', 'current_topic']
          }
        };

        if (modelName === 'gemini-3.8-flash') {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.MEDIUM };
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config
        });

        if (response.text) {
          rawResult = JSON.parse(response.text);
          break;
        }
      } catch (e) {
        console.warn(`[Vercel API Model ${modelName} notice]:`, e);
      }
    }

    if (!rawResult) {
      rawResult = generateDeterministicTeacherResponse(skill, focusedStep, trimmedMessage, quickAction);
    }

    res.status(200).json({
      success: true,
      requestId: crypto.randomUUID(),
      data: {
        ...rawResult,
        verified_resources: verifiedResourcesForStep
      }
    });
  } catch (err: any) {
    console.error('[Vercel AI Teacher Handler error]:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
