import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { supabase } from './src/lib/supabase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Parse JSON request bodies
app.use(express.json({ limit: '1mb' }));

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Pragati AI API',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

/**
 * Deterministic fallback generator when Gemini API experiences temporary 503 spikes or rate limits
 */
function generateDeterministicAnalysis(
  skill: { id: string; name: string; difficulty?: string },
  steps: Array<{ id: string; title: string; description?: string; step_order: number; resource_link?: string; drive_link?: string }>,
  resources: Array<{ id: string; title: string; url: string; format?: string; type?: string }>,
  completedSteps: Array<{ id: string; title: string; description?: string; step_order: number; resource_link?: string; drive_link?: string }>,
  incompleteSteps: Array<{ id: string; title: string; description?: string; step_order: number; resource_link?: string; drive_link?: string }>,
  matchPercentage: number,
  masteryLevel: 'Novice' | 'Beginner' | 'Developing' | 'Proficient' | 'Mastered'
) {
  const skillGaps = incompleteSteps.map((step, idx) => {
    const priority = idx === 0 ? 'HIGH' : idx < 3 ? 'MEDIUM' : 'LOW';
    const subtopics = step.description ? step.description.split('||').map(s => s.trim()).filter(Boolean) : [];
    const subtopicSnippet = subtopics.length > 0 ? ` Covers: ${subtopics.slice(0, 3).join(', ')}.` : '';

    let verifiedUrl = step.drive_link || step.resource_link || null;
    if (!verifiedUrl && resources.length > 0) {
      verifiedUrl = resources[0].url;
    }

    return {
      step_id: step.id,
      step_order: step.step_order,
      topic_title: step.title,
      priority,
      gap_reason: idx === 0 
        ? `Foundational immediate prerequisite for mastering ${skill.name}.${subtopicSnippet}`
        : `Core curriculum milestone required for track proficiency.${subtopicSnippet}`,
      recommended_action: `Complete milestone #${step.step_order} ("${step.title}") in Pragati's verified roadmap.`,
      verified_resource_url: verifiedUrl
    };
  });

  const nextMilestone = incompleteSteps.length > 0 ? incompleteSteps[0].title : 'Curriculum Mastered';
  const nextOrder = incompleteSteps.length > 0 ? incompleteSteps[0].step_order : steps.length;
  const nextStepId = incompleteSteps.length > 0 ? incompleteSteps[0].id : (steps[steps.length - 1]?.id || undefined);

  let overallSummary = '';
  if (matchPercentage === 100) {
    overallSummary = `Congratulations! You have completed all ${steps.length} verified curriculum milestones in ${skill.name}. You demonstrate full track mastery.`;
  } else if (matchPercentage === 0) {
    overallSummary = `You are at the starting gate of the ${skill.name} curriculum. Begin with Milestone #1 ("${steps[0]?.title || 'Fundamentals'}") to build core foundations.`;
  } else {
    overallSummary = `You have completed ${completedSteps.length} of ${steps.length} milestones (${matchPercentage}% readiness). Focus next on Milestone #${nextOrder} ("${nextMilestone}") to bridge remaining gaps.`;
  }

  return {
    target_skill_id: skill.id,
    target_skill_name: skill.name,
    difficulty: skill.difficulty,
    mastery_level: masteryLevel,
    match_percentage: matchPercentage,
    total_milestones: steps.length,
    completed_milestones_count: completedSteps.length,
    overall_gap_summary: overallSummary,
    estimated_hours_to_close_gap: Math.max(1, incompleteSteps.length * 2),
    next_recommended_milestone: nextMilestone,
    next_recommended_step_order: nextOrder,
    next_recommended_step_id: nextStepId,
    skill_gaps: skillGaps,
    key_strengths: completedSteps.map(s => s.title).slice(0, 4)
  };
}

/**
 * POST /api/analyze-skill-gap
 * Protected endpoint for AI Skill Gap Analysis
 */
