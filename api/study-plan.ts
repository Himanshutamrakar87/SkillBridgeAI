import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { getGenAIClient, parseRequestBody, generateWithFallback, formatErrorMessage } from './_lib/gemini.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = parseRequestBody(req);
    const { subject, topics, studyHoursPerDay, targetDate, currentLevel, extraPreferences } = body;

    if (!subject || !topics) {
      return res.status(400).json({ error: 'Subject and syllabus topics are required.' });
    }

    const ai = getGenAIClient();

    const prompt = `Create a comprehensive, realistic, and practical study plan for a student.
Subject: ${subject}
Topics to Cover: ${topics}
Available Study Time: ${studyHoursPerDay || '2 hours/day'}
Target Completion / Exam Date: ${targetDate || 'in 3 weeks'}
Current Student Level: ${currentLevel || 'Intermediate'}
Special Focus / Notes: ${extraPreferences || 'None specified'}

Provide a structured, encouraging plan in JSON format matching the schema.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert academic curriculum planner for engineering and university students. Build practical, realistic, spaced-repetition study plans with clear actionable milestones.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            estimatedTotalHours: { type: Type.NUMBER },
            dailyRecommendedHours: { type: Type.STRING },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: 'e.g. Phase 1: Core Fundamentals' },
                  dayRange: { type: Type.STRING, description: 'e.g. Days 1–4' },
                  title: { type: Type.STRING },
                  objectives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  recommendedTechnique: { type: Type.STRING, description: 'e.g. Active Recall, Feynman Technique, Practice Problems' },
                  selfCheckGoal: { type: Type.STRING },
                },
                required: ['phase', 'dayRange', 'title', 'objectives', 'recommendedTechnique', 'selfCheckGoal'],
              },
            },
            retentionStrategies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            revisionCheckpoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['planTitle', 'summary', 'estimatedTotalHours', 'dailyRecommendedHours', 'milestones', 'retentionStrategies', 'revisionCheckpoints'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Error in /api/study-plan:', err);
    return res.status(500).json({
      error: formatErrorMessage(err),
    });
  }
}
