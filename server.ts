import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
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
    const { skillId } = req.body;
    if (!skillId || typeof skillId !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid skillId parameter.',
        code: 'BAD_REQUEST'
      });
      return;
    }

    // 3. Fetch Skill details from Supabase (Source of Truth)
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('id, name, description, difficulty, avg_days, field_id, step_count')
      .eq('id', skillId)
      .maybeSingle();

    if (skillError || !skill) {
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
  skill: { id: string; name: string },
  focusedStep: { id: string; title: string; description?: string; step_order: number; drive_link?: string; resource_link?: string } | null,
  message: string,
  quickAction?: string
) {
  const stepTitle = focusedStep ? focusedStep.title : `${skill.name} Fundamentals`;
  const stepDesc = focusedStep?.description || `Core building blocks for ${skill.name}.`;
  const subtopics = focusedStep?.description ? focusedStep.description.split('||').map(s => s.trim()).filter(Boolean) : [];
  const subtopicsText = subtopics.length > 0 ? ` Topics in this milestone: ${subtopics.join(', ')}.` : '';

  let mode: 'explanation' | 'example' | 'practice' | 'hint' | 'quiz' | 'general' = 'explanation';
  let answer = `Here is an explanation of **${stepTitle}** in the ${skill.name} curriculum.\n\n${stepDesc}.${subtopicsText}\n\nTo master this milestone, focus on understanding the core syntax and write small test programs to reinforce what you learn.`;
  let practiceQuestion: string | null = `What is the primary role of ${stepTitle}, and what happens if you omit its key syntax?`;
  let hint: string | null = `Review the lecture notes and official docs for ${stepTitle}. Pay attention to the syntax requirements and structure.`;
  let codeSnippet: string | null = null;
  const isHtml = skill.name.toLowerCase().includes('html');
  const isCss = skill.name.toLowerCase().includes('css');
  const isJs = skill.name.toLowerCase().includes('script') || skill.name.toLowerCase().includes('js');
  const isPython = skill.name.toLowerCase().includes('python');
  const isC = skill.name.toLowerCase().includes('c ') || skill.name.toLowerCase().includes('c++') || skill.name.toLowerCase().includes('language');

  let codeLang = isHtml ? 'html' : isCss ? 'css' : isJs ? 'javascript' : isPython ? 'python' : isC ? 'c' : 'text';

  if (quickAction === 'practice' || message.toLowerCase().includes('practice') || message.toLowerCase().includes('quiz')) {
    mode = 'practice';
    answer = `Here is a practice exercise on **${stepTitle}** designed to test your understanding:\n\n**Question:** ${practiceQuestion}\n\nTake your time to write down your solution or code snippet, then ask me to check your work!`;
  } else if (quickAction === 'hint' || message.toLowerCase().includes('hint')) {
    mode = 'hint';
    answer = `Here is a helpful hint for **${stepTitle}**:\n\n${hint}\n\nTry applying this hint to your code!`;
  } else if (quickAction === 'example' || message.toLowerCase().includes('example') || message.toLowerCase().includes('code')) {
    mode = 'example';
    answer = `Here is a code example illustrating **${stepTitle}** in ${skill.name}:`;
    if (isHtml) {
      codeSnippet = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${stepTitle} Example</title>\n</head>\n<body>\n  <!-- ${stepTitle} -->\n  <h1>${stepTitle}</h1>\n  <p>Practice writing clean semantic markup.</p>\n</body>\n</html>`;
    } else if (isCss) {
      codeSnippet = `/* ${stepTitle} Styling Example */\n.card-container {\n  display: flex;\n  flex-direction: column;\n  padding: 1.5rem;\n  border-radius: 1rem;\n  background-color: #ffffff;\n  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\n}`;
    } else if (isPython) {
      codeSnippet = `# ${stepTitle} Demonstration\ndef learn_${stepTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}():\n    print("Mastering ${stepTitle} in Python")\n    return True\n\nlearn_${stepTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}()`;
    } else {
      codeSnippet = `// ${stepTitle} Example in ${skill.name}\nfunction demonstrateConcept() {\n  console.log("Practicing ${stepTitle}");\n}\ndemonstrateConcept();`;
    }
  }

  return {
    answer,
    teaching_mode: mode,
    current_topic: stepTitle,
    related_step_id: focusedStep?.id,
    related_step_title: stepTitle,
    practice_question: practiceQuestion,
    hint: hint,
    code_snippet: codeSnippet,
    code_language: codeLang,
    suggested_followups: [
      `Can you give me a code example for ${stepTitle}?`,
      `Give me another practice question`,
      `Explain this simply in beginner terms`
    ]
  };
}

/**
 * POST /api/ai-teacher
 * Protected endpoint for AI Teacher personalized tutoring
 */
app.post('/api/ai-teacher', async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Verify Supabase JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required. Please log in to chat with Pragati AI Teacher.',
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

    // 2. Validate request parameters
    const { skillId: rawSkillId, currentStepId, message, conversationHistory, quickAction, topic, language } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        error: 'Missing or empty message parameter.',
        code: 'BAD_REQUEST'
      });
      return;
    }

    const trimmedMessage = message.trim().slice(0, 2500);

    // 3. Fetch Skill details from Supabase (Source of Truth)
    let skillId = rawSkillId;
    let skill: any = null;

    if (!skillId || skillId === 'All topics' || skillId === 'general') {
      const { data: defaultSkills } = await supabase
        .from('skills')
        .select('id, name, description, difficulty, avg_days')
        .order('order_index', { ascending: true })
        .limit(1);
      skill = defaultSkills?.[0] || null;
      skillId = skill?.id || 'skill-1787555255194';
    } else {
      const { data: foundSkill, error: skillError } = await supabase
        .from('skills')
        .select('id, name, description, difficulty, avg_days')
        .eq('id', skillId)
        .maybeSingle();

      if (skillError || !foundSkill) {
        res.status(404).json({
          error: `Skill track "${skillId}" not found in Pragati curriculum.`,
          code: 'SKILL_NOT_FOUND'
        });
        return;
      }
      skill = foundSkill;
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
    if (!steps || steps.length === 0) {
      res.json({
        available: false,
        reason: 'ROADMAP_INCOMPLETE',
        skillName: skill.name,
        message: `The curriculum for ${skill.name} is currently being curated by the Pragati Administrator. AI Teacher will unlock as soon as roadmap milestones are published.`
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

    // 8. Fetch student profile context (strictly minimal for personalization: name & department only)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, department')
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

    // 10. Determine and Validate Focal Milestone
    let focusedStep = null;
    if (currentStepId && typeof currentStepId === 'string' && currentStepId.trim().length > 0) {
      const matched = steps.find(s => s.id === currentStepId.trim());
      if (!matched) {
        res.status(400).json({
          error: `Milestone step "${currentStepId}" does not belong to skill track "${skill.name}".`,
          code: 'INVALID_STEP'
        });
        return;
      }
      focusedStep = matched;
    } else {
      focusedStep = incompleteSteps.length > 0 ? incompleteSteps[0] : steps[0];
    }

    // 11. Resolve verified resources for this focal step or track (strictly from Supabase)
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

    // 12. Fallback if Gemini API Key is missing
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

    // 13. Initialize Google GenAI SDK
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // 14. Build clean AI context grounded in Pragati curriculum
    const aiContext = {
      skill_track: {
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
      },
      current_focus_milestone: focusedStep ? {
        step_order: focusedStep.step_order,
        title: focusedStep.title,
        description: focusedStep.description || '',
        subtopics: focusedStep.description ? focusedStep.description.split('||').map(t => t.trim()).filter(Boolean) : [],
        is_completed: completedStepOrders.includes(focusedStep.step_order)
      } : null,
      student_profile: {
        name: profile?.full_name || 'Student',
        department: profile?.department || 'CSE',
        mastery_level: masteryLevel,
        match_percentage: matchPercentage,
        completed_step_count: completedSteps.length,
        total_step_count: steps.length
      },
      verified_resources: verifiedResourcesForStep
    };

    // 15. Prepare conversation history
    const sanitizedHistory: Array<{ role: 'user' | 'model'; text: string }> = [];
    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-6)) {
        if (turn && typeof turn.text === 'string' && (turn.role === 'user' || turn.role === 'assistant' || turn.role === 'model')) {
          sanitizedHistory.push({
            role: turn.role === 'assistant' ? 'model' : turn.role as 'user' | 'model',
            text: turn.text.slice(0, 1000)
          });
        }
      }
    }

    const systemInstruction = `You are Pragati AI Teacher, an empathetic, encouraging, and academically rigorous university computer science tutor at DIU for CSE students.
Your mission is to teach, explain, test, and guide students based EXCLUSIVELY on Pragati's verified curriculum.

STRICT GROUNDING & INTEGRITY RULES:
1. THE PRAGATI ROADMAP IS THE SOURCE OF TRUTH. You are teaching the "${skill.name}" track. Ground all explanations in this curriculum.
2. CURRENT FOCUS: ${focusedStep ? `Milestone #${focusedStep.step_order} - "${focusedStep.title}"` : 'General Track'}.
3. STUDENT CONTEXT: ${aiContext.student_profile.name} (${aiContext.student_profile.mastery_level}, ${completedSteps.length}/${steps.length} milestones complete).
4. VERIFIED RESOURCES: You may ONLY reference URLs that are explicitly provided in "verified_resources". NEVER hallucinate or guess web/drive/video links.
5. TEACHING STYLES:
   - When asked to explain: Provide clear, structured explanations with real-world analogies first, then clean technical precision.
   - When asked for examples: Provide clean, commented, idiomatic code snippets in the appropriate language.
   - When asked for practice: Provide a focused, realistic practice question or short problem related to the current milestone.
   - When asked for a hint: Give a pedagogical nudge to stimulate thinking without giving away the full answer immediately.
   - Keep explanations engaging, concise, and educational.
8. LANGUAGE & CSE TOPICS:
   - If Preferred Language is 'Bangla + English' or 'Bangla', explain concepts in natural, friendly Bangla mixed with English technical terms.
   - You can answer any CSE-related question: programming, DSA, OS, DBMS, networks, OOP, AI/ML, web development, exams, projects, careers. Ground explanations in Pragati curriculum when relevant.
9. Return strictly valid JSON adhering to the specified schema.`;

    const contents: any[] = [];
    for (const h of sanitizedHistory) {
      contents.push({
        role: h.role,
        parts: [{ text: h.text }]
      });
    }

    let userPromptText = `User Message: "${trimmedMessage}"`;
    if (quickAction) {
      userPromptText += `\nRequested Action: "${quickAction}"`;
    }
    if (topic && topic !== 'All topics') {
      userPromptText += `\nTopic Focus: "${topic}"`;
    }
    if (language) {
      userPromptText += `\nPreferred Language: "${language}"`;
    }
    userPromptText += `\n\nContext Data:\n${JSON.stringify(aiContext, null, 2)}`;

    contents.push({
      role: 'user',
      parts: [{ text: userPromptText }]
    });

    let rawResult: any = null;
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                answer: { type: Type.STRING },
                teaching_mode: { type: Type.STRING },
                current_topic: { type: Type.STRING },
                related_step_title: { type: Type.STRING },
                practice_question: { type: Type.STRING, nullable: true },
                hint: { type: Type.STRING, nullable: true },
                code_snippet: { type: Type.STRING, nullable: true },
                code_language: { type: Type.STRING, nullable: true },
                suggested_followups: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['answer', 'teaching_mode']
            }
          }
        });

        if (response.text) {
          rawResult = JSON.parse(response.text);
          break;
        }
      } catch (geminiErr: any) {
        console.warn(`[Gemini AI Teacher model ${modelName} notice]:`, geminiErr?.message || geminiErr);
      }
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
        data: {
          ...fallbackResult,
          verified_resources: verifiedResourcesForStep
        }
      });
      return;
    }

    // 16. Sanitize and ground output with trusted Supabase data
    let matchedStepId: string | undefined = undefined;
    let matchedStepTitle: string = focusedStep?.title || skill.name;

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

    if (!matchedStepId && focusedStep) {
      matchedStepId = focusedStep.id;
      matchedStepTitle = focusedStep.title;
    }

    const validModes = ['explanation', 'example', 'practice', 'hint', 'quiz', 'general'];
    const teachingMode = validModes.includes(String(rawResult.teaching_mode).toLowerCase())
      ? String(rawResult.teaching_mode).toLowerCase()
      : 'explanation';

    const validatedTeacherData = {
      answer: rawResult.answer,
      teaching_mode: teachingMode,
      current_topic: rawResult.current_topic || matchedStepTitle,
      related_step_id: matchedStepId,
      related_step_title: matchedStepTitle,
      practice_question: rawResult.practice_question || null,
      hint: rawResult.hint || null,
      code_snippet: rawResult.code_snippet || null,
      code_language: rawResult.code_language || null,
      verified_resources: verifiedResourcesForStep,
      suggested_followups: Array.isArray(rawResult.suggested_followups)
        ? rawResult.suggested_followups.slice(0, 3)
        : [
            `Can you give me a code example for ${matchedStepTitle}?`,
            `Give me a practice quiz question`,
            `Explain this simply in beginner terms`
          ]
    };

    res.json({
      success: true,
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