app.post('/api/analyze-skill-gap', async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Verify Supabase JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required. Please log in to analyze your skill gaps.',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData?.user) {
      res.status(401).json({
        error: 'Invalid or expired session. Please log in again.',
        code: 'INVALID_SESSION'
      });
      return;
    }

    const authenticatedUserId = authData.user.id;

    // 2. Validate requested skillId
    let { skillId } = req.body;
    if (!skillId || typeof skillId !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid skillId parameter.',
        code: 'BAD_REQUEST'
      });
      return;
    }

    // 3. Fetch Skill details from Supabase (Source of Truth)
    let { data: skill } = await supabase
      .from('skills')
      .select('id, name, description, difficulty, avg_days, field_id, step_count')
      .eq('id', skillId)
      .maybeSingle();

    if (!skill) {
      const cleanName = String(skillId)
        .replace(/^skill[-_]?/i, '')
        .replace(/[-_]/g, ' ')
        .trim()
        .toLowerCase();
      const { data: allSkills } = await supabase
        .from('skills')
        .select('id, name, description, difficulty, avg_days, field_id, step_count');
      if (allSkills && allSkills.length > 0) {
        skill = allSkills.find(s => {
          const sName = s.name.toLowerCase();
          return sName === cleanName || sName.includes(cleanName) || cleanName.includes(sName);
        }) || allSkills[0];
        skillId = skill.id;
      }
    }

    if (!skill) {
      res.status(404).json({
        error: `Skill track "${skillId}" not found in Pragati curriculum.`,
        code: 'SKILL_NOT_FOUND'
      });
      return;
    }

    // 4. Fetch Roadmap Steps for this Skill
    const { data: rawSteps, error: stepsError } = await supabase
      .from('roadmap_steps')
      .select('*')
      .eq('skill_id', skillId)
      .order('step_order', { ascending: true });

    if (stepsError) {
      console.error('[Supabase roadmap_steps error]:', stepsError.message);
    }

    const steps = (rawSteps || []).map((row: any) => {
      let detailsObj: any = null;
      if (row.details) {
        try {
          detailsObj = typeof row.details === 'string' ? JSON.parse(row.details) : row.details;
        } catch (e) {
          if (typeof row.details === 'string' && (row.details.includes('drive.google.com') || row.details.startsWith('http'))) {
            detailsObj = { drive_link: row.details };
          }
        }
      }

      return {
        id: row.id,
        skill_id: row.skill_id,
        title: row.title,
        description: row.description || '',
        step_order: Number(row.step_order) || 1,
        resource_link: row.resource_link || detailsObj?.resource_link || undefined,
        drive_link: row.drive_link || detailsObj?.drive_link || undefined
      };
    });

    // 5. Incomplete Roadmap Guard
    // If admin has not published roadmap steps, NEVER call Gemini or fabricate curriculum.
    if (!steps || steps.length < 2) {
      res.json({
        available: false,
        reason: 'ROADMAP_INCOMPLETE',
        skillName: skill.name,
        message: `The curriculum for ${skill.name} is currently being curated by the Pragati Administrator. AI Skill Gap Analysis will unlock as soon as the roadmap milestones are published.`
      });
      return;
    }

    // 6. Fetch verified resources for this skill
    const { data: rawResources } = await supabase
      .from('skill_resources')
      .select('id, title, type, format, url, description')
      .eq('skill_id', skillId);

    const resources = rawResources || [];

    // 7. Fetch the authenticated user's progress on this skill
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', authenticatedUserId)
      .eq('skill_id', skillId)
      .maybeSingle();

    // 8. Fetch student profile context
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, department, batch_number, points, current_streak')
      .eq('id', authenticatedUserId)
      .maybeSingle();

    // 9. Deterministic calculation of progress metrics
    const isCompleted = userProgress?.status === 'completed';
    const completedStepOrders: number[] = isCompleted
      ? steps.map(s => s.step_order)
      : Array.isArray(userProgress?.steps_completed)
        ? userProgress.steps_completed
        : [];

    const completedSteps = steps.filter(s => completedStepOrders.includes(s.step_order));
    const incompleteSteps = steps.filter(s => !completedStepOrders.includes(s.step_order));
    const matchPercentage = Math.min(100, Math.max(0, Math.round((completedSteps.length / steps.length) * 100)));

    let masteryLevel: 'Novice' | 'Beginner' | 'Developing' | 'Proficient' | 'Mastered';
    if (matchPercentage === 100 || isCompleted) {
      masteryLevel = 'Mastered';
    } else if (matchPercentage >= 75) {
      masteryLevel = 'Proficient';
    } else if (matchPercentage >= 40) {
      masteryLevel = 'Developing';
    } else if (matchPercentage > 0) {
      masteryLevel = 'Beginner';
    } else {
      masteryLevel = 'Novice';
    }

    // 10. Verify Gemini API Key configuration
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // Return deterministic verified analysis if API key is not yet configured
      const fallbackResult = generateDeterministicAnalysis(
        skill,
        steps,
        resources,
        completedSteps,
        incompleteSteps,
        matchPercentage,
        masteryLevel
      );
      res.json({ available: true, data: fallbackResult });
      return;
    }

    // 11. Initialize Google GenAI SDK
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // 12. Build clean, privacy-preserving AI context grounded in Pragati data
    const aiContext = {
      skill_track: {
        name: skill.name,
        difficulty: skill.difficulty || 'Beginner',
        avg_days: skill.avg_days || '3-5 days',
        total_milestones: steps.length,
        roadmap_milestones: steps.map(s => ({
          step_order: s.step_order,
          title: s.title,
          subtopics: s.description ? s.description.split('||').map(t => t.trim()).filter(Boolean) : [],
          has_drive_notes: Boolean(s.drive_link),
          has_doc_link: Boolean(s.resource_link)
        }))
      },
      verified_pragati_resources: resources.map(r => ({
        title: r.title,
        format: r.format,
        type: r.type,
        url: r.url
      })),
      student_progress: {
        name: profile?.full_name || 'Student',
        department: profile?.department || 'Computer Science',
        batch: profile?.batch_number || 'General Batch',
        points: profile?.points || 0,
        streak_days: profile?.current_streak || 0,
        completed_step_count: completedSteps.length,
        total_step_count: steps.length,
        completed_step_orders: completedStepOrders,
        completed_milestone_titles: completedSteps.map(s => s.title),
        remaining_milestone_titles: incompleteSteps.map(s => s.title),
        mastery_level: masteryLevel,
        match_percentage: matchPercentage,
        is_fully_completed: isCompleted || matchPercentage === 100
      }
    };

    const systemInstruction = `You are Pragati's AI Skill Gap Analyzer and Academic Mentor for university students.
Your mission is to provide clear, actionable, motivating, and rigorous skill gap analyses based EXCLUSIVELY on Pragati's verified admin-created curriculum roadmap.

STRICT GROUNDING & INTEGRITY RULES:
1. THE PRAGATI ROADMAP IS THE ABSOLUTE SOURCE OF TRUTH. Analyze ONLY the provided roadmap steps. NEVER invent missing skills, imaginary topics, or external prerequisite tracks.
2. VERIFIED RESOURCES ONLY: You may ONLY reference resource URLs that exist in the provided Pragati resources or step links. If no resource exists, provide null. NEVER hallucinate or guess web/drive/video links.
3. PRECISE STEP MAPPING: For every skill gap, you must reference the exact "step_order" and "topic_title" from the provided Pragati roadmap.
4. PRIORITIZE GAPS:
   - Assign "HIGH" priority to the immediate next uncompleted foundational step in the roadmap.
   - Assign "MEDIUM" to intermediate subsequent steps.
   - Assign "LOW" to advanced/optional later steps.
5. IF PROGRESS IS 0%: Provide an encouraging beginner orientation. Highlight Milestone #1 as the highest priority starting point.
6. IF PROGRESS IS 100%: Congratulate the student, summarize their comprehensive mastery of the track, and do NOT fabricate additional steps.
7. Return strictly valid JSON adhering to the specified schema.`;

    let rawResult: any = null;
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Perform a skill gap analysis for student ${aiContext.student_progress.name} on the "${skill.name}" track.\n\nContext Data:\n${JSON.stringify(aiContext, null, 2)}`
                }
              ]
            }
          ],
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                target_skill_name: { type: Type.STRING },
                mastery_level: { type: Type.STRING },
                match_percentage: { type: Type.NUMBER },
                overall_gap_summary: { type: Type.STRING },
                estimated_hours_to_close_gap: { type: Type.NUMBER },
                next_recommended_milestone: { type: Type.STRING },
                next_recommended_step_order: { type: Type.NUMBER },
                skill_gaps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      step_order: { type: Type.NUMBER },
                      topic_title: { type: Type.STRING },
                      priority: { type: Type.STRING },
                      gap_reason: { type: Type.STRING },
                      recommended_action: { type: Type.STRING },
                      verified_resource_url: { type: Type.STRING, nullable: true }
                    },
                    required: ['step_order', 'topic_title', 'priority', 'gap_reason', 'recommended_action']
                  }
                },
                key_strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: [
                'target_skill_name',
                'mastery_level',
                'match_percentage',
                'overall_gap_summary',
                'estimated_hours_to_close_gap',
                'next_recommended_milestone',
                'skill_gaps'
              ]
            }
          }
        });

        if (response.text) {
          rawResult = JSON.parse(response.text);
          break;
        }
      } catch (geminiErr: any) {
        console.warn(`[Gemini model ${modelName} notice]:`, geminiErr?.message || geminiErr);
      }
    }

    // If Gemini model was unavailable (e.g. temporary demand spike), gracefully use deterministic verified analyzer
    if (!rawResult) {
      console.log('[Pragati Server] Using deterministic roadmap analyzer fallback.');
      const fallbackResult = generateDeterministicAnalysis(
        skill,
        steps,
        resources,
        completedSteps,
        incompleteSteps,
        matchPercentage,
        masteryLevel
      );
      res.json({ available: true, data: fallbackResult });
      return;
    }

    // 13. Server-side Validation and Sanitization of Gemini output
    const verifiedGaps = (rawResult.skill_gaps || []).map((gap: any) => {
      const matchingStep = steps.find(s => s.step_order === gap.step_order || s.title.toLowerCase() === (gap.topic_title || '').toLowerCase());
      
      const stepOrder = matchingStep ? matchingStep.step_order : gap.step_order;
      const topicTitle = matchingStep ? matchingStep.title : gap.topic_title;
      const stepId = matchingStep ? matchingStep.id : undefined;

      let verifiedUrl = null;
      if (gap.verified_resource_url) {
        const matchingRes = resources.find(r => r.url === gap.verified_resource_url);
        const matchingStepResource = steps.find(s => s.drive_link === gap.verified_resource_url || s.resource_link === gap.verified_resource_url);
        if (matchingRes || matchingStepResource) {
          verifiedUrl = gap.verified_resource_url;
        }
      }

      if (!verifiedUrl && matchingStep?.drive_link) {
        verifiedUrl = matchingStep.drive_link;
      } else if (!verifiedUrl && matchingStep?.resource_link) {
        verifiedUrl = matchingStep.resource_link;
      }

      const priority = ['HIGH', 'MEDIUM', 'LOW'].includes(String(gap.priority).toUpperCase())
        ? String(gap.priority).toUpperCase()
        : 'MEDIUM';

      return {
        step_id: stepId,
        step_order: stepOrder,
        topic_title: topicTitle,
        priority,
        gap_reason: gap.gap_reason || 'Core milestone required for curriculum completion.',
        recommended_action: gap.recommended_action || `Study and complete Milestone #${stepOrder}: ${topicTitle}.`,
        verified_resource_url: verifiedUrl
      };
    });

    let nextMilestone = rawResult.next_recommended_milestone;
    let nextStepOrder = rawResult.next_recommended_step_order;
    let nextStepId: string | undefined = undefined;

    if (incompleteSteps.length > 0) {
      const firstIncomplete = incompleteSteps[0];
      if (!nextMilestone || !steps.some(s => s.title === nextMilestone)) {
        nextMilestone = firstIncomplete.title;
        nextStepOrder = firstIncomplete.step_order;
        nextStepId = firstIncomplete.id;
      } else {
        const found = steps.find(s => s.title === nextMilestone || s.step_order === nextStepOrder);
        nextStepId = found?.id || firstIncomplete.id;
      }
    } else {
      nextMilestone = 'Curriculum Complete';
      nextStepOrder = steps.length;
      nextStepId = steps[steps.length - 1]?.id;
    }

    const validatedResult = {
      target_skill_id: skill.id,
      target_skill_name: skill.name,
      difficulty: skill.difficulty,
      mastery_level: masteryLevel,
      match_percentage: matchPercentage,
      total_milestones: steps.length,
      completed_milestones_count: completedSteps.length,
      overall_gap_summary: rawResult.overall_gap_summary || `You have completed ${completedSteps.length} of ${steps.length} milestones in ${skill.name}.`,
      estimated_hours_to_close_gap: typeof rawResult.estimated_hours_to_close_gap === 'number'
        ? Math.max(0, rawResult.estimated_hours_to_close_gap)
        : Math.max(1, incompleteSteps.length * 2),
      next_recommended_milestone: nextMilestone,
      next_recommended_step_order: nextStepOrder,
      next_recommended_step_id: nextStepId,
      skill_gaps: verifiedGaps,
      key_strengths: Array.isArray(rawResult.key_strengths) ? rawResult.key_strengths : completedSteps.map(s => s.title).slice(0, 4)
    };

    res.json({
      available: true,
      data: validatedResult
    });

  } catch (error: any) {
    console.error('[POST /api/analyze-skill-gap exception]:', error);
    res.status(500).json({
      error: error?.message || 'An unexpected error occurred during AI skill gap analysis.',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * Deterministic teacher fallback generator when Gemini API is offline or key is unconfigured
 */
function generateDeterministicTeacherResponse(
  skill: { id?: string; name: string } | null,
  focusedStep: { id: string; title: string; description?: string; step_order: number; drive_link?: string; resource_link?: string } | null,
  message: string,
  quickAction?: string
) {
  const stepTitle = focusedStep ? focusedStep.title : (skill ? `${skill.name} Fundamentals` : 'Computer Science Fundamentals');
  let mode: 'explanation' | 'example' | 'practice' | 'hint' | 'quiz' | 'general' = 'explanation';
  
  const questionTopic = message.length > 30 ? message.slice(0, 30) + '...' : message;
  const isBangla = /[\u0980-\u09FF]/.test(message) || message.toLowerCase().includes('ki?') || message.toLowerCase().includes('kivabe');
  const lowerMsg = message.toLowerCase();

  let answer: string;
  if (lowerMsg.includes('html') && (lowerMsg.includes('full form') || lowerMsg.includes('full name') || lowerMsg.includes('mane ki') || lowerMsg.includes('ki'))) {
    answer = isBangla
      ? `**HTML** এর পূর্ণরূপ হলো **HyperText Markup Language**।\n\nএটি কোনো প্রোগ্রামিং ল্যাঙ্গুয়েজ নয়, বরং একটি স্ট্যান্ডার্ড মার্কআপ ল্যাঙ্গুয়েজ যা দিয়ে ওয়েব পেজের মূল গঠন বা স্ট্রাকচার তৈরি করা হয়।`
      : `**HTML** stands for **HyperText Markup Language**.\n\nIt is the standard markup language used by web browsers to structure and display web pages on the World Wide Web.`;
  } else if (lowerMsg.includes('pointer') && (lowerMsg.includes('c ') || lowerMsg.includes('c te') || lowerMsg.includes('c++') || lowerMsg.includes('ki'))) {
    answer = isBangla
      ? `C প্রোগ্রামিংয়ে **Pointer** হলো এমন একটি স্পেশাল ভ্যারিয়েবল যা সরাসরি কোনো ডেটা ভ্যালু ধারণ না করে অন্য একটি ভ্যারিয়েবলের **মেমোরি অ্যাড্রেস (Memory Address)** স্টোর করে।\n\nপয়েন্টার ব্যবহারের মাধ্যমে সরাসরি মেমোরি অ্যাক্সেস, ডাইনামিক মেমোরি অ্যালোকেশন এবং ফাংশনে পাস-বাই-রেফারেন্সের কাজ করা যায়।`
      : `In C programming, a **pointer** is a special variable that stores the memory address of another variable rather than a direct value.\n\nPointers allow direct memory manipulation, dynamic memory allocation, and efficient pass-by-reference operations.`;
  } else if (lowerMsg.includes('normalization') || lowerMsg.includes('dbms')) {
    answer = isBangla
      ? `DBMS-এ **Normalization** হলো একটি সুশৃঙ্খল টেকনিক যার মাধ্যমে রিলেশনাল ডাটাবেজের টেবিলগুলোকে এমনভাবে ডিজাইন করা হয় যেন **Data Redundancy (অপ্রয়োজনীয় পুনরাবৃত্তি)** দূর হয় এবং **Data Integrity** নিশ্চিত থাকে।\n\nসাধারণত 1NF, 2NF, 3NF এবং BCNF লেভেলে নরম্যালাইজেশন করা হয়।`
      : `In DBMS, **Normalization** is a systematic database design approach that decomposes tables to eliminate data redundancy and enhance data integrity (1NF, 2NF, 3NF, BCNF).`;
  } else {
    answer = isBangla
      ? `আপনার প্রশ্ন **"${message}"** এর ব্যাখ্যা:\n\nকম্পিউটার সায়েন্সে এই কনসেপ্টটি অত্যন্ত গুরুত্বপূর্ণ। এটি গভীরভাবে বুঝতে এর মূল মেকানিজম এবং প্র্যাকটিক্যাল ব্যবহার লক্ষ্য করুন। কোনো কোড উদাহরণ বা প্র্যাকটিস কুইজ লাগলে জিজ্ঞেস করতে পারেন!`
      : `Here is an educational explanation addressing your question: **"${message}"**.\n\nIn computer science, mastering this concept requires understanding its fundamental mechanism, practical implementation, and how it connects to software design.\n\nTake your time to write down small test programs to reinforce what you learn. If you'd like, you can ask for a code example, a simpler explanation, or a practice quiz!`;
  }
  let practiceQuestion: string | null = `How would you explain the core mechanism of "${questionTopic}" to a fellow student?`;
  let hint: string | null = `Focus on the foundational principles of "${questionTopic}". Break it down into smaller steps before implementing.`;
  let codeSnippet: string | null = null;
  const isHtml = message.toLowerCase().includes('html');
  const isCss = message.toLowerCase().includes('css');
  const isJs = message.toLowerCase().includes('script') || message.toLowerCase().includes('js');
  const isPython = message.toLowerCase().includes('python');
  const isC = message.toLowerCase().includes('c ') || message.toLowerCase().includes('c++') || message.toLowerCase().includes('pointer');

  let codeLang = isHtml ? 'html' : isCss ? 'css' : isJs ? 'javascript' : isPython ? 'python' : isC ? 'c' : 'text';

  if (quickAction === 'practice' || message.toLowerCase().includes('practice') || message.toLowerCase().includes('quiz')) {
    mode = 'practice';
    answer = `Here is a practice exercise on **"${questionTopic}"** to test your understanding:\n\n**Question:** ${practiceQuestion}\n\nTake your time to solve it, and ask me if you want a hint!`;
  } else if (quickAction === 'hint' || message.toLowerCase().includes('hint')) {
    mode = 'hint';
    answer = `Here is a helpful hint regarding **"${questionTopic}"**:\n\n${hint}\n\nTry applying this hint to your code!`;
  } else if (quickAction === 'example' || message.toLowerCase().includes('example') || message.toLowerCase().includes('code')) {
    mode = 'example';
    answer = `Here is a clean code example related to **"${questionTopic}"**:`;
    if (isC) {
      codeSnippet = `#include <stdio.h>\n\nint main() {\n    int num = 42;\n    int *ptr = &num;\n    printf("Value: %d, Address: %p\\n", *ptr, (void*)ptr);\n    return 0;\n}`;
    } else if (isJs) {
      codeSnippet = `// Example demonstration\nconst item = "Pragati";\nconsole.log(\`Learning \${item}\`);`;
    } else if (isPython) {
      codeSnippet = `# Example demonstration\ndef demonstrate():\n    print("Computer Science with Pragati")\n\ndemonstrate()`;
    }
  }

  return {
    answer,
    teaching_mode: mode,
    current_topic: questionTopic,
    related_step_id: focusedStep?.id || undefined,
    related_step_title: stepTitle,
    practice_question: practiceQuestion,
    hint: hint,
    code_snippet: codeSnippet,
    code_language: codeSnippet ? codeLang : null,
    visual: null,
    suggested_followups: [
      `Can you give a code example of ${questionTopic}?`,
      `Explain ${questionTopic} with a simple real-world analogy.`,
      `Give me a practice quiz on this.`
    ]
  };
}

/**
 * POST /api/ai-teacher
 * Protected endpoint for AI Teacher personalized tutoring
 */
app.post('/api/ai-teacher', async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Resolve user identity from Authorization header (Optional/Graceful)
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
        } catch (authErr) {
          console.warn('[AI Teacher Auth notice]:', authErr);
        }
      }
    }

    // 2. Validate request parameters
    const { skillId: rawSkillId, currentStepId, message, conversationHistory, quickAction, topic, language, userName: reqUserName } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        error: 'Missing or empty message parameter.',
        code: 'BAD_REQUEST'
      });
      return;
    }

    const trimmedMessage = message.trim().slice(0, 2500);

    // 3. Graceful Skill & Curriculum Lookup (Supporting Context, NEVER Blocking)
    let skillId = rawSkillId;
    let skill: any = null;
    let resolvedSkillId: string | null = null;

    if (rawSkillId && rawSkillId !== 'All topics' && rawSkillId !== 'general') {
      // 3a. Try exact ID match
      const { data: exactSkill } = await supabase
        .from('skills')
        .select('id, name, description, difficulty, avg_days')
        .eq('id', rawSkillId)
        .maybeSingle();

      if (exactSkill) {
        skill = exactSkill;
        resolvedSkillId = exactSkill.id;
      } else {
        // 3b. Try matching by name or slug (e.g. "skill-html" -> "html", "skill-python" -> "python")
        const cleanName = String(rawSkillId)
          .replace(/^skill[-_]?/i, '')
          .replace(/[-_]/g, ' ')
          .trim()
          .toLowerCase();

        const { data: allSkills } = await supabase
          .from('skills')
          .select('id, name, description, difficulty, avg_days');

        if (allSkills && allSkills.length > 0) {
          const matched = allSkills.find(s => {
            const sName = s.name.toLowerCase();
            return sName === cleanName || sName.includes(cleanName) || cleanName.includes(sName);
          });
          if (matched) {
            skill = matched;
            resolvedSkillId = matched.id;
          }
        }
      }
    }

    // If still no skill resolved, try default first skill for background context without throwing
    if (!skill) {
      const { data: defaultSkills } = await supabase
        .from('skills')
        .select('id, name, description, difficulty, avg_days')
        .order('order_index', { ascending: true })
        .limit(1);
      skill = defaultSkills?.[0] || null;
      resolvedSkillId = skill?.id || null;
    }

    skillId = resolvedSkillId || rawSkillId || 'general-cse';

    // 4. Fetch Roadmap Steps for this Skill (if available)
    let steps: any[] = [];
    if (resolvedSkillId) {
      const { data: rawSteps, error: stepsError } = await supabase
        .from('roadmap_steps')
        .select('*')
        .eq('skill_id', resolvedSkillId)
        .order('step_order', { ascending: true });

      if (stepsError) {
        console.warn('[Supabase roadmap_steps notice]:', stepsError.message);
      }

      steps = (rawSteps || []).map((row: any) => {
        let detailsObj: any = null;
        if (row.details) {
          try {
            detailsObj = typeof row.details === 'string' ? JSON.parse(row.details) : row.details;
          } catch (e) {
            if (typeof row.details === 'string' && (row.details.includes('drive.google.com') || row.details.startsWith('http'))) {
              detailsObj = { drive_link: row.details };
            }
          }
        }

        return {
          id: row.id,
          skill_id: row.skill_id,
          title: row.title,
          description: row.description || '',
          step_order: Number(row.step_order) || 1,
          resource_link: row.resource_link || detailsObj?.resource_link || undefined,
          drive_link: row.drive_link || detailsObj?.drive_link || undefined
        };
      });
    }

    // 5. Fetch verified resources for this skill if available
    let resources: any[] = [];
    if (resolvedSkillId) {
      const { data: rawResources } = await supabase
        .from('skill_resources')
        .select('id, title, type, format, url, description')
        .eq('skill_id', resolvedSkillId);
      resources = rawResources || [];
    }

    // 6. Fetch the authenticated user's progress on this skill (if logged in)
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

    // 7. Fetch student profile context (name & department)
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

    // 8. Deterministic calculation of progress metrics
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

    let masteryLevel: 'Novice' | 'Beginner' | 'Developing' | 'Proficient' | 'Mastered';
    if (matchPercentage === 100 || isCompleted) {
      masteryLevel = 'Mastered';
    } else if (matchPercentage >= 75) {
      masteryLevel = 'Proficient';
    } else if (matchPercentage >= 40) {
      masteryLevel = 'Developing';
    } else if (matchPercentage > 0) {
      masteryLevel = 'Beginner';
    } else {
      masteryLevel = 'Novice';
    }

    // 9. Determine Focal Milestone (if steps exist)
    let focusedStep = null;
    if (steps.length > 0) {
      if (currentStepId && typeof currentStepId === 'string' && currentStepId.trim().length > 0) {
        focusedStep = steps.find(s => s.id === currentStepId.trim()) || null;
      }
      if (!focusedStep) {
        focusedStep = incompleteSteps.length > 0 ? incompleteSteps[0] : steps[0];
      }
    }

    // 10. Resolve verified resources for this focal step or track (strictly from Supabase)
    const isValidHttpUrl = (urlStr?: string | null): boolean => {
      if (!urlStr || typeof urlStr !== 'string') return false;
      return urlStr.startsWith('http://') || urlStr.startsWith('https://');
    };

    const verifiedResourcesForStep: Array<{ title: string; url: string; format?: string; type?: string }> = [];
    if (isValidHttpUrl(focusedStep?.drive_link)) {
      verifiedResourcesForStep.push({
        title: `${focusedStep!.title} (Lecture Notes / Google Drive PDF)`,
        url: focusedStep!.drive_link!,
        format: 'drive',
        type: 'document'
      });
    }
    if (isValidHttpUrl(focusedStep?.resource_link)) {
      verifiedResourcesForStep.push({
        title: `${focusedStep!.title} (Official Documentation / Reference)`,
        url: focusedStep!.resource_link!,
        format: 'link',
        type: 'reference'
      });
    }
    for (const r of resources.slice(0, 3)) {
      if (isValidHttpUrl(r.url) && !verifiedResourcesForStep.some(vr => vr.url === r.url)) {
        verifiedResourcesForStep.push({
          title: r.title,
          url: r.url,
          format: r.format || 'link',
          type: r.type || 'reference'
        });
      }
    }

    // 11. Fallback if Gemini API Key is missing
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      const fallbackResult = generateDeterministicTeacherResponse(
        skill,
        focusedStep,
        trimmedMessage,
        quickAction
      );
      res.json({
        success: true,
        data: {
          ...fallbackResult,
          verified_resources: verifiedResourcesForStep
        }
      });
      return;
    }

    // 12. Initialize Google GenAI SDK
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // 13. Build clean AI context (Supporting Context, NOT Knowledge Boundary)
    const aiContext = {
      curriculum_source: 'DIU Computer Science & Engineering - Pragati Platform',
      active_track: skill ? {
        id: skill.id,
        name: skill.name,
        difficulty: skill.difficulty || 'Beginner',
        total_milestones: steps.length,
        milestones: steps.map(s => ({
          step_order: s.step_order,
          title: s.title,
          subtopics: s.description ? s.description.split('||').map(t => t.trim()).filter(Boolean) : [],
          is_completed: completedStepOrders.includes(s.step_order),
          has_drive_notes: Boolean(s.drive_link),
          has_doc_link: Boolean(s.resource_link)
        }))
      } : {
        id: 'general-cse',
        name: 'General Computer Science',
        difficulty: 'All Levels',
        total_milestones: 0,
        milestones: []
      },
      current_focus_milestone: focusedStep ? {
        step_order: focusedStep.step_order,
        title: focusedStep.title,
        description: focusedStep.description || '',
        subtopics: focusedStep.description ? focusedStep.description.split('||').map(t => t.trim()).filter(Boolean) : [],
        is_completed: completedStepOrders.includes(focusedStep.step_order)
      } : null,
      student_profile: {
        name: studentFullName,
        department: studentDept,
        mastery_level: masteryLevel,
        match_percentage: matchPercentage,
        completed_step_count: completedSteps.length,
        total_step_count: steps.length
      },
      verified_resources: verifiedResourcesForStep
    };

    // Generate or use client-provided correlation requestId
    const requestId = (req.body.requestId && typeof req.body.requestId === 'string')
      ? req.body.requestId
      : crypto.randomUUID();

    console.log(`\n================== [AI TEACHER REQUEST] ==================`);
    console.log(`requestId:     ${requestId}`);
    console.log(`userId:        ${authenticatedUserId}`);
    console.log(`message:       ${trimmedMessage}`);
    console.log(`skillId:       ${skillId}`);
    console.log(`currentStepId: ${currentStepId || 'none'}`);
    console.log(`quickAction:   ${quickAction || 'none'}`);
    console.log(`==========================================================\n`);

    // 14. Prepare prior conversation history (strictly excluding the current question)
    const sanitizedHistory: Array<{ role: 'user' | 'model'; text: string }> = [];
    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-8)) {
        if (turn && typeof turn.text === 'string' && (turn.role === 'user' || turn.role === 'assistant' || turn.role === 'model')) {
          const role = (turn.role === 'assistant' || turn.role === 'model') ? 'model' : 'user';
          const text = turn.text.trim().slice(0, 1000);
          if (!text || (role === 'user' && text === trimmedMessage)) continue;

          const lastTurn = sanitizedHistory[sanitizedHistory.length - 1];
          if (!lastTurn || lastTurn.role !== role) {
            sanitizedHistory.push({ role, text });
          }
        }
      }
    }
    // Ensure history does not end with a user turn before appending the new user prompt
    if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === 'user') {
      sanitizedHistory.pop();
    }

    const systemInstruction = `You are Pragati AI Teacher — an expert-level Computer Science educator, senior software engineer, technical mentor, and university academic instructor for CSE students.

Your job is to provide high-quality technical answers comparable in clarity, accuracy, depth, specificity, and reasoning quality to advanced AI assistants (ChatGPT, Claude, Perplexity).

==================================================
PRAGATI AI TEACHER — EXPERT-LEVEL RESPONSE ENGINE
==================================================

1. CORE PRINCIPLE:
- Answer the student's actual question accurately, thoroughly, and directly.
- Never intentionally make a technically complex concept shallow merely because the student is learning.
- "Simple explanation" does NOT mean "simple content." Make difficult concepts understandable without removing critical technical depth, mechanisms, and nuances.

2. ADAPTIVE DEPTH & QUESTION CLASSIFICATION:
Internally assess the question complexity (BASIC, INTERMEDIATE, ADVANCED, EXPERT, AMBIGUOUS) and adapt accordingly:
- Basic Factual: Direct, concise, precise, and accurate.
- Conceptual: Definition, internal mechanism, why it matters, concrete example, common misconceptions.
- Intermediate: Internal mechanisms, practical implementation, trade-offs, common mistakes, related concepts.
- Advanced: Deep technical reasoning, implementation details, edge cases, performance considerations, trade-offs, alternative approaches, real-world implications, limitations.
- Expert: Assume technical fluency. Discuss low-level mechanics, architecture, failure modes, concurrency, scalability constraints, and engineering decisions without dumbing down.

3. DIRECT ANSWER FIRST:
Always answer the core question in the very first 1-2 sentences. Avoid throat-clearing introductions (e.g., do NOT start with "To understand pointers, first we need to understand programming...").

4. ABSOLUTE TECHNICAL ACCURACY:
Prioritize correctness over sounding simple. Never make a technically inaccurate statement to simplify.
(Example: Java is strictly pass-by-value; when an object reference is passed, the value copied is the reference itself). Use correct, established technical terminology.

5. MULTI-PARAGRAPH & BEAUTIFULLY STRUCTURED MARKDOWN:
- NEVER output the answer as a single continuous paragraph or wall of text!
- ALWAYS format answers in clean, multi-paragraph Markdown with blank lines (\n\n) between paragraphs.
- Structure explanations with:
  - Short direct overview paragraph (1-2 sentences).
  - Clear section headings (### Subtopic).
  - Clean numbered lists or bullet points with double newlines between items:
    1. **Topic / Step Name**: Clear explanation and why it matters.
    2. **Topic / Step Name**: Clear explanation and why it matters.
  - Fenced code blocks with language identifiers.
  - Concluding practical tip or next step in a separate paragraph.

6. CONCRETE EXAMPLES & IDIOMATIC CODE QUALITY:
- Use real, modern, idiomatic code examples (C, C++, Java, Python, JS, TS, SQL, etc.) with clean syntax, comments, and edge case handling.
- For debugging: 1) Identify root cause, 2) Explain why it happens, 3) Show corrected code, 4) Explain the fix, 5) Note related pitfalls.

7. COMPARISONS & "WHY" QUESTIONS:
- For comparisons (TCP vs UDP, SQL vs NoSQL, Process vs Thread, Array vs Linked List): Compare along meaningful dimensions (purpose, internal behavior, memory, performance, trade-offs, real-world use cases). Use markdown tables when appropriate.
- For "Why" questions: Explain mathematical/architectural derivations (e.g. for binary search, show n -> n/2 -> n/4 -> log2(n)).

8. EDGE CASES, TRADE-OFFS & REAL-WORLD CONTEXT:
- Mention edge cases (NULL pointers, empty bounds, integer overflow, race conditions, SQL injection, cache invalidation, network retries) when relevant.
- Explicitly discuss engineering trade-offs (time vs space, consistency vs availability, latency vs throughput).

9. PRAGATI CURRICULUM BOUNDARY:
- Pragati curriculum is supporting background context only, NOT a knowledge boundary.
- Answer ANY Computer Science / CSE / engineering question directly using full domain knowledge, regardless of what roadmap track is active.
- Recommend verified resources ONLY when genuinely relevant. Never invent fake URLs.

10. LANGUAGE & MENTOR TONE:
- If the student asks in Bangla or Banglish: Respond in warm, natural Bangla mixed with standard English technical terms (e.g., "Pointer মূলত অন্য object-এর memory address store করে"). Avoid unnatural robotic translations of established terms.
- If English: Respond in clear, professional English.
- Behave as a senior technical mentor: direct, intellectually rigorous, encouraging, and honest about uncertainty or version-dependent behaviors. Avoid canned robotic greetings ("Sure!", "Let's dive in!").
- Return strictly valid JSON adhering to the specified schema.`;

    let historyText = '';
    if (sanitizedHistory.length > 0) {
      historyText = sanitizedHistory.map(h => `${h.role === 'user' ? 'Student' : 'AI Teacher'}: ${h.text}`).join('\n\n');
    }

    const userPromptText = `<student_context>
Name: ${studentFullName}
Department: ${studentDept}
Mastery: ${masteryLevel} (${completedSteps.length}/${steps.length} milestones complete in ${skill?.name || 'General CSE'})
</student_context>

<skill_context>
Curriculum Track: ${skill ? `${skill.name} (${skill.difficulty || 'Beginner'})` : 'General Computer Science'}
</skill_context>

<roadmap_context>
Focused Milestone: ${focusedStep ? `#${focusedStep.step_order} - ${focusedStep.title}` : 'General Track'}
Description: ${focusedStep?.description || 'N/A'}
Other Milestones in Track: ${steps.length > 0 ? steps.map(s => `#${s.step_order} ${s.title}`).join(', ') : 'No track milestones active'}
NOTE: This roadmap is BACKGROUND CONTEXT ONLY. Do NOT substitute this roadmap for the student's question.
</roadmap_context>

<verified_resources>
${verifiedResourcesForStep.length > 0 ? verifiedResourcesForStep.map(r => `- ${r.title}: ${r.url}`).join('\n') : 'No specific URLs attached'}
</verified_resources>

${historyText ? `<conversation_history>\n${historyText}\n</conversation_history>\n\n` : ''}${quickAction ? `<requested_action>\n${quickAction}\n</requested_action>\n\n` : ''}${topic && topic !== 'All topics' ? `<topic_focus>\n${topic}\n</topic_focus>\n\n` : ''}${language ? `<preferred_language>\n${language}\n</preferred_language>\n\n` : ''}<current_question>
${trimmedMessage}
</current_question>

<final_instruction>
Answer the student's question "${trimmedMessage}" following the PRAGATI EXPERT-LEVEL RESPONSE ENGINE standards:

1. Direct answer first without canned fluff.
2. Provide the appropriate depth (preserving deep technical mechanisms, edge cases, trade-offs, and why it works).
3. Structure in clean MULTI-PARAGRAPH Markdown with blank lines between paragraphs, bold key terms, subheadings, and clear lists. NEVER output one giant paragraph!
4. Match language: if Bangla/Banglish, use natural Bengali with standard English technical terms.

In the JSON response:
- "answer": Your expert-level, multi-paragraph Markdown answer addressing "${trimmedMessage}".
- "current_topic": The actual specific topic of "${trimmedMessage}" (e.g. "OS Memory Management", "Pointers in C", "DBMS B+ Tree Indexing", "TCP vs UDP", "Inheritance in Java").
- "related_step_title": If "${trimmedMessage}" directly relates to a milestone in the current track (${skill?.name || 'General CSE'}), provide the relevant milestone title; otherwise set to null.
- "teaching_mode": "explanation", "example", "practice", or "hint".
- "visual": ONLY provide an object here if the student EXPLICITLY requested an interactive visualization, step-by-step diagram, complete cheat-sheet/document, or complete HTML webpage. For normal questions, standard explanations, simple code snippets, or regular Q&A, you MUST set "visual": null.
</final_instruction>`;

    console.log(`[AI TEACHER DEBUG]`);
    console.log(`Question:     ${trimmedMessage}`);
    console.log(`Skill:        ${skill?.name || 'General CSE'} (${skillId})`);
    console.log(`Current Step: ${focusedStep ? `#${focusedStep.step_order} - ${focusedStep.title}` : 'none'}`);
    console.log(`History:      ${sanitizedHistory.length} turns`);
    console.log(`Quick Action: ${quickAction || 'none'}`);

    const contents: any[] = [];
    for (const h of sanitizedHistory) {
      contents.push({
        role: h.role,
        parts: [{ text: h.text }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: userPromptText }]
    });

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
              visual: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING, nullable: true },
                  content: { type: Type.STRING, nullable: true }
                }
              },
              suggested_followups: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['answer', 'teaching_mode', 'current_topic']
          }
        };

        if (modelName === 'gemini-3.8-flash') {
          config.thinkingConfig = {
            thinkingLevel: ThinkingLevel.MEDIUM
          };
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config
        });

        if (response.text) {
          rawResult = JSON.parse(response.text);
          console.log(`[Gemini AI Teacher] Successfully generated response with model: ${modelName}`);
          break;
        }
      } catch (geminiErr: any) {
        const isQuota = geminiErr?.status === 'RESOURCE_EXHAUSTED' || geminiErr?.message?.includes('429');
        if (isQuota) {
          console.warn(`[Gemini AI Teacher] Model ${modelName} quota limit reached. Trying next model...`);
        } else {
          console.warn(`[Gemini AI Teacher] Model ${modelName} error:`, geminiErr?.message || geminiErr);
        }
      }
    }

    if (rawResult) {
      console.log(`\n================== [AI TEACHER RESPONSE] ==================`);
      console.log(`requestId: ${requestId}`);
      console.log(`message:   ${trimmedMessage}`);
      console.log(`topic:     ${rawResult.current_topic}`);
      console.log(`answer:    ${rawResult.answer?.slice(0, 150)}...`);
      console.log(`===========================================================\n`);
    }

    if (!rawResult) {
      console.log('[Pragati Server] Using deterministic AI Teacher fallback.');
      const fallbackResult = generateDeterministicTeacherResponse(
        skill,
        focusedStep,
        trimmedMessage,
        quickAction
      );
      res.json({
        success: true,
        requestId,
        data: {
          ...fallbackResult,
          verified_resources: verifiedResourcesForStep
        }
      });
      return;
    }

    // 16. Sanitize and ground output with trusted Supabase data
    let matchedStepId: string | undefined = undefined;
    let matchedStepTitle: string | undefined = undefined;

    if (rawResult.related_step_title) {
      const found = steps.find(s => 
        s.title.toLowerCase().trim() === String(rawResult.related_step_title).toLowerCase().trim() ||
        s.title.toLowerCase().includes(String(rawResult.related_step_title).toLowerCase()) ||
        String(rawResult.related_step_title).toLowerCase().includes(s.title.toLowerCase())
      );
      if (found) {
        matchedStepId = found.id;
        matchedStepTitle = found.title;
      }
    }

    const validModes = ['explanation', 'example', 'practice', 'hint', 'quiz', 'general'];
    const teachingMode = validModes.includes(String(rawResult.teaching_mode).toLowerCase())
      ? String(rawResult.teaching_mode).toLowerCase()
      : 'explanation';

    const validatedTeacherData = {
      answer: rawResult.answer,
      teaching_mode: teachingMode,
      current_topic: rawResult.current_topic || (matchedStepTitle || skill?.name || 'Computer Science'),
      related_step_id: matchedStepId,
      related_step_title: matchedStepTitle || null,
      practice_question: rawResult.practice_question || null,
      hint: rawResult.hint || null,
      code_snippet: rawResult.code_snippet || null,
      code_language: rawResult.code_language || null,
      visual: rawResult.visual || null,
      verified_resources: verifiedResourcesForStep,
      suggested_followups: Array.isArray(rawResult.suggested_followups)
        ? rawResult.suggested_followups.slice(0, 3)
        : [
            `Can you give me a code example for this?`,
            `Give me a practice quiz question on this`,
            `Explain this simply with an everyday analogy`
          ]
    };

    res.json({
      success: true,
      requestId,
      data: validatedTeacherData
    });

  } catch (error: any) {
    console.error('[POST /api/ai-teacher exception]:', error);
    res.status(500).json({
      error: error?.message || 'An unexpected error occurred in AI Teacher service.',
      code: 'SERVER_ERROR'
    });
  }
});

// Setup Vite development server middleware or production static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Pragati Server] Running in ${isProd ? 'production' : 'development'} mode on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Pragati Server] Fatal startup error:', err);
  process.exit(1);
});
